import httpStatus from 'http-status';
import { catchAsync } from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { ReportServices } from './report.service';

const getSummaryReport = catchAsync(async (req, res) => {
  const result = await ReportServices.getSummaryReport(req.farmId as string, req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Summary report retrieved successfully',
    data: result,
  });
});

const getDailyReport = catchAsync(async (req, res) => {
  const result = await ReportServices.getDailyReport(req.farmId as string, req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Daily report retrieved successfully',
    data: result,
  });
});

const getBatchDashboard = catchAsync(async (req, res) => {
  const result = await ReportServices.getBatchDashboard(req.params.batchId, req.farmId as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Batch dashboard metrics retrieved successfully',
    data: result,
  });
});

const getActivityLog = catchAsync(async (req, res) => {
  const result = await ReportServices.getActivityLog(req.farmId as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Activity log retrieved successfully',
    data: result,
  });
});

const exportReport = catchAsync(async (req, res) => {
  const { format } = req.query;
  const logs = await ReportServices.exportLogs(req.farmId as string, req.query);

  if (format === 'csv') {
    const headers = 'Date,EggCount,BrokenEggCount,DeadCount,FeedGivenKg,WaterGivenLiters,Notes\n';
    const rows = logs
      .map(
        (l) =>
          `${l.date},${l.eggCount},${l.brokenEggCount},${l.deadCount},${l.feedGivenKg},${l.waterGivenLiters},"${(l.notes || '').replace(/"/g, '""')}"`
      )
      .join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="farm-report-${new Date().toISOString().split('T')[0]}.csv"`
    );
    return res.send(headers + rows);
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Report exported successfully',
    data: {
      recordCount: logs.length,
      exportedAt: new Date().toISOString(),
      logs,
    },
  });
});

export const ReportControllers = {
  getSummaryReport,
  getDailyReport,
  getBatchDashboard,
  getActivityLog,
  exportReport,
};
