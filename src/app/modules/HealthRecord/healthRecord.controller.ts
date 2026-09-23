import httpStatus from 'http-status';
import { catchAsync } from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { HealthRecordServices } from './healthRecord.service';

const getHealthRecords = catchAsync(async (req, res) => {
  const result = await HealthRecordServices.getHealthRecords(req.farmId as string, req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Health records retrieved successfully',
    data: result,
  });
});

const createHealthRecord = catchAsync(async (req, res) => {
  const userId = (req.user?.userId || req.user?.id) as string;
  const result = await HealthRecordServices.createHealthRecord(req.farmId as string, userId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Health record created successfully',
    data: result,
  });
});

const updateHealthRecord = catchAsync(async (req, res) => {
  const result = await HealthRecordServices.updateHealthRecord(
    req.params.id,
    req.farmId as string,
    req.body
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Health record updated successfully',
    data: result,
  });
});

const deleteHealthRecord = catchAsync(async (req, res) => {
  const result = await HealthRecordServices.deleteHealthRecord(req.params.id, req.farmId as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Health record deleted successfully',
    data: result,
  });
});

export const HealthRecordControllers = {
  getHealthRecords,
  createHealthRecord,
  updateHealthRecord,
  deleteHealthRecord,
};
