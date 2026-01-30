import { db } from "@/lib/db"
import { TemplateEditor } from "@/components/admin/template-editor"
import { notFound } from "next/navigation"

interface PageProps {
    params: Promise<{ id: string }>
}

export default async function DesignPage({ params }: PageProps) {
    const { id } = await params
    const template = await db.interventionTemplate.findUnique({
        where: { id },
        include: {
            tasks: {
                include: { subTasks: { orderBy: { order: 'asc' } } },
                orderBy: { order: 'asc' }
            }
        }
    })

    if (!template) notFound()

    return (
        <div className="flex flex-col gap-6 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Design: {template.title}</h1>
                    <p className="text-muted-foreground">
                        Version: {template.version} • Status: {template.status}
                    </p>
                </div>
            </div>

            <TemplateEditor template={template} />
        </div>
    )
}
