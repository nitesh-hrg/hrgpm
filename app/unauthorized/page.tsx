import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function UnauthorizedPage() {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-gray-50">
            <Card className="w-[400px] shadow-lg border-red-200">
                <CardHeader className="text-center">
                    <CardTitle className="text-xl font-bold text-red-600">Access Denied</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4 text-center">
                    <p>You do not have permission to view this page.</p>
                    <Link href="/">
                        <Button variant="outline">Return to Home</Button>
                    </Link>
                </CardContent>
            </Card>
        </div>
    )
}
