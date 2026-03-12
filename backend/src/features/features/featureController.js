import {
    handleAsync
} from '../helpers/handleAsync.js';
import {
    parseId
} from '../helpers/validators.js';
import { getAllFeaturesService, getFeatureByIdService, createFeatureService, updateFeatureService, deleteFeatureService } from './featureService.js';

// GET /api/projects/:projectId/features
export const getAllFeaturesController = handleAsync(async (req, res) => {
    const projectId = parseId(req.params.projectId);  // <--- nytt
    const features = await getAllFeaturesService(projectId);
    res.json(features);
});

// GET /api/projects/:projectId/features/:id
export const getFeatureByIdController = handleAsync(async (req, res) => {
    const projectId = parseId(req.params.projectId); // <--- nytt
    const id = parseId(req.params.id);
    const feature = await getFeatureByIdService(projectId, id);
    if (!feature) {
        return res.status(404).json({ error: 'Feature not found' });
    }
    res.json(feature);
});

// POST /api/projects/:projectId/features
export const createFeatureController = handleAsync(async (req, res) => {
    const projectId = parseId(req.params.projectId); // <--- nytt
    const data = req.body;
    const newFeature = await createFeatureService(projectId, data);
    res.status(201).json(newFeature);
});

// PUT /api/projects/:projectId/features/:id
export const updateFeatureController = handleAsync(async (req, res) => {
    const projectId = parseId(req.params.projectId); // <--- nytt
    const id = parseId(req.params.id);
    const data = req.body;  
    const updatedFeature = await updateFeatureService(projectId, id, data);    
    res.status(201).json(updatedFeature);
});

// DELETE /api/projects/:projectId/features/:id
export const deleteFeatureController = handleAsync(async (req, res) => {
    const projectId = parseId(req.params.projectId); // <--- nytt
    const id = parseId(req.params.id);
    await deleteFeatureService(projectId, id);
    res.status(204).send();
});

