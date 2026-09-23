import express from 'express';
import { AuthRoutes } from '../modules/Auth/auth.route';
import { UserRoutes } from '../modules/User/user.route';
import { FarmRoutes } from '../modules/Farm/farm.route';
import { BatchRoutes } from '../modules/Batch/batch.route';
import { DailyLogRoutes } from '../modules/DailyLog/dailyLog.route';
import { ExpenseRoutes } from '../modules/Expense/expense.route';
import { SaleRoutes } from '../modules/Sale/sale.route';
import { CustomerRoutes } from '../modules/Customer/customer.route';
import { PaymentRoutes } from '../modules/Payment/payment.route';
import { FeedStockRoutes } from '../modules/FeedStock/feedStock.route';
import { HealthRecordRoutes } from '../modules/HealthRecord/healthRecord.route';
import { ReminderRoutes } from '../modules/Reminder/reminder.route';
import { ReportRoutes } from '../modules/Report/report.route';

const router = express.Router();

// Health check endpoint
router.get('/health-check', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'PoultryDex API',
    timestamp: new Date().toISOString(),
  });
});

const moduleRoutes = [
  { path: '/auth', route: AuthRoutes },
  { path: '/farms', route: FarmRoutes },
  { path: '/firms', route: FarmRoutes }, // Alias for farms
  { path: '/batches', route: BatchRoutes },
  { path: '/logs', route: DailyLogRoutes },
  { path: '/expenses', route: ExpenseRoutes },
  { path: '/sales', route: SaleRoutes },
  { path: '/customers', route: CustomerRoutes },
  { path: '/payments', route: PaymentRoutes },
  { path: '/feed-stock', route: FeedStockRoutes },
  { path: '/health', route: HealthRecordRoutes },
  { path: '/health-records', route: HealthRecordRoutes }, // Alias
  { path: '/reminders', route: ReminderRoutes },
  { path: '/reports', route: ReportRoutes },
  { path: '/users', route: UserRoutes },
  { path: '/team', route: UserRoutes }, // Alias for users
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
