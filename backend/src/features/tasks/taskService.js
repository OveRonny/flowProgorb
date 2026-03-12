import { prisma } from '../prisma/client.js';

const TASK_STATUSES = ['PENDING', 'COMPLETED', 'IN_PROGRESS', 'BLOCKED', 'TODO', 'DONE'];

// Hent alle tasks for en feature, med filter og sortering
export async function getAllTasksService(featureId, statusFilter) {  
  const whereClause = { featureId };
  if (statusFilter && TASK_STATUSES.includes(statusFilter)) {
    whereClause.status = statusFilter;
  }

  return prisma.task.findMany({
    where: whereClause,
    include: { feature: true }, // inkluder feature-data
    orderBy: { orderIndex: 'asc' }
  });
}

// Hent en task spesifikt
export async function getTaskByIdService(featureId, taskId) {
  return prisma.task.findFirst({
    where: { id: taskId, featureId },
    include: { feature: true }
  });
}

// Opprett ny task under en feature
export async function createTaskService(featureId, data) {
  const { title, description, status, estimatedHours, orderIndex } = data;

  if (status && !TASK_STATUSES.includes(status)) {
    throw new Error(
      `Ugyldig status: ${status}. Gyldige verdier: ${TASK_STATUSES.join(', ')}`
    );
  }

  return prisma.task.create({
    data: {
      featureId,
      title,
      description: description ?? null,
      status: status ?? 'PENDING',
      estimatedHours,
      orderIndex
    },
    include: { feature: true }
  });
}

// Oppdater en task
export async function updateTaskService(featureId, taskId, data) {
  if (data.status && !TASK_STATUSES.includes(data.status)) {
    throw new Error(
      `Ugyldig status: ${data.status}. Gyldige verdier: ${TASK_STATUSES.join(', ')}`
    );
  }

  return prisma.task.updateMany({
    where: { id: taskId, featureId },
    data: {
      title: data.title,
      description: data.description,
      status: data.status,
      estimatedHours: data.estimatedHours,
      orderIndex: data.orderIndex,
      completedAt: data.status === 'COMPLETED' ? new Date() : null
    }
  });
}

// Slett en task
export async function deleteTaskService(featureId, taskId) {
  return prisma.task.deleteMany({
    where: { id: taskId, featureId }
  });
}

// Kalkuler progress for en feature basert på tasks
export async function calculateFeatureProgress(featureId) {
  const tasks = await prisma.task.findMany({
    where: { featureId },
    select: { status: true }
  });

  if (tasks.length === 0) return 0;

  const completedTasks = tasks.filter(t => t.status === 'COMPLETED').length;
  const progress = Math.round((completedTasks / tasks.length) * 100);
  return progress;
}

// Oppdater feature progress automatisk etter en task-endring
export async function updateFeatureProgress(featureId) {
  const progress = await calculateFeatureProgress(featureId);
  return prisma.feature.update({
    where: { id: featureId },
    data: { progress }
  });
}