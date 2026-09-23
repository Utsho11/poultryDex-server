import express from 'express';
import { FeedStockControllers } from './feedStock.controller';
import auth from '../../middlewares/auth';
import resolveTenant from '../../middlewares/tenant';
import validateRequest from '../../middlewares/validateRequest';
import { FeedStockValidation } from './feedStock.validation';

const router = express.Router();

router.use(auth());
router.use(resolveTenant);

router.get('/', FeedStockControllers.getFeedStock);
router.post(
  '/',
  validateRequest(FeedStockValidation.feedStockValidationSchema),
  FeedStockControllers.createFeedStock
);
router.put(
  '/:id',
  validateRequest(FeedStockValidation.updateFeedStockValidationSchema),
  FeedStockControllers.updateFeedStock
);
router.delete('/:id', auth('owner', 'manager'), FeedStockControllers.deleteFeedStock);

export const FeedStockRoutes = router;
