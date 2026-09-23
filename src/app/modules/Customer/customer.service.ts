import mongoose from 'mongoose';
import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { Customer } from './customer.model';
import QueryBuilder from '../../builder/QueryBuilder';
import { customerSearchableFields } from './customer.constant';

const getCustomers = async (farmId: string, query: Record<string, unknown> = {}) => {
  const customerQuery = new QueryBuilder(
    Customer.find({ farmId }).sort({ name: 1 }),
    query
  )
    .search(customerSearchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  return await customerQuery.modelQuery;
};

const createCustomer = async (farmId: string, payload: any) => {
  const { name, phone, address } = payload;

  const existing = await Customer.findOne({ farmId, phone: phone.trim() });
  if (existing) {
    throw new AppError(httpStatus.CONFLICT, 'A customer with this phone number already exists');
  }

  const customer = new Customer({
    farmId,
    name: name.trim(),
    phone: phone.trim(),
    address: address?.trim(),
    totalDue: 0,
  });

  await customer.save();
  return customer;
};

const updateCustomer = async (id: string, farmId: string, payload: any) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid customer ID');
  }

  const customer = await Customer.findOne({ _id: id, farmId });
  if (!customer) {
    throw new AppError(httpStatus.NOT_FOUND, 'Customer not found');
  }

  const { name, phone, address } = payload;

  if (phone && phone.trim() !== customer.phone) {
    const existing = await Customer.findOne({
      farmId,
      phone: phone.trim(),
      _id: { $ne: customer._id },
    });
    if (existing) {
      throw new AppError(httpStatus.CONFLICT, 'A customer with this phone number already exists');
    }
    customer.phone = phone.trim();
  }

  if (name) customer.name = name.trim();
  if (address !== undefined) customer.address = address?.trim();

  await customer.save();
  return customer;
};

const deleteCustomer = async (id: string, farmId: string) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid customer ID');
  }

  const customer = await Customer.findOne({ _id: id, farmId });
  if (!customer) {
    throw new AppError(httpStatus.NOT_FOUND, 'Customer not found');
  }

  if (customer.totalDue && customer.totalDue > 0) {
    throw new AppError(httpStatus.BAD_REQUEST, `Cannot delete customer with outstanding due of ৳${customer.totalDue}`);
  }

  const collections = mongoose.connection.collections;
  const hasSales = collections['sales']
    ? await collections['sales'].findOne({ customerId: customer._id, farmId: new mongoose.Types.ObjectId(farmId) })
    : null;

  if (hasSales) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Cannot delete customer who has existing sales records');
  }

  await Customer.findOneAndDelete({ _id: id, farmId });
  return { message: 'Customer deleted successfully' };
};

export const CustomerServices = {
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
};
