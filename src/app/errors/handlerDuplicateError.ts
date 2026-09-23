/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  TErrorSources,
  TGenericErrorResponse,
} from '../interfaces/error.interface';

const handleDuplicateError = (err: any): TGenericErrorResponse => {
  const match = err.message ? err.message.match(/"([^"]*)"/) : null;
  const extractedMessage = match && match[1] ? match[1] : 'Value';

  const errorSources: TErrorSources = [
    {
      path: '',
      message: `${extractedMessage} already exists`,
    },
  ];

  const statusCode = 400;

  return {
    statusCode,
    message: 'Duplicate key error',
    errorSources,
  };
};

export default handleDuplicateError;
