// import { PrismaClient } from '@prisma/client'

// const prismaClientSingleton = () => {
//   return new PrismaClient()
// }

// type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>

// const globalForPrisma = globalThis as unknown as {
//   prisma: PrismaClientSingleton | undefined
// }

// export const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

// if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// MOCK FOR BUILD WITHOUT DB
const prismaMock = {
  user: {
    findUnique: async () => null,
    create: async () => ({ id: "mock-admin", role: "ADMIN" }),
    count: async () => 0
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const prisma = prismaMock as any
