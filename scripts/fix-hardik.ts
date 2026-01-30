import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const email = 'strategichrcourse@gmail.com'
    console.log(`Checking/Fixing user: ${email}...`)

    const user = await prisma.user.upsert({
        where: { email },
        update: {
            role: 'MENTOR',
            name: 'Hardik (Mentor)'
        },
        create: {
            email,
            name: 'Hardik (Mentor)',
            role: 'MENTOR',
            image: null
        }
    })

    console.log('SUCCESS: User is now configured as:', user)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
