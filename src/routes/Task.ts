import express from 'express';
import { createTask, getTasksByStatus,getTasksByUserToken } from '../controller/taskController';
import {authenticateToken} from '../middleware/auth';

const router = express.Router();

router.get('/',(req,res)=>{
    res.send('Hello World');
});
router.post('/tasks',authenticateToken, createTask);
router.get('/tasks/:status',getTasksByStatus);
router.get('/tasks', authenticateToken, getTasksByUserToken);

export default router;
