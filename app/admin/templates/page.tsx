import { db } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from "next/link"
import { CreateTemplateDialog } from "@/components/admin/create-template-dialog"
import { TemplateStatus } from "@/types/enums"
import { publishTemplate, createTemplateVersion } from "@/lib/actions/templates"

export default async function TemplateLibraryPage() {
    const templates = await db.interventionTemplate.findMany({
        include: { tasks: true },
        orderBy: { updatedAt: 'desc' }
    })

    return (
        <div className="flex flex-col gap-6 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Template Library</h1>
                    <p className="text-muted-foreground">Manage intervention designs and versions.</p>
                </div>
                <CreateTemplateDialog />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Templates ({templates.length})</CardTitle>
                    <CardDescription>Drafts are editable. Published templates are locked.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Version</TableHead>
                                <TableHead>Tasks</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Last Updated</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {templates.map(t => (
                                <TableRow key={t.id}>
                                    <TableCell className="font-medium">{t.title}</TableCell>
                                    <TableCell>{t.version}</TableCell>
                                    <TableCell>{t.tasks.length}</TableCell>
                                    <TableCell>
                                        <Badge variant={t.status === "PUBLISHED" ? "default" : "secondary"}>
                                            {t.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{t.updatedAt.toLocaleDateString()}</TableCell>
                                    <TableCell className="text-right space-x-2">
                                        {/* Actions based on Status */}
                                        {t.status === "DRAFT" && (
                                            <Button asChild size="sm" variant="outline">
                                                <Link href={`/admin/templates/${t.id}/design`}>Edit Design</Link>
                                            </Button>
                                        )}

                                        {t.status === "PUBLISHED" && (
                                            <div className="inline-flex gap-2">
                                                <Button asChild size="sm" variant="ghost">
                                                    <Link href={`/admin/templates/${t.id}/design`}>View Design</Link>
                                                </Button>
                                                {/* We need a client component or server action form wrapper for Create Version */}
                                                <form action={async () => {
                                                    "use server"
                                                    await createTemplateVersion(t.id, "ADMIN_USER_ID_TODO") // TODO: get real user ID
                                                }}>
                                                    <Button size="sm" variant="secondary">Create v{parseFloat(t.version.replace("v", "")) + 0.1 /* Hack UI hint */}+</Button>
                                                </form>
                                            </div>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
