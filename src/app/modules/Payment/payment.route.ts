import express from 'express';
import { PaymentControllers } from './payment.controller';
import auth from '../../middlewares/auth';
import resolveTenant from '../../middlewares/tenant';
import validateRequest from '../../middlewares/validateRequest';
import { PaymentValidation } from './payment.validation';

const router = express.Router();

router.use(auth());
router.use(resolveTenant);

router.get('/', PaymentControllers.getPayments);
router.post(
  '/',
  validateRequest(PaymentValidation.paymentValidationSchema),
  PaymentControllers.createPayment
);
router.delete('/:id', auth('owner', 'manager'), PaymentControllers.deletePayment);

export const PaymentRoutes = router;
