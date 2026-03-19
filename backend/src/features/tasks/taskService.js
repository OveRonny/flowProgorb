import { prisma } from '../prisma/client.js';
import { calculateTaskCollectionProgress } from '../helpers/progress.js';

const TASK_STATUSES = ['PENDING', 'IN_PROGRESS', 'DONE'];

const projectMembershipFilter = (userId) => ({
  feature: {
    project: {
      members: {
        some: {
          userId
        }
      }
    }
  }
});

export async function getAllTasksService(featureId, statusFilter, userId) {
  if (!userId) {
    return [];
  }

  const whereClause = {
    featureId,
    ...projectMembershipFilter(userId)
  };
  if (statusFilter && TASK_STATUSES.includes(statusFilter)) {
    whereClause.status = statusFilter;
  }

  return prisma.task.findMany({
    where: whereClause,
    include: { feature: true, timeLogs: true },
    orderBy: { orderIndex: 'asc' }
  });
}

export async function getTaskByIdService(featureId, taskId, userId) {
  if (!userId) {
    return null;
  }

  return prisma.task.findFirst({
    where: { id: taskId, featureId, ...projectMembershipFilter(userId) },
    include: {
      feature: true,
      timeLogs: {
        orderBy: { createdAt: 'desc' }
      }
    }
  });
}

export async function createTaskService(featureId, data, userId) {
  if (!userId) {
    return null;
  }

  const { title, description, status, estimatedHours, orderIndex } = data;

  if (status && !TASK_STATUSES.includes(status)) {
    throw new Error(
      `Ugyldig status: ${status}. Gyldige verdier: ${TASK_STATUSES.join(', ')}`
    );
  }

  const accessibleFeature = await prisma.feature.findFirst({
    where: {
      id: featureId,
      project: {
        members: {
          some: {
            userId
          }
        }
      }
    },
    select: { id: true }
  });

  if (!accessibleFeature) {
    return null;
  }

  const task = await prisma.task.create({
    data: {
      featureId,
      title,
      description: description ?? null,
      status: status ?? 'PENDING',
      estimatedHours,
      orderIndex
    },
    include: { feature: true, timeLogs: true }
  });

  return task;
}

export async function updateTaskService(featureId, taskId, data, userId) {
  if (!userId) {
    return null;
  }

  if (data.status && !TASK_STATUSES.includes(data.status)) {
    throw new Error(
      `Ugyldig status: ${data.status}. Gyldige verdier: ${TASK_STATUSES.join(', ')}`
    );
  }

  const existingTask = await prisma.task.findFirst({
    where: { id: taskId, featureId, ...projectMembershipFilter(userId) },
    select: { id: true }
  });

  if (!existingTask) {
    return null;
  }

  const updatedTask = await prisma.task.update({
    where: { id: taskId },
    data: {
      title: data.title,
      description: data.description,
      status: data.status,
      estimatedHours: data.estimatedHours,
      orderIndex: data.orderIndex,
      completedAt: data.status === 'DONE' ? new Date() : data.status ? null : undefined
    },
    include: { feature: true, timeLogs: true }
  });

  return updatedTask;
}

export async function deleteTaskService(featureId, taskId, userId) {
  if (!userId) {
    return { count: 0 };
  }

  return prisma.task.deleteMany({
    where: { id: taskId, featureId, ...projectMembershipFilter(userId) }
  });
}

export async function calculateFeatureProgress(featureId) {
  const tasks = await prisma.task.findMany({
    where: { featureId },
    select: { status: true }
  });

  return calculateTaskCollectionProgress(tasks);
}

export async function updateFeatureProgress(featureId) {
  return prisma.feature.findUnique({
    where: { id: featureId },
    select: { id: true, projectId: true }
  });
}

export async function calculateProjectProgress(projectId) {
  const features = await prisma.feature.findMany({
    where: { projectId },
    select: {
      tasks: {
        select: { status: true }
      }
    }
  });

  const allTasks = features.flatMap(feature => feature.tasks || []);
  if (allTasks.length > 0) {
    return calculateTaskCollectionProgress(allTasks);
  }

  return 0;
}

export async function updateProjectProgress(projectId) {
  return prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true }
  });
}

export async function syncFeatureAndProjectProgress(featureId) {
  return updateFeatureProgress(featureId);
}

async function ensureTaskInFeature(featureId, taskId, userId) {
  const task = await prisma.task.findFirst({
    where: { id: taskId, featureId, ...projectMembershipFilter(userId) },
    select: { id: true }
  });

  if (!task) {
    throw new Error('Task not found');
  }
}

export async function getTaskTimeLogsService(featureId, taskId, userId) {
  await ensureTaskInFeature(featureId, taskId, userId);

  return prisma.taskTimeLog.findMany({
    where: { taskId },
    orderBy: { createdAt: 'desc' }
  });
}

export async function createTaskTimeLogService(featureId, taskId, data, userId) {
  await ensureTaskInFeature(featureId, taskId, userId);

  const minutes = Number(data.minutes);
  if (!Number.isInteger(minutes) || minutes <= 0) {
    throw new Error('minutes must be a positive integer');
  }

  return prisma.taskTimeLog.create({
    data: {
      taskId,
      minutes,
      note: data.note ?? null
    }
  });
}

export async function updateTaskTimeLogService(featureId, taskId, timeLogId, data, userId) {
  if (!userId) {
    throw new Error('Task time log not found');
  }

  const existingLog = await prisma.taskTimeLog.findFirst({
    where: {
      id: timeLogId,
      taskId,
      task: {
        featureId,
        ...projectMembershipFilter(userId)
      }
    },
    select: { id: true }
  });

  if (!existingLog) {
    throw new Error('Task time log not found');
  }

  const updateData = {};

  if (data.minutes !== undefined) {
    const minutes = Number(data.minutes);
    if (!Number.isInteger(minutes) || minutes <= 0) {
      throw new Error('minutes must be a positive integer');
    }
    updateData.minutes = minutes;
  }

  if (data.note !== undefined) {
    updateData.note = data.note ?? null;
  }

  return prisma.taskTimeLog.update({
    where: { id: timeLogId },
    data: updateData
  });
}

export async function deleteTaskTimeLogService(featureId, taskId, timeLogId, userId) {
  if (!userId) {
    throw new Error('Task time log not found');
  }

  const existingLog = await prisma.taskTimeLog.findFirst({
    where: {
      id: timeLogId,
      taskId,
      task: {
        featureId,
        ...projectMembershipFilter(userId)
      }
    },
    select: { id: true }
  });

  if (!existingLog) {
    throw new Error('Task time log not found');
  }

  await prisma.taskTimeLog.delete({
    where: { id: timeLogId }
  });
}