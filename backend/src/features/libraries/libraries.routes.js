import express from 'express'
import {
    getAllLibrariesController
} from './libraries.controller.js';

const router = express.Router();

router.get('/', getAllLibrariesController);

export default router;