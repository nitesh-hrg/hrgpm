import { AuthGuard } from "@/components/auth-guard"
import { UserRole } from "@/types/enums"
import { db } from "@/lib/db"
import { Calendar } from "lucide-react"
import { notFound } from "next/navigation"
import { TaskExecutionItem } from "@/components/intervention/task-execution-item"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export default async function InterventionPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const session = await getServerSession(authOptions)

    const instance = await db.interventionAssignment.findUnique({
        where: { id },
        include: {
            template: {
                include: { tasks: { include: { subTasks: { orderBy: { order: 'asc' } } } } }
            },
            taskExecutions: { orderBy: { order: 'asc' } }
        }
    })

    if (!instance) notFound()

    const isMentor = session?.user?.id === instance.mentorId
    const isAdmin = session?.user?.role === UserRole.ADMIN // Allow admins to force approve too? Maybe later.

    return (
        <AuthGuard allowedRoles={[UserRole.HR_PRO, UserRole.ADMIN, UserRole.MENTOR]}>
            <div className="flex min-h-screen w-full flex-col bg-slate-50/50">
                <main className="flex flex-1 flex-col gap-8 p-4 md:p-8 max-w-5xl mx-auto w-full">

                    {/* Debug Info for Mentor Mismatch */}
                    {session?.user?.role === UserRole.MENTOR && !isMentor && (
                        <div className="bg-red-100 border border-red-200 text-red-800 p-4 rounded-md mb-6">
                            <p className="font-bold">Debug: Mentor Mismatch</p>
                            <p className="text-sm">You are logged in, but this intervention is assigned to a different mentor.</p>
                            <p className="text-xs font-mono mt-1">
                                Your ID: {session.user.id}<br />
                                Assigned Mentor ID: {instance.mentorId}
                            </p>
                        </div>
                    )}

                    {/* Header */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-slate-500 text-sm">
                            <span>My Assignments</span>
                            <span>/</span>
                            <span>{instance.template.title}</span>
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-slate-900">{instance.template.title}</h1>
                            <p className="text-lg text-slate-600 mt-2">{instance.template.description}</p>
                        </div>
                        <div className="flex items-center gap-6 text-sm text-slate-500">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                <span>Start: {instance.startDate.toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                <span>Projected End: {instance.calculatedEndDate?.toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-8 lg:grid-cols-3">
                        {/* Task List */}
                        <div className="lg:col-span-2 space-y-6">
                            {instance.taskExecutions.map((taskInst) => {
                                // Find original template task config (for subtasks/description which are design-time)
                                const taskTpl = instance.template.tasks.find(t => t.order === taskInst.order)

                                return (
                                    <TaskExecutionItem
                                        key={taskInst.id}
                                        execution={taskInst}
                                        templateTask={taskTpl}
                                        isMentor={isMentor}
                                    />
                                )
                            })}
                        </div>

                        {/* Guidelines */}
                        <div className="space-y-6">
                            <div className="rounded-xl border bg-white p-6 shadow-sm sticky top-8">
                                <h3 className="font-semibold text-slate-900 mb-4">Execution Guardrails</h3>
                                <ul className="space-y-3 text-sm text-slate-600">
                                    <li className="flex gap-2">
                                        <div className="h-1.5 w-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0" />
                                        Evidence submission is required to unlock next tasks.
                                    </li>
                                    <li className="flex gap-2">
                                        <div className="h-1.5 w-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0" />
                                        Dates are strict and auto-generated based on design.
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                </main>
            </div>
        </AuthGuard>
    )
}
