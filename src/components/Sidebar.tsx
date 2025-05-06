
import React from "react";
import { NavLink } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  UserRound,
  BarChart,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  return (
    <aside
      className={cn(
        "flex flex-col bg-white border-r shadow transition-all duration-300 z-30",
        isOpen ? "w-64" : "w-16"
      )}
    >
      <div className="flex h-14 items-center justify-between border-b px-3">
        <div className={cn("overflow-hidden", isOpen ? "block" : "hidden")}>
          <h1 className="font-semibold text-careforme-cyan text-lg">
            CareForMe AdminPortal
          </h1>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="text-careforme-text"
        >
          {isOpen ? (
            <ChevronLeft className="h-5 w-5" />
          ) : (
            <ChevronRight className="h-5 w-5" />
          )}
          <span className="sr-only">Toggle sidebar</span>
        </Button>
      </div>

      <nav className="flex-1 overflow-y-auto p-2">
        <ul className="space-y-1">
          <NavItem
            to="/"
            icon={<LayoutDashboard className="h-5 w-5" />}
            label="Dashboard"
            isOpen={isOpen}
          />
          <NavItem
            to="/doctors"
            icon={<UserRound className="h-5 w-5" />}
            label="Doctors"
            isOpen={isOpen}
          />
          <NavItem
            to="/reports"
            icon={<BarChart className="h-5 w-5" />}
            label="Reports"
            isOpen={isOpen}
          />
          <NavItem
            to="/settings"
            icon={<Settings className="h-5 w-5" />}
            label="Settings"
            isOpen={isOpen}
          />
        </ul>
      </nav>

      <div className="p-2 border-t">
        <div className="rounded-md bg-primary-foreground p-2 text-xs text-center">
          {isOpen ? (
            <p>Oratile Chilliboy 22000517</p>
          ) : (
            <p>v1.0</p>
          )}
        </div>
      </div>
    </aside>
  );
};

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isOpen: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label, isOpen }) => {
  return (
    <li>
      <NavLink
        to={to}
        className={({ isActive }) =>
          cn(
            "flex items-center gap-3 rounded-md px-3 py-2 transition-colors hover:bg-muted",
            isActive ? "bg-careforme-cyan text-white hover:bg-careforme-cyan/90" : "text-careforme-text"
          )
        }
      >
        {icon}
        {isOpen && <span>{label}</span>}
      </NavLink>
    </li>
  );
};

export default Sidebar;
