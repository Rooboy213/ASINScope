import React from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSidebar } from "./sidebar-context";
import { useGetMe, useLogout } from "@workspace/api-client-react";
import { 
  LayoutDashboard, 
  Users, 
  ShoppingCart, 
  LifeBuoy, 
  FileText, 
  Star,
  HelpCircle,
  FileDown,
  Mail,
  MailOpen,
  LogOut,
  Menu,
  X
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

const adminNavItems = [
  { icon: LayoutDashboard, label: "Analytics", href: "/admin" },
  { icon: Users, label: "Clients", href: "/admin/clients" },
  { icon: ShoppingCart, label: "Orders", href: "/admin/orders" },
  { icon: LifeBuoy, label: "Tickets", href: "/admin/tickets" },
  { icon: FileText, label: "Blog", href: "/admin/blog" },
  { icon: Star, label: "Testimonials", href: "/admin/testimonials" },
  { icon: HelpCircle, label: "FAQ", href: "/admin/faq" },
  { icon: FileDown, label: "Reports", href: "/admin/reports" },
  { icon: Mail, label: "Contacts", href: "/admin/contacts" },
  { icon: MailOpen, label: "Subscribers", href: "/admin/subscribers" },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isOpen, toggle } = useSidebar();
  const [location, setLocation] = useLocation();
  const { data: user, isLoading } = useGetMe();
  const logout = useLogout();

  // Redirect if not authenticated or not admin
  React.useEffect(() => {
    if (!isLoading) {
      if (!user) {
        setLocation("/login");
      } else if (user.role !== 'admin') {
        setLocation("/dashboard");
      }
    }
  }, [user, isLoading, setLocation]);

  if (isLoading || !user || user.role !== 'admin') return null;

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
          "fixed md:sticky top-0 z-50 h-[100dvh] bg-zinc-950 border-r border-zinc-800 flex flex-col transition-all duration-300 text-zinc-300",
          isOpen ? "w-64 translate-x-0" : "w-64 -translate-x-full md:w-20 md:translate-x-0"
        )}
      >
        <div className="h-16 flex items-center px-4 border-b border-zinc-800 bg-zinc-950">
          <Link href="/admin" className="flex items-center gap-2 overflow-hidden whitespace-nowrap">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 shrink-0 flex items-center justify-center">
              <span className="text-white font-display font-bold text-xl">A</span>
            </div>
            {isOpen && (
              <div className="flex flex-col">
                <span className="font-display font-bold text-lg tracking-tight text-white leading-none">
                  Admin Panel
                </span>
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest">NumVerify</span>
              </div>
            )}
          </Link>
          <Button variant="ghost" size="icon" className="md:hidden ml-auto text-zinc-400 hover:text-white" onClick={toggle}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 space-y-1 px-2">
          {adminNavItems.map((item) => {
            const isActive = location === item.href || (location.startsWith(item.href) && item.href !== "/admin");
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors whitespace-nowrap overflow-hidden",
                  isActive 
                    ? "bg-indigo-500/10 text-indigo-400 font-medium" 
                    : "hover:bg-zinc-900 hover:text-white"
                )}
                title={!isOpen ? item.label : undefined}
              >
                <item.icon className={cn("h-5 w-5 shrink-0")} />
                {isOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b bg-background flex items-center justify-between px-4 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={toggle} className="text-muted-foreground">
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <h1 className="font-semibold hidden sm:block truncate">
                {adminNavItems.find(i => i.href === location)?.label || "Admin"}
              </h1>
              <Badge variant="outline" className="text-xs bg-indigo-500/10 text-indigo-500 border-indigo-500/20">
                ADMIN
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatarUrl || ""} alt={user.name} />
                    <AvatarFallback className="bg-indigo-500 text-white">
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
                <DropdownMenuItem className="text-destructive focus:text-destructive cursor-pointer" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-x-hidden bg-muted/20">
          {children}
        </main>
      </div>
    </div>
  );
}
