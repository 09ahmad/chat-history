"use client";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const { status } = useSession();
  const pathname = usePathname();

  // Don't show sidebar on landing page or signin page
  const shouldShowSidebar = status === "authenticated" && 
    !pathname.includes("/signin") && 
    pathname !== "/";

  if (shouldShowSidebar) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarTrigger />
        <div className="min-h-screen">{children}</div>
      </SidebarProvider>
    );
  }

  // For unauthenticated users or landing/signin pages, don't show sidebar
  return <div className="min-h-screen">{children}</div>;
} 