import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './features/auth/authRoutes.js';
import projectRoutes from './features/projects/projectRoutes.js'
import taskRoutes from './features/tasks/taskRoutes.js'
import moduleRoutes from './features/modules/moduleRoutes.js'
import featureRoutes from './features/features/featureRoutes.js'
import frameworksRoutes from './features/frameworks/frameworks.routes.js'
import languagesRoutes from './features/programmingLanguages/languages.routes.js'
import librariesRoutes from './features/libraries/libraries.routes.js'


const app = express();
app.use(express.json());
app.use(cors());

app.use('/auth', authRoutes);
app.use('/projects', projectRoutes);
app.use('/tasks', taskRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/features', featureRoutes);
app.use('/api/frameworks', frameworksRoutes);
app.use('/api/languages', languagesRoutes);
app.use('/api/libraries', librariesRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
