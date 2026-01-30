import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const email = 'strategichrcourse@gmail.com'
    console.log(`Checking user: ${email}...`)

    const user = await prisma.user.findUnique({
        where: { email },
    })
    if (user) {
        console.log('User found:', user)
    } else {
        console.log('User NOT found.')
    }

    const count = await prisma.user.count()
    console.log(`Total users in DB: ${count}`)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
