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
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { MOCK_USERS } from "@/lib/data"
import { UserRole } from "@/types/enums"
import { useState } from "react"
import { PlusCircle } from "lucide-react"

export function CreateInterventionDialog() {
    const [open, setOpen] = useState(false)

    // Filter for HR Pros to assign to
    const hrPros = MOCK_USERS.filter(u => u.role === UserRole.HR_PRO)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        console.log("Creating intervention...")
        alert("Intervention Created! (Simulation Mode - Data reset on refresh)")
        setOpen(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2 bg-slate-900 hover:bg-slate-800">
                    <PlusCircle className="h-4 w-4" /> New Intervention
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                    <DialogTitle>Create New Intervention</DialogTitle>
                    <DialogDescription>
                        Define the high-level goals and assign an HR Professional to execute.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="title" className="text-right">
                                Title
                            </Label>
                            <Input id="title" placeholder="e.g. Q1 Leadership Upskilling" className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-start gap-4">
                            <Label htmlFor="description" className="text-right mt-2">
                                Description
                            </Label>
                            <Textarea id="description" placeholder="Describe the business problem and expected outcomes..." className="col-span-3 min-h-[100px]" />
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="assignee" className="text-right">
                                Assign To
                            </Label>
                            <Select>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select HR Professional" />
                                </SelectTrigger>
                                <SelectContent>
                                    {hrPros.map(user => (
                                        <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="deadline" className="text-right">
                                Target Date
                            </Label>
                            <Input id="deadline" type="date" className="col-span-3" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit">Initialize Intervention</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
