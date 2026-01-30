"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function createUser(data: { name: string; email: string; role: string }) {
    // Basic validation
    if (!data.email || !data.role) {
        throw new Error("Email and Role are required")
    }

    // Check collision
    const existing = await db.user.findUnique({
        where: { email: data.email }
    })
    if (existing) {
        throw new Error("User with this email already exists")
    }

    const newUser = await db.user.create({
        data: {
            name: data.name,
            email: data.email,
            role: data.role
        }
    })

    revalidatePath("/admin/users")
    revalidatePath("/admin/assignments") // Because HR Pros/Mentors lists change
    return newUser
}

export async function deleteUser(userId: string) {
    // Check if user has active assignments?
    // Ideally yes, but for prototype we just allow deleting or set active=false.
    // Schema doesn't have cascade delete on Assignments -> User usually restricts.
    // Let's try delete, if it fails due to FK, we throw.

    try {
        await db.user.delete({
            where: { id: userId }
        })
        revalidatePath("/admin/users")
    } catch (error) {
        throw new Error("Cannot delete user. They may have active assignments.")
    }
}
