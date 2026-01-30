"use client"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Eye, Edit } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MOCK_INTERVENTIONS, MOCK_USERS } from "@/lib/data"
import { InterventionStatus } from "@/types/enums"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function InterventionList() {
    const interventions = MOCK_INTERVENTIONS

    const getStatusBadgeVariant = (status: InterventionStatus) => {
        switch (status) {
            case InterventionStatus.LIVE: return "default" // Black
            case InterventionStatus.DRAFT: return "secondary" // Gray
            case InterventionStatus.COMPLETED: return "secondary" // Greenish (managed via class if needed)
            default: return "outline"
        }
    }

    const getAssigneeName = (id: string | null) => {
        if (!id) return "Unassigned"
        return MOCK_USERS.find(u => u.id === id)?.name || "Unknown"
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Assigned To</TableHead>
                        <TableHead>Timeline</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {interventions.map((intervention) => {
                        const assignee = MOCK_USERS.find(u => u.id === intervention.assignedToId)

                        return (
                            <TableRow key={intervention.id}>
                                <TableCell className="font-medium">
                                    <div>{intervention.title}</div>
                                    <div className="text-xs text-muted-foreground truncate max-w-[200px]">{intervention.description}</div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={getStatusBadgeVariant(intervention.status)}>
                                        {intervention.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        {assignee ? (
                                            <>
                                                <Avatar className="h-6 w-6">
                                                    <AvatarImage src={assignee.image || ""} />
                                                    <AvatarFallback>{assignee.name?.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <span className="text-sm">{assignee.name}</span>
                                            </>
                                        ) : (
                                            <span className="text-sm text-muted-foreground">Unassigned</span>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell className="text-xs">
                                    {intervention.startDate ? (
                                        <div className="flex flex-col">
                                            <span>Start: {intervention.startDate.toLocaleDateString()}</span>
                                            <span className="text-muted-foreground">Target: {intervention.targetCompletionDate?.toLocaleDateString()}</span>
                                        </div>
                                    ) : (
                                        <span className="text-muted-foreground">Not started</span>
                                    )}
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <span className="sr-only">Open menu</span>
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            <DropdownMenuItem>
                                                <Eye className="mr-2 h-4 w-4" /> View Details
                                            </DropdownMenuItem>
                                            <DropdownMenuItem>
                                                <Edit className="mr-2 h-4 w-4" /> Edit Configuration
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
        </div>
    )
}
