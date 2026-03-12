import express from 'express';
import {
    authMiddleware
} from '../auth/authMiddleware.js'
import {
    getAllTasksController,
    getTaskByIdController,
    createTaskController,
    updateTaskController,
    deleteTaskController
} from './taskController.js'


const router = express.Router({ mergeParams: true });

router.post('/', authMiddleware, createTaskController);
router.get('/', authMiddleware, getAllTasksController);
router.get('/:id', authMiddleware, getTaskByIdController);
router.put('/:id', authMiddleware, updateTaskController);
router.delete('/:id', authMiddleware, deleteTaskController);

export default router;