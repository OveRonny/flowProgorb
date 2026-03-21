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
import {
    createTaskGithubIssueService,
    syncTaskGithubIssueService
} from '../projects/githubService.js';

export const getAllTasksController = handleAsync(async (req, res) => {
    const featureId = parseId(req.params.featureId);
    const status = req.query.status;
    const tasks = await getAllTasksService(featureId, status, req.user?.userId);
    res.json(tasks);
});

export const getTaskByIdController = handleAsync(async (req, res) => {
    const featureId = parseId(req.params.featureId);
    const id = parseId(req.params.id);
    const task = await getTaskByIdService(featureId, id, req.user?.userId);
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
    const newTask = await createTaskService(featureId, data, req.user?.userId);
    if (!newTask) {
        return res.status(404).json({ error: 'Feature not found' });
    }

    res.status(201).json(newTask);
});

export const updateTaskController = handleAsync(async (req, res) => {
    const featureId = parseId(req.params.featureId);
    const id = parseId(req.params.id);
    const data = req.body;
    const updateTask = await updateTaskService(featureId, id, data, req.user?.userId);
    if (!updateTask) {
        return res.status(404).json({ error: 'Task not found' });
    }

    res.status(201).json(updateTask);
});

export const deleteTaskController = handleAsync(async (req, res) => {
    const featureId = parseId(req.params.featureId);
    const id = parseId(req.params.id);
    const result = await deleteTaskService(featureId, id, req.user?.userId);
    if (!result.count) {
        return res.status(404).json({ error: 'Task not found' });
    }

    res.status(204).send();
});

export const createTaskGithubIssueController = handleAsync(async (req, res) => {
    const featureId = parseId(req.params.featureId);
    const taskId = parseId(req.params.id);
    const task = await createTaskGithubIssueService(featureId, taskId, req.body || {}, req.user?.userId);
    res.status(201).json(task);
});

export const syncTaskGithubIssueController = handleAsync(async (req, res) => {
    const featureId = parseId(req.params.featureId);
    const taskId = parseId(req.params.id);
    const task = await syncTaskGithubIssueService(featureId, taskId, req.user?.userId);
    res.json(task);
});

export const getTaskTimeLogsController = handleAsync(async (req, res) => {
    const featureId = parseId(req.params.featureId);
    const taskId = parseId(req.params.id);
    const logs = await getTaskTimeLogsService(featureId, taskId, req.user?.userId);
    res.json(logs);
});

export const createTaskTimeLogController = handleAsync(async (req, res) => {
    const featureId = parseId(req.params.featureId);
    const taskId = parseId(req.params.id);
    const newLog = await createTaskTimeLogService(featureId, taskId, req.body, req.user?.userId);
    res.status(201).json(newLog);
});

export const updateTaskTimeLogController = handleAsync(async (req, res) => {
    const featureId = parseId(req.params.featureId);
    const taskId = parseId(req.params.id);
    const timeLogId = parseId(req.params.timeLogId);
    const updatedLog = await updateTaskTimeLogService(featureId, taskId, timeLogId, req.body, req.user?.userId);
    res.json(updatedLog);
});

export const deleteTaskTimeLogController = handleAsync(async (req, res) => {
    const featureId = parseId(req.params.featureId);
    const taskId = parseId(req.params.id);
    const timeLogId = parseId(req.params.timeLogId);
    await deleteTaskTimeLogService(featureId, taskId, timeLogId, req.user?.userId);
    res.status(204).send();
});