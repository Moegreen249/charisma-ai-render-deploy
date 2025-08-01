import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { redirect } from "next/navigation";
import { getModules } from "@/app/actions/module";
import ModuleManagementTable from "@/components/admin/ModuleManagementTable";
import StorySettingsPanel from "@/components/admin/StorySettingsPanel";

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
  const error = result.success ? null : (result as any).error;

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 p-4 relative overflow-hidden">
        {/* Neural background particles - error state */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-32 left-20 w-2 h-2 bg-red-400/20 rounded-full animate-pulse"></div>
          <div className="absolute top-48 right-32 w-1 h-1 bg-orange-400/25 rounded-full animate-ping"></div>
          <div className="absolute bottom-40 left-16 w-1.5 h-1.5 bg-red-300/15 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center py-12 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 mt-20">
            <h1 className="text-2xl font-bold text-red-400 mb-4">
              Error Loading Modules
            </h1>
            <p className="text-white/70">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 p-4 relative overflow-hidden">
      {/* Neural background particles - modules theme */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-24 left-16 w-2 h-2 bg-purple-400/20 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-1 h-1 bg-cyan-400/25 rounded-full animate-ping"></div>
        <div className="absolute top-2/3 left-12 w-1.5 h-1.5 bg-blue-400/20 rounded-full animate-pulse" style={{animationDelay: '1.3s'}}></div>
        <div className="absolute bottom-32 right-28 w-1 h-1 bg-indigo-400/25 rounded-full animate-ping" style={{animationDelay: '2.1s'}}></div>
        <div className="absolute bottom-16 left-24 w-2 h-2 bg-purple-300/15 rounded-full animate-pulse" style={{animationDelay: '0.6s'}}></div>
      </div>
      
      <div className="max-w-7xl mx-auto space-y-6 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 hover:bg-white/20 transition-all duration-300">
              <svg
                className="h-8 w-8 text-purple-300"
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
              <h1 className="text-3xl font-bold text-white">Prompt Engineering Studio</h1>
              <p className="text-white/70">
                Manage AI analysis modules and their prompts
              </p>
            </div>
          </div>
        </div>

        {/* Story Settings Panel */}
        <StorySettingsPanel />

        {/* Module Management Table */}
        <ModuleManagementTable initialModules={initialModules || []} />
      </div>
    </div>
  );
}
