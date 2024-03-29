import express from 'express';
import { createTask, getTasksByStatus,getTasksByUserToken } from '../controller/taskController';
import authorizeToken from '../middleware/auth';

const router = express.Router();

router.post('/tasks',authorizeToken, createTask);
router.get('/tasks/:status', getTasksByStatus);
router.get('/tasks', authorizeToken, getTasksByUserToken);

export default router;
