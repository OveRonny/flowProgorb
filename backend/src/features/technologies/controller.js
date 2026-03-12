import {
    handleAsync
} from '../helpers/handleAsync.js';
import {
    parseId
} from '../helpers/validators.js';

import {
    getAllTechnologiesService,
    getTechnologyByIdService,
    createTechnologyService,
    updateTechnologyService,
    deleteTechnologyService,
    getTechnologyTypesService
} from './service.js';

export const getAllTechnologiesController = handleAsync(async (req, res) => {
    const technologies = await getAllTechnologiesService();
    res.json(technologies);
});

export const getTechnologyByIdController = handleAsync(async (req, res) => {
    const id = parseId(req.params.id);
    const technology = await getTechnologyByIdService(id);
    if (!technology) {
        return res.status(404).json({
            error: 'Technology not found'
        });
    }
    res.json(technology);
});

export const createTechnologyController = handleAsync(async (req, res) => {
    await createTechnologyService(req, res);
});

export const updateTechnologyController = handleAsync(async (req, res) => {
    const id = parseId(req.params.id);
    const data = req.body;
    const updateTechnology = await updateTechnologyService(id, data);
    res.status(201).json(updateTechnology);
});

export const deleteTechnologyController = handleAsync(async (req, res) => {
    const id = parseId(req.params.id);
    await deleteTechnologyService(id);
    res.status(204).send();
});

export const getTechnologyTypesController = handleAsync(async (req, res) => {
    const types = getTechnologyTypesService();
    res.json(types);
});