import express from 'express';
import { ExpenseControllers } from './expense.controller';
import auth from '../../middlewares/auth';
import resolveTenant from '../../middlewares/tenant';
import validateRequest from '../../middlewares/validateRequest';
import { ExpenseValidation } from './expense.validation';

const router = express.Router();

router.use(auth());
router.use(resolveTenant);

router.get('/', ExpenseControllers.getExpenses);
router.post(
  '/',
  validateRequest(ExpenseValidation.expenseValidationSchema),
  ExpenseControllers.createExpense
);
router.put(
  '/:id',
  validateRequest(ExpenseValidation.updateExpenseValidationSchema),
  ExpenseControllers.updateExpense
);
router.delete('/:id', auth('owner', 'manager'), ExpenseControllers.deleteExpense);

export const ExpenseRoutes = router;
