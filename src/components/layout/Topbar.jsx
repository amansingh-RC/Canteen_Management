import { useLocation, useNavigate } from "react-router-dom";
import { ChevronDown, LogOut, Menu, Moon, Sun } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,} from "@/components/ui/dropdown-menu";
import { LiveClock } from "@/components/shared/LiveClock";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/auth/AuthProvider";
import { navigationItems } from "@/config/navigation";

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
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const title = useCurrentTitle();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

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
          className="grid size-9 place-items-center rounded-md border cursor-pointer"
          onClick={toggleTheme}
          aria-label="Toggle theme"
          title="Toggle theme"
        >
          {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </button>

        {/* Profile menu with logout */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 rounded-full border py-1 pl-1 pr-2 outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer">
            <Avatar className="size-7">
              <AvatarFallback className="text-[11px]">{user?.initials}</AvatarFallback>
            </Avatar>
            <div className="hidden leading-tight sm:block">
              <b className="block text-xs">{user?.name}</b>
              <small className="text-[11px] text-muted-foreground">{user?.role}</small>
            </div>
            <ChevronDown className="size-4 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="leading-tight">
                <p className="text-sm font-medium text-foreground">{user?.name}</p>
                <p className="text-xs font-normal text-muted-foreground">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={handleLogout}
              className="text-danger focus:bg-danger-soft focus:text-danger"
            >
              <LogOut /> Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
