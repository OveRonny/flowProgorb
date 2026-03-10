import express from 'express';
import { getAllModulesController, getModuleByIdController, createModuleController, updateModuleController, deleteModuleController } from './moduleController';
import { authMiddleware } from '../auth/authMiddleware.js'

const router = express.Router();

router.post('/', authMiddleware, createModuleController);
router.get('/', authMiddleware, getAllModulesController);
router.get('/:id', authMiddleware, getModuleByIdController);
router.put('/:id', authMiddleware, updateModuleController);
router.delete('/:id', authMiddleware, deleteModuleController);

export default router;