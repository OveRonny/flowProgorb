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
            moduleId: data.moduleId
        }
    });
}

export async function updatefeatureService(id, data) {
    return prisma.feature.update({
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

export async function deletefeatureService(id) {
    return prisma.feature.delete({
        where: {
            id
        }
    });
}
