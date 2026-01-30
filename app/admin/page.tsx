import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Shield, BookOpen, Users, Activity, CheckCircle, Clock } from "lucide-react"
import { db } from "@/lib/db"

export default async function AdminDashboard() {
    // Fetch Stats
    const templateCount = await db.interventionTemplate.count({ where: { status: "PUBLISHED" } })
    const activeAssignmentsCount = await db.interventionAssignment.count({ where: { status: "ACTIVE" } })
    const userCount = await db.user.count()
    // Optional: Get recent activities or pending approvals if schema supported it easily

    return (
        <div className="flex min-h-screen w-full flex-col bg-slate-50/50">
            <main className="flex flex-1 flex-col gap-8 p-8 md:gap-8 md:p-12">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Admin Console</h1>
                        <p className="text-slate-500 mt-2">System Overview & Management</p>
                    </div>
                </div>

                {/* Stats Row */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                            <Users className="h-4 w-4 text-slate-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{userCount}</div>
                            <p className="text-xs text-slate-500">
                                HR Pros, Mentors, Admins
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Assignments</CardTitle>
                            <Activity className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{activeAssignmentsCount}</div>
                            <p className="text-xs text-slate-500">
                                Currently in progress
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Published Templates</CardTitle>
                            <BookOpen className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{templateCount}</div>
                            <p className="text-xs text-slate-500">
                                Available for assignment
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

                    {/* Template Management */}
                    <Link href="/admin/templates">
                        <Card className="hover:border-slate-400 transition-colors cursor-pointer h-full border-l-4 border-l-blue-500">
                            <CardHeader>
                                <div className="flex items-center gap-2 mb-2">
                                    <CardTitle>Template Library</CardTitle>
                                </div>
                                <CardDescription>
                                    Manage intervention structures. Create drafts, edit tasks, and publish new versions.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button variant="secondary" className="w-full">
                                    Manage Templates
                                </Button>
                            </CardContent>
                        </Card>
                    </Link>

                    {/* Active Assignments */}
                    <Link href="/admin/assignments">
                        <Card className="hover:border-slate-400 transition-colors cursor-pointer h-full border-l-4 border-l-green-500">
                            <CardHeader>
                                <div className="flex items-center gap-2 mb-2">
                                    <CardTitle>Assignments & Progress</CardTitle>
                                </div>
                                <CardDescription>
                                    Deploy interventions to HR Professionals. Monitor progress and mentor activity.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button variant="secondary" className="w-full">
                                    View Assignments
                                </Button>
                            </CardContent>
                        </Card>
                    </Link>

                    {/* User Management */}
                    <Link href="/admin/users">
                        <Card className="hover:border-slate-400 transition-colors cursor-pointer h-full border-l-4 border-l-purple-500">
                            <CardHeader>
                                <div className="flex items-center gap-2 mb-2">
                                    <CardTitle>User Management</CardTitle>
                                </div>
                                <CardDescription>
                                    Add or remove HR Professionals and Mentors. Manage system access.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button variant="secondary" className="w-full">
                                    Manage Users
                                </Button>
                            </CardContent>
                        </Card>
                    </Link>
                </div>
            </main>
        </div>
    )
}
