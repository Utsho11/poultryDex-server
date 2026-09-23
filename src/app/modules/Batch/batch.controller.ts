import httpStatus from 'http-status';
import { catchAsync } from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { BatchServices } from './batch.service';

const createBatch = catchAsync(async (req, res) => {
  const result = await BatchServices.createBatch(req.farmId as string, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Flock/Batch created successfully',
    data: result,
  });
});

const getBatches = catchAsync(async (req, res) => {
  const result = await BatchServices.getBatches(req.farmId as string, req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Batches retrieved successfully',
    data: result,
  });
});

const getBatchById = catchAsync(async (req, res) => {
  const result = await BatchServices.getBatchById(req.params.id, req.farmId as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Batch retrieved successfully',
    data: result,
  });
});

const updateBatch = catchAsync(async (req, res) => {
  const result = await BatchServices.updateBatch(
    req.params.id,
    req.farmId as string,
    req.body
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Batch updated successfully',
    data: result,
  });
});

const assignWorkers = catchAsync(async (req, res) => {
  const result = await BatchServices.assignWorkers(
    req.params.id,
    req.farmId as string,
    req.body
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Workers assigned successfully',
    data: result,
  });
});

const closeBatch = catchAsync(async (req, res) => {
  const result = await BatchServices.closeBatch(req.params.id, req.farmId as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Batch closed successfully',
    data: result,
  });
});

const deleteBatch = catchAsync(async (req, res) => {
  const result = await BatchServices.deleteBatch(req.params.id, req.farmId as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Batch deleted successfully',
    data: result,
  });
});

export const BatchControllers = {
  createBatch,
  getBatches,
  getBatchById,
  updateBatch,
  assignWorkers,
  closeBatch,
  deleteBatch,
};
