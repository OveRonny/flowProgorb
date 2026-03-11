import express from 'express';
import {
    getAllFrameworksController
} from './frameworks.controller.js';

const router = express.Router();

router.get('/', getAllFrameworksController);
export default router;