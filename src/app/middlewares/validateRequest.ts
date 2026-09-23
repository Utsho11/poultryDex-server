import { NextFunction, Request, Response } from 'express';
import { AnyZodObject, ZodEffects } from 'zod';
import { catchAsync } from '../utils/catchAsync';

const validateRequest = (schema: AnyZodObject | ZodEffects<any>) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // If schema directly validates the body or validates wrapped object
    const dataToValidate = 'body' in req.body ? req.body.body : req.body;
    const parsed = await schema.parseAsync(dataToValidate);
    req.body = parsed;
    next();
  });
};

export const validateRequestCookies = (schema: AnyZodObject) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const parsedCookies = await schema.parseAsync({
      cookies: req.cookies,
    });

    req.cookies = parsedCookies.cookies;
    next();
  });
};

export default validateRequest;
