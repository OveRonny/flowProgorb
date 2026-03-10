import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './features/auth/authRoutes.js';
import projectRoutes from './features/projects/projectRoutes.js'
import taskRoutes from './features/tasks/taskRoutes.js'
import moduleRoutes from './features/modules/moduleRoutes.js'
import featureRoutes from './features/features/featureRoutes.js'

const app = express();
app.use(express.json());
app.use(cors());

app.use('/auth', authRoutes);
app.use('/projects', projectRoutes);
app.use('/tasks', taskRoutes);
app.use('/modules', moduleRoutes);
app.use('/features', featureRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
