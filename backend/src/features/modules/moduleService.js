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
    const projectId = Number(data.projectId);
    if (!Number.isInteger(projectId) || projectId <= 0) {
        throw new Error('projectId is required and must be a positive integer');
    }

    const lastModule = await prisma.module.findFirst({
        where: {
            projectId
        },
        orderBy: {
            orderIndex: 'desc'
        }
    });

    const nextIndex = lastModule?.orderIndex != null
        ? lastModule.orderIndex + 1
        : 1;

    return prisma.module.create({
        data: {
            name: data.name,
            description: data.description,
            projectId,
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
            description: data.description,
            projectId: data.projectId !== undefined ? Number(data.projectId) : undefined,
            orderIndex: data.orderIndex
        },  
        select: {
            id: true,
            name: true,
            description: true,
            projectId: true,
            orderIndex: true
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
