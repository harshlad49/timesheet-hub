import { useLocation, useNavigate } from "react-router-dom";
import { Bell, Menu, ChevronDown, LogOut, User } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const pageTitles = {
  "/dashboard": "Dashboard",
  "/timesheets": "Timesheets",
  "/projects": "Projects",
  "/tasks": "Tasks & Categories",
  "/approvals": "Approval Queue",
  "/reports": "Reports & Analytics",
  "/users": "User Management",
};

export default function Header({ onMobileMenuClick }) {
  const { currentUser, logout, timesheets } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  const title = pageTitles[location.pathname] || "TimePro";
  const initials = currentUser?.name?.split(" ").map((n) => n[0]).join("") || "U";

  const pendingCount = timesheets.filter((t) => t.status === "submitted").length;

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 md:px-6 flex items-center justify-between flex-shrink-0 z-10">
      <div className="flex items-center gap-4">
        <button
          onClick={onMobileMenuClick}
          className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
          data-testid="mobile-menu-btn"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-semibold text-slate-900" style={{ fontFamily: "Manrope, sans-serif" }}>
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        {/* Notifications */}
        <button
          className="relative p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
          data-testid="notifications-btn"
          onClick={() => toast.info(`${pendingCount} timesheets pending approval`)}
        >
          <Bell className="w-5 h-5" />
          {pendingCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold">
              {pendingCount}
            </span>
          )}
        </button>

        {/* User Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="flex items-center gap-2 p-1 pr-3 rounded-lg hover:bg-slate-100 transition-colors"
              data-testid="user-menu-btn"
            >
              <Avatar className="w-8 h-8">
                <AvatarImage src={currentUser?.avatar} />
                <AvatarFallback className="bg-indigo-600 text-white text-xs font-bold">{initials}</AvatarFallback>
              </Avatar>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-slate-900 leading-tight">{currentUser?.name}</p>
                <p className="text-xs text-slate-500 capitalize leading-tight">{currentUser?.role}</p>
              </div>
              <ChevronDown className="hidden md:block w-4 h-4 text-slate-400" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>
              <p className="font-medium">{currentUser?.name}</p>
              <p className="text-xs text-slate-500">{currentUser?.email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem data-testid="profile-menu-item">
              <User className="w-4 h-4 mr-2" /> Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600" data-testid="logout-btn">
              <LogOut className="w-4 h-4 mr-2" /> Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
