"use server"

import { db } from "@/lib/db"
import { AssignmentStatus, TaskExecutionStatus, TemplateStatus } from "@/types/enums"
import { revalidatePath } from "next/cache"
import { addDays } from "date-fns" // Assuming date-fns is installed or use native

// Helper for native date math if date-fns not available (checking package.json earlier would be good but safe to standard lib)
function addDaysNative(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

export async function assignIntervention(data: {
    templateId: string;
    hrProId: string;
    mentorId?: string;
    startDate: Date;
}) {
    // 1. Fetch Template
    const template = await db.interventionTemplate.findUnique({
        where: { id: data.templateId },
        include: { tasks: { orderBy: { order: 'asc' } } }
    })

    if (!template) throw new Error("Template not found")
    if (template.status !== TemplateStatus.PUBLISHED) throw new Error("Can only assign PUBLISHED templates")
    if (template.tasks.length === 0) throw new Error("Template has no tasks")

    // 2. Calculate Dates
    let currentStartDate = new Date(data.startDate)
    const taskExecutionsData = []

    for (const taskTpl of template.tasks) {
        // Duration implies inclusive? e.g. Start Monday, 5 days -> Mon, Tue, Wed, Thu, Fri. End Friday.
        // Add days logic: Start + Duration = End? Usually Start + Duration - 1 is the inclusive end date?
        // Let's assume inclusive duration. defaultDurationDays = 1 means Start = End.

        // End Date
        const duration = taskTpl.defaultDurationDays
        const daysToAdd = Math.max(0, duration - 1) // prevent negative
        const endDate = addDaysNative(currentStartDate, daysToAdd)

        taskExecutionsData.push({
            // assignmentId linked later
            title: taskTpl.title,
            order: taskTpl.order,
            startDate: new Date(currentStartDate),
            endDate: new Date(endDate),
            status: taskTpl.order === 1 ? TaskExecutionStatus.ACTIVE : TaskExecutionStatus.LOCKED,
            // We could just link templateTaskId too if we added it to schema, but schema has separate tables
            // relying on snapshot data
        })

        // Next task starts the DAY AFTER this task ends
        currentStartDate = addDaysNative(endDate, 1)
    }

    const finalEndDate = taskExecutionsData[taskExecutionsData.length - 1].endDate

    // 3. Create Assignment Transaction
    const assignment = await db.interventionAssignment.create({
        data: {
            templateId: template.id,
            assignedToId: data.hrProId,
            mentorId: data.mentorId,
            startDate: data.startDate,
            calculatedEndDate: finalEndDate,
            status: AssignmentStatus.ACTIVE,
            taskExecutions: {
                create: taskExecutionsData
            }
        }
    })

    revalidatePath("/admin/assignments")
    return assignment
}
