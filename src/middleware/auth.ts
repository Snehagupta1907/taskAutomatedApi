import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';


declare global {
  namespace Express {
    interface Request {
      user?: IUser; 
    }
  }
}

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers['authorization'];
    console.log(token,"auth");

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized: Token missing' });
    }

    try {
        const decoded = jwt.verify(token, 'your-secret-key') as { userId: string };
        req.user = await User.findById(decoded.userId); 
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }
};
