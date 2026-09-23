import express from 'express';
import { BatchControllers } from './batch.controller';
import auth from '../../middlewares/auth';
import resolveTenant from '../../middlewares/tenant';
import verifyPassword from '../../middlewares/verifyPassword';
import validateRequest from '../../middlewares/validateRequest';
import { BatchValidation } from './batch.validation';

const router = express.Router();

router.use(auth());
router.use(resolveTenant);

router.post(
  '/',
  auth('owner', 'manager'),
  verifyPassword,
  validateRequest(BatchValidation.createBatchValidationSchema),
  BatchControllers.createBatch
);

router.get('/', BatchControllers.getBatches);
router.get('/:id', BatchControllers.getBatchById);

router.put(
  '/:id',
  auth('owner', 'manager'),
  validateRequest(BatchValidation.updateBatchValidationSchema),
  BatchControllers.updateBatch
);

router.patch(
  '/:id/assign-workers',
  auth('owner', 'manager'),
  validateRequest(BatchValidation.assignWorkersValidationSchema),
  BatchControllers.assignWorkers
);

router.post(
  '/:id/close',
  auth('owner', 'manager'),
  verifyPassword,
  BatchControllers.closeBatch
);

router.delete(
  '/:id',
  auth('owner'),
  verifyPassword,
  BatchControllers.deleteBatch
);

export const BatchRoutes = router;
