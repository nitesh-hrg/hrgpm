import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { AuthGuard } from "@/components/auth-guard"
import { UserRole } from "@/types/enums"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { db } from "@/lib/db"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { RoleFixer } from "@/components/debug/role-fixer"
import { ResetSessionButton } from "@/components/auth/reset-session-button"

export default async function MentorDashboard() {
    const session = await getServerSession(authOptions)

    // 1. If not logged in, go to login
    if (!session?.user) {
        redirect("/auth/signin?callbackUrl=/mentor")
    }

    // 1.5 Safety Valve: If session exists but is "stale" (missing email), show reset screen



    // 2. If logged in but wrong role, show Access Denied (Allow ADMIN too)
    if (session.user.role !== "MENTOR" && session.user.role !== "ADMIN") {
        return (
            <div className="p-8 space-y-4">
                <div className="text-red-600 font-bold">Access Denied. Please log in as a Mentor.</div>
                <div className="bg-slate-100 p-4 rounded text-sm font-mono text-slate-700 border">
                    <p className="font-bold mb-2">Debug Details:</p>
                    <p>Current User: {session?.user?.email || "None detected"}</p>
                    <p>Current Role: {session?.user?.role || "None"}</p>
                    <p>Expected Role: MENTOR</p>
                </div>

                <div className="bg-amber-50 border border-amber-200 p-4 rounded-md">
                    <h4 className="font-bold text-amber-900 mb-2">Dev Tool: Force Fix</h4>
                    <p className="text-xs text-amber-800 mb-3">If you are stuck as ADMIN, enter your email below to force-switch to MENTOR.</p>
                    <RoleFixer initialEmail={session?.user?.email} />
                </div>

                <Button asChild variant="outline">
                    <Link href="/api/auth/signout">Sign Out & Retry</Link>
                </Button>
            </div>
        )
    }


    const currentUser = session.user
    // Fix: session.user.id from next-auth might need to be verified against DB if we want to be 100% sure, 
    // but our auth.ts session callback populates it from DB, so it is safe.


    // specific query for tasks needing review
    // We find assignments for this mentor, then find tasks in those assignments that are IN_REVIEW
    // Optimally we could query TaskExecution directly with a nested relation filter, but this is fine.
    const pendingReviews = await db.taskExecution.findMany({
        where: {
            status: "IN_REVIEW",
            assignment: {
                mentorId: currentUser.id
            }
        },
        include: {
            assignment: {
                include: {
                    template: true,
                    assignedTo: true
                }
            }
        },
        orderBy: { updatedAt: 'desc' }
    })

    return (
        <AuthGuard allowedRoles={[UserRole.MENTOR, UserRole.ADMIN]}>
            <div className="flex min-h-screen w-full flex-col bg-slate-50/50">
                <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Mentor Dashboard</h1>
                    <p className="text-slate-500">Welcome, {currentUser.name}. You have <strong>{pendingReviews.length}</strong> tasks pending review.</p>

                    <div className="grid gap-6">
                        {pendingReviews.map((task) => {
                            const instance = task.assignment
                            return (
                                <Card key={task.id} className="border-l-4 border-l-amber-500 shadow-md">
                                    <CardHeader>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="text-sm font-medium text-amber-600 uppercase tracking-wider mb-1">Evidence Pending Review</div>
                                                <CardTitle className="text-2xl">{instance.template.title}</CardTitle>
                                                <div className="mt-1 font-semibold text-lg">Task: {task.title}</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm text-slate-500">Submitted by</div>
                                                <div className="font-semibold">{instance.assignedTo.name || instance.assignedTo.email}</div>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        {task.evidenceUrl && (
                                            <div className="bg-slate-100 p-3 rounded text-sm text-slate-700 truncate">
                                                Evidence: <a href={task.evidenceUrl} target="_blank" className="text-blue-600 hover:underline">{task.evidenceUrl}</a>
                                            </div>
                                        )}
                                    </CardContent>
                                    <CardFooter className="bg-slate-50/50 flex justify-end">
                                        <Button className="gap-2 bg-amber-600" asChild>
                                            <a href={`/intervention/${instance.id}`}>
                                                Review Task <ArrowRight className="h-4 w-4" />
                                            </a>
                                        </Button>
                                    </CardFooter>
                                </Card>
                            )
                        })}
                        {pendingReviews.length === 0 && <div className="text-center py-12 text-slate-500">No pending reviews. Good job!</div>}
                    </div>
                </main>
            </div>
        </AuthGuard>
    )
}
