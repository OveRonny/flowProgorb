import {
    prisma
} from '../prisma/client.js';

export async function getAllProjectsService() {
    return prisma.project.findMany({});    
}

export async function getProjectByIdService(id) {
    return prisma.project.findUnique({
        where: {
            id
        }
    });
}

export async function createProjectService(data) {
  try {
    const newProject = await prisma.project.create({
      data: {
        name: data.name,
        description: data.description ?? null,
        userId: data.userId,
        status: data.status ?? 'PLANNED',           // default enum
        progress: data.progress ?? 0,               // default 0
        deadline: data.deadline ? new Date(data.deadline) : null,
        priority: data.priority ?? null,
        tags: data.tags ?? [],
        githubRepoUrl: data.githubRepoUrl ?? null,
        githubRepoId: data.githubRepoId ?? null,
        githubDefaultBranch: data.githubDefaultBranch ?? null
      }
    })

    return newProject
  } catch (error) {
    throw new Error(error.message)
  }
}

export async function updateProjectService(id, data) {
  // Valider enum status hvis sendt
  const PROJECT_STATUSES = ['PLANNED', 'ACTIVE', 'COMPLETED', 'ON_HOLD']
  if (data.status && !PROJECT_STATUSES.includes(data.status)) {
    throw new Error(
      `Ugyldig status: ${data.status}. Gyldige verdier: ${PROJECT_STATUSES.join(', ')}`
    )
  }

  return prisma.project.update({
    where: { id },
    data: {
      name: data.name,
      description: data.description,
      status: data.status,
      progress: data.progress,
      deadline: data.deadline ? new Date(data.deadline) : undefined,
      priority: data.priority,
      tags: data.tags,
      githubRepoUrl: data.githubRepoUrl,
      githubRepoId: data.githubRepoId,
      githubDefaultBranch: data.githubDefaultBranch
    },
    select: {
      id: true,
      name: true,
      description: true,
      status: true,
      progress: true,
      deadline: true,
      priority: true,
      tags: true,
      githubRepoUrl: true,
      githubRepoId: true,
      githubDefaultBranch: true
    }
  })
}

export async function deleteProjectService(id) {
    return prisma.project.delete({
        where: {
            id
        }
    });
} 