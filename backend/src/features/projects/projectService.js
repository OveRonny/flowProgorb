import {
    prisma
} from '../prisma/client.js';

export async function getAllProjectsService() {
    return prisma.project.findMany({});    
}

export async function getProjectByIdService(id) {
  return prisma.project.findUnique({
    where: { id },
    include: {
      modules: {                 // ProjectModule
        include: {
          module: true           // selve Module-data
        }
      },
      features: {                // Features
        include: {
          technologies: true     // og teknologier
        }
      }
    }
  })
}

export async function createProjectService(data) {
  try {
    const {
      name,
      description,
      userId,
      status,
      progress,
      deadline,
      priority,
      tags,
      githubRepoUrl,
      githubRepoId,
      githubDefaultBranch
    } = data;

    const newProject = await prisma.project.create({
      data: {
        name,
        description: description ?? null,
        userId,
        status: status ?? 'PLANNED',
        progress: progress ?? 0,
        deadline: deadline ? new Date(deadline) : null,
        priority: priority ?? null,
        tags: tags ?? [],
        githubRepoUrl: githubRepoUrl ?? null,
        githubRepoId: githubRepoId ?? null,
        githubDefaultBranch: githubDefaultBranch ?? null       
      }
    });

    return newProject;
  } catch (error) {
    console.error('Feil ved opprettelse av prosjekt:', error);
    throw new Error(error.message);
  }
}

export async function updateProjectService(id, data) {  
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