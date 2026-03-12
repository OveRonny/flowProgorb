import { PrismaClient, TechnologyType } from "@prisma/client"
const prisma = new PrismaClient()

export async function getAllTechnologiesService() {
    return prisma.technology.findMany({});
}

export async function getTechnologyByIdService(id) {
    return prisma.technology.findUnique({
        where: {
            id
        }
    });
}

export async function createTechnologyService(req, res) {
  const { name, type } = req.body

   if (!Object.values(TechnologyType).includes(type)) {
    return res.status(400).json({ error: "Invalid technology type" })  }

  const technology = await prisma.technology.create({
    data: {
      name,
      type
    }
  })

  res.json(technology)
}

export async function updateTechnologyService(id, data) {
    return prisma.technology.update({
        where: {
            id
        },
        data: {
            name: data.name,
            type: data.type,
        },
        select: {   
            id: true,
            name: true,
            type: true
        }
    });
}

export async function deleteTechnologyService(id) {
    return prisma.technology.delete({
        where: {
            id
        }
    });
}