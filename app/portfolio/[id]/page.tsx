"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MOCK_INSTANCES, MOCK_TEMPLATES } from "@/lib/data"
import { TaskStatus } from "@/types/enums"
import { CheckCircle, ShieldCheck, Calendar, ExternalLink } from "lucide-react"

export default function PortfolioPage({ params }: { params: { id: string } }) {
    // Hack: grab last instance for demo
    const instance = MOCK_INSTANCES[MOCK_INSTANCES.length - 1]
    const template = MOCK_TEMPLATES.find(t => t.id === instance?.templateId)

    if (!instance || !template) return <div>Portfolio not found.</div>

    const completedTasks = instance.taskInstances.filter(t => t.status === TaskStatus.APPROVED)

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center py-12 px-4 shadow-sm">
            <div className="mb-8 text-center space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 text-slate-50 text-sm font-medium shadow-lg">
                    <ShieldCheck className="h-4 w-4" />
                    <span>Verified Execution Portfolio</span>
                </div>
                <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">{template.title}</h1>
                <p className="text-xl text-slate-600 max-w-2xl mx-auto">{template.description}</p>
            </div>

            <div className="w-full max-w-4xl space-y-8">
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-slate-900 text-center">Verified Timeline</h2>
                    {completedTasks.length === 0 ? (
                        <p className="text-center text-slate-500">No verified tasks yet.</p>
                    ) : (
                        completedTasks.map((taskInst, index) => {
                            const tpl = template.tasks.find(t => t.id === taskInst.taskTemplateId)
                            return (
                                <Card key={taskInst.id} className="relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-1.5 h-full bg-green-500" />
                                    <CardHeader>
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-3">
                                                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-700 text-sm font-bold ring-1 ring-green-200">
                                                    {tpl?.taskNumber}
                                                </span>
                                                <div>
                                                    <CardTitle className="text-lg">{tpl?.title}</CardTitle>
                                                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                                                        <Calendar className="h-3 w-3" />
                                                        <span>Completed: {taskInst.endDate.toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 gap-1">
                                                <CheckCircle className="h-3 w-3" /> Mentor Verified
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                </Card>
                            )
                        })
                    )}
                </div>
            </div>
        </div>
    )
}
