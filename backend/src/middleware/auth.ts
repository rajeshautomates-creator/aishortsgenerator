import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config/env.js';
import logger from '../utils/logger.js';

export interface AuthRequest extends Request {
    admin?: boolean;
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, config.jwtSecret) as { admin: boolean };
        req.admin = decoded.admin;
        next();
    } catch (error) {
        logger.error('JWT verification failed:', error);
        return res.status(401).json({ message: 'Invalid token' });
    }
};
