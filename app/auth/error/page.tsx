"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"

function AuthErrorContent() {
    const searchParams = useSearchParams()
    const error = searchParams.get("error")

    return (
        <Card className="w-[400px] shadow-lg border-red-100">
            <CardHeader className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <CardTitle className="text-xl text-red-700">Authentication Error</CardTitle>
                <CardDescription>
                    We encountered an issue signing you in.
                </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
                <div className="p-4 bg-slate-100 rounded text-sm font-mono text-slate-800 break-words">
                    Error Code: <strong>{error}</strong>
                </div>
                <p className="text-sm text-slate-500">
                    {error === "AccessDenied" && "You do not have permission to view this page."}
                    {error === "CredentialsSignin" && "Sign in failed. Check your details or try again."}
                </p>
            </CardContent>
            <CardFooter className="flex justify-center">
                <Button variant="outline" asChild>
                    <a href="/auth/signin">Back to Sign In</a>
                </Button>
            </CardFooter>
        </Card>
    )
}

export default function AuthErrorPage() {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-gray-50">
            <Suspense fallback={<div>Loading...</div>}>
                <AuthErrorContent />
            </Suspense>
        </div>
    )
}
