import { Request, Response } from "express";
import User from "../models/User";
import { v4 as uuidv4 } from 'uuid';

export const registerUser = async (req: Request, res: Response) => {
    const { username } = req.body;
    const apiKey = generateApiKey(); 
  
    try {
      const user = await User.create({ username, apiKey });
      res.status(201).json({ user, apiKey });
    } catch (error) {
      console.error('Error registering user:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };



const generateApiKey = (): string => {
  return uuidv4();
};
