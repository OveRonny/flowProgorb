import express from 'express';
import {
    authMiddleware
} from '../auth/authMiddleware.js'
import {
    getAllFeaturesController,
    getFeatureByIdController,
    createFeatureController,
    updateFeatureController,
    deleteFeatureController
} from './featureController.js'

const router = express.Router({ mergeParams: true });

router.post('/', authMiddleware, createFeatureController);
router.get('/', authMiddleware, getAllFeaturesController);
router.get('/:id', authMiddleware, getFeatureByIdController);
router.put('/:id', authMiddleware, updateFeatureController);
router.delete('/:id', authMiddleware, deleteFeatureController);

export default router;