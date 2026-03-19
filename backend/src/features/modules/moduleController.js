import {
    handleAsync
} from '../helpers/handleAsync.js';
import {
    parseId
} from '../helpers/validators.js';
import {
    getAllModulesService,
    getModuleByIdService,
    createModuleService,
    updateModuleService,
    deleteModuleService
} from './moduleService.js';

export const getAllModulesController = handleAsync(async (req, res) => {
    const modules = await getAllModulesService(req.user?.userId);
    res.json(modules);
});

export const getModuleByIdController = handleAsync(async (req, res) => {
    const id = parseId(req.params.id);
    const module = await getModuleByIdService(id, req.user?.userId);
    if (!module) {
        return res.status(404).json({
            error: 'Module not found'
        });
    }
    res.json(module);
});

export const createModuleController = handleAsync(async (req, res) => {
    const data = req.body;
    const newModule = await createModuleService(data, req.user?.userId);
    if (!newModule) {
        return res.status(404).json({ error: 'Project not found' });
    }

    res.status(201).json(newModule);
});

export const updateModuleController = handleAsync(async (req, res) => {
    const id = parseId(req.params.id);
    const data = req.body;
    const updateModule = await updateModuleService(id, data, req.user?.userId);
    if (!updateModule) {
        return res.status(404).json({ error: 'Module not found' });
    }

    res.status(201).json(updateModule);
});

export const deleteModuleController = handleAsync(async (req, res) => {
    const id = parseId(req.params.id);
    const result = await deleteModuleService(id, req.user?.userId);
    if (!result.count) {
        return res.status(404).json({ error: 'Module not found' });
    }

    res.status(204).send();
});