import express from 'express';
import { DailyLogControllers } from './dailyLog.controller';
import auth from '../../middlewares/auth';
import resolveTenant from '../../middlewares/tenant';
import validateRequest from '../../middlewares/validateRequest';
import { DailyLogValidation } from './dailyLog.validation';

const router = express.Router();

router.use(auth());
router.use(resolveTenant);

router.get('/', DailyLogControllers.getLogs);
router.post(
  '/',
  validateRequest(DailyLogValidation.dailyLogValidationSchema),
  DailyLogControllers.createLog
);
router.put(
  '/:id',
  auth('owner', 'manager', 'worker'),
  validateRequest(DailyLogValidation.updateDailyLogValidationSchema),
  DailyLogControllers.updateLog
);
router.delete(
  '/:id',
  auth('owner', 'manager'),
  DailyLogControllers.deleteLog
);

export const DailyLogRoutes = router;
