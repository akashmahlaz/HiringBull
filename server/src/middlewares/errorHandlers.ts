import httpStatus from 'http-status';
import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';

export const notFoundHandler = (req: Request, res: Response, _next: NextFunction): void => {
  res.status(httpStatus.NOT_FOUND).json({ code: httpStatus.NOT_FOUND, message: 'Not Found' });
};

export const errorHandler: ErrorRequestHandler = (
  err: Error & { statusCode?: number; stack?: string },
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error(err);
  const statusCode = err.statusCode || httpStatus.INTERNAL_SERVER_ERROR;
  const message = err.message || httpStatus[statusCode];

  res.status(statusCode).json({
    code: statusCode,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};