import { prisma } from '../prisma/client.js';

const FEATURE_STATUSES = ['PLANNED', 'IN_PROGRESS', 'DONE'];

export async function getAllFeaturesService(projectId) {
  return prisma.feature.findMany({
    where: { projectId },
    include: { technologies: true, tasks: true }
  });
}

export async function getFeatureByIdService(projectId, featureId) {
  return prisma.feature.findFirst({
    where: {
      id: featureId,
      projectId
    },
    include: { technologies: true, tasks: true }
  });
}

export async function createFeatureService(projectId, data) {
  const { moduleId, name, description, technologyIds } = data;

  return prisma.feature.create({
    data: {
      projectId,
      moduleId,
      name,
      description: description ?? null,
      technologies: technologyIds
        ? { connect: technologyIds.map(id => ({ id })) }
        : undefined,
      status: 'PLANNED',
      progress: 0
    },
    include: { technologies: true, tasks: true }
  });
}

export async function updateFeatureService(projectId, featureId, data) {
  if (data.status && !FEATURE_STATUSES.includes(data.status)) {
    throw new Error(
      `Ugyldig status: ${data.status}. Gyldige verdier: ${FEATURE_STATUSES.join(', ')}`
    );
  }

  return prisma.feature.updateMany({
    where: {
      id: featureId,
      projectId
    },
    data: {
      name: data.name,
      description: data.description,
      status: data.status,
      progress: data.progress,
      deadline: data.deadline ? new Date(data.deadline) : undefined,
      priority: data.priority,
      githubIssueId: data.githubIssueId,
      githubIssueUrl: data.githubIssueUrl,
      githubIssueState: data.githubIssueState
    }
  });
}


export async function deleteFeatureService(projectId, featureId) {
  return prisma.feature.deleteMany({
    where: {
      id: featureId,
      projectId
    }
  });
}