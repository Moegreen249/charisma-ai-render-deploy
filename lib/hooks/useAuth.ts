import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function useAuth(requireAuth: boolean = false, requireAdmin: boolean = false) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (requireAuth && !session) {
      router.push("/auth/signin");
      return;
    }

    if (requireAdmin && session?.user?.role !== "ADMIN") {
      router.push("/");
      return;
    }
  }, [session, status, requireAuth, requireAdmin, router]);

  return {
    session,
    status,
    isAuthenticated: !!session,
    isAdmin: session?.user?.role === "ADMIN",
    isLoading: status === "loading",
  };
}

export function useRequireAuth() {
  return useAuth(true, false);
}

export function useRequireAdmin() {
  return useAuth(true, true);
} 