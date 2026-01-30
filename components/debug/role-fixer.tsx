"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { forceRoleUpdate } from "@/lib/actions/dev-tools"
import { UserRole } from "@/types/enums"

export function RoleFixer({ initialEmail }: { initialEmail?: string | null }) {
    const [email, setEmail] = useState(initialEmail || "")
    const [status, setStatus] = useState("")

    const handleFix = async () => {
        if (!email) {
            setStatus("Enter email first")
            return
        }
        setStatus("Updating...")
        const res = await forceRoleUpdate(email, UserRole.MENTOR)
        if (res.success) {
            setStatus("Fixed! Redirecting to login...")
            // Force signout to clear old JWT, then go to login
            window.location.href = "/api/auth/signout?callbackUrl=/auth/signin"
        } else {
            setStatus("Error: " + res.error)
        }
    }

    return (
        <div className="space-y-2">
            <div className="flex gap-2">
                <input
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="hardik@example.com"
                    className="flex-1 px-3 py-1 text-sm border rounded bg-white"
                />
                <Button size="sm" onClick={handleFix} disabled={status === "Updating..."}>
                    Fix & Refresh
                </Button>
            </div>
            {status && <div className="text-xs font-bold text-amber-700">{status}</div>}
        </div>
    )
}
