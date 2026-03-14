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
    if (data.projectId == null) {
        return prisma.module.create({
            data: {
                name: data.name,
                description: data.description
            }
        });
    }

    const lastProjectModule = await prisma.projectModule.findFirst({
        where: {
            projectId: data.projectId
        },
        orderBy: {
            orderIndex: 'desc'
        }
    });

    const nextIndex = lastProjectModule?.orderIndex != null
        ? lastProjectModule.orderIndex + 1
        : 1;

    return prisma.module.create({
        data: {
            name: data.name,
            description: data.description,
            projectModules: {
                create: {
                    projectId: data.projectId,
                    orderIndex: nextIndex
                }
            }
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
