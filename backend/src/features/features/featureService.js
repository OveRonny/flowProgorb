import {
    prisma
} from '../prisma/client.js';

export async function getAllfeaturesService() {
    return prisma.feature.findMany({});
}

export async function getfeatureByIdService(id) {
    return prisma.feature.findUnique({
        where: {
            id
        }
    });
}

export async function createfeatureService(data) {
    return prisma.feature.create({
        data: {
            name: data.name,
            description: data.description,
            moduleId: data.moduleId,
            status: data.status ?? 'PLANNED',
            progress: data.progress ?? 0,
            priority: data.priority ?? null,
            deadline: data.deadline ? new Date(data.deadline) : null,
            githubIssueId: data.githubIssueId ?? null,
            githubIssueUrl: data.githubIssueUrl ?? null,
            githubIssueState: data.githubIssueState ?? null
        }
    });
}

const FEATURE_STATUSES = ['PLANNED', 'IN_PROGRESS', 'DONE']

export async function updatefeatureService(featureId, data) { 
  if (data.status && !FEATURE_STATUSES.includes(data.status)) {
    throw new Error(
      `Ugyldig status: ${data.status}. Gyldige verdier: ${FEATURE_STATUSES.join(', ')}`
    )
  }

  return prisma.feature.update({
    where: { id: featureId },
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
  })
}

export async function deletefeatureService(id) {
    return prisma.feature.delete({
        where: {
            id
        }
    });
}