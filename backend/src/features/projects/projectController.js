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
    syncGithubCollaboratorsService,
    publishProjectGithubReleaseService
} from './githubService.js';
import {
    getProjectPlanningService,
    createRequirementService,
    updateRequirementService,
    deleteRequirementService,
    createMilestoneService,
    updateMilestoneService,
    deleteMilestoneService,
    createCustomerMeetingService,
    updateCustomerMeetingService,
    deleteCustomerMeetingService
} from './planningService.js';

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

export const syncGithubCollaboratorsController = handleAsync(async (req, res) => {
    const projectId = parseId(req.params.id);
    const result = await syncGithubCollaboratorsService(projectId, req.user?.userId);
    res.json(result);
});

export const publishProjectGithubReleaseController = handleAsync(async (req, res) => {
    const projectId = parseId(req.params.id);
    const result = await publishProjectGithubReleaseService(projectId, req.body || {}, req.user?.userId);
    res.status(201).json(result);
});

export const getProjectPlanningController = handleAsync(async (req, res) => {
    const projectId = parseId(req.params.id);
    const project = await getProjectPlanningService(projectId, req.user?.userId);
    if (!project) {
        return res.status(404).json({ error: 'Project not found' });
    }

    res.json(project);
});

export const createRequirementController = handleAsync(async (req, res) => {
    const projectId = parseId(req.params.id);
    const requirement = await createRequirementService(projectId, req.body || {}, req.user?.userId);
    if (!requirement) {
        return res.status(404).json({ error: 'Project not found' });
    }

    res.status(201).json(requirement);
});

export const updateRequirementController = handleAsync(async (req, res) => {
    const projectId = parseId(req.params.id);
    const requirementId = parseId(req.params.requirementId);
    const requirement = await updateRequirementService(projectId, requirementId, req.body || {}, req.user?.userId);
    if (!requirement) {
        return res.status(404).json({ error: 'Requirement not found' });
    }

    res.json(requirement);
});

export const deleteRequirementController = handleAsync(async (req, res) => {
    const projectId = parseId(req.params.id);
    const requirementId = parseId(req.params.requirementId);
    const result = await deleteRequirementService(projectId, requirementId, req.user?.userId);
    if (!result.count) {
        return res.status(404).json({ error: 'Requirement not found' });
    }

    res.status(204).send();
});

export const createMilestoneController = handleAsync(async (req, res) => {
    const projectId = parseId(req.params.id);
    const milestone = await createMilestoneService(projectId, req.body || {}, req.user?.userId);
    if (!milestone) {
        return res.status(404).json({ error: 'Project not found' });
    }

    res.status(201).json(milestone);
});

export const updateMilestoneController = handleAsync(async (req, res) => {
    const projectId = parseId(req.params.id);
    const milestoneId = parseId(req.params.milestoneId);
    const milestone = await updateMilestoneService(projectId, milestoneId, req.body || {}, req.user?.userId);
    if (!milestone) {
        return res.status(404).json({ error: 'Milestone not found' });
    }

    res.json(milestone);
});

export const deleteMilestoneController = handleAsync(async (req, res) => {
    const projectId = parseId(req.params.id);
    const milestoneId = parseId(req.params.milestoneId);
    const result = await deleteMilestoneService(projectId, milestoneId, req.user?.userId);
    if (!result.count) {
        return res.status(404).json({ error: 'Milestone not found' });
    }

    res.status(204).send();
});

export const createCustomerMeetingController = handleAsync(async (req, res) => {
    const projectId = parseId(req.params.id);
    const meeting = await createCustomerMeetingService(projectId, req.body || {}, req.user?.userId);
    if (!meeting) {
        return res.status(404).json({ error: 'Project not found' });
    }

    res.status(201).json(meeting);
});

export const updateCustomerMeetingController = handleAsync(async (req, res) => {
    const projectId = parseId(req.params.id);
    const meetingId = parseId(req.params.meetingId);
    const meeting = await updateCustomerMeetingService(projectId, meetingId, req.body || {}, req.user?.userId);
    if (!meeting) {
        return res.status(404).json({ error: 'Customer meeting not found' });
    }

    res.json(meeting);
});

export const deleteCustomerMeetingController = handleAsync(async (req, res) => {
    const projectId = parseId(req.params.id);
    const meetingId = parseId(req.params.meetingId);
    const result = await deleteCustomerMeetingService(projectId, meetingId, req.user?.userId);
    if (!result.count) {
        return res.status(404).json({ error: 'Customer meeting not found' });
    }

    res.status(204).send();
});

