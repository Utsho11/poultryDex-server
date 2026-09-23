import express from 'express';
import { CustomerControllers } from './customer.controller';
import auth from '../../middlewares/auth';
import resolveTenant from '../../middlewares/tenant';
import validateRequest from '../../middlewares/validateRequest';
import { CustomerValidation } from './customer.validation';

const router = express.Router();

router.use(auth());
router.use(resolveTenant);

router.get('/', CustomerControllers.getCustomers);
router.post(
  '/',
  validateRequest(CustomerValidation.customerValidationSchema),
  CustomerControllers.createCustomer
);
router.put(
  '/:id',
  validateRequest(CustomerValidation.updateCustomerValidationSchema),
  CustomerControllers.updateCustomer
);
router.delete('/:id', auth('owner', 'manager'), CustomerControllers.deleteCustomer);

export const CustomerRoutes = router;
