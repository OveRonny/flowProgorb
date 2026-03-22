import express from 'express';
import {
    getAllProjectsController,
    getProjectByIdController,
    createProjectController,
    updateProjectController,
    deleteProjectController,
    getProjectPlanningController,
    listProjectVersionsController,
    createProjectVersionController,
    updateProjectVersionController,
    deleteProjectVersionController,
    connectProjectGithubRepoController,
    getProjectGithubRepoController,
    syncGithubCollaboratorsController,
    publishProjectGithubReleaseController,
    createRequirementController,
    updateRequirementController,
    deleteRequirementController,
    createMilestoneController,
    updateMilestoneController,
    deleteMilestoneController,
    createCustomerMeetingController,
    updateCustomerMeetingController,
    deleteCustomerMeetingController,
    createProjectEmailController,
    updateProjectEmailController,
    deleteProjectEmailController
} from './projectController.js'
import {
    authMiddleware
} from '../auth/authMiddleware.js'

const router = express.Router();

router.post('/', authMiddleware, createProjectController);
router.get('/', authMiddleware, getAllProjectsController);
router.get('/:id', authMiddleware, getProjectByIdController);
router.get('/:id/planning', authMiddleware, getProjectPlanningController);
router.get('/:id/versions', authMiddleware, listProjectVersionsController);
router.post('/:id/versions', authMiddleware, createProjectVersionController);
router.put('/:id/versions/:versionId', authMiddleware, updateProjectVersionController);
router.delete('/:id/versions/:versionId', authMiddleware, deleteProjectVersionController);
router.put('/:id', authMiddleware, updateProjectController);
router.delete('/:id', authMiddleware, deleteProjectController);

router.post('/:id/github/connect', authMiddleware, connectProjectGithubRepoController);
router.get('/:id/github/repo', authMiddleware, getProjectGithubRepoController);
router.post('/:id/github/sync-collaborators', authMiddleware, syncGithubCollaboratorsController);
router.post('/:id/github/releases', authMiddleware, publishProjectGithubReleaseController);
router.post('/:id/requirements', authMiddleware, createRequirementController);
router.put('/:id/requirements/:requirementId', authMiddleware, updateRequirementController);
router.delete('/:id/requirements/:requirementId', authMiddleware, deleteRequirementController);
router.post('/:id/milestones', authMiddleware, createMilestoneController);
router.put('/:id/milestones/:milestoneId', authMiddleware, updateMilestoneController);
router.delete('/:id/milestones/:milestoneId', authMiddleware, deleteMilestoneController);
router.post('/:id/customer-meetings', authMiddleware, createCustomerMeetingController);
router.put('/:id/customer-meetings/:meetingId', authMiddleware, updateCustomerMeetingController);
router.delete('/:id/customer-meetings/:meetingId', authMiddleware, deleteCustomerMeetingController);
router.post('/:id/emails', authMiddleware, createProjectEmailController);
router.put('/:id/emails/:emailId', authMiddleware, updateProjectEmailController);
router.delete('/:id/emails/:emailId', authMiddleware, deleteProjectEmailController);

export default router;