import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger.js';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    logger.error('Unhandled error:', err);

    const status = err.status || 500;
    const message = err.message || 'Internal server error';

    res.status(status).json({
        message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
};
