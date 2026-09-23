import httpStatus from 'http-status';
import { catchAsync } from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { DailyLogServices } from './dailyLog.service';

const getLogs = catchAsync(async (req, res) => {
  const result = await DailyLogServices.getLogs(req.farmId as string, req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Daily logs retrieved successfully',
    data: result,
  });
});

const createLog = catchAsync(async (req, res) => {
  const userId = (req.user?.userId || req.user?.id) as string;
  const result = await DailyLogServices.createLog(req.farmId as string, userId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Daily log created successfully',
    data: result,
  });
});

const updateLog = catchAsync(async (req, res) => {
  const userRole = req.user?.role || 'worker';
  const result = await DailyLogServices.updateLog(
    req.params.id,
    req.farmId as string,
    userRole,
    req.body
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Daily log updated successfully',
    data: result,
  });
});

const deleteLog = catchAsync(async (req, res) => {
  const result = await DailyLogServices.deleteLog(req.params.id, req.farmId as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Daily log deleted successfully',
    data: result,
  });
});

export const DailyLogControllers = {
  getLogs,
  createLog,
  updateLog,
  deleteLog,
};
