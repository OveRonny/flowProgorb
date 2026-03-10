import {
    handleAsync
} from '../helpers/handleAsync.js';
import {
    parseId
} from '../helpers/validators.js';
import { getAllModulesService, getModuleByIdService, createModuleService, updateModuleService, deleteModuleService } from './moduleService.js';

export const getAllModulesController = handleAsync(async (req, res) => {
    const modules = await getAllModulesService();
    res.json(modules);
});

export const getModuleByIdController = handleAsync(async (req, res) => {
    const id = parseId(req.params.id);
    const module = await getModuleByIdService(id);
    if (!module) {
        return res.status(404).json({ error: 'Module not found' });
    }
    res.json(module);
});

export const createModuleController = handleAsync(async (req, res) => {
    const data = req.body;
    const newModule = await createModuleService(data);
    res.status(201).json(newModule);
});

export const updateModuleController = handleAsync( async (req, res) => {
    const id = parseId(req.params.id);
    const data = req.body;  
    const updateModule = await updateModuleService(id, data);    
    res.status(201).json(updateModule);
});

export const deleteModuleController = handleAsync( async (req, res) => {
    const id = parseId(req.params.id);
    await deleteModuleService(id);
    res.status(204).send();
});
