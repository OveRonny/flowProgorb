import {
    handleAsync
} from '../helpers/handleAsync.js';
import {
    parseId
} from '../helpers/validators.js';
import { getAllProjectsService, getProjectByIdService, createProjectService, updateProjectService, deleteProjectService } from './projectService.js'
import {
    connectProjectGithubRepoService,
    getProjectGithubRepoService,
    createFeatureGithubIssueService,
    syncFeatureGithubIssueService,
    syncGithubCollaboratorsService
} from './githubService.js';

export const getAllProjectsController = handleAsync(async (req, res) => {
    const projects = await getAllProjectsService(req.user?.userId);
    res.json(projects);
});

export const getProjectByIdController = handleAsync(async (req, res) => {
    const id = parseId(req.params.id);
    const project = await getProjectByIdService(id, req.user?.userId);
    if (!project) {
        return res.status(404).json({ error: 'Project not found' });
    }
    res.json(project);
});

export const createProjectController = handleAsync(async (req, res) => {
    const data = req.body;    
    const newProject = await createProjectService({
        ...data,
        userId: req.user?.userId
    });   
    res.status(201).json(newProject);
});

export const updateProjectController = handleAsync( async (req, res) => {
    const id = parseId(req.params.id);
    const data = req.body;

    const updateProject = await updateProjectService(id, data, req.user?.userId);
    if (!updateProject) {
        return res.status(404).json({ error: 'Project not found' });
    }

    res.status(201).json(updateProject);
});

export const deleteProjectController = handleAsync( async (req, res) => {
    const id = parseId(req.params.id);
    const deleted = await deleteProjectService(id, req.user?.userId);
    if (!deleted) {
        return res.status(404).json({ error: 'Project not found' });
    }

    res.status(204).send();
});

export const connectProjectGithubRepoController = handleAsync(async (req, res) => {
    const projectId = parseId(req.params.id);
    const result = await connectProjectGithubRepoService(projectId, req.body || {}, req.user?.userId);
    res.json(result);
});

export const getProjectGithubRepoController = handleAsync(async (req, res) => {
    const projectId = parseId(req.params.id);
    const result = await getProjectGithubRepoService(projectId, req.user?.userId);
    res.json(result);
});

export const createFeatureGithubIssueController = handleAsync(async (req, res) => {
    const projectId = parseId(req.params.id);
    const featureId = parseId(req.params.featureId);
    const result = await createFeatureGithubIssueService(projectId, featureId, req.body || {}, req.user?.userId);
    res.status(201).json(result);
});

export const syncFeatureGithubIssueController = handleAsync(async (req, res) => {
    const projectId = parseId(req.params.id);
    const featureId = parseId(req.params.featureId);
    const result = await syncFeatureGithubIssueService(projectId, featureId, req.user?.userId);
    res.json(result);
});

export const syncGithubCollaboratorsController = handleAsync(async (req, res) => {
    const projectId = parseId(req.params.id);
    const result = await syncGithubCollaboratorsService(projectId, req.user?.userId);
    res.json(result);
});

