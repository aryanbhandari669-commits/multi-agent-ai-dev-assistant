import logger from '../config/logger.js';

const errorHandler = (err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  logger.error(`${status} - ${message}`);

  if (process.env.NODE_ENV === 'development') {
    res.status(status).json({
      error: {
        message,
        status,
        stack: err.stack
      }
    });
  } else {
    res.status(status).json({
      error: {
        message: status === 500 ? 'Internal Server Error' : message,
        status
      }
    });
  }
};

export default errorHandler;
