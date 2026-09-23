import httpStatus from 'http-status';
import { catchAsync } from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { SaleServices } from './sale.service';

const getSales = catchAsync(async (req, res) => {
  const result = await SaleServices.getSales(req.farmId as string, req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Sales retrieved successfully',
    data: result,
  });
});

const createSale = catchAsync(async (req, res) => {
  const userId = (req.user?.userId || req.user?.id) as string;
  const result = await SaleServices.createSale(req.farmId as string, userId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Sale created successfully',
    data: result,
  });
});

const updateSale = catchAsync(async (req, res) => {
  const userId = (req.user?.userId || req.user?.id) as string;
  const result = await SaleServices.updateSale(
    req.params.id,
    req.farmId as string,
    userId,
    req.body
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Sale updated successfully',
    data: result,
  });
});

const deleteSale = catchAsync(async (req, res) => {
  const result = await SaleServices.deleteSale(req.params.id, req.farmId as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Sale deleted successfully',
    data: result,
  });
});

export const SaleControllers = {
  getSales,
  createSale,
  updateSale,
  deleteSale,
};
