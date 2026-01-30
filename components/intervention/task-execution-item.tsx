"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { CheckCircle, Lock, Send, ThumbsUp, ThumbsDown } from "lucide-react"
import { useState } from "react"
import { submitEvidence, approveTask, rejectTask } from "@/lib/actions/execution"

interface TaskExecutionItemProps {
    execution: any // TaskExecution with proper shape
    templateTask: any // TemplateTask with subtasks
    isMentor?: boolean
}

export function TaskExecutionItem({ execution, templateTask, isMentor }: TaskExecutionItemProps) {
    const [evidenceUrl, setEvidenceUrl] = useState(execution.evidenceUrl || "")
    const [rejectionComment, setRejectionComment] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isRejecting, setIsRejecting] = useState(false)

    // Status checks
    const isLocked = execution.status === "LOCKED"
    const isActive = execution.status === "ACTIVE"
    const isReview = execution.status === "IN_REVIEW"
    const isCompleted = execution.status === "COMPLETED"
    const isRejected = execution.status === "REJECTED"

    const handleSubmit = async () => {
        if (!evidenceUrl) return
        setIsSubmitting(true)
        try {
            await submitEvidence(execution.id, evidenceUrl)
        } catch (error) {
            alert("Failed to submit: " + error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleApprove = async () => {
        if (!confirm("Approve this task and unlock the next?")) return
        setIsSubmitting(true)
        try {
            await approveTask(execution.id)
        } catch (error) {
            alert("Failed to approve: " + error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleReject = async () => {
        if (!rejectionComment) {
            alert("Please provide a comment for why this is being rejected.")
            return
        }
        setIsSubmitting(true)
        try {
            await rejectTask(execution.id, rejectionComment)
            setIsRejecting(false)
        } catch (error) {
            alert("Failed to reject: " + error)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className={`rounded-xl border bg-white shadow-sm transition-all overflow-hidden ${isActive ? 'ring-2 ring-blue-600 border-blue-600' : ''} ${isLocked ? 'opacity-60 bg-slate-50' : ''}`}>
            <div className={`p-6 ${isActive || isReview ? 'pb-4' : ''}`}>
                <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-4">
                        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold border
                            ${isCompleted ? 'bg-green-100 text-green-700 border-green-200' : ''}
                            ${isActive ? 'bg-blue-600 text-white border-blue-600' : ''}
                            ${isReview ? 'bg-amber-100 text-amber-700 border-amber-200' : ''}
                            ${isLocked ? 'bg-slate-100 text-slate-400 border-slate-200' : ''}
                            ${isRejected ? 'bg-red-100 text-red-700 border-red-200' : ''}
                        `}>
                            {isCompleted ? <CheckCircle className="h-5 w-5" /> : execution.order}
                        </div>

                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Task {execution.order}</span>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${isActive && new Date() > new Date(execution.endDate) ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-500'}`}>
                                    Due: {new Date(execution.endDate).toLocaleDateString()}
                                </span>
                            </div>
                            <h3 className={`text-lg font-semibold ${isLocked ? 'text-slate-500' : 'text-slate-900'}`}>{execution.title}</h3>
                            <p className="text-sm text-slate-600 mt-2 leading-relaxed">{templateTask?.description || "No description available."}</p>

                            {/* Rejection Comment */}
                            {isRejected && (
                                <div className="mt-2 p-3 bg-red-50 text-red-700 text-sm rounded border border-red-100">
                                    <strong>Mentor Feedback:</strong> {execution.mentorComment}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="shrink-0">
                        {isLocked && <Lock className="h-5 w-5 text-slate-300" />}
                        {isCompleted && <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">Verified</Badge>}
                        {isReview && <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Under Review</Badge>}
                        {isActive && <Badge>Active</Badge>}
                        {isRejected && <Badge variant="destructive">Rework Required</Badge>}
                    </div>
                </div>
            </div>

            {!isLocked && (
                <div className="border-t border-slate-100 bg-slate-50/50">
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="subtasks" className="border-b-0 px-6">
                            <AccordionTrigger className="text-sm text-slate-500 hover:text-slate-800 py-3">
                                View Guidance Checklist ({templateTask?.subTasks?.length || 0} steps)
                            </AccordionTrigger>
                            <AccordionContent>
                                <div className="space-y-3 pb-4">
                                    {templateTask?.subTasks?.map((subTask: any) => (
                                        <div key={subTask.id} className="flex items-start gap-3 p-3 bg-white rounded-md border border-slate-200 shadow-sm">
                                            <div className="grid gap-1.5 leading-none">
                                                <p className="text-sm font-medium text-slate-800">{subTask.instruction}</p>
                                                <p className="text-xs text-slate-500">Step {subTask.order}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>

                    <div className="p-6 pt-0">
                        {/* 1. Evidence Submission (For Assignee) */}
                        {(isActive || isRejected) && !isMentor && (
                            <div className="mt-4 p-4 rounded-lg bg-white border border-blue-100 shadow-sm">
                                <h4 className="text-sm font-semibold text-slate-900 mb-1">Submit Proof of Work</h4>
                                <div className="flex gap-3">
                                    <Input
                                        placeholder="Evidence URL..."
                                        className="bg-white"
                                        value={evidenceUrl}
                                        onChange={e => setEvidenceUrl(e.target.value)}
                                        disabled={isSubmitting}
                                    />
                                    <Button onClick={handleSubmit} disabled={isSubmitting || !evidenceUrl}>
                                        {isSubmitting ? "Sending..." : "Submit"} <Send className="ml-2 h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* 2. Review Status (For Assignee) */}
                        {isReview && !isMentor && (
                            <div className="mt-4 p-4 rounded-lg bg-amber-50 border border-amber-100 shadow-sm text-center text-sm text-amber-800">
                                Evidence submitted. Waiting for mentor review.
                            </div>
                        )}

                        {/* 3. Mentor Actions (For Mentor) */}
                        {isReview && isMentor && (
                            <div className="mt-4 p-4 rounded-lg bg-amber-50 border border-amber-200 shadow-sm">
                                <h4 className="text-sm font-semibold text-amber-900 mb-2">Mentor Actions</h4>
                                {execution.evidenceUrl && (
                                    <div className="text-sm mb-4">
                                        Evidence: <a href={execution.evidenceUrl} target="_blank" className="text-blue-600 underline">{execution.evidenceUrl}</a>
                                    </div>
                                )}

                                {isRejecting ? (
                                    <div className="space-y-3">
                                        <Input
                                            placeholder="Reason for rejection / Feedback..."
                                            value={rejectionComment}
                                            onChange={e => setRejectionComment(e.target.value)}
                                        />
                                        <div className="flex gap-2">
                                            <Button variant="destructive" size="sm" onClick={handleReject} disabled={isSubmitting}>Confirm Reject</Button>
                                            <Button variant="ghost" size="sm" onClick={() => setIsRejecting(false)}>Cancel</Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex gap-3">
                                        <Button className="bg-green-600 hover:bg-green-700" onClick={handleApprove} disabled={isSubmitting}>
                                            <ThumbsUp className="mr-2 h-4 w-4" /> Approve
                                        </Button>
                                        <Button variant="destructive" onClick={() => setIsRejecting(true)} disabled={isSubmitting}>
                                            <ThumbsDown className="mr-2 h-4 w-4" /> Reject
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
