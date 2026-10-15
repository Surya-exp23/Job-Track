import logger from "../../../Real projects/JobTrack/server/src/utils/logger.js";

export class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  logger.error(err.message, {
    stack: err.stack,
    path: req.originalUrl,
    method: req.method,
    body: req.body,
    statusCode,
  });

  res.status(statusCode).json({
    success: false,
    message: err.isOperational ? err.message : "Something went wrong. Please try again.",
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
};
