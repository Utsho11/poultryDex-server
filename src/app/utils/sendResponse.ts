import { Response } from 'express';

export type TResponse<T> = {
  statusCode: number;
  success: boolean;
  message?: string;
  data: T;
};

const sendResponse = <T>(res: Response, data: TResponse<T>) => {
  const isPlainObject =
    data.data !== null &&
    typeof data.data === 'object' &&
    !Array.isArray(data.data);

  res.status(data?.statusCode).json({
    success: data.success,
    statusCode: data.statusCode,
    message: data.message,
    data: data.data,
    ...(isPlainObject ? data.data : {}),
  });
};

export default sendResponse;
