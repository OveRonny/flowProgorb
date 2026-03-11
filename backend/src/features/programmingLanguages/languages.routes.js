import express from 'express';
import {
    getAllLanguagesController
} from './languages.controller.js';
const router = express.Router();

router.get('/', getAllLanguagesController);

export default router;