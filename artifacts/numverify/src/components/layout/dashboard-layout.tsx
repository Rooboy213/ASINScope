import React from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSidebar } from "./sidebar-context";
import { useGetMe, useLogout } from "@workspace/api-client-react";
import { 
  LayoutDashboard, 
  Briefcase, 
  ShoppingCart, 
  FileText, 
  LifeBuoy, 
  MessageSquare, 
  FileDown, 
  Settings, 
  LogOut,
  Menu,
  X,
  Bell
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from "@/components/ui/dropdown-menu";

const navItems = [
  { icon: LayoutDashboard, label: "Overview", href: "/dashboard" },
  { icon: Briefcase, label: "Projects", href: "/dashboard/projects" },
  { icon: ShoppingCart, label: "Orders", href: "/dashboard/orders" },
  { icon: FileText, label: "Invoices", href: "/dashboard/invoices" },
  { icon: LifeBuoy, label: "Support", href: "/dashboard/tickets" },
  { icon: MessageSquare, label: "Messages", href: "/dashboard/messages" },
  { icon: FileDown, label: "Reports", href: "/dashboard/reports" },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isOpen, toggle } = useSidebar();
  const [location, setLocation] = useLocation();
  const { data: user, isLoading } = useGetMe();
  const logout = useLogout();

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!isLoading && !user) {
      setLocation("/login");
    }
  }, [user, isLoading, setLocation]);

  if (isLoading || !user) return null;

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        window.location.href = "/login";
      }
    });
  };

  return (
    <div className="flex min-h-[100dvh] bg-background">
      {/* Sidebar Overlay on mobile */}
      {!isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={toggle}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed md:sticky top-0 z-50 h-[100dvh] bg-sidebar border-r flex flex-col transition-all duration-300",
          isOpen ? "w-64 translate-x-0" : "w-64 -translate-x-full md:w-20 md:translate-x-0"
        )}
      >
        <div className="h-16 flex items-center px-4 border-b">
          <Link href="/dashboard" className="flex items-center gap-2 overflow-hidden whitespace-nowrap">
            <div className="w-8 h-8 rounded-lg bg-primary shrink-0 flex items-center justify-center">
              <span className="text-white font-display font-bold text-xl">N</span>
            </div>
            {isOpen && (
              <span className="font-display font-bold text-xl tracking-tight text-sidebar-foreground">
                NumVerify
              </span>
            )}
          </Link>
          <Button variant="ghost" size="icon" className="md:hidden ml-auto" onClick={toggle}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 space-y-1 px-2">
          {navItems.map((item) => {
            const isActive = location === item.href || (location.startsWith(item.href) && item.href !== "/dashboard");
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors whitespace-nowrap overflow-hidden",
                  isActive 
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" 
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                )}
                title={!isOpen ? item.label : undefined}
              >
                <item.icon className={cn("h-5 w-5 shrink-0", isActive ? "text-primary" : "")} />
                {isOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t">
          <Link 
            href="/dashboard/settings"
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors whitespace-nowrap overflow-hidden text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
              location === "/dashboard/settings" && "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
            )}
            title={!isOpen ? "Settings" : undefined}
          >
            <Settings className="h-5 w-5 shrink-0" />
            {isOpen && <span>Settings</span>}
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b bg-background flex items-center justify-between px-4 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={toggle} className="text-muted-foreground">
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="font-semibold hidden sm:block truncate">
              {navItems.find(i => i.href === location)?.label || "Dashboard"}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative text-muted-foreground">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full" />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatarUrl || ""} alt={user.name} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings">Profile Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive focus:text-destructive cursor-pointer" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
