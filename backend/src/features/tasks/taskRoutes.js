import express from 'express';
import {
    authMiddleware
} from '../auth/authMiddleware.js'
import {
    getAllTasksController,
    getTaskByIdController,
    createTaskController,
    updateTaskController,
    deleteTaskController,
    getTaskTimeLogsController,
    createTaskTimeLogController,
    updateTaskTimeLogController,
    deleteTaskTimeLogController
} from './taskController.js'


const router = express.Router({ mergeParams: true });

router.post('/', authMiddleware, createTaskController);
router.get('/', authMiddleware, getAllTasksController);
router.get('/:id', authMiddleware, getTaskByIdController);
router.put('/:id', authMiddleware, updateTaskController);
router.delete('/:id', authMiddleware, deleteTaskController);

router.get('/:id/time-logs', authMiddleware, getTaskTimeLogsController);
router.post('/:id/time-logs', authMiddleware, createTaskTimeLogController);
router.put('/:id/time-logs/:timeLogId', authMiddleware, updateTaskTimeLogController);
router.delete('/:id/time-logs/:timeLogId', authMiddleware, deleteTaskTimeLogController);

export default router;