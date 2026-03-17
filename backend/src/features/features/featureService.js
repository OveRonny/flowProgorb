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
  const normalizedModuleId = Number(moduleId);

  return prisma.feature.create({
    data: {
      projectId,
      moduleId: normalizedModuleId,
      name,
      description: description ?? null,
      technologies: technologyIds
        ? { connect: technologyIds.map(id => ({ id })) }
        : undefined,
      status: 'PLANNED'
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

  const existingFeature = await prisma.feature.findFirst({
    where: {
      id: featureId,
      projectId
    },
    select: { id: true }
  });

  if (!existingFeature) {
    throw new Error('Feature not found');
  }

  const hasTechnologyIds = Array.isArray(data.technologyIds);
  const normalizedTechnologyIds = hasTechnologyIds
    ? data.technologyIds
      .map(id => Number(id))
      .filter(id => Number.isInteger(id) && id > 0)
    : [];

  return prisma.feature.update({
    where: {
      id: featureId
    },
    data: {
      moduleId: data.moduleId !== undefined ? Number(data.moduleId) : undefined,
      name: data.name,
      description: data.description,
      status: data.status,
      githubIssueId: data.githubIssueId,
      githubIssueUrl: data.githubIssueUrl,
      githubIssueState: data.githubIssueState,
      githubBranchName: data.githubBranchName,
      githubPRId: data.githubPRId,
      githubPRUrl: data.githubPRUrl,
      githubPRState: data.githubPRState,
      githubSyncedAt: data.githubSyncedAt ? new Date(data.githubSyncedAt) : undefined,
      technologies: hasTechnologyIds
        ? {
          set: normalizedTechnologyIds.map(id => ({ id }))
        }
        : undefined
    },
    include: { technologies: true, tasks: true }
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