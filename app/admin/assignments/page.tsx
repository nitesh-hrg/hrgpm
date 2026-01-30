import { db } from "@/lib/db"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AssignmentWizard } from "@/components/admin/assignment-wizard"

export default async function AssignmentsPage() {
    const assignments = await db.interventionAssignment.findMany({
        include: {
            template: true,
            assignedTo: true,
            mentor: true,
            taskExecutions: { orderBy: { order: 'asc' } }
        },
        orderBy: { startDate: 'desc' }
    })

    // Fetch data for the wizard (Users, Published Templates)
    const hrPros = await db.user.findMany({ where: { role: "HR_PRO" } }) // Should match enum "HR_PRO" string
    const mentors = await db.user.findMany({ where: { role: "MENTOR" } })
    const publishedTemplates = await db.interventionTemplate.findMany({
        where: { status: "PUBLISHED" },
        orderBy: { title: 'asc' }
    })

    // We pass data to the client component wizard
    // Note: For cleaner architecture, we could fetch this inside the wizard or via server action options,
    // but passing props is fine for this scale.

    return (
        <div className="flex flex-col gap-6 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Active Assignments</h1>
                    <p className="text-muted-foreground">Monitor ongoing interventions and compliance.</p>
                </div>
                <AssignmentWizard
                    hrPros={hrPros}
                    mentors={mentors}
                    templates={publishedTemplates}
                />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Deployed Instances</CardTitle>
                    <CardDescription>Track progress across all assignees.</CardDescription>
                </CardHeader>
                <CardContent>
                    {assignments.length === 0 ? (
                        <div className="text-center py-6 text-slate-500">No active assignments found.</div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Instance ID</TableHead>
                                    <TableHead>Template</TableHead>
                                    <TableHead>Assigned To</TableHead>
                                    <TableHead>Mentor</TableHead>
                                    <TableHead>Timeline</TableHead>
                                    <TableHead>Progress</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {assignments.map(inst => {
                                    const totalTasks = inst.taskExecutions.length
                                    const completedTasks = inst.taskExecutions.filter(t => t.status === "COMPLETED").length
                                    const activeTask = inst.taskExecutions.find(t => t.status === "ACTIVE")

                                    return (
                                        <TableRow key={inst.id}>
                                            <TableCell className="font-mono text-xs text-slate-500">{inst.id.slice(-8)}</TableCell>
                                            <TableCell className="font-medium">
                                                {inst.template.title} <span className="text-xs text-slate-400">({inst.template.version})</span>
                                            </TableCell>
                                            <TableCell>{inst.assignedTo.name || inst.assignedTo.email}</TableCell>
                                            <TableCell>{inst.mentor?.name || inst.mentor?.email || "-"}</TableCell>
                                            <TableCell>
                                                <div className="text-xs">
                                                    <div>Start: {inst.startDate.toLocaleDateString()}</div>
                                                    <div className="text-slate-500">End: {inst.calculatedEndDate?.toLocaleDateString()}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">
                                                    {completedTasks} / {totalTasks} Tasks
                                                </div>
                                                {activeTask && (
                                                    <div className="text-xs text-blue-600 mt-1">
                                                        Current: {activeTask.title}
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={inst.status === "ACTIVE" ? "default" : "secondary"}>
                                                    {inst.status}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
