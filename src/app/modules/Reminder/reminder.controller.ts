import httpStatus from 'http-status';
import { catchAsync } from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { ReminderServices } from './reminder.service';

const getReminders = catchAsync(async (req, res) => {
  const result = await ReminderServices.getReminders(req.farmId as string, req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Reminders retrieved successfully',
    data: result,
  });
});

const createReminder = catchAsync(async (req, res) => {
  const userId = (req.user?.userId || req.user?.id) as string;
  const result = await ReminderServices.createReminder(req.farmId as string, userId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Reminder created successfully',
    data: result,
  });
});

const updateReminder = catchAsync(async (req, res) => {
  const result = await ReminderServices.updateReminder(
    req.params.id,
    req.farmId as string,
    req.body
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Reminder updated successfully',
    data: result,
  });
});

const deleteReminder = catchAsync(async (req, res) => {
  const result = await ReminderServices.deleteReminder(req.params.id, req.farmId as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Reminder deleted successfully',
    data: result,
  });
});

export const ReminderControllers = {
  getReminders,
  createReminder,
  updateReminder,
  deleteReminder,
};
