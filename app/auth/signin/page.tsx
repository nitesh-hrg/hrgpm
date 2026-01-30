"use client"

import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function SignIn() {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-gray-50">
            <Card className="w-[350px] shadow-lg">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold">HRX CORE</CardTitle>
                    <CardDescription>System for High-Authority HR Interventions</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col gap-4">
                        <Button
                            className="w-full"
                            onClick={() => signIn("google", { callbackUrl: "/" })}
                        >
                            Sign in with Google
                        </Button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-white px-2 text-muted-foreground">Dev Mode Access</span>
                            </div>
                        </div>

                        <Button
                            variant="outline"
                            className="w-full border-red-200 text-red-900 bg-red-50 hover:bg-red-100"
                            onClick={() => signIn("credentials", { email: "admin@hrx.core", role: "ADMIN", callbackUrl: "/admin" })}
                        >
                            Simulate Admin
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full border-blue-200 text-blue-900 bg-blue-50 hover:bg-blue-100"
                            onClick={() => signIn("credentials", { email: "bob@hrx.core", role: "HR_PRO", callbackUrl: "/dashboard" })}
                        >
                            Simulate HR Pro
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full border-amber-200 text-amber-900 bg-amber-50 hover:bg-amber-100"
                            onClick={() => signIn("credentials", { email: "charlie@hrx.core", role: "MENTOR", callbackUrl: "/mentor" })}
                        >
                            Simulate Mentor
                        </Button>
                        <p className="text-xs text-center text-gray-500">
                            Access restricted to authorized personnel only.
                        </p>

                        <div className="pt-4 border-t">
                            <details className="text-xs text-slate-500">
                                <summary className="cursor-pointer hover:text-slate-800">Advanced: Custom Login</summary>
                                <div className="mt-2 space-y-2 p-2 bg-slate-100 rounded">
                                    <p className="text-[10px] mb-2">Type any email to auto-create user.</p>
                                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                    <form action={async (formData: any) => {
                                        const email = formData.get("email")
                                        const role = formData.get("role")
                                        signIn("credentials", { email, role, callbackUrl: "/" })
                                    }}
                                        className="flex flex-col gap-2"
                                    >
                                        <input name="email" placeholder="user@example.com" className="p-1 border rounded w-full" required />
                                        <select name="role" className="p-1 border rounded w-full">
                                            <option value="ADMIN">Admin</option>
                                            <option value="HR_PRO">HR Pro</option>
                                            <option value="MENTOR">Mentor</option>
                                        </select>
                                        <Button type="submit" size="sm" variant="secondary" className="w-full">Sign In</Button>
                                    </form>
                                </div>
                            </details>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
