import express from 'express';
import { getAllProjectsController, getProjectByIdController, createProjectController, updateProjectController, deleteProjectController } from './projectController.js'
import { authMiddleware } from '../auth/authMiddleware.js'

const router = express.Router();

router.post('/', authMiddleware, createProjectController);
router.get('/', authMiddleware, getAllProjectsController);
router.get('/:id', authMiddleware, getProjectByIdController);
router.put('/:id', authMiddleware, updateProjectController);
router.delete('/:id', authMiddleware, deleteProjectController);


export default router;