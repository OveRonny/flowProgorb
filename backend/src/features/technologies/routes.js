import express from 'express';
import {
    authMiddleware
} from '../auth/authMiddleware.js'
import {
    getAllTechnologiesController,
    getTechnologyByIdController,
    createTechnologyController,
    updateTechnologyController,
    deleteTechnologyController,
    getTechnologyTypesController
} from './controller.js'

const router = express.Router();

router.get('/types', authMiddleware, getTechnologyTypesController);
router.post('/', authMiddleware, createTechnologyController);
router.get('/', authMiddleware, getAllTechnologiesController);
router.get('/:id', authMiddleware, getTechnologyByIdController);
router.put('/:id', authMiddleware, updateTechnologyController);
router.delete('/:id', authMiddleware, deleteTechnologyController);

export default router;