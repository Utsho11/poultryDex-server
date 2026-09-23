import express from 'express';
import { SaleControllers } from './sale.controller';
import auth from '../../middlewares/auth';
import resolveTenant from '../../middlewares/tenant';
import validateRequest from '../../middlewares/validateRequest';
import { SaleValidation } from './sale.validation';

const router = express.Router();

router.use(auth());
router.use(resolveTenant);

router.get('/', SaleControllers.getSales);
router.post(
  '/',
  validateRequest(SaleValidation.saleValidationSchema),
  SaleControllers.createSale
);
router.put(
  '/:id',
  validateRequest(SaleValidation.updateSaleValidationSchema),
  SaleControllers.updateSale
);
router.delete('/:id', auth('owner', 'manager'), SaleControllers.deleteSale);

export const SaleRoutes = router;
