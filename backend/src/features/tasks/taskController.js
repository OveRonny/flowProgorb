import {
    handleAsync
} from '../helpers/handleAsync.js';
import {
    parseId
} from '../helpers/validators.js';

import {
    getAllTasksService,
    getTaskByIdService,
    createTaskService,
    updateTaskService,
    deleteTaskService
} from './taskService.js';

export const getAllTasksController = handleAsync(async (req, res) => {
    const tasks = await getAllTasksService();
    res.json(tasks);
});

export const getTaskByIdController = handleAsync(async (req, res) => {
    const id = parseId(req.params.id);
    const task = await getTaskByIdService(id);
    if (!task) {
        return res.status(404).json({
            error: 'Task not found'
        });
    }
    res.json(task);
});

export const createTaskController = handleAsync(async (req, res) => {
    const data = req.body;
    const newTask = await createTaskService(data);
    res.status(201).json(newTask);
});

export const updateTaskController = handleAsync(async (req, res) => {
    const id = parseId(req.params.id);
    const data = req.body;
    const updateTask = await updateTaskService(id, data);
    res.status(201).json(updateTask);
});

export const deleteTaskController = handleAsync(async (req, res) => {
    const id = parseId(req.params.id);
    await deleteTaskService(id);
    res.status(204).send();
});