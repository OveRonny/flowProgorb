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
                description: data.description,
                userId: data.userId
            }
        });

        return newProject;

    } catch (error) {
        throw new Error(error.message);
    }
}

export async function updateProjectService(id, data) {    
    return prisma.project.update({
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

export async function deleteProjectService(id) {
    return prisma.project.delete({
        where: {
            id
        }
    });
} 