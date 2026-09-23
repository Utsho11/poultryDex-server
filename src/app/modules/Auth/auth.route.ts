import express from 'express';
import { AuthControllers } from './auth.controller';
import validateRequest from '../../middlewares/validateRequest';
import { AuthValidation } from './auth.validation';
import auth from '../../middlewares/auth';

const router = express.Router();

router.post(
  '/register',
  validateRequest(AuthValidation.registerValidationSchema),
  AuthControllers.register
);

router.post(
  '/register-farm',
  validateRequest(AuthValidation.registerFarmValidationSchema),
  AuthControllers.registerFarm
);

router.post(
  '/login',
  validateRequest(AuthValidation.loginValidationSchema),
  AuthControllers.login
);

router.get(
  '/me',
  auth(),
  AuthControllers.me
);

router.post(
  '/switch-firm',
  auth(),
  validateRequest(AuthValidation.switchFarmValidationSchema),
  AuthControllers.switchFirm
);

export const AuthRoutes = router;
