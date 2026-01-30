"use client"

import { useSession } from "next-auth/react"
import { useRouter, usePathname } from "next/navigation"
import { useEffect } from "react"
import { UserRole } from "@/types/enums"

interface AuthGuardProps {
    children: React.ReactNode
    allowedRoles?: UserRole[]
}

export function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
    const { data: session, status } = useSession()
    const router = useRouter()
    const pathname = usePathname()

    useEffect(() => {
        if (status === "loading") return;

        if (status === "unauthenticated") {
            router.push("/auth/signin" + "?callbackUrl=" + pathname)
        } else if (allowedRoles && session?.user?.role) {
            if (!allowedRoles.includes(session.user.role)) {
                router.push("/unauthorized") // Need to create this page
            }
        }
    }, [status, session, allowedRoles, router, pathname])

    if (status === "loading") {
        return <div className="flex h-screen items-center justify-center">Loading...</div>
    }

    if (status === "authenticated") {
        // If we have strict role requirements, only render if role matches
        if (allowedRoles && session?.user?.role && !allowedRoles.includes(session.user.role)) {
            return null // Will redirect
        }
        return <>{children}</>
    }

    return null // Will redirect
}
