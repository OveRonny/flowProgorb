import {
    prisma
} from '../prisma/client.js';

export async function getAllLibrariesService() {
    return prisma.library.findMany({});
}
