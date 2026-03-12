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
    const featureId = parseId(req.params.featureId);
    const status = req.query.status;
    const tasks = await getAllTasksService(featureId, status);
    res.json(tasks);
});

export const getTaskByIdController = handleAsync(async (req, res) => {
    const featureId = parseId(req.params.featureId);
    const id = parseId(req.params.id);
    const task = await getTaskByIdService(featureId, id);
    if (!task) {
        return res.status(404).json({
            error: 'Task not found'
        });
    }
    res.json(task);
});

export const createTaskController = handleAsync(async (req, res) => {
    const featureId = parseId(req.params.featureId);
    const data = req.body;
    const newTask = await createTaskService(featureId, data);
    res.status(201).json(newTask);
});

export const updateTaskController = handleAsync(async (req, res) => {
    const featureId = parseId(req.params.featureId);
    const id = parseId(req.params.id);
    const data = req.body;
    const updateTask = await updateTaskService(featureId, id, data);
    res.status(201).json(updateTask);
});

export const deleteTaskController = handleAsync(async (req, res) => {
    const featureId = parseId(req.params.featureId);
    const id = parseId(req.params.id);
    await deleteTaskService(featureId, id);
    res.status(204).send();
});