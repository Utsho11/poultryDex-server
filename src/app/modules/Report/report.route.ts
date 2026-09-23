import express from 'express';
import { ReportControllers } from './report.controller';
import auth from '../../middlewares/auth';
import resolveTenant from '../../middlewares/tenant';

const router = express.Router();

router.use(auth());
router.use(resolveTenant);

router.get('/summary', ReportControllers.getSummaryReport);
router.get('/daily', auth('owner', 'manager'), ReportControllers.getDailyReport);
router.get('/batch-dashboard/:batchId', ReportControllers.getBatchDashboard);
router.get('/activity-log', auth('owner', 'manager'), ReportControllers.getActivityLog);
router.get('/export', auth('owner', 'manager'), ReportControllers.exportReport);

export const ReportRoutes = router;
