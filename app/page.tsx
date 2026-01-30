import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { UserRole } from "@/types/enums";
import { Button } from "@/components/ui/button";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session?.user) {
    // Redirect based on role
    switch (session.user.role) {
      case UserRole.MENTOR:
        redirect("/mentor");
        break;
      case UserRole.ADMIN:
        redirect("/admin/users");
        break;
      case UserRole.HR_PRO:
      default:
        redirect("/dashboard");
        break;
    }
  }

  // If not logged in, show a simple landing page or redirect to signin
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-slate-900">HR Growth System</h1>
        <p className="text-slate-600">Please sign in to continue.</p>
        <Button asChild size="lg">
          <a href="/auth/signin">Sign In</a>
        </Button>
      </div>
    </div>
  );
}
