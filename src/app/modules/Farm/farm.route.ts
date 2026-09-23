import express from 'express';
import { FarmControllers } from './farm.controller';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { FarmValidation } from './farm.validation';

const router = express.Router();

router.use(auth());

router.get('/', FarmControllers.getFarms);
router.post(
  '/',
  validateRequest(FarmValidation.createFarmValidationSchema),
  FarmControllers.createFarm
);
router.get('/:id', FarmControllers.getFarmById);
router.put(
  '/:id',
  validateRequest(FarmValidation.updateFarmValidationSchema),
  FarmControllers.updateFarm
);
router.delete('/:id', FarmControllers.deleteFarm);

export const FarmRoutes = router;
