import httpStatus from 'http-status';
import { catchAsync } from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { UserServices } from './user.service';

const getUsersByFarm = catchAsync(async (req, res) => {
  const result = await UserServices.getUsersByFarm(req.farmId as string, req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Users retrieved successfully',
    data: result,
  });
});

const createUser = catchAsync(async (req, res) => {
  const result = await UserServices.createUser(req.farmId as string, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'User created successfully',
    data: result,
  });
});

const updateOwnProfile = catchAsync(async (req, res) => {
  const userId = (req.user?.userId || req.user?.id) as string;
  const result = await UserServices.updateOwnProfile(userId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Profile updated successfully',
    data: result,
  });
});

const changeOwnPassword = catchAsync(async (req, res) => {
  const userId = (req.user?.userId || req.user?.id) as string;
  const result = await UserServices.changeOwnPassword(userId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Password changed successfully',
    data: result,
  });
});

const toggleUserActive = catchAsync(async (req, res) => {
  const result = await UserServices.toggleUserActive(req.params.id, req.farmId as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User active status toggled',
    data: result,
  });
});

const updateUserRole = catchAsync(async (req, res) => {
  const result = await UserServices.updateUserRole(
    req.params.id,
    req.farmId as string,
    req.body.role
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User role updated',
    data: result,
  });
});

const updateUser = catchAsync(async (req, res) => {
  const result = await UserServices.updateUser(
    req.params.id,
    req.farmId as string,
    req.body
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User details updated',
    data: result,
  });
});

const deleteUser = catchAsync(async (req, res) => {
  const currentUserId = (req.user?.userId || req.user?.id) as string;
  const result = await UserServices.deleteUser(
    req.params.id,
    req.farmId as string,
    currentUserId
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User deleted successfully',
    data: result,
  });
});

export const UserControllers = {
  getUsersByFarm,
  createUser,
  updateOwnProfile,
  changeOwnPassword,
  toggleUserActive,
  updateUserRole,
  updateUser,
  deleteUser,
};
