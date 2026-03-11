import {
    handleAsync
} from '../helpers/handleAsync.js';
import {
    parseId
} from '../helpers/validators.js';
import { getAllProjectsService, getProjectByIdService, createProjectService, updateProjectService, deleteProjectService } from './projectService.js'

export const getAllProjectsController = handleAsync(async (req, res) => {
    const projects = await getAllProjectsService();
    res.json(projects);
});

export const getProjectByIdController = handleAsync(async (req, res) => {
    const id = parseId(req.params.id);
    const project = await getProjectByIdService(id);
    if (!project) {
        return res.status(404).json({ error: 'Project not found' });
    }
    res.json(project);
});

export const createProjectController = handleAsync(async (req, res) => {
    const data = req.body;    
    const newProject = await createProjectService({
        ...data,
        userId: req.user.userId
    });   
    res.status(201).json(newProject);
});

export const updateProjectController = handleAsync( async (req, res) => {
    const id = parseId(req.params.id);
    const data = req.body;

    const updateProject = await updateProjectService(id, data);    
    res.status(201).json(updateProject);
});

export const deleteProjectController = handleAsync( async (req, res) => {
    const id = parseId(req.params.id);
    await deleteProjectService(id);
    res.status(204).send();
});

