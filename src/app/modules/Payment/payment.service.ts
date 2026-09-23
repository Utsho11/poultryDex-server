import mongoose from 'mongoose';
import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { Payment } from './payment.model';
import { Customer } from '../Customer/customer.model';
import { Sale } from '../Sale/sale.model';
import { syncCustomerTotalDue } from '../Sale/sale.service';
import QueryBuilder from '../../builder/QueryBuilder';
import { paymentSearchableFields } from './payment.constant';

const getPayments = async (farmId: string, query: Record<string, unknown>) => {
  const { customerId } = query;
  const filter: any = { farmId };
  if (customerId) filter.customerId = customerId;

  const paymentQuery = new QueryBuilder(
    Payment.find(filter).populate('customerId', 'name phone').sort({ date: -1 }),
    query
  )
    .search(paymentSearchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  return await paymentQuery.modelQuery;
};

const createPayment = async (farmId: string, userId: string, payload: any) => {
  const { customerId, saleId, amount, date, method, notes } = payload;

  if (!mongoose.Types.ObjectId.isValid(customerId)) {
    throw new AppError(httpStatus.NOT_FOUND, 'Customer not found');
  }

  const customer = await Customer.findOne({ _id: customerId, farmId });
  if (!customer) {
    throw new AppError(httpStatus.NOT_FOUND, 'Customer not found');
  }

  const payment = new Payment({
    farmId,
    customerId,
    saleId,
    amount,
    date,
    method,
    notes,
    recordedBy: userId,
  });

  await payment.save();

  if (saleId) {
    if (!mongoose.Types.ObjectId.isValid(saleId)) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Invalid sale ID');
    }
    const sale = await Sale.findOne({ _id: saleId, customerId: customer._id, farmId });
    if (sale) {
      sale.amountPaid = (sale.amountPaid || 0) + amount;
      sale.amountDue = Math.max(0, (sale.totalAmount || 0) - sale.amountPaid);
      if (sale.amountDue === 0) sale.status = 'paid';
      else if (sale.amountPaid > 0) sale.status = 'partial';
      await sale.save();
    }
  }

  await syncCustomerTotalDue(farmId, customerId);

  return payment;
};

const deletePayment = async (id: string, farmId: string) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(httpStatus.NOT_FOUND, 'Payment not found');
  }

  const payment = await Payment.findOne({ _id: id, farmId });
  if (!payment) {
    throw new AppError(httpStatus.NOT_FOUND, 'Payment not found');
  }

  if (payment.saleId) {
    const sale = await Sale.findOne({ _id: payment.saleId, farmId });
    if (sale) {
      sale.amountPaid = Math.max(0, (sale.amountPaid || 0) - payment.amount);
      sale.amountDue = Math.max(0, (sale.totalAmount || 0) - sale.amountPaid);
      if (sale.amountDue === 0) sale.status = 'paid';
      else if (sale.amountPaid > 0) sale.status = 'partial';
      else sale.status = 'due';
      await sale.save();
    }
  }

  const customerId = payment.customerId;
  await Payment.deleteOne({ _id: id, farmId });

  await syncCustomerTotalDue(farmId, customerId);

  return { message: 'Payment deleted successfully', id };
};

export const PaymentServices = {
  getPayments,
  createPayment,
  deletePayment,
};
