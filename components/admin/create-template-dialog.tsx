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
import { createTemplate } from "@/lib/actions/templates"
import { useState } from "react"
import { PlusCircle, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

export function CreateTemplateDialog() {
    const [open, setOpen] = useState(false)
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const handleSubmit = async () => {
        if (!title) return alert("Title is required")
        setIsLoading(true)

        try {
            const newTemplate = await createTemplate({
                title,
                description,
                userId: "ADMIN_USER_ID_TODO" // TODO: Get from auth context
            })

            setOpen(false)
            setTitle("")
            setDescription("")

            // Redirect to design page
            router.push(`/admin/templates/${newTemplate.id}/design`)
        } catch (error) {
            console.error("Failed to create template", error)
            alert("Failed to create template. See console.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2 bg-slate-900 hover:bg-slate-800">
                    <PlusCircle className="h-4 w-4" /> Create New Template
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Create New Intervention Template</DialogTitle>
                    <DialogDescription>
                        Start by naming your template. You will define the tasks in the next step.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    <div className="space-y-3">
                        <div className="grid gap-2">
                            <Label>Template Title</Label>
                            <Input
                                placeholder="e.g. Remote Leadership Framework"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>Description</Label>
                            <Textarea
                                placeholder="High-level goal..."
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button onClick={handleSubmit} disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Create & Design
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
