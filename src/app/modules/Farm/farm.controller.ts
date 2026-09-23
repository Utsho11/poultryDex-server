import httpStatus from 'http-status';
import { catchAsync } from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { FarmServices } from './farm.service';

const createFarm = catchAsync(async (req, res) => {
  const userId = (req.user?.userId || req.user?.id) as string;
  const result = await FarmServices.createFarm(userId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Firm created successfully',
    data: result,
  });
});

const getFarms = catchAsync(async (req, res) => {
  const userId = (req.user?.userId || req.user?.id) as string;
  const tokenFarmId = req.user?.farmId;
  const result = await FarmServices.getFarms(userId, tokenFarmId, req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Firms retrieved successfully',
    data: result,
  });
});

const getFarmById = catchAsync(async (req, res) => {
  const userId = (req.user?.userId || req.user?.id) as string;
  const tokenFarmId = req.user?.farmId;
  const result = await FarmServices.getFarmById(req.params.id, userId, tokenFarmId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Firm retrieved successfully',
    data: result,
  });
});

const updateFarm = catchAsync(async (req, res) => {
  const userId = (req.user?.userId || req.user?.id) as string;
  const result = await FarmServices.updateFarm(req.params.id, userId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Firm updated successfully',
    data: result,
  });
});

const deleteFarm = catchAsync(async (req, res) => {
  const userId = (req.user?.userId || req.user?.id) as string;
  const result = await FarmServices.deleteFarm(req.params.id, userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Firm deleted successfully',
    data: result,
  });
});

export const FarmControllers = {
  createFarm,
  getFarms,
  getFarmById,
  updateFarm,
  deleteFarm,
};
