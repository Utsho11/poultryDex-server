import express from 'express';
import { UserControllers } from './user.controller';
import auth from '../../middlewares/auth';
import resolveTenant from '../../middlewares/tenant';
import validateRequest from '../../middlewares/validateRequest';
import { UserValidation } from './user.validation';

const router = express.Router();

router.use(auth());

// Self-service profile routes
router.put('/me', validateRequest(UserValidation.updateOwnProfileValidationSchema), UserControllers.updateOwnProfile);
router.put('/me/password', validateRequest(UserValidation.changeOwnPasswordValidationSchema), UserControllers.changeOwnPassword);

// Tenant-scoped management routes
router.use(resolveTenant);

router.get('/', auth('owner', 'manager'), UserControllers.getUsersByFarm);
router.post('/', auth('owner', 'manager'), validateRequest(UserValidation.createUserValidationSchema), UserControllers.createUser);
router.post('/invite', auth('owner', 'manager'), validateRequest(UserValidation.createUserValidationSchema), UserControllers.createUser);
router.post('/workers', auth('owner', 'manager'), validateRequest(UserValidation.createUserValidationSchema), UserControllers.createUser);

router.patch('/:id/toggle-active', auth('owner'), UserControllers.toggleUserActive);
router.patch('/:id/role', auth('owner'), validateRequest(UserValidation.updateUserRoleValidationSchema), UserControllers.updateUserRole);
router.patch('/:id', auth('owner'), UserControllers.updateUser);
router.delete('/:id', auth('owner'), UserControllers.deleteUser);

export const UserRoutes = router;
