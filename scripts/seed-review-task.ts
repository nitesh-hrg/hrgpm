import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const mentorEmail = 'strategichrcourse@gmail.com'

    // 1. Get Mentor
    const mentor = await prisma.user.findUnique({ where: { email: mentorEmail } })
    if (!mentor) throw new Error("Mentor not found")

    // 2. Get/Create HR User (Simulated mentee)
    let hrUser = await prisma.user.findFirst({ where: { role: 'HR_PRO' } })
    if (!hrUser) {
        hrUser = await prisma.user.create({
            data: {
                email: 'mentee@hrx.core',
                name: 'Alice HR (Mentee)',
                role: 'HR_PRO'
            }
        })
    }

    // 3. Get/Create Template
    let template = await prisma.interventionTemplate.findFirst()
    if (!template) {
        template = await prisma.interventionTemplate.create({
            data: {
                title: "Performance Improvement Plan",
                description: "Standard PIP flow",
                status: "PUBLISHED",
                createdById: mentor.id // doesn't matter much
            }
        })
    }

    // 4. Create Assignment
    const assignment = await prisma.interventionAssignment.create({
        data: {
            templateId: template.id,
            assignedToId: hrUser.id,
            mentorId: mentor.id,
            startDate: new Date(),
            status: "ACTIVE"
        }
    })

    // 5. Create Task in IN_REVIEW
    await prisma.taskExecution.create({
        data: {
            assignmentId: assignment.id,
            title: "Initial Self-Assessment",
            order: 1,
            startDate: new Date(),
            endDate: new Date(), // Due today
            status: "IN_REVIEW",
            evidenceUrl: "https://docs.google.com/document/d/example-evidence", // Simulation
            createdAt: new Date()
        }
    })

    console.log("SUCCESS: Created a test task 'Initial Self-Assessment' pending review for this mentor.")
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
