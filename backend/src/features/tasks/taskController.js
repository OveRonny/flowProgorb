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
    deleteTaskService,
    getTaskTimeLogsService,
    createTaskTimeLogService,
    updateTaskTimeLogService,
    deleteTaskTimeLogService
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

export const getTaskTimeLogsController = handleAsync(async (req, res) => {
    const featureId = parseId(req.params.featureId);
    const taskId = parseId(req.params.id);
    const logs = await getTaskTimeLogsService(featureId, taskId);
    res.json(logs);
});

export const createTaskTimeLogController = handleAsync(async (req, res) => {
    const featureId = parseId(req.params.featureId);
    const taskId = parseId(req.params.id);
    const newLog = await createTaskTimeLogService(featureId, taskId, req.body);
    res.status(201).json(newLog);
});

export const updateTaskTimeLogController = handleAsync(async (req, res) => {
    const featureId = parseId(req.params.featureId);
    const taskId = parseId(req.params.id);
    const timeLogId = parseId(req.params.timeLogId);
    const updatedLog = await updateTaskTimeLogService(featureId, taskId, timeLogId, req.body);
    res.json(updatedLog);
});

export const deleteTaskTimeLogController = handleAsync(async (req, res) => {
    const featureId = parseId(req.params.featureId);
    const taskId = parseId(req.params.id);
    const timeLogId = parseId(req.params.timeLogId);
    await deleteTaskTimeLogService(featureId, taskId, timeLogId);
    res.status(204).send();
});