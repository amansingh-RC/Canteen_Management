import { useLocation } from "react-router-dom";
import { Bell, Menu, Moon, Search, Sun } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LiveClock } from "@/components/shared/LiveClock";
import { useTheme } from "@/hooks/useTheme";
import { navigationItems } from "@/config/navigation";
import { siteConfig } from "@/config/site";

const TODAY = "Today, 18 Jun 2026";

function useCurrentTitle() {
  const { pathname } = useLocation();
  const match =
    navigationItems.find((i) => i.path === pathname) ||
    navigationItems.find((i) => i.path !== "/" && pathname.startsWith(i.path));
  return match?.label ?? "Dashboard";
}

export function Topbar({ onToggleSidebar }) {
  const { theme, toggleTheme } = useTheme();
  const title = useCurrentTitle();
  const { currentUser } = siteConfig;

  return (
    <header className="sticky top-0 z-20 flex items-center gap-4 border-b bg-card px-5 py-2.5">
      <button
        className="grid size-9 place-items-center rounded-md border lg:hidden"
        onClick={onToggleSidebar}
        aria-label="Toggle menu"
      >
        <Menu className="size-5" />
      </button>

      <div className="text-xs text-muted-foreground">
        <b className="text-foreground">{title}</b> · {TODAY}
      </div>

      <div className="ml-auto flex items-center gap-2.5">
        <span className="hidden rounded-full border bg-background px-3 py-1.5 text-xs text-muted-foreground sm:inline">
          <LiveClock />
        </span>

        <button
          className="grid size-9 place-items-center rounded-md border"
          onClick={toggleTheme}
          aria-label="Toggle theme"
          title="Toggle theme"
        >
          {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </button>

        <div className="flex items-center gap-2 rounded-full border py-1 pl-1 pr-3">
          <Avatar className="size-7">
            <AvatarFallback className="text-[11px]">
              {currentUser.initials}
            </AvatarFallback>
          </Avatar>
          <div className="hidden leading-tight sm:block">
            <b className="block text-xs">{currentUser.name}</b>
            <small className="text-[11px] text-muted-foreground">
              {currentUser.role}
            </small>
          </div>
        </div>
      </div>
    </header>
  );
}
