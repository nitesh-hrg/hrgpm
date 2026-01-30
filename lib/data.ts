import { UserRole, TaskExecutionStatus } from "@/types/enums"

export const MOCK_USERS = [
    { id: "1", name: "Alice Admin", email: "alice@hrx.core", role: UserRole.ADMIN, image: null },
    { id: "2", name: "Bob HR", email: "bob@hrx.core", role: UserRole.HR_PRO, image: null },
    { id: "3", name: "Charlie Mentor", email: "charlie@hrx.core", role: UserRole.MENTOR, image: null },
    { id: "4", name: "Dana HR", email: "dana@hrx.core", role: UserRole.HR_PRO, image: null },
]

// --- TEMPLATES (DESIGN TIME) ---

export interface SubTaskTemplate {
    subTaskNumber: string
    instructionText: string
    order: number
}

export interface TaskTemplate {
    id: string
    title: string
    description: string
    approvalCriteria: string
    defaultDurationDays: number
    taskNumber: number
    subTasks: SubTaskTemplate[]
}

export interface InterventionTemplate {
    id: string
    title: string
    description: string
    version: string
    status: "DRAFT" | "PUBLISHED" | "ARCHIVED"
    tasks: TaskTemplate[]
}

export const MOCK_TEMPLATES: InterventionTemplate[] = [
    {
        id: "tpl-1",
        title: "Leadership Development Program",
        description: "Standardized framework for senior leadership transition.",
        version: "v1.0",
        status: "PUBLISHED",
        tasks: [
            {
                id: "t-tpl-1",
                taskNumber: 1,
                title: "Define Financial Feasibility",
                description: "Establish financial baseline.",
                approvalCriteria: "Spreadsheet with 3-year projection.",
                defaultDurationDays: 7,
                subTasks: [
                    { subTaskNumber: "1.1", instructionText: "Identify cost heads", order: 1 },
                    { subTaskNumber: "1.2", instructionText: "Define baseline metrics", order: 2 }
                ]
            },
            {
                id: "t-tpl-2",
                taskNumber: 2,
                title: "Stakeholder Communication",
                description: "Draft initial communications.",
                approvalCriteria: "Communication plan document.",
                defaultDurationDays: 5,
                subTasks: [
                    { subTaskNumber: "2.1", instructionText: "Map stakeholders", order: 1 },
                    { subTaskNumber: "2.2", instructionText: "Draft town hall script", order: 2 }
                ]
            }
        ]
    }
]

// --- INSTANCES (EXECUTION TIME) ---

export interface TaskInstance {
    id: string
    taskTemplateId: string
    taskNumber: number
    title: string // Copied for immutability
    objective: string // Mapped from description
    startDate: Date
    endDate: Date
    status: TaskExecutionStatus
    evidenceUrl: string | null
    mentorFeedback: string | null
    // We don't need to copy subtasks, we can ref template or copy if needed. 
    // For simplicity, we reference the template for subtasks in the UI.
}

export interface InterventionInstance {
    id: string
    templateId: string
    hrProId: string
    mentorId: string | null
    startDate: Date
    calculatedEndDate: Date
    status: "ACTIVE" | "COMPLETED" | "PAUSED"
    taskInstances: TaskInstance[]
}

export let MOCK_INSTANCES: InterventionInstance[] = []

// --- LOGIC ---

export function generateInstance(templateId: string, hrProId: string, startDate: Date): InterventionInstance | null {
    const template = MOCK_TEMPLATES.find(t => t.id === templateId)
    if (!template) return null

    let currentDate = new Date(startDate)
    const taskInstances: TaskInstance[] = []

    template.tasks.forEach(taskTpl => {
        const tStart = new Date(currentDate)
        const tEnd = new Date(currentDate)
        tEnd.setDate(tEnd.getDate() + taskTpl.defaultDurationDays)

        taskInstances.push({
            id: `inst-task-${Math.random().toString(36).substr(2, 9)}`,
            taskTemplateId: taskTpl.id,
            taskNumber: taskTpl.taskNumber,
            title: taskTpl.title,
            objective: taskTpl.description,
            startDate: tStart,
            endDate: tEnd,
            status: taskTpl.taskNumber === 1 ? TaskExecutionStatus.ACTIVE : TaskExecutionStatus.LOCKED, // Unlock first task
            evidenceUrl: null,
            mentorFeedback: null
        })

        // Next task starts day after previous ends
        currentDate = new Date(tEnd)
        currentDate.setDate(currentDate.getDate() + 1)
    })

    const newInstance: InterventionInstance = {
        id: `inst-${Math.random().toString(36).substr(2, 9)}`,
        templateId: template.id,
        hrProId: hrProId,
        mentorId: null, // Assign later or default
        startDate: startDate,
        calculatedEndDate: currentDate,
        status: "ACTIVE",
        taskInstances
    }

    MOCK_INSTANCES.push(newInstance)
    return newInstance
}

// Initialize with one mock instance for "Bob"
generateInstance("tpl-1", "2", new Date("2026-02-01"))

export function createTemplate(templateData: Omit<InterventionTemplate, "id" | "status" | "version">) {
    const newTemplate: InterventionTemplate = {
        id: `tpl-${Math.random().toString(36).substr(2, 9)}`,
        ...templateData,
        version: "v1.0",
        status: "DRAFT"
    }
    MOCK_TEMPLATES.push(newTemplate)
    return newTemplate
}
