import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Clock, FolderKanban, CheckSquare,
  ClipboardCheck, BarChart2, Users, ChevronLeft, ChevronRight,
  Timer, X
} from "lucide-react";
import { useApp } from "@/context/AppContext";

const navConfig = {
  admin: [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    { icon: Users, label: "User Management", path: "/users" },
    { icon: FolderKanban, label: "Projects", path: "/projects" },
    { icon: CheckSquare, label: "Tasks", path: "/tasks" },
    { icon: ClipboardCheck, label: "Approvals", path: "/approvals" },
    { icon: Clock, label: "Audit Logs", path: "/audit-logs" },
    { icon: BarChart2, label: "Reports", path: "/reports" },
  ],
  manager: [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    { icon: Clock, label: "Timesheets", path: "/timesheets" },
    { icon: FolderKanban, label: "Projects", path: "/projects" },
    { icon: CheckSquare, label: "Tasks", path: "/tasks" },
    { icon: ClipboardCheck, label: "Approvals", path: "/approvals" },
    { icon: BarChart2, label: "Reports", path: "/reports" },
  ],
  employee: [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    { icon: Clock, label: "My Timesheets", path: "/timesheets" },
    { icon: FolderKanban, label: "Projects", path: "/projects" },
    { icon: CheckSquare, label: "My Tasks", path: "/my-tasks" },
  ],
};

export default function Sidebar({ collapsed, onToggle, isMobile = false }) {
  const { currentUser, timesheets } = useApp();
  const location = useLocation();
  const items = navConfig[currentUser?.role] || navConfig.employee;
  const initials = currentUser?.name?.split(" ").map((n) => n[0]).join("") || "U";

  return (
    <aside
      className={cn(
        "h-screen bg-slate-900 flex flex-col transition-all duration-300 flex-shrink-0",
        isMobile ? "w-64" : collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo Header */}
      <div className={cn(
        "flex items-center h-16 px-4 border-b border-slate-800",
        collapsed && !isMobile ? "justify-center" : "justify-between"
      )}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Timer className="w-4 h-4 text-white" />
          </div>
          {(!collapsed || isMobile) && (
            <span className="font-bold text-white text-lg" style={{ fontFamily: "Manrope, sans-serif" }}>
              TimePro
            </span>
          )}
        </div>
        {isMobile ? (
          <button onClick={onToggle} className="text-slate-400 hover:text-white transition-colors p-1 rounded" data-testid="sidebar-close">
            <X className="w-4 h-4" />
          </button>
        ) : (
          <button onClick={onToggle} className="text-slate-400 hover:text-white transition-colors p-1 rounded" data-testid="sidebar-toggle">
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Role Badge */}
      {(!collapsed || isMobile) && (
        <div className="px-4 pt-4 pb-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-600/20 text-indigo-300 capitalize">
            {currentUser?.role || "Guest"}
          </span>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 py-2 px-2 overflow-y-auto space-y-1">
        {items.map((item) => {
          const isActive = location.pathname === item.path;
          const isApprovals = item.label === "Approvals";
          const pendingCount = isApprovals ? timesheets.filter(t => t.status === "submitted").length : 0;

          return (
            <Link
              key={item.path}
              to={item.path}
              data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative",
                isActive
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {(!collapsed || isMobile) && (
                <span className="text-sm font-medium flex-1">{item.label}</span>
              )}
              {isApprovals && pendingCount > 0 && (!collapsed || isMobile) && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center">
                  {pendingCount}
                </span>
              )}
              {isApprovals && pendingCount > 0 && collapsed && !isMobile && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-slate-900" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User at bottom */}
      {(!collapsed || isMobile) && (
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{currentUser?.name}</p>
              <p className="text-slate-400 text-xs">{currentUser?.email}</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
