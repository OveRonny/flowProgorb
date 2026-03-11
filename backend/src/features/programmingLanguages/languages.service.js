import {
    prisma
} from '../prisma/client.js';

export async function getAllLanguagesService() {
    return prisma.programmingLanguage.findMany({});
}