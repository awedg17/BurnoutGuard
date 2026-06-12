import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { Sun, Moon, Bell } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — BurnoutGuard" },
      {
        name: "description",
        content: "Manage appearance and notification preferences.",
      },
    ],
  }),
  component: SettingsPage,
});

const THEMES = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
] as const;

function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [permission, setPermission] = useState<NotificationPermission | null>(
    null,
  );

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestNotifications = async () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      toast.error("Notifications are not supported in this browser.");
      return;
    }
    const result = await Notification.requestPermission();
    setPermission(result);
    if (result === "granted") {
      toast.success("Notifications enabled");
    } else if (result === "denied") {
      toast.error("Notifications blocked");
    }
  };

  const PERMISSION_META: Record<
    NotificationPermission,
    { label: string; className: string }
  > = {
    granted: { label: "Enabled", className: "bg-calm/15 text-calm-foreground" },
    denied: { label: "Blocked", className: "bg-danger/20 text-danger-foreground" },
    default: { label: "Not set", className: "bg-secondary text-secondary-foreground" },
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Customize how BurnoutGuard looks and notifies you.
        </p>
      </div>

      {/* Appearance */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold">Appearance</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose between a light or dark theme.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:w-72">
          {THEMES.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.value}
                onClick={() => setTheme(t.value)}
                className={`flex flex-col items-center gap-2 rounded-xl border px-4 py-3 text-sm transition-colors ${
                  theme === t.value
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border text-muted-foreground hover:bg-muted/50"
                }`}
              >
                <Icon className="h-5 w-5" />
                {t.label}
              </button>
            );
          })}
        </div>
      </Card>

      {/* Notifications */}
      <Card className="p-6">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Notifications</h2>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Allow BurnoutGuard to send you browser notifications, e.g. for
          upcoming deadlines.
        </p>
        <div className="mt-4 flex items-center gap-3">
          {permission && (
            <Badge className={`rounded-full ${PERMISSION_META[permission].className}`}>
              {PERMISSION_META[permission].label}
            </Badge>
          )}
          <Button
            variant="outline"
            className="rounded-full"
            onClick={requestNotifications}
            disabled={permission === "granted"}
          >
            {permission === "granted" ? "Notifications enabled" : "Enable notifications"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
