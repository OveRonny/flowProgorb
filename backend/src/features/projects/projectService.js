import {
    prisma
} from '../prisma/client.js';
import { calculateTaskCollectionProgress } from '../helpers/progress.js';

function calculateFeatureProgressFromTasks(feature) {
  const tasks = feature.tasks || [];
  if (tasks.length === 0) {
    return Number(feature.progress) || 0;
  }

  return calculateTaskCollectionProgress(tasks);
}

function calculateProjectProgressFromFeatures(features) {
  const allTasks = features.flatMap(feature => feature.tasks || []);
  if (allTasks.length > 0) {
    return calculateTaskCollectionProgress(allTasks);
  }

  if (features.length > 0) {
    const totalFeatureProgress = features.reduce((sum, feature) => sum + (Number(feature.progress) || 0), 0);
    return Math.round(totalFeatureProgress / features.length);
  }

  return 0;
}

export async function getAllProjectsService(userId) {
    if (!userId) {
      return [];
    }

    const projects = await prisma.project.findMany({
      where: {
        members: {
          some: {
            userId
          }
        }
      },
      include: {
        features: {
          include: {
              tasks: {
                include: {
                  timeLogs: {
                    select: {
                      minutes: true
                    }
                  }
                }
              }
          }
        }
      }
    });

    return projects.map((project) => {
      const features = (project.features || []).map((feature) => ({
        ...feature,
        progress: calculateFeatureProgressFromTasks(feature)
      }));

      return {
        ...project,
        features,
        progress: calculateProjectProgressFromFeatures(features)
      };
    });
}

export async function getProjectByIdService(id, userId) {
  if (!userId) {
    return null;
  }

  const project = await prisma.project.findFirst({
    where: {
      id,
      members: {
        some: {
          userId
        }
      }
    },
    include: {
      modules: {
        orderBy: { orderIndex: 'asc' }
      },
      features: {
        include: {
          technologies: true,
          tasks: {
            include: {
              timeLogs: {
                select: {
                  minutes: true
                }
              }
            }
          }
        }
      }
    }
  });

  if (!project) {
    return null;
  }

  const features = (project.features || []).map((feature) => ({
    ...feature,
    progress: calculateFeatureProgressFromTasks(feature)
  }));

  return {
    ...project,
    features,
    progress: calculateProjectProgressFromFeatures(features)
  };
}

export async function createProjectService(data) {
  try {
    const {
      name,
      description,
      userId,
      status,
      deadline,
      priority,
      tags,
      githubRepoUrl,
      githubRepoId,
      githubDefaultBranch,
      githubOwner,
      githubRepoName
    } = data;

    if (!userId) {
      const error = new Error('Unauthorized');
      error.status = 401;
      throw error;
    }

    const newProject = await prisma.project.create({
      data: {
        name,
        description: description ?? null,
        status: status ?? 'PLANNED',
        deadline: deadline ? new Date(deadline) : null,
        priority: priority ?? null,
        tags: tags ?? [],
        githubRepoUrl: githubRepoUrl ?? null,
        githubRepoId: githubRepoId ?? null,
        githubDefaultBranch: githubDefaultBranch ?? null,
        githubOwner: githubOwner ?? null,
        githubRepoName: githubRepoName ?? null,
        members: {
          create: {
            userId,
            role: 'OWNER'
          }
        }
      }
    });

    return newProject;
  } catch (error) {
    console.error('Feil ved opprettelse av prosjekt:', error);
    throw new Error(error.message);
  }
}

async function userHasProjectAccess(id, userId) {
  if (!userId) {
    return false;
  }

  const membership = await prisma.projectMember.findUnique({
    where: {
      userId_projectId: {
        userId,
        projectId: id
      }
    },
    select: { id: true }
  });

  return Boolean(membership);
}

export async function updateProjectService(id, data, userId) {
  if (!(await userHasProjectAccess(id, userId))) {
    return null;
  }

  const PROJECT_STATUSES = ['PLANNED', 'ACTIVE', 'COMPLETED', 'ON_HOLD'];
  if (data.status && !PROJECT_STATUSES.includes(data.status)) {
    throw new Error(
      `Ugyldig status: ${data.status}. Gyldige verdier: ${PROJECT_STATUSES.join(', ')}`
    );
  }

  return prisma.project.update({
    where: { id },
    data: {
      name: data.name,
      description: data.description,
      status: data.status,
      deadline: data.deadline ? new Date(data.deadline) : undefined,
      priority: data.priority,
      tags: data.tags,
      githubRepoUrl: data.githubRepoUrl,
      githubRepoId: data.githubRepoId,
      githubDefaultBranch: data.githubDefaultBranch,
      githubOwner: data.githubOwner,
      githubRepoName: data.githubRepoName
    },
    select: {
      id: true,
      name: true,
      description: true,
      status: true,
      deadline: true,
      priority: true,
      tags: true,
      githubRepoUrl: true,
      githubRepoId: true,
      githubDefaultBranch: true,
      githubOwner: true,
      githubRepoName: true
    }
  });
}

export async function deleteProjectService(id, userId) {
    if (!(await userHasProjectAccess(id, userId))) {
      return null;
    }

    return prisma.$transaction(async (tx) => {
      const features = await tx.feature.findMany({
        where: { projectId: id },
        select: { id: true }
      });

      const featureIds = features.map((feature) => feature.id);

      if (featureIds.length > 0) {
        await tx.taskTimeLog.deleteMany({
          where: {
            task: {
              featureId: {
                in: featureIds
              }
            }
          }
        });

        await tx.task.deleteMany({
          where: {
            featureId: {
              in: featureIds
            }
          }
        });

        await tx.feature.deleteMany({
          where: {
            id: {
              in: featureIds
            }
          }
        });
      }

      await tx.module.deleteMany({ where: { projectId: id } });
      await tx.milestone.deleteMany({ where: { projectId: id } });
      await tx.requirement.deleteMany({ where: { projectId: id } });
      await tx.customerMeeting.deleteMany({ where: { projectId: id } });
      await tx.activity.deleteMany({ where: { projectId: id } });
      await tx.projectMember.deleteMany({ where: { projectId: id } });

      return tx.project.delete({
        where: {
          id
        }
      });
    });
}