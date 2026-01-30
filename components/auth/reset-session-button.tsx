"use client"

import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

export function ResetSessionButton() {
    return (
        <Button
            variant="destructive"
            className="w-full"
            onClick={() => signOut({ callbackUrl: "/auth/signin" })}
        >
            <LogOut className="mr-2 h-4 w-4" />
            Reset & Sign In
        </Button>
    )
}
