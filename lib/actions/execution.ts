"use server"

import { db } from "@/lib/db"
import { TaskExecutionStatus } from "@/types/enums" // Ensure these match schema strings if using strings
import { revalidatePath } from "next/cache"

// Helper to find next task
async function unlockNextTask(assignmentId: string, currentOrder: number) {
    const nextTask = await db.taskExecution.findFirst({
        where: {
            assignmentId,
            order: currentOrder + 1
        }
    })

    if (nextTask) {
        await db.taskExecution.update({
            where: { id: nextTask.id },
            data: { status: "ACTIVE" } // String "ACTIVE"
        })
    } else {
        // No more tasks? Mark assignment complete?
        await db.interventionAssignment.update({
            where: { id: assignmentId },
            data: { status: "COMPLETED", completedDate: new Date() }
        })
    }
}

export async function submitEvidence(taskExecutionId: string, evidenceUrl: string) {
    const execution = await db.taskExecution.findUnique({
        where: { id: taskExecutionId }
    })

    if (!execution) throw new Error("Task not found")
    if (execution.status !== "ACTIVE" && execution.status !== "REJECTED") {
        throw new Error("Task is not active")
    }

    await db.taskExecution.update({
        where: { id: taskExecutionId },
        data: {
            evidenceUrl,
            status: "IN_REVIEW"
        }
    })

    revalidatePath(`/intervention/${execution.assignmentId}`)
}

export async function approveTask(taskExecutionId: string) {
    const execution = await db.taskExecution.findUnique({
        where: { id: taskExecutionId }
    })
    if (!execution) throw new Error("Task not found")

    // Mark complete
    await db.taskExecution.update({
        where: { id: taskExecutionId },
        data: {
            status: "COMPLETED",
            completedAt: new Date()
        }
    })

    // Unlock next
    await unlockNextTask(execution.assignmentId, execution.order)

    revalidatePath(`/intervention/${execution.assignmentId}`)
}

export async function rejectTask(taskExecutionId: string, comment: string) {
    const execution = await db.taskExecution.findUnique({
        where: { id: taskExecutionId }
    })
    if (!execution) throw new Error("Task not found")

    await db.taskExecution.update({
        where: { id: taskExecutionId },
        data: {
            status: "REJECTED", // or REWORK
            mentorComment: comment
        }
    })

    revalidatePath(`/intervention/${execution.assignmentId}`)
}
