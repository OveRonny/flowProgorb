import {
    handleAsync
} from '../helpers/handleAsync.js';
import {
    parseId
} from '../helpers/validators.js';
import { getAllfeaturesService, getfeatureByIdService, createfeatureService, updatefeatureService, deletefeatureService } from './featureService.js';

export const getAllFeaturesController = handleAsync(async (req, res) => {
    const features = await getAllfeaturesService();
    res.json(features);
});

export const getFeatureByIdController = handleAsync(async (req, res) => {
    const id = parseId(req.params.id);
    const feature = await getfeatureByIdService(id);
    if (!feature) {
        return res.status(404).json({ error: 'Feature not found' });
    }
    res.json(feature);
});

export const createFeatureController = handleAsync(async (req, res) => {
    const data = req.body;
    const newfeature = await createfeatureService(data);
    res.status(201).json(newfeature);
});

export const updateFeatureController = handleAsync( async (req, res) => {
    const id = parseId(req.params.id);
    const data = req.body;  
    const updatefeature = await updatefeatureService(id, data);    
    res.status(201).json(updatefeature);
});

export const deleteFeatureController = handleAsync( async (req, res) => {
    const id = parseId(req.params.id);
    await deletefeatureService(id);
    res.status(204).send();
});