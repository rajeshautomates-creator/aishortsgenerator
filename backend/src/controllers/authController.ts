import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config/env.js';

export class AuthController {
    static login(req: Request, res: Response) {
        const { password } = req.body;

        if (password === config.adminPassword) {
            const token = jwt.sign({ admin: true }, config.jwtSecret, { expiresIn: '7d' });
            return res.json({ token, admin: true });
        }

        return res.status(401).json({ message: 'Invalid password' });
    }

    static verify(_req: Request, res: Response) {
        // If it reached here, the middleware already verified it
        return res.json({ valid: true, admin: true });
    }
}
