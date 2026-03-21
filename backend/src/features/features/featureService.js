import { prisma } from '../prisma/client.js';

const FEATURE_STATUSES = ['PLANNED', 'IN_PROGRESS', 'DONE'];

async function userHasProjectAccess(projectId, userId) {
  if (!userId) {
    return false;
  }

  const membership = await prisma.projectMember.findUnique({
    where: {
      userId_projectId: {
        userId,
        projectId
      }
    },
    select: { id: true }
  });

  return Boolean(membership);
}

export async function getAllFeaturesService(projectId, userId) {
  if (!(await userHasProjectAccess(projectId, userId))) {
    return [];
  }

  return prisma.feature.findMany({
    where: { projectId },
    include: { technologies: true, tasks: true, requirement: true }
  });
}

export async function getFeatureByIdService(projectId, featureId, userId) {
  if (!(await userHasProjectAccess(projectId, userId))) {
    return null;
  }

  return prisma.feature.findFirst({
    where: {
      id: featureId,
      projectId
    },
    include: { technologies: true, tasks: true, requirement: true }
  });
}

export async function createFeatureService(projectId, data, userId) {
  if (!(await userHasProjectAccess(projectId, userId))) {
    return null;
  }

  const { moduleId, name, description, technologyIds } = data;
  const normalizedModuleId = Number(moduleId);
  const normalizedRequirementId = data.requirementId != null && data.requirementId !== ''
    ? Number(data.requirementId)
    : null;

  const module = await prisma.module.findFirst({
    where: {
      id: normalizedModuleId,
      projectId
    },
    select: { id: true }
  });

  if (!module) {
    throw new Error('Module not found for this project');
  }

  if (normalizedRequirementId != null) {
    const requirement = await prisma.requirement.findFirst({
      where: {
        id: normalizedRequirementId,
        projectId
      },
      select: { id: true }
    });

    if (!requirement) {
      throw new Error('Requirement not found for this project');
    }
  }

  return prisma.feature.create({
    data: {
      projectId,
      moduleId: normalizedModuleId,
      requirementId: normalizedRequirementId,
      name,
      description: description ?? null,
      technologies: technologyIds
        ? { connect: technologyIds.map(id => ({ id })) }
        : undefined,
      status: 'PLANNED'
    },
    include: { technologies: true, tasks: true, requirement: true }
  });
}

export async function updateFeatureService(projectId, featureId, data, userId) {
  if (!(await userHasProjectAccess(projectId, userId))) {
    return null;
  }

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
  const hasRequirementId = Object.prototype.hasOwnProperty.call(data, 'requirementId');
  const normalizedRequirementId = hasRequirementId
    ? data.requirementId === null || data.requirementId === ''
      ? null
      : Number(data.requirementId)
    : undefined;

  if (normalizedRequirementId != null) {
    const requirement = await prisma.requirement.findFirst({
      where: {
        id: normalizedRequirementId,
        projectId
      },
      select: { id: true }
    });

    if (!requirement) {
      throw new Error('Requirement not found for this project');
    }
  }

  return prisma.feature.update({
    where: {
      id: featureId
    },
    data: {
      moduleId: data.moduleId !== undefined ? Number(data.moduleId) : undefined,
      requirementId: normalizedRequirementId,
      name: data.name,
      description: data.description,
      status: data.status,
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
    include: { technologies: true, tasks: true, requirement: true }
  });
}


export async function deleteFeatureService(projectId, featureId, userId) {
  if (!(await userHasProjectAccess(projectId, userId))) {
    return { count: 0 };
  }

  return prisma.feature.deleteMany({
    where: {
      id: featureId,
      projectId
    }
  });
}