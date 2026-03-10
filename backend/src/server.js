import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './features/auth/authRoutes.js';
import projectRoutes from './features/projects/projectRoutes.js'

const app = express();
app.use(express.json());
app.use(cors());

app.use('/auth', authRoutes);
app.use('/projects', projectRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
