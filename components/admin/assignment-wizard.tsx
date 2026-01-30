"use client"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { assignIntervention } from "@/lib/actions/assignments"
import { useState } from "react"
import { PlayCircle, Loader2, CalendarIcon } from "lucide-react"

interface AssignmentWizardProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    hrPros: any[] // User[]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mentors: any[] // User[]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    templates: any[] // InterventionTemplate[]
}

export function AssignmentWizard({ hrPros, mentors, templates }: AssignmentWizardProps) {
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    // Form State
    const [selectedTemplateId, setSelectedTemplateId] = useState("")
    const [selectedHrProId, setSelectedHrProId] = useState("")
    const [selectedMentorId, setSelectedMentorId] = useState("")
    const [startDate, setStartDate] = useState("")

    const handleAssign = async () => {
        if (!selectedTemplateId || !selectedHrProId || !startDate) {
            alert("Template, HR Pro and Start Date are required.")
            return
        }

        setIsLoading(true)
        try {
            await assignIntervention({
                templateId: selectedTemplateId,
                hrProId: selectedHrProId,
                mentorId: (selectedMentorId && selectedMentorId !== "no_mentor") ? selectedMentorId : undefined,
                startDate: new Date(startDate)
            })

            setOpen(false)
            alert("Intervention Assigned Successfully! Dates have been auto-calculated.")

            // Reset
            setSelectedTemplateId("")
            setSelectedHrProId("")
            setSelectedMentorId("")
            setStartDate("")
        } catch (error) {
            console.error("Assignment failed", error)
            alert("Failed to assign: " + error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2 bg-green-700 hover:bg-green-800">
                    <PlayCircle className="h-4 w-4" /> Assign Intervention
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Launch New Intervention</DialogTitle>
                    <DialogDescription>
                        Select a design and assign it to an HR Professional. The system will auto-calculate the schedule.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    <div className="space-y-4">

                        {/* Step 1: Template */}
                        <div className="grid gap-2">
                            <Label>Select Published Template (Design)</Label>
                            <Select onValueChange={setSelectedTemplateId} value={selectedTemplateId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a template..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {templates.length === 0 ? (
                                        <div className="p-2 text-sm text-muted-foreground">No published templates available.</div>
                                    ) : (
                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                        templates.map((t: any) => (
                                            <SelectItem key={t.id} value={t.id}>
                                                {t.title} (v{t.version})
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Step 2: HR Pro & Mentor */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Assign To (HR Pro)</Label>
                                <Select onValueChange={setSelectedHrProId} value={selectedHrProId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select HR Pro..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {hrPros.map(u => (
                                            <SelectItem key={u.id} value={u.id}>
                                                {u.name || u.email}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label>Assign Mentor (Optional)</Label>
                                <Select onValueChange={setSelectedMentorId} value={selectedMentorId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Mentor..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="no_mentor">No Mentor</SelectItem>
                                        {mentors.map(u => (
                                            <SelectItem key={u.id} value={u.id}>
                                                {u.name || u.email}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Step 3: Start Date */}
                        <div className="grid gap-2">
                            <Label>Start Date</Label>
                            <div className="relative">
                                <Input
                                    type="date"
                                    value={startDate}
                                    onChange={e => setStartDate(e.target.value)}
                                    className="pl-10"
                                />
                                <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Task dates will be calculated automatically starting from this date.
                            </p>
                        </div>

                    </div>
                </div>

                <DialogFooter>
                    <Button onClick={handleAssign} disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Confirm & Launch
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
