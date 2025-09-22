// backend/routes/userRoutes/authenticateJWT.ts

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { MikroORM } from '@mikro-orm/core';

const SECRET_KEY = 'your_secret_key';  // Replace with a strong secret key

declare module 'express-serve-static-core' {
    interface Request {
        user?: any;  // Define user property on Request object

    }
}

export const authenticateJWT = () => (req: Request, res: Response, next: NextFunction) => {
    // Exclude '/register' route from token check
    console.log("reached");
    if (req.path === '/register') {
        return next();  // Skip authentication for registration
    }else if(req.path === '/vehicle/type'){
        return next();
    }else if(req.path === '/bookings'){
        return next();
    }


    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        const decoded: any = jwt.verify(token, SECRET_KEY);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};
