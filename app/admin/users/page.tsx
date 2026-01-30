import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { db } from "@/lib/db"
import { UserRole } from "@/types/enums"
import { CreateUserDialog } from "@/components/admin/create-user-dialog"
import { Badge } from "@/components/ui/badge"
import { Trash2, User as UserIcon } from "lucide-react"
import { deleteUser } from "@/lib/actions/users"
import { revalidatePath } from "next/cache"

export default async function UsersPage() {
    const users = await db.user.findMany({
        orderBy: { role: 'asc' } // Group by role roughly
    })

    return (
        <div className="flex flex-col gap-6 p-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">User Management</h1>
                    <p className="text-slate-500 mt-2">Manage HR Professionals, Mentors, and Admins.</p>
                </div>
                <CreateUserDialog />
            </div>

            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>All Users ({users.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {users.map((user) => (
                                <div key={user.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600">
                                            <UserIcon className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-900">{user.name || "Unnamed User"}</p>
                                            <p className="text-sm text-slate-500">{user.email}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <Badge variant={
                                            user.role === "ADMIN" ? "default" :
                                                user.role === "MENTOR" ? "secondary" : "outline"
                                        }>
                                            {user.role}
                                        </Badge>

                                        <form action={async () => {
                                            "use server"
                                            await deleteUser(user.id)
                                        }}>
                                            <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </form>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
