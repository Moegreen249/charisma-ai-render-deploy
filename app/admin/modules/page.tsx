import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { redirect } from "next/navigation";
import { getModules } from "@/app/actions/module";
import ModuleManagementTable from "@/components/admin/ModuleManagementTable";

export default async function AdminModulesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/admin");
  }

  const result = await getModules();
  const initialModules = result.success ? result.data : [];
  const error = result.success ? null : result.error;

  if (error) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              Error Loading Modules
            </h1>
            <p className="text-muted-foreground">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <svg
                className="h-8 w-8 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold">Prompt Engineering Studio</h1>
              <p className="text-muted-foreground">
                Manage AI analysis modules and their prompts
              </p>
            </div>
          </div>
        </div>

        {/* Module Management Table */}
        <ModuleManagementTable initialModules={initialModules || []} />
      </div>
    </div>
  );
}
