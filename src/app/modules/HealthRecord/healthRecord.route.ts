import express from 'express';
import { HealthRecordControllers } from './healthRecord.controller';
import auth from '../../middlewares/auth';
import resolveTenant from '../../middlewares/tenant';
import validateRequest from '../../middlewares/validateRequest';
import { HealthRecordValidation } from './healthRecord.validation';

const router = express.Router();

router.use(auth());
router.use(resolveTenant);

router.get('/', HealthRecordControllers.getHealthRecords);
router.post(
  '/',
  validateRequest(HealthRecordValidation.healthRecordValidationSchema),
  HealthRecordControllers.createHealthRecord
);
router.put(
  '/:id',
  validateRequest(HealthRecordValidation.updateHealthRecordValidationSchema),
  HealthRecordControllers.updateHealthRecord
);
router.delete('/:id', auth('owner', 'manager'), HealthRecordControllers.deleteHealthRecord);

export const HealthRecordRoutes = router;
