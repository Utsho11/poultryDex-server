import httpStatus from 'http-status';
import { catchAsync } from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { AuthServices } from './auth.service';
import { AUTH_MESSAGES } from './auth.constant';

const register = catchAsync(async (req, res) => {
  const result = await AuthServices.registerUser(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: AUTH_MESSAGES.USER_REGISTERED,
    data: result,
  });
});

const registerFarm = catchAsync(async (req, res) => {
  const result = await AuthServices.registerFarm(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: AUTH_MESSAGES.FARM_REGISTERED,
    data: result,
  });
});

const login = catchAsync(async (req, res) => {
  const result = await AuthServices.loginUser(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: AUTH_MESSAGES.LOGIN_SUCCESS,
    data: result,
  });
});

const me = catchAsync(async (req, res) => {
  const userId = (req.user?.userId || req.user?.id) as string;
  const result = await AuthServices.getMe(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: AUTH_MESSAGES.PROFILE_RETRIEVED,
    data: result,
  });
});

const switchFirm = catchAsync(async (req, res) => {
  const userId = (req.user?.userId || req.user?.id) as string;
  const result = await AuthServices.switchFirm(userId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: AUTH_MESSAGES.FIRM_SWITCHED,
    data: result,
  });
});

export const AuthControllers = {
  register,
  registerFarm,
  login,
  me,
  switchFirm,
};

export const AuthController = AuthControllers;
