import {
    prisma
} from '../prisma/client.js';

export async function getAllModulesService() {
    return prisma.module.findMany({});
}

export async function getModuleByIdService(id) {
    return prisma.module.findUnique({
        where: {
            id
        }
    });
}

export async function createModuleService(data) {  
  const lastModule = await prisma.module.findFirst({
    where: { projectId: data.projectId },
    orderBy: { orderIndex: 'desc' }
  });

  const nextIndex = lastModule ? lastModule.orderIndex + 1 : 1;

  return prisma.module.create({
    data: {
      name: data.name,
      description: data.description,
      projectId: data.projectId,
      orderIndex: nextIndex
    }
  });
}

export async function updateModuleService(id, data) {
    return prisma.module.update({
        where: {
            id
        },
        data: {
            name: data.name,
            description: data.description
        },  
        select: {
            id: true,
            name: true,
            description: true
        }
    });
}

export async function deleteModuleService(id) {
    return prisma.module.delete({
        where: {
            id
        }
    });
}
