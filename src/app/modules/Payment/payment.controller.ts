import httpStatus from 'http-status';
import { catchAsync } from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { PaymentServices } from './payment.service';

const getPayments = catchAsync(async (req, res) => {
  const result = await PaymentServices.getPayments(req.farmId as string, req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Payments retrieved successfully',
    data: result,
  });
});

const createPayment = catchAsync(async (req, res) => {
  const userId = (req.user?.userId || req.user?.id) as string;
  const result = await PaymentServices.createPayment(req.farmId as string, userId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Payment recorded successfully',
    data: result,
  });
});

const deletePayment = catchAsync(async (req, res) => {
  const result = await PaymentServices.deletePayment(req.params.id, req.farmId as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Payment deleted successfully',
    data: result,
  });
});

export const PaymentControllers = {
  getPayments,
  createPayment,
  deletePayment,
};
