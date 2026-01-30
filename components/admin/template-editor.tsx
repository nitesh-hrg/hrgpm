"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GripVertical, Plus, Trash2, X } from "lucide-react"
import { useState } from "react"
import { addTaskToTemplate, removeTaskFromTemplate, publishTemplate, updateTemplateDesign, addSubTask, removeSubTask } from "@/lib/actions/templates"
import { useRouter } from "next/navigation"
import { TemplateStatus } from "@/types/enums"

// Types matching the Prisma include structure
interface TemplateWithTasks {
    id: string
    title: string
    description: string | null
    status: string
    tasks: any[] // TODO: precise type via Prisma.InterventionTemplateGetPayload
}

export function TemplateEditor({ template }: { template: TemplateWithTasks }) {
    const router = useRouter()
    const isPublished = template.status === TemplateStatus.PUBLISHED
    const [isPublishing, setIsPublishing] = useState(false)

    // Task Adding State
    const [newTaskTitle, setNewTaskTitle] = useState("")
    const [newTaskDuration, setNewTaskDuration] = useState(1)

    // Subtask Adding State (Map of taskID -> string input)
    const [subTaskInputs, setSubTaskInputs] = useState<Record<string, string>>({})

    const handleAddTask = async () => {
        if (!newTaskTitle) return
        await addTaskToTemplate(template.id, {
            title: newTaskTitle,
            order: template.tasks.length + 1,
            defaultDurationDays: Number(newTaskDuration)
        })
        setNewTaskTitle("")
        setNewTaskDuration(1)
        router.refresh()
    }

    const handleRemoveTask = async (taskId: string) => {
        if (!confirm("Delete this task?")) return
        await removeTaskFromTemplate(taskId)
        router.refresh()
    }

    const handleAddSubTask = async (taskId: string) => {
        const instruction = subTaskInputs[taskId]
        if (!instruction) return

        await addSubTask(taskId, instruction)
        setSubTaskInputs(prev => ({ ...prev, [taskId]: "" })) // Clear input
        router.refresh()
    }

    const handleRemoveSubTask = async (subTaskId: string) => {
        if (!confirm("Remove sub-task?")) return
        await removeSubTask(subTaskId)
        router.refresh()
    }

    const handlePublish = async () => {
        if (!confirm("Are you sure? Published templates cannot be edited.")) return
        setIsPublishing(true)
        try {
            await publishTemplate(template.id)
            router.push("/admin/templates")
        } catch (error) {
            alert("Failed to publish: " + error)
            setIsPublishing(false)
        }
    }

    const isDraft = !isPublished // Kept for publish button logic only

    return (
        <div className="space-y-6">

            {/* Top Stats / Actions */}
            <div className="flex gap-4">
                <Card className="flex-1">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{template.tasks.length}</div>
                    </CardContent>
                </Card>
                <Card className="flex-1">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Duration</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {template.tasks.reduce((acc: number, t: any) => acc + t.defaultDurationDays, 0)} Days
                        </div>
                    </CardContent>
                </Card>

                {isDraft && (
                    <Card className="flex-1 border-primary/20 bg-primary/5">
                        <CardContent className="flex items-center justify-center h-full">
                            <Button size="lg" onClick={handlePublish} disabled={isPublishing}>
                                {isPublishing ? "Publishing..." : "Publish Template"}
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Task List */}
            <div className="space-y-4">
                {template.tasks.map((task, index) => {
                    const taskNumber = index + 1 // 1, 2, 3...
                    return (
                        <Card key={task.id} className="relative group">
                            <CardContent className="p-6 flex gap-4 items-start">
                                <div className="mt-1 text-slate-400">
                                    <span className="font-mono text-xl font-bold">#{taskNumber}.0</span>
                                </div>

                                <div className="flex-1 space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-semibold text-lg">{task.title}</h3>
                                            <div className="text-sm text-muted-foreground">{task.defaultDurationDays} Days</div>
                                        </div>
                                        {/* REMOVED isDraft CHECK */}
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() => handleRemoveTask(task.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>

                                    {/* Subtasks */}
                                    <div className="space-y-2">
                                        {task.subTasks.length > 0 && (
                                            <div className="space-y-2">
                                                {task.subTasks.map((st: any, stIndex: number) => {
                                                    const subTaskNumber = `${taskNumber}.${stIndex + 1}` // 1.1, 1.2...
                                                    return (
                                                        <div key={st.id} className="flex items-center justify-between group/sub bg-slate-50 p-2 rounded-md border border-transparent hover:border-slate-200">
                                                            <div className="flex items-center gap-3">
                                                                <span className="font-mono text-xs font-bold text-slate-500 bg-slate-200 px-1.5 py-0.5 rounded">{subTaskNumber}</span>
                                                                <span className="text-sm text-slate-700">{st.instruction}</span>
                                                            </div>
                                                            {/* REMOVED isDraft CHECK */}
                                                            <Button
                                                                size="icon"
                                                                variant="ghost"
                                                                className="h-6 w-6 text-slate-400 hover:text-red-500 opacity-0 group-hover/sub:opacity-100"
                                                                onClick={() => handleRemoveSubTask(st.id)}
                                                            >
                                                                <X className="h-3 w-3" />
                                                            </Button>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        )}

                                        {/* Add Subtask Input - ALWAYS SHOW */}
                                        <div className="flex items-center gap-2 mt-2">
                                            <Input
                                                placeholder="Add sub-task..."
                                                className="h-8 text-sm"
                                                value={subTaskInputs[task.id] || ""}
                                                onChange={e => setSubTaskInputs(prev => ({ ...prev, [task.id]: e.target.value }))}
                                                onKeyDown={e => { if (e.key === 'Enter') handleAddSubTask(task.id) }}
                                            />
                                            <Button size="sm" variant="secondary" className="h-8" onClick={() => handleAddSubTask(task.id)}>
                                                Add
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            {/* Add Task Form - ALWAYS SHOW */}
            <Card className="border-dashed">
                <CardHeader>
                    <CardTitle className="text-sm">Add Next Task</CardTitle>
                </CardHeader>
                <CardContent className="flex gap-4">
                    <div className="grid gap-2 flex-1">
                        <Label>Task Title</Label>
                        <Input
                            placeholder="E.g. Initial Stakeholder Meeting"
                            value={newTaskTitle}
                            onChange={e => setNewTaskTitle(e.target.value)}
                        />
                    </div>
                    <div className="grid gap-2 w-[150px]">
                        <Label>Duration (Days)</Label>
                        <Input
                            type="number"
                            min={1}
                            value={newTaskDuration}
                            onChange={e => setNewTaskDuration(Number(e.target.value))}
                        />
                    </div>
                    <div className="flex items-end">
                        <Button onClick={handleAddTask}>
                            <Plus className="mr-2 h-4 w-4" /> Add Task
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
