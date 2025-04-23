"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Settings, 
  LogOut,
  ChevronRight,
  ChevronLeft,
  Menu,
  X
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function DashboardSidebar() {
  const pathname = usePathname();
  const { user, logout, loading } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const navigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      current: pathname === "/dashboard",
    },
    {
      name: "Bids",
      href: "/dashboard/bids",
      icon: FileText,
      current: pathname.includes("/dashboard/bids") && !pathname.includes("/dashboard/comparison"),
    },
    {
      name: "Comparisons",
      href: "/dashboard/bids",
      icon: FileText,
      current: pathname.includes("/dashboard/comparison"),
    },
    {
      name: "Vendors",
      href: "/dashboard/vendors",
      icon: Users,
      current: pathname === "/dashboard/vendors",
    },
    {
      name: "Settings",
      href: "/dashboard/settings",
      icon: Settings,
      current: pathname === "/dashboard/settings",
    },
  ];

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const toggleMobileSidebar = () => {
    setMobileOpen(!mobileOpen);
  };

  if (!user) {
    return null;
  }

  return (
    <>
      {/* Mobile menu button */}
      <div className="fixed z-40 top-4 left-4 md:hidden">
        <Button
          variant="outline"
          size="sm"
          className="h-10 w-10 p-0"
          onClick={toggleMobileSidebar}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open sidebar</span>
        </Button>
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={toggleMobileSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col bg-card border-r shadow-sm transition-all duration-300",
          collapsed ? "w-16" : "w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b px-4">
          <div className={cn("flex items-center", collapsed && "justify-center w-full")}>
            {!collapsed && (
              <Link href="/dashboard" className="text-xl font-bold text-primary">
                ProcureBid
              </Link>
            )}
            {collapsed && (
              <Link href="/dashboard" className="text-xl font-bold text-primary">
                PB
              </Link>
            )}
          </div>
          
          {/* Mobile close button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={toggleMobileSidebar}
            >
              <X className="h-5 w-5" />
              <span className="sr-only">Close sidebar</span>
            </Button>
          </div>
          
          {/* Toggle button */}
          <div className="hidden md:block">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={toggleSidebar}
            >
              {collapsed ? (
                <ChevronRight className="h-5 w-5" />
              ) : (
                <ChevronLeft className="h-5 w-5" />
              )}
              <span className="sr-only">
                {collapsed ? "Expand sidebar" : "Collapse sidebar"}
              </span>
            </Button>
          </div>
        </div>
        
        <div className="flex-1 overflow-auto py-4">
          <nav className="space-y-1 px-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  item.current
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  collapsed && "justify-center"
                )}
              >
                <item.icon className={cn("h-5 w-5", collapsed ? "mx-0" : "mr-3")} />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            ))}
          </nav>
        </div>
        
        <div className="border-t p-4">
          <Button
            variant="ghost"
            className={cn("w-full justify-start text-sm", collapsed && "justify-center")}
            onClick={handleLogout}
            disabled={isLoggingOut || loading}
          >
            <LogOut className={cn("h-5 w-5", collapsed ? "mx-0" : "mr-3")} />
            {!collapsed && <span>{isLoggingOut ? "Logging out..." : "Log Out"}</span>}
          </Button>
          
          {!collapsed && (
            <div className="mt-4 flex items-center">
              <div>
                <p className="text-xs text-muted-foreground">Logged in as:</p>
                <p className="text-sm font-medium truncate">{user.name}</p>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
