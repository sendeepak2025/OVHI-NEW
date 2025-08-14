import type React from "react";
import { useState, useEffect } from "react";
import {
  Menu,
  Bell,
  Search,
  Sun,
  Moon,
  Phone,
  PhoneOff,
  LogOut,
  Clock,
  Wifi,
  WifiOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { ringCentralStore } from "@/ringcentral/store/ringcentral";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { Link, useNavigate } from "react-router-dom";
import { logout } from "@/services/operations/auth";

interface HeaderProps {
  sidebarOpen?: boolean;
  setSidebarOpen?: (open: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ sidebarOpen, setSidebarOpen }) => {
  // RingCentral state
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [tokenExpiry, setTokenExpiry] = useState("Not logged in");
  const [extInfo, setExtInfo] = useState(null);
  const [initComplete, setInitComplete] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  // UI state
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const isMobile = useIsMobile();

  // Mock user data - replace with actual Redux selector
  const { user, token } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const updateStatus = () => {
      setIsConnected(ringCentralStore.isConnected);
      setIsConnecting(ringCentralStore.isConnecting);
      setIsLoggedIn(ringCentralStore.isLoggedIn);
      setTokenExpiry(ringCentralStore.tokenExpiryFormatted);
      setExtInfo(ringCentralStore.extInfo);
      setInitComplete(ringCentralStore.initializationComplete);
    };

    updateStatus();
    const unsubscribe = ringCentralStore.subscribe(updateStatus);
    const interval = setInterval(updateStatus, 1000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const handleConnect = () => {
    ringCentralStore.connect();
  };

  const handleDisconnect = () => {
    ringCentralStore.disconnect();
  };

  const handleLogout = () => {
    ringCentralStore.logout();
    dispatch(logout(navigate) as any);

    // Also handle regular app logout here
  };

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  const toggleSidebar = () => {
    if (setSidebarOpen) {
      setSidebarOpen(!sidebarOpen);
    }
  };

  // Show loading state during initialization
  if (!initComplete) {
    return (
      <header className="sticky top-0 z-50 flex items-center justify-between h-14 px-3 sm:px-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="flex items-center justify-center h-9 w-9"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "font-bold text-primary",
                isMobile ? "text-base" : "text-xl"
              )}
            >
              Ovhi_Patient Portal
            </span>
            <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
              EHR
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
          <span className="text-sm text-muted-foreground">Initializing...</span>
        </div>
      </header>
    );
  }

  return (
    <TooltipProvider>
      <header className="sticky top-0 z-50 flex items-center justify-between h-14 px-3 sm:px-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="flex items-center justify-center h-9 w-9"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex items-center gap-2">
            <span
              className={cn(
                "font-bold text-primary",
                isMobile ? "text-base" : "text-xl"
              )}
            >
              Ovhi_Patient Portal
            </span>
            <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
              EHR
            </span>
          </div>
        </div>

        {/* Search bar - hidden on small screens */}
        {/* <div className="hidden md:flex items-center max-w-sm flex-1 mx-4">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Search patients..." className="w-full pl-9 bg-secondary border-none" />
          </div>
        </div> */}

        <div className="flex items-center gap-1 sm:gap-2">
          {/* RingCentral Connection Status */}
          <div className="flex items-center gap-2">
            <Badge
              variant={
                isConnected
                  ? "default"
                  : isLoggedIn
                  ? "secondary"
                  : "destructive"
              }
              className="hidden sm:flex items-center gap-1"
            >
              {isConnected ? (
                <Wifi className="h-3 w-3" />
              ) : (
                <WifiOff className="h-3 w-3" />
              )}
              {isConnected
                ? "Connected"
                : isLoggedIn
                ? "Logged In"
                : "Disconnected"}
            </Badge>

            {/* Connect/Disconnect Button */}
            {isLoggedIn ? (
              isConnected ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDisconnect}
                  className="hidden sm:flex items-center gap-1"
                >
                  <PhoneOff className="h-4 w-4" />
                  {!isMobile && "Disconnect"}
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={handleConnect}
                  disabled={isConnecting}
                  className="hidden sm:flex items-center gap-1"
                >
                  <Phone className="h-4 w-4" />
                  {isConnecting ? "Connecting..." : !isMobile && "Connect"}
                </Button>
              )
            ) : (
              <Button
                size="sm"
                onClick={handleConnect}
                disabled={isConnecting}
                className="hidden sm:flex items-center gap-1"
              >
                <Phone className="h-4 w-4" />
                {isConnecting
                  ? "Connecting..."
                  : !isMobile && "Login & Connect"}
              </Button>
            )}
          </div>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="text-muted-foreground hover:text-foreground h-8 w-8 sm:h-9 sm:w-9"
          >
            {theme === "light" ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>

          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "text-muted-foreground hover:text-foreground relative h-8 w-8 sm:h-9 sm:w-9",
              "after:absolute after:top-2 after:right-2 after:w-2 after:h-2 after:rounded-full after:bg-red-500"
            )}
          >
            <Bell className="h-5 w-5" />
            <span className="sr-only">Notifications</span>
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full h-8 w-8 sm:h-9 sm:w-9"
              >
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarFallback>
                    {user.firstname[0]}
                    {user.lastname[0]}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel>Account Information</DropdownMenuLabel>
              <DropdownMenuSeparator />

              {/* User Info */}
              <DropdownMenuItem className="flex flex-col items-start gap-1 cursor-default">
                <span className="font-medium">
                  {user?.firstname} {user?.lastname}
                </span>
                <span className="text-xs text-muted-foreground">
                  {user?.email}
                </span>
              </DropdownMenuItem>

              {/* RingCentral Info */}
              {isLoggedIn && extInfo && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="flex items-center gap-2 cursor-default">
                    <Clock className="h-4 w-4" />
                    <span className="text-xs">{tokenExpiry}</span>
                  </DropdownMenuItem>
                </>
              )}

              <DropdownMenuSeparator />

              <Link to="/provider/settings">
                <DropdownMenuItem>Profile Settings</DropdownMenuItem>
              </Link>

              {/* RingCentral Actions for Mobile */}
              {isMobile && (
                <>
                  <DropdownMenuSeparator />
                  {isLoggedIn ? (
                    isConnected ? (
                      <DropdownMenuItem
                        onClick={handleDisconnect}
                        className="flex items-center gap-2"
                      >
                        <PhoneOff className="h-4 w-4" />
                        Disconnect Phone
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem
                        onClick={handleConnect}
                        className="flex items-center gap-2"
                      >
                        <Phone className="h-4 w-4" />
                        Connect Phone
                      </DropdownMenuItem>
                    )
                  ) : (
                    <DropdownMenuItem
                      onClick={handleConnect}
                      className="flex items-center gap-2"
                    >
                      <Phone className="h-4 w-4" />
                      Login & Connect
                    </DropdownMenuItem>
                  )}
                </>
              )}

              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="flex items-center gap-2 text-red-600"
              >
                <LogOut className="h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Token Expiry Tooltip */}
          {isLoggedIn && !isMobile && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground"
                >
                  <Clock className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Token {tokenExpiry}</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </header>
    </TooltipProvider>
  );
};

export default Header;
