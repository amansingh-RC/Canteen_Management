import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { navigationGroups } from "@/config/navigation";
import { siteConfig } from "@/config/site";

export function Sidebar({ open, onNavigate }) {
  return (
    <aside
      className={cn(
        "fixed z-40 flex h-screen w-60 flex-col bg-sidebar text-sidebar-foreground transition-transform duration-200 lg:sticky lg:top-0 lg:translate-x-0",
        open ? "translate-x-0 shadow-2xl" : "-translate-x-full"
      )}
    >
      {/* Brand */}
      <div className="flex items-center gap-3 border-b border-sidebar-border px-5 py-4">
        <div className="grid place-items-center text-sm font-bold text-white bg-white">
          <img
            src="https://royalchaingroup.com/wp-content/uploads/2025/09/favicon.png"
            alt="Logo"
            className="h-10"
          />
        </div>
        <div className="leading-tight">
          <b className="block text-sm text-white">{siteConfig.name}</b>
          <small className="text-[11px] text-sidebar-foreground/70">
            {siteConfig.subtitle}
          </small>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-2">
        {navigationGroups.map((group) => (
          <div key={group.label}>
            <div className="px-3 pb-1.5 pt-4 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/50">
              {group.label}
            </div>
            {group.items.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.key}
                  to={item.path}
                  end={item.path === "/"}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] transition-colors",
                      isActive
                        ? "bg-sidebar-accent text-white"
                        : "text-sidebar-foreground hover:bg-white/5 hover:text-white"
                    )
                  }
                >
                  <Icon className="size-4.5 shrink-0 opacity-90" />
                  {item.label}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );
}
