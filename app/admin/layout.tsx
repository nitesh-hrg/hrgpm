import { AuthGuard } from "@/components/auth-guard"
import { UserRole } from "@/types/enums"
import Link from "next/link"
import {
    LayoutDashboard,
    FileEdit,
    Users,
    UserCog,
    LogOut
} from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <AuthGuard allowedRoles={[UserRole.ADMIN]}>
            <div className="flex min-h-screen bg-slate-50">
                {/* Sidebar */}
                <aside className="w-64 bg-slate-900 text-slate-50 hidden md:flex flex-col">
                    <div className="p-6">
                        <h2 className="text-xl font-bold tracking-tight text-white">HRX Core</h2>
                        <p className="text-xs text-slate-400">Admin Console</p>
                    </div>

                    <nav className="flex-1 px-4 space-y-2">
                        <Link href="/admin" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-slate-800 text-slate-300 hover:text-white transition-colors">
                            <LayoutDashboard className="h-4 w-4" />
                            Dashboard
                        </Link>
                        <Link href="/admin/templates" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-slate-800 text-slate-300 hover:text-white transition-colors">
                            <FileEdit className="h-4 w-4" />
                            Templates
                        </Link>
                        <Link href="/admin/assignments" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-slate-800 text-slate-300 hover:text-white transition-colors">
                            <Users className="h-4 w-4" />
                            Assignments
                        </Link>
                        <Link href="/admin/users" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-slate-800 text-slate-300 hover:text-white transition-colors">
                            <UserCog className="h-4 w-4" />
                            Users
                        </Link>
                    </nav>

                    <div className="p-4 border-t border-slate-800">
                        <div className="flex items-center gap-3 px-3 py-2 text-sm text-slate-400">
                            <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                                A
                            </div>
                            <div>
                                <p className="text-white font-medium">Admin User</p>
                                <p className="text-xs">admin@hrx.core</p>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Mobile Header (visible only on small screens) */}
                {/* For now, simplistic handled by main layout or omitted for MVP */}

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto">
                    {children}
                </main>
            </div>
        </AuthGuard>
    )
}
