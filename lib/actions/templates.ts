"use server"

import { db } from "@/lib/db"
import { TemplateStatus } from "@/types/enums"
import { revalidatePath } from "next/cache"

// --- HELPER: Bootstrap Users (Self-Healing) ---
async function getAuthenticatedUserId(providedId: string): Promise<string> {
    // If provided ID looks real (not the TODO placeholder), check if it exists
    if (providedId && providedId !== "ADMIN_USER_ID_TODO" && !providedId.includes("TODO")) {
        const user = await db.user.findUnique({ where: { id: providedId } })
        if (user) return user.id
    }

    // Otherwise, find existing ADMIN
    let admin = await db.user.findFirst({ where: { role: "ADMIN" } })

    // Create Admin if missing
    if (!admin) {
        // Check by email to avoid unique constraint error
        const existing = await db.user.findUnique({ where: { email: "admin@hrx.core" } })
        if (existing) {
            admin = existing
        } else {
            admin = await db.user.create({
                data: {
                    name: "Alice Admin",
                    email: "admin@hrx.core",
                    role: "ADMIN"
                }
            })
        }
    }

    // SIDE EFFECT: Ensure an HR Pro exists (for Assignments Wizard)
    // This ensures the NEXT flow works for the user immediately.
    const hrCount = await db.user.count({ where: { role: "HR_PRO" } })
    if (hrCount === 0) {
        const existingBob = await db.user.findUnique({ where: { email: "bob@hrx.core" } })
        if (!existingBob) {
            await db.user.create({
                data: { name: "Bob HR", email: "bob@hrx.core", role: "HR_PRO" }
            })
        }
    }

    // SIDE EFFECT: Ensure a Mentor exists
    const mentorCount = await db.user.count({ where: { role: "MENTOR" } })
    if (mentorCount === 0) {
        const existingCharlie = await db.user.findUnique({ where: { email: "charlie@hrx.core" } })
        if (!existingCharlie) {
            await db.user.create({
                data: { name: "Charlie Mentor", email: "charlie@hrx.core", role: "MENTOR" }
            })
        }
    }

    return admin.id
}

// --- TEMPLATE MANAGEMENT ACTIONS ---

export async function createTemplate(data: { title: string; description?: string; userId: string }) {
    const userId = await getAuthenticatedUserId(data.userId)

    const template = await db.interventionTemplate.create({
        data: {
            title: data.title,
            description: data.description,
            createdById: userId,
            version: "v1.0",
            status: TemplateStatus.DRAFT
        }
    })
    revalidatePath("/admin/templates")
    return template
}

export async function updateTemplateDesign(templateId: string, data: { title?: string; description?: string }) {
    const tpl = await db.interventionTemplate.findUnique({ where: { id: templateId } })
    if (!tpl) throw new Error("Template not found")

    // Status check removed to allow editing published templates

    const updated = await db.interventionTemplate.update({
        where: { id: templateId },
        data: {
            title: data.title,
            description: data.description
        }
    })
    revalidatePath(`/admin/templates/${templateId}/design`)
    return updated
}

export async function addTaskToTemplate(templateId: string, data: { title: string; order: number; defaultDurationDays: number }) {
    const tpl = await db.interventionTemplate.findUnique({ where: { id: templateId } })
    if (!tpl) throw new Error("Template not found")

    // Status check removed

    const task = await db.templateTask.create({
        data: {
            templateId,
            title: data.title,
            order: data.order,
            defaultDurationDays: data.defaultDurationDays
        }
    })
    revalidatePath(`/admin/templates/${templateId}/design`)
    return task
}

export async function removeTaskFromTemplate(taskId: string) {
    const task = await db.templateTask.findUnique({
        where: { id: taskId },
        include: { template: true }
    })

    if (!task) throw new Error("Task not found")

    // Status check removed

    await db.templateTask.delete({ where: { id: taskId } })
    revalidatePath(`/admin/templates/${task.templateId}/design`)
    revalidatePath("/admin/templates")
}

export async function publishTemplate(templateId: string) {
    const tpl = await db.interventionTemplate.findUnique({
        where: { id: templateId },
        include: { tasks: true }
    })
    if (!tpl) throw new Error("Template not found")
    if (tpl.tasks.length === 0) throw new Error("Cannot publish a template with no tasks")

    const updated = await db.interventionTemplate.update({
        where: { id: templateId },
        data: { status: TemplateStatus.PUBLISHED }
    })
    // Revalidating re-fetches the list where status is shown
    revalidatePath("/admin/templates")
    return updated
}

export async function addSubTask(taskId: string, instruction: string) {
    const task = await db.templateTask.findUnique({
        where: { id: taskId },
        include: { template: true, subTasks: true }
    })
    if (!task) throw new Error("Task not found")

    // Status check removed

    const subTask = await db.templateSubTask.create({
        data: {
            taskId,
            instruction,
            order: task.subTasks.length + 1
        }
    })
    revalidatePath(`/admin/templates/${task.template.id}/design`)
    return subTask
}

export async function removeSubTask(subTaskId: string) {
    const subTask = await db.templateSubTask.findUnique({
        where: { id: subTaskId },
        include: { task: { include: { template: true } } }
    })
    if (!subTask) throw new Error("Subtask not found")

    // Status check removed

    await db.templateSubTask.delete({ where: { id: subTaskId } })
    revalidatePath(`/admin/templates/${subTask.task.template.id}/design`)
}

export async function createTemplateVersion(originalTemplateId: string, userId: string) {
    const finalUserId = await getAuthenticatedUserId(userId)

    const original = await db.interventionTemplate.findUnique({
        where: { id: originalTemplateId },
        include: { tasks: { include: { subTasks: true } } }
    })
    if (!original) throw new Error("Template not found")

    // Determine new version string (simplistic logic: increment minor)
    const versionParts = original.version.replace("v", "").split(".")
    const newMajor = parseInt(versionParts[0])
    const newMinor = parseInt(versionParts[1]) + 1
    const newVersion = `v${newMajor}.${newMinor}`

    // Create new Draft
    const newDraft = await db.interventionTemplate.create({
        data: {
            title: original.title,
            description: original.description,
            version: newVersion,
            status: TemplateStatus.DRAFT,
            createdById: finalUserId,
        }
    })

    // Deep copy tasks
    for (const task of original.tasks) {
        const newTask = await db.templateTask.create({
            data: {
                templateId: newDraft.id,
                title: task.title,
                description: task.description,
                order: task.order,
                defaultDurationDays: task.defaultDurationDays
            }
        })

        // Copy subtasks
        if (task.subTasks.length > 0) {
            await db.templateSubTask.createMany({
                data: task.subTasks.map(st => ({
                    taskId: newTask.id,
                    instruction: st.instruction,
                    order: st.order
                }))
            })
        }
    }

    revalidatePath("/admin/templates")
    return newDraft
}
