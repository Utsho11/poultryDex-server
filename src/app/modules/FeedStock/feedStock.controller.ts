import httpStatus from 'http-status';
import { catchAsync } from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { FeedStockServices } from './feedStock.service';

const getFeedStock = catchAsync(async (req, res) => {
  const result = await FeedStockServices.getFeedStock(req.farmId as string, req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Feed stock entries retrieved successfully',
    data: result,
  });
});

const createFeedStock = catchAsync(async (req, res) => {
  const userId = (req.user?.userId || req.user?.id) as string;
  const result = await FeedStockServices.createFeedStock(req.farmId as string, userId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Feed stock entry created successfully',
    data: result,
  });
});

const updateFeedStock = catchAsync(async (req, res) => {
  const result = await FeedStockServices.updateFeedStock(
    req.params.id,
    req.farmId as string,
    req.body
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Feed stock entry updated successfully',
    data: result,
  });
});

const deleteFeedStock = catchAsync(async (req, res) => {
  const result = await FeedStockServices.deleteFeedStock(req.params.id, req.farmId as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Feed stock entry deleted successfully',
    data: result,
  });
});

export const FeedStockControllers = {
  getFeedStock,
  createFeedStock,
  updateFeedStock,
  deleteFeedStock,
};
