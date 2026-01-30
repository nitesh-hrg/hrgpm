import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const email = 'strategichrcourse@gmail.com'
    console.log(`DELETING user: ${email}...`)

    try {
        const deleted = await prisma.user.delete({
            where: { email },
        })
        console.log('SUCCESS: User deleted.', deleted)
    } catch (e) {
        console.log("User might not exist or already deleted.", e)
    }
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
