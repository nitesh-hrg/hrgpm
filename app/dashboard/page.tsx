import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { AuthGuard } from "@/components/auth-guard"
import { UserRole } from "@/types/enums"
import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle, Calendar } from "lucide-react"
import { db } from "@/lib/db"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function Dashboard() {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
        redirect("/auth/signin?callbackUrl=/dashboard")
    }

    const currentUser = session.user

    const myInstances = await db.interventionAssignment.findMany({
        where: { assignedToId: currentUser.id },
        include: { template: true },
        orderBy: { startDate: 'desc' }
    })

    // Helper to calculate status/progress?
    // We can fetch tasks too if needed, but simplistic view only needs basic info.

    return (
        <AuthGuard allowedRoles={[UserRole.HR_PRO, UserRole.ADMIN, UserRole.MENTOR]}>
            <div className="flex min-h-screen w-full flex-col bg-slate-50/50">
                <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-slate-900">My Dashboard</h1>
                            <p className="text-slate-500 mt-2">
                                Welcome, <span className="font-semibold text-slate-900">{currentUser.name || currentUser.email}</span>. execute your assigned HR interventions.
                            </p>
                        </div>
                    </div>

                    <div className="grid gap-6">
                        {myInstances.map(instance => (
                            <Card key={instance.id} className="border-l-4 border-l-blue-600 shadow-md">
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="text-sm font-medium text-blue-600 uppercase tracking-wider mb-1">
                                                Active Assignment
                                            </div>
                                            <CardTitle className="text-2xl">{instance.template.title}</CardTitle>
                                            <CardDescription className="mt-2 text-lg">
                                                {instance.template.description}
                                            </CardDescription>
                                        </div>
                                        <div className="text-right">
                                            <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-slate-900 text-slate-50">
                                                {instance.status}
                                            </div>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-6 text-sm text-slate-600">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4" />
                                            <span>Start: {instance.startDate.toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4" />
                                            <span>Status: {instance.status}</span>
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="bg-slate-50/50 flex justify-between items-center">
                                    <p className="text-sm text-slate-500">
                                        Target Completion: <strong>{instance.calculatedEndDate?.toLocaleDateString()}</strong>
                                    </p>
                                    <Button className="gap-2 bg-slate-900" asChild>
                                        <a href={`/intervention/${instance.id}`}>
                                            Continue Execution <ArrowRight className="h-4 w-4" />
                                        </a>
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}

                        {myInstances.length === 0 && (
                            <div className="text-center py-12">
                                <h3 className="text-lg font-medium text-slate-900">No Assignments Yet</h3>
                                <p className="text-slate-500">Wait for an Admin to assign you an intervention template.</p>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </AuthGuard>
    )
}
