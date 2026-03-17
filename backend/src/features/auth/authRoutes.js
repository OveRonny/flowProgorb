import express from 'express';
import { register, login, githubCallback } from './authController.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/callback', githubCallback);

export default router;