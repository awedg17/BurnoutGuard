import { Link } from "@tanstack/react-router";
import { Home, ListTodo, LineChart, MessageCircle, Settings, User, Leaf } from "lucide-react";
import type { ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";
import { Chatbot } from "@/components/Chatbot";

const navItems = [
  { to: "/", label: "Home", icon: Home },
  { to: "/activities", label: "Activities", icon: ListTodo },
  { to: "/insights", label: "Insights", icon: LineChart },
  { to: "/chatbot", label: "Chatbot", icon: MessageCircle },
] as const;

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-primary">
              <Leaf className="h-5 w-5" />
            </span>
            <span className="font-display text-lg font-semibold text-foreground">
              Burnout<span className="text-primary">Guard</span>
            </span>
          </Link>

          <div className="flex items-center gap-1">
            {/* Desktop nav */}
            <nav className="hidden items-center gap-1 sm:flex">
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  activeOptions={{ exact: item.to === "/" }}
                  className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground data-[status=active]:bg-secondary data-[status=active]:text-secondary-foreground"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Profile & settings */}
            <div className="flex items-center gap-1 border-l border-border/60 pl-2 sm:ml-1">
              <Link
                to="/settings"
                aria-label="Settings"
                className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground data-[status=active]:bg-secondary data-[status=active]:text-secondary-foreground"
              >
                <Settings className="h-5 w-5" />
              </Link>
              <Link
                to="/profile"
                aria-label="Profile"
                className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground data-[status=active]:bg-secondary data-[status=active]:text-secondary-foreground"
              >
                <User className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="mx-auto max-w-5xl px-5 pb-28 pt-6 sm:pb-12">{children}</main>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border/60 bg-background/90 backdrop-blur-md sm:hidden">
        <div className="mx-auto flex max-w-5xl items-stretch justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.to === "/" }}
                className="flex flex-1 flex-col items-center gap-1 py-3 text-xs font-medium text-muted-foreground transition-colors data-[status=active]:text-primary"
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
      <Toaster position="top-center" />
      <Chatbot />
    </div>
  );
}
