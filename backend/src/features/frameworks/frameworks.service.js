import {
    prisma
} from '../prisma/client.js';

export async function getAllFrameworksService() {
    return prisma.framework.findMany({});
}