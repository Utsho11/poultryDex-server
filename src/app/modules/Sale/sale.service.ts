import mongoose from 'mongoose';
import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { Sale } from './sale.model';
import { Batch } from '../Batch/batch.model';
import { Customer } from '../Customer/customer.model';
import QueryBuilder from '../../builder/QueryBuilder';
import { saleSearchableFields } from './sale.constant';

export async function syncCustomerTotalDue(farmId: any, customerId: any) {
  const farmObjId = typeof farmId === 'string' ? new mongoose.Types.ObjectId(farmId) : farmId;
  const custObjId = typeof customerId === 'string' ? new mongoose.Types.ObjectId(customerId) : customerId;

  const salesAgg = await Sale.aggregate([
    { $match: { farmId: farmObjId, customerId: custObjId } },
    { $group: { _id: null, totalSales: { $sum: '$totalAmount' } } },
  ]);
  const totalSales = salesAgg[0]?.totalSales || 0;

  const collections = mongoose.connection.collections;
  const paymentsAgg = collections['payments']
    ? await collections['payments']
        .aggregate([
          { $match: { farmId: farmObjId, customerId: custObjId } },
          { $group: { _id: null, totalPayments: { $sum: '$amount' } } },
        ])
        .toArray()
    : [];
  const totalPayments = paymentsAgg[0]?.totalPayments || 0;

  const totalDue = Math.max(0, totalSales - totalPayments);

  await Customer.updateOne(
    { _id: custObjId, farmId: farmObjId },
    { $set: { totalDue } }
  );
}

const getSales = async (farmId: string, query: Record<string, unknown>) => {
  const { batchId, customerId, from, to } = query;
  const filter: any = { farmId };

  if (batchId) {
    let bObjId: any;
    try {
      bObjId = new mongoose.Types.ObjectId(batchId as string);
    } catch {
      bObjId = batchId;
    }
    filter.$and = [{ $or: [{ batchId: bObjId }, { batchId: String(batchId) }] }];
  }
  if (customerId) filter.customerId = customerId;
  if (from || to) {
    filter.date = {};
    if (from) filter.date.$gte = from;
    if (to) filter.date.$lte = to;
  }

  const saleQuery = new QueryBuilder(
    Sale.find(filter).populate('customerId', 'name phone address').sort({ date: -1 }),
    query
  )
    .search(saleSearchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  return await saleQuery.modelQuery;
};

const createSale = async (farmId: string, userId: string, payload: any) => {
  const {
    batchId,
    itemType,
    quantity,
    unitPrice,
    customerId: reqCustomerId,
    customerName,
    customerPhone,
    items: reqItems,
    date,
    amountPaid: reqAmountPaid,
    note,
    notes,
  } = payload;

  let targetCustomerId = reqCustomerId;
  if (!targetCustomerId && customerName && customerPhone) {
    const trimmedPhone = customerPhone.trim();
    const trimmedName = customerName.trim();
    const customer = await Customer.findOneAndUpdate(
      { farmId, phone: trimmedPhone },
      { $setOnInsert: { farmId, name: trimmedName, phone: trimmedPhone, totalDue: 0 } },
      { upsert: true, new: true }
    );
    targetCustomerId = (customer._id as any).toString();
  }

  let itemsToSave: any[] = [];
  let calculatedTotal = 0;

  if (reqItems && reqItems.length > 0) {
    itemsToSave = reqItems.map((item: any) => {
      const subtotal = item.quantity * item.unitPrice;
      calculatedTotal += subtotal;
      return { ...item, subtotal };
    });
  } else if (itemType && quantity && unitPrice !== undefined) {
    const subtotal = quantity * unitPrice;
    calculatedTotal = subtotal;
    itemsToSave = [
      {
        type: itemType,
        quantity,
        unit: itemType === 'egg' ? 'piece' : 'bird',
        unitPrice,
        subtotal,
      },
    ];
  } else {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid sale items or price structure.');
  }

  const amountPaid = Number(reqAmountPaid || 0);
  const amountDue = Math.max(0, calculatedTotal - amountPaid);
  let status: 'paid' | 'partial' | 'due' = 'due';
  if (amountDue === 0) status = 'paid';
  else if (amountPaid > 0) status = 'partial';

  const totalChickensSold = itemsToSave
    .filter((i: any) => i.type === 'chicken')
    .reduce((sum: number, i: any) => sum + (i.birdCount || i.quantity || 0), 0);

  if (batchId) {
    if (totalChickensSold > 0) {
      const updatedBatch = await Batch.findOneAndUpdate(
        { _id: batchId, farmId, currentCount: { $gte: totalChickensSold } },
        { $inc: { currentCount: -totalChickensSold } },
        { new: true }
      );
      if (!updatedBatch) {
        const currentBatch = await Batch.findOne({ _id: batchId, farmId });
        if (!currentBatch) {
          throw new AppError(httpStatus.NOT_FOUND, 'Selected flock/batch not found in this firm');
        }
        throw new AppError(
          httpStatus.BAD_REQUEST,
          `Cannot sell ${totalChickensSold} chickens. Current flock count is only ${currentBatch.currentCount} birds.`
        );
      }
    } else {
      const exists = await Batch.exists({ _id: batchId, farmId });
      if (!exists) {
        throw new AppError(httpStatus.NOT_FOUND, 'Selected flock/batch not found in this firm');
      }
    }
  }

  const primaryItem = itemsToSave[0];
  const effectiveItemType = itemType || primaryItem?.type;
  const effectiveQuantity =
    quantity !== undefined ? quantity : itemsToSave.reduce((s: number, i: any) => s + (i.quantity || 0), 0);
  const effectiveUnitPrice = unitPrice !== undefined ? unitPrice : primaryItem?.unitPrice || 0;

  const sale = new Sale({
    farmId,
    batchId,
    customerId: targetCustomerId,
    customerName,
    customerPhone,
    itemType: effectiveItemType,
    quantity: effectiveQuantity,
    unitPrice: effectiveUnitPrice,
    date,
    items: itemsToSave,
    totalAmount: calculatedTotal,
    amountPaid,
    amountDue,
    status,
    notes: note || notes,
    recordedBy: userId,
  });

  await sale.save();

  if (amountPaid > 0 && targetCustomerId) {
    const collections = mongoose.connection.collections;
    if (collections['payments']) {
      await collections['payments'].insertOne({
        farmId: new mongoose.Types.ObjectId(farmId),
        customerId: new mongoose.Types.ObjectId(targetCustomerId),
        saleId: sale._id,
        amount: amountPaid,
        date,
        method: 'cash',
        notes: `Upfront payment for Sale Invoice #${sale._id.toString().slice(-6)}`,
        recordedBy: new mongoose.Types.ObjectId(userId),
        createdAt: new Date(),
      });
    }
  }

  if (targetCustomerId) {
    await syncCustomerTotalDue(farmId, targetCustomerId);
  }

  return sale;
};

const updateSale = async (id: string, farmId: string, userId: string, payload: any) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(httpStatus.NOT_FOUND, 'Sale record not found');
  }

  const sale = await Sale.findOne({ _id: id, farmId });
  if (!sale) {
    throw new AppError(httpStatus.NOT_FOUND, 'Sale record not found');
  }

  const { date, notes, amountPaid } = payload;
  if (date !== undefined) sale.date = date;
  if (notes !== undefined) sale.notes = notes;
  if (amountPaid !== undefined) {
    const newPaid = Number(amountPaid);
    sale.amountPaid = newPaid;
    sale.amountDue = Math.max(0, sale.totalAmount - sale.amountPaid);
    sale.status = sale.amountDue === 0 ? 'paid' : sale.amountPaid > 0 ? 'partial' : 'due';

    if (sale.customerId) {
      const collections = mongoose.connection.collections;
      if (newPaid > 0) {
        const existingUpfront = collections['payments']
          ? await collections['payments'].findOne({
              farmId: new mongoose.Types.ObjectId(farmId),
              saleId: sale._id,
              notes: { $regex: /^Upfront payment/i },
            })
          : null;

        if (existingUpfront && collections['payments']) {
          await collections['payments'].updateOne(
            { _id: existingUpfront._id },
            { $set: { amount: newPaid, ...(date ? { date } : {}) } }
          );
        } else if (collections['payments']) {
          await collections['payments'].insertOne({
            farmId: new mongoose.Types.ObjectId(farmId),
            customerId: sale.customerId,
            saleId: sale._id,
            amount: newPaid,
            date: date || sale.date,
            method: 'cash',
            notes: `Upfront payment for Sale Invoice #${sale._id.toString().slice(-6)}`,
            recordedBy: new mongoose.Types.ObjectId(userId),
            createdAt: new Date(),
          });
        }
      } else if (collections['payments']) {
        await collections['payments'].deleteOne({
          farmId: new mongoose.Types.ObjectId(farmId),
          saleId: sale._id,
          notes: { $regex: /^Upfront payment/i },
        });
      }
    }
  }

  await sale.save();

  if (sale.customerId) {
    await syncCustomerTotalDue(farmId, sale.customerId);
  }

  return sale;
};

const deleteSale = async (id: string, farmId: string) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(httpStatus.NOT_FOUND, 'Sale record not found');
  }

  const sale = await Sale.findOne({ _id: id, farmId });
  if (!sale) {
    throw new AppError(httpStatus.NOT_FOUND, 'Sale record not found');
  }

  if (sale.batchId) {
    const totalChickensSold =
      sale.items && sale.items.length > 0
        ? sale.items
            .filter((i: any) => i.type === 'chicken')
            .reduce((sum: number, i: any) => sum + (i.birdCount || i.quantity || 0), 0)
        : sale.itemType === 'chicken'
        ? sale.quantity || 0
        : 0;

    if (totalChickensSold > 0) {
      await Batch.updateOne(
        { _id: sale.batchId, farmId },
        { $inc: { currentCount: totalChickensSold } }
      );
    }
  }

  const customerId = sale.customerId;
  const collections = mongoose.connection.collections;
  if (collections['payments']) {
    await collections['payments'].deleteMany({
      farmId: new mongoose.Types.ObjectId(farmId),
      saleId: sale._id,
      notes: { $regex: /^Upfront payment/i },
    });
    await collections['payments'].updateMany(
      { farmId: new mongoose.Types.ObjectId(farmId), saleId: sale._id },
      { $unset: { saleId: 1 } }
    );
  }

  await Sale.deleteOne({ _id: id, farmId });

  if (customerId) {
    await syncCustomerTotalDue(farmId, customerId);
  }

  return { message: 'Sale deleted successfully and dues updated' };
};

export const SaleServices = {
  getSales,
  createSale,
  updateSale,
  deleteSale,
  syncCustomerTotalDue,
};
