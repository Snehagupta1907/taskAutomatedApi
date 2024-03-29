import { Request, Response, NextFunction } from 'express';
import User, { IUser } from '../models/User'; 

declare global {
  namespace Express {
    interface Request {
      user?: IUser; 
    }
  }
}

const authorizeToken = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.header('Authorization');

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized: Token missing' });
  }

  const user = await User.findOne({ apiKey: token });

  if (!user) {
    return res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }

  req.user = user;
  next();
};

export default authorizeToken;
