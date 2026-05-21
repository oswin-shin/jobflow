import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
    user?: any;
}

export const authMiddleware = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                error: 'No token provided',
            });
        }
        
        const token = authHeader.split(' ')[1];
        console.log(token);

        if (token === undefined) {
            return res.status(401).json({
                error: 'Token undefined'
            });
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET as string
        );

        req.user = decoded;

        next();
    } catch (e) {
        return res.status(401).json({
            error: 'Invalid token',
        });
    }
};