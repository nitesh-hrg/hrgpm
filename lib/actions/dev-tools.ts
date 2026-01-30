"use server"

import { db } from "@/lib/db"
import { UserRole } from "@/types/enums"
import { revalidatePath } from "next/cache"

export async function forceRoleUpdate(email: string, role: UserRole) {
    if (!email) return { success: false, error: "Email required" }

    try {
        const user = await db.user.findUnique({ where: { email } })
        if (!user) {
            // Try to create if missing (super safe dev mode)
            await db.user.create({
                data: {
                    email,
                    name: email.split("@")[0],
                    role,
                    image: null
                }
            })
            return { success: true, message: "User created and role set!" }
        }

        await db.user.update({
            where: { email },
            data: { role }
        })
        revalidatePath("/mentor")
        return { success: true, message: "Role updated successfully!" }
    } catch (e) {
        return { success: false, error: String(e) }
    }
}
