import httpStatus from 'http-status';
import { catchAsync } from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { ExpenseServices } from './expense.service';

const getExpenses = catchAsync(async (req, res) => {
  const result = await ExpenseServices.getExpenses(req.farmId as string, req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Expenses retrieved successfully',
    data: result,
  });
});

const createExpense = catchAsync(async (req, res) => {
  const userId = (req.user?.userId || req.user?.id) as string;
  const result = await ExpenseServices.createExpense(req.farmId as string, userId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Expense created successfully',
    data: result,
  });
});

const updateExpense = catchAsync(async (req, res) => {
  const result = await ExpenseServices.updateExpense(
    req.params.id,
    req.farmId as string,
    req.body
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Expense updated successfully',
    data: result,
  });
});

const deleteExpense = catchAsync(async (req, res) => {
  const result = await ExpenseServices.deleteExpense(req.params.id, req.farmId as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Expense deleted successfully',
    data: result,
  });
});

export const ExpenseControllers = {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
};
