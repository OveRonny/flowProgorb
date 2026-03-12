import {
    prisma
} from '../prisma/client.js';

export async function getAllTasksService() {
    return prisma.task.findMany({});
}

export async function getTaskByIdService(id) {
    return prisma.task.findUnique({
        where: {
            id
        }
    });
}

export async function createTaskService(data) {
    return prisma.task.create({
        data: {
            name: data.name,
            description: data.description,
            featureId: data.featureId,
            status: data.status
        }
    });
}

export async function updateTaskService(id, data) {
    return prisma.task.update({
        where: {
            id
        },
        data: {
            name: data.name,
            description: data.description,
            status: data.status
        },
        select: {   
            id: true,
            name: true,
            description: true
        }
    });
}

export async function deleteTaskService(id) {
    return prisma.task.delete({
        where: {
            id
        }
    });
}