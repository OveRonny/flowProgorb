import {
    prisma
} from '../prisma/client.js';

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

export async function getAllModulesService(userId) {
    if (!userId) {
        return [];
    }

    return prisma.module.findMany({
        where: {
            project: {
                members: {
                    some: {
                        userId
                    }
                }
            }
        }
    });
}

export async function getModuleByIdService(id, userId) {
    if (!userId) {
        return null;
    }

    return prisma.module.findFirst({
        where: {
            id,
            project: {
                members: {
                    some: {
                        userId
                    }
                }
            }
        }
    });
}

export async function createModuleService(data, userId) {
    const projectId = Number(data.projectId);
    if (!Number.isInteger(projectId) || projectId <= 0) {
        throw new Error('projectId is required and must be a positive integer');
    }

    if (!(await userHasProjectAccess(projectId, userId))) {
        return null;
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

export async function updateModuleService(id, data, userId) {
    const existingModule = await prisma.module.findFirst({
        where: {
            id,
            project: {
                members: {
                    some: {
                        userId
                    }
                }
            }
        },
        select: { id: true, projectId: true }
    });

    if (!existingModule) {
        return null;
    }

    if (data.projectId !== undefined) {
        const nextProjectId = Number(data.projectId);
        if (!Number.isInteger(nextProjectId) || nextProjectId <= 0) {
            throw new Error('projectId must be a positive integer');
        }

        if (!(await userHasProjectAccess(nextProjectId, userId))) {
            return null;
        }
    }

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

export async function deleteModuleService(id, userId) {
    return prisma.module.deleteMany({
        where: {
            id,
            project: {
                members: {
                    some: {
                        userId
                    }
                }
            }
        }
    });
}
