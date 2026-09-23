import express from 'express';
import { ReminderControllers } from './reminder.controller';
import auth from '../../middlewares/auth';
import resolveTenant from '../../middlewares/tenant';
import validateRequest from '../../middlewares/validateRequest';
import { ReminderValidation } from './reminder.validation';

const router = express.Router();

router.use(auth());
router.use(resolveTenant);

router.get('/', ReminderControllers.getReminders);
router.post(
  '/',
  auth('owner', 'manager'),
  validateRequest(ReminderValidation.reminderValidationSchema),
  ReminderControllers.createReminder
);
router.put(
  '/:id',
  auth('owner', 'manager'),
  validateRequest(ReminderValidation.updateReminderValidationSchema),
  ReminderControllers.updateReminder
);
router.delete('/:id', auth('owner', 'manager'), ReminderControllers.deleteReminder);

export const ReminderRoutes = router;
