import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  User,
  Heart,
  Calendar,
  FileText,
  Pill,
  Shield,
  ChevronLeft,
  ChevronRight,
  X,
  Activity,
  Brain,
  ClipboardList,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useIsMobile } from "@/hooks/use-mobile";
import { logout } from "@/services/operations/auth";
import { useDispatch } from "react-redux";

interface PatientSidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const PatientSidebar: React.FC<PatientSidebarProps> = ({ open, setOpen }) => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const navItems = [
    { name: "Overview", path: "/patient/dashboard", icon: User },
    { name: "Medical Records", path: "/patient/medical", icon: FileText },
    { name: "Medications", path: "/patient/medications", icon: Pill },
    { name: "Appointments", path: "/patient/appointments", icon: Calendar },
    { name: "Vitals", path: "/patient/vitals", icon: Heart },
    { name: "Insurance", path: "/patient/insurance", icon: Shield },
    { name: "PCM Module", path: "/patient/pcm", icon: Brain },
    { name: "Test Results", path: "/patient/tests", icon: Activity },
  ];
  const handleLogout = () => {
    dispatch(logout(navigate) as any);
  };

  const handleBackdropClick = () => {
    if (isMobile) {
      setOpen(false);
    }
  };

  const handleNavClick = () => {
    if (isMobile) {
      setOpen(false);
    }
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isMobile && open && (
        <div
          className="fixed inset-0 bg-black/50 z-30 backdrop-blur-sm"
          onClick={handleBackdropClick}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "flex flex-col border-r bg-sidebar shadow-lg transition-all duration-300 ease-in-out",
          isMobile
            ? open
              ? "fixed inset-y-0 left-0 z-40 w-[85%] max-w-[300px] translate-x-0"
              : "fixed inset-y-0 left-0 z-40 w-0 -translate-x-full"
            : open
            ? "relative z-10 w-64"
            : "relative z-10 w-14"
        )}
      >
        {/* Mobile close button */}
        {isMobile && open && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 z-50 h-8 w-8 rounded-full"
            onClick={() => setOpen(false)}
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Close sidebar</span>
          </Button>
        )}

        {/* Desktop toggle button */}
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "absolute right-0 top-20 h-6 w-6 rounded-full -mr-3 border border-border hidden sm:flex",
            "hover:bg-primary hover:text-primary-foreground"
          )}
          onClick={() => setOpen(!open)}
        >
          {open ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
          <span className="sr-only">{open ? "Close" : "Open"} sidebar</span>
        </Button>

        {/* Header */}
        <div className="flex h-14 items-center border-b px-4">
          {open && (
            <div className="flex items-center gap-2 transition-opacity duration-300">
              <User className="h-6 w-6 text-primary" />
              <span className="text-lg font-semibold">Patient Portal</span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 py-4">
          <nav className="grid gap-1 px-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 transition-all",
                  "hover:bg-accent hover:text-accent-foreground",
                  location.pathname === item.path
                    ? "bg-accent text-accent-foreground font-medium"
                    : "text-muted-foreground",
                  !open && "justify-center"
                )}
                onClick={handleNavClick}
              >
                <item.icon className={cn("h-5 w-5", !open && "h-6 w-6")} />
                {open && <span className="text-base">{item.name}</span>}
              </Link>
            ))}
          </nav>
        </ScrollArea>

        <Button
          variant="ghost"
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground justify-start",
            "hover:bg-accent hover:text-accent-foreground text-base",
            !open && "justify-center"
          )}
          onClick={handleLogout}
        >
          <LogOut className={cn("h-5 w-5", !open && "h-6 w-6")} />
          {open && <span>Log out</span>}
        </Button>
      </aside>
    </>
  );
};

export default PatientSidebar;
