import express from 'express';
import {
    getAllProjectsController,
    getProjectByIdController,
    createProjectController,
    updateProjectController,
    deleteProjectController,
    connectProjectGithubRepoController,
    getProjectGithubRepoController,
    createFeatureGithubIssueController,
    syncFeatureGithubIssueController
} from './projectController.js'
import {
    authMiddleware
} from '../auth/authMiddleware.js'

const router = express.Router();

router.post('/', authMiddleware, createProjectController);
router.get('/', authMiddleware, getAllProjectsController);
router.get('/:id', authMiddleware, getProjectByIdController);
router.put('/:id', authMiddleware, updateProjectController);
router.delete('/:id', authMiddleware, deleteProjectController);

router.post('/:id/github/connect', authMiddleware, connectProjectGithubRepoController);
router.get('/:id/github/repo', authMiddleware, getProjectGithubRepoController);
router.post('/:id/features/:featureId/github/issue', authMiddleware, createFeatureGithubIssueController);
router.post('/:id/features/:featureId/github/issue/sync', authMiddleware, syncFeatureGithubIssueController);


export default router;