import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useBoards } from "../hooks/useBoards";
import { useNotificationStore } from "../store/notifications";
import { useUserProfileStore } from "../store/userProfile";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Separator } from "./ui/separator";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { NotificationPanel } from "./NotificationPanel";
import { ProfileSettings } from "./ProfileSettings";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./ui/breadcrumb";
import {
  LayoutDashboard,
  Plus,
  Moon,
  Sun,
  LogOut,
  Sparkles,
  TrendingUp,
  Settings,
  User,
  Kanban,
  Calendar,
  Bell,
  Search,
  ChevronRight,
  ChevronDown,
  X,
  MapPin,
  Globe,
  Shield,
  Users,
  Star,
} from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, signOut } = useAuth();
  const { boards, createBoard, loading } = useBoards();
  const { unreadCount, fetchNotifications } = useNotificationStore();
  const { profile, getAvatarUrl } = useUserProfileStore();

  const location = useLocation();
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
  const [isProfileSettingsOpen, setIsProfileSettingsOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [newBoardTitle, setNewBoardTitle] = useState("");
  const [newBoardDescription, setNewBoardDescription] = useState("");

  const [expandedSections, setExpandedSections] = useState({
    myBoards: true,
    sharedWithMe: true,
    starred: true,
  });

  // Categorize boards for sidebar
  const ownedBoards = boards.filter((board) => board.created_by === user?.id);
  const sharedBoards = boards.filter((board) => board.created_by !== user?.id);
  const starredBoards = boards.filter((board) => board.is_starred);

  // Fetch notifications on mount
  React.useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleToggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const handleCreateBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBoardTitle.trim()) return;

    await createBoard(newBoardTitle.trim(), newBoardDescription.trim() || "");

    setNewBoardTitle("");
    setNewBoardDescription("");

    setIsCreateModalOpen(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      // Navigate to dashboard with search term
      navigate(`/dashboard?search=${encodeURIComponent(searchTerm.trim())}`);
      setIsSearchOpen(false);
      setSearchTerm("");
    }
  };

  // Keyboard shortcut for search (Ctrl/Cmd + K)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === "Escape") {
        setIsSearchOpen(false);
        setIsCreateModalOpen(false);
        setIsNotificationPanelOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const isBoardActive = location.pathname.startsWith("/board/");

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Generate breadcrumb based on current location
  const getBreadcrumb = () => {
    const pathSegments = location.pathname.split("/").filter(Boolean);

    if (pathSegments.length === 0) {
      return [
        {
          name: "Dashboard",
          path: "/dashboard",
          key: "dashboard",
          icon: <MapPin className="h-4 w-4 text-muted-foreground mr-1" />,
        },
      ];
    }

    const breadcrumb = [
      {
        name: "Taskly",
        path: "/dashboard",
        key: "taskly",
        icon: <MapPin className="h-4 w-4 text-muted-foreground mr-1" />,
      },
    ];

    if (pathSegments[0] === "dashboard") {
      breadcrumb.push({
        name: "Dashboard",
        path: "/dashboard",
        key: "dashboard-page",
      });
    } else if (pathSegments[0] === "board" && pathSegments[1]) {
      breadcrumb.push({
        name: "Dashboard",
        path: "/dashboard",
        key: "dashboard-nav",
      });
      // Find the board name from the boards array
      const board = boards.find((b) => b.id === pathSegments[1]);

      // If boards are still loading, show a loading state
      if (loading && boards.length === 0) {
        breadcrumb.push({
          name: "Loading...",
          path: `/board/${pathSegments[1]}`,
          key: `board-${pathSegments[1]}`,
        });
      } else {
        breadcrumb.push({
          name: board?.title || "Board",
          path: `/board/${pathSegments[1]}`,
          key: `board-${pathSegments[1]}`,
        });
      }
    } else if (pathSegments[0] === "settings") {
      breadcrumb.push({ name: "Settings", path: "/settings", key: "settings" });
    }

    return breadcrumb;
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-72 bg-card border-r border-border/50 flex flex-col shadow-sm">
        {/* Logo Section */}
        <div className="p-6 border-b border-border/50">
          <Link to="/dashboard" className="flex items-center space-x-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-600 shadow-lg group-hover:shadow-xl transition-all duration-200">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary-600 bg-clip-text text-transparent">
                Taskly
              </h1>
              <p className="text-xs text-muted-foreground">
                Productivity Platform
              </p>
            </div>
          </Link>
        </div>

        {/* Top Section - Navigation */}
        <div className="flex-1 p-4 space-y-6 overflow-y-auto">
          {/* Search Bar */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search boards..."
                className="pl-9 h-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && searchTerm.trim()) {
                    handleSearch(e as any);
                  }
                }}
              />
            </div>
          </div>

          {/* My Boards */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleSection("myBoards")}
                className="h-6 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground"
              >
                <span>My Boards</span>
                {expandedSections.myBoards ? (
                  <ChevronDown className="h-3 w-3 ml-1" />
                ) : (
                  <ChevronRight className="h-3 w-3 ml-1" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCreateModalOpen(true)}
                className="h-6 w-6 p-0"
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
            {expandedSections.myBoards && (
              <nav className="space-y-1">
                {ownedBoards.slice(0, 5).map((board) => (
                  <Link
                    key={board.id}
                    to={`/board/${board.id}`}
                    className="block"
                  >
                    <Button
                      variant={
                        location.pathname === `/board/${board.id}`
                          ? "secondary"
                          : "ghost"
                      }
                      size="sm"
                      className="w-full justify-start h-8 text-xs"
                    >
                      <Kanban className="h-3 w-3 mr-2" />
                      <span className="truncate flex-1">{board.title}</span>
                      <div className="flex items-center gap-1 ml-auto">
                        {board.is_public && (
                          <Badge
                            variant="secondary"
                            className="text-xs flex items-center gap-1"
                          >
                            <Globe className="h-3 w-3 text-green-500" />
                            <span className="text-green-600">Public</span>
                          </Badge>
                        )}
                      </div>
                    </Button>
                  </Link>
                ))}
                {ownedBoards.length === 0 && (
                  <div className="px-3 py-2 text-xs text-muted-foreground">
                    No boards created yet
                  </div>
                )}
                {ownedBoards.length > 5 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate("/dashboard")}
                    className="w-full justify-start h-8 text-xs text-muted-foreground"
                  >
                    <span>View all {ownedBoards.length} boards</span>
                    <ChevronRight className="h-3 w-3 ml-auto" />
                  </Button>
                )}
              </nav>
            )}
          </div>

          {/* Shared With Me */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleSection("sharedWithMe")}
                className="h-6 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground"
              >
                <span>Shared With Me</span>
                {expandedSections.sharedWithMe ? (
                  <ChevronDown className="h-3 w-3 ml-1" />
                ) : (
                  <ChevronRight className="h-3 w-3 ml-1" />
                )}
              </Button>
            </div>
            {expandedSections.sharedWithMe && (
              <nav className="space-y-1">
                {sharedBoards.slice(0, 5).map((board) => (
                  <Link
                    key={board.id}
                    to={`/board/${board.id}`}
                    className="block"
                  >
                    <Button
                      variant={
                        location.pathname === `/board/${board.id}`
                          ? "secondary"
                          : "ghost"
                      }
                      size="sm"
                      className="w-full justify-start h-8 text-xs"
                    >
                      <Kanban className="h-3 w-3 mr-2" />
                      <span className="truncate flex-1">{board.title}</span>
                      <div className="flex items-center gap-1 ml-auto">
                        <Badge
                          variant="secondary"
                          className="text-xs flex items-center gap-1"
                        >
                          <Users className="h-3 w-3 text-blue-500" />
                          <span className="text-blue-600">Shared</span>
                        </Badge>
                      </div>
                    </Button>
                  </Link>
                ))}
                {sharedBoards.length === 0 && (
                  <div className="px-3 py-2 text-xs text-muted-foreground">
                    No shared boards yet
                  </div>
                )}
                {sharedBoards.length > 5 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate("/dashboard")}
                    className="w-full justify-start h-8 text-xs text-muted-foreground"
                  >
                    <span>View all {sharedBoards.length} shared boards</span>
                    <ChevronRight className="h-3 w-3 ml-auto" />
                  </Button>
                )}
              </nav>
            )}
          </div>

          {/* Starred Boards */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleSection("starred")}
                className="h-6 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground"
              >
                <span>Starred</span>
                {expandedSections.starred ? (
                  <ChevronDown className="h-3 w-3 ml-1" />
                ) : (
                  <ChevronRight className="h-3 w-3 ml-1" />
                )}
              </Button>
            </div>
            {expandedSections.starred && (
              <nav className="space-y-1">
                {starredBoards.slice(0, 5).map((board) => (
                  <Link
                    key={board.id}
                    to={`/board/${board.id}`}
                    className="block"
                  >
                    <Button
                      variant={
                        location.pathname === `/board/${board.id}`
                          ? "secondary"
                          : "ghost"
                      }
                      size="sm"
                      className="w-full justify-start h-8 text-xs"
                    >
                      <Kanban className="h-3 w-3 mr-2" />
                      <span className="truncate flex-1">{board.title}</span>
                      <div className="flex items-center gap-1 ml-auto">
                        <Badge
                          variant="secondary"
                          className="text-xs flex items-center gap-1"
                        >
                          <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                          <span className="text-yellow-600">Starred</span>
                        </Badge>
                      </div>
                    </Button>
                  </Link>
                ))}
                {starredBoards.length === 0 && (
                  <div className="px-3 py-2 text-xs text-muted-foreground">
                    No starred boards yet
                  </div>
                )}
                {starredBoards.length > 5 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate("/dashboard")}
                    className="w-full justify-start h-8 text-xs text-muted-foreground"
                  >
                    <span>View all {starredBoards.length} starred boards</span>
                    <ChevronRight className="h-3 w-3 ml-auto" />
                  </Button>
                )}
              </nav>
            )}
          </div>
        </div>

        {/* Footer Section */}
        <div className="p-4 border-t border-border/50 space-y-4">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleDarkMode}
            className="w-full justify-start h-9"
          >
            {darkMode ? (
              <Sun className="h-4 w-4 mr-3" />
            ) : (
              <Moon className="h-4 w-4 mr-3" />
            )}
            {darkMode ? "Light Mode" : "Dark Mode"}
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-start p-2 h-auto"
              >
                <Avatar className="h-8 w-8 ring-2 ring-background mr-3">
                  <AvatarImage
                    src={getAvatarUrl(user?.email || "", profile?.avatar_url)}
                  />
                  <AvatarFallback className="bg-primary/10 text-primary font-medium text-xs">
                    {(
                      profile?.display_name ||
                      user?.email?.split("@")[0] ||
                      "U"
                    )
                      .charAt(0)
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-medium truncate">
                    {profile?.display_name ||
                      user?.email?.split("@")[0] ||
                      "User"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user?.email}
                  </p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {profile?.display_name ||
                      user?.email?.split("@")[0] ||
                      "User"}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setIsProfileSettingsOpen(true)}>
                <User className="mr-2 h-4 w-4" />
                <span>Profile Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="h-16 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/50 flex items-center justify-between px-6">
          <div className="flex items-center space-x-4">
            {/* Breadcrumb Navigation */}
            <Breadcrumb>
              <BreadcrumbList>
                {(() => {
                  const breadcrumbItems = getBreadcrumb();
                  return breadcrumbItems.map((item, index) => {
                    // Skip items with no name
                    if (!item.name || item.name.trim() === "") {
                      return null;
                    }

                    return (
                      <React.Fragment key={item.key}>
                        <BreadcrumbItem>
                          {item.icon && item.icon}
                          {index === breadcrumbItems.length - 1 ? (
                            <BreadcrumbPage>{item.name}</BreadcrumbPage>
                          ) : (
                            <BreadcrumbLink href={item.path}>
                              {item.name}
                            </BreadcrumbLink>
                          )}
                        </BreadcrumbItem>
                        {index < breadcrumbItems.length - 1 && (
                          <BreadcrumbSeparator />
                        )}
                      </React.Fragment>
                    );
                  });
                })()}
              </BreadcrumbList>
            </Breadcrumb>
            {loading && (
              <div className="text-xs text-muted-foreground ml-2">
                Loading...
              </div>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 relative"
              onClick={() => setIsNotificationPanelOpen(true)}
              title="Notifications"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs"
                >
                  {unreadCount}
                </Badge>
              )}
            </Button>
            <div className="hidden md:flex items-center space-x-2 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              <span>Productivity Platform</span>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-auto bg-background/50">{children}</div>
      </div>

      {/* Create Board Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Create New Board</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCreateModalOpen(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <form onSubmit={handleCreateBoard} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Board Title</label>
                <Input
                  value={newBoardTitle}
                  onChange={(e) => setNewBoardTitle(e.target.value)}
                  placeholder="Enter board title"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Description (optional)
                </label>
                <Input
                  value={newBoardDescription}
                  onChange={(e) => setNewBoardDescription(e.target.value)}
                  placeholder="Enter board description"
                />
              </div>

              <div className="flex space-x-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  Create Board
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Search Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Search Boards</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSearchOpen(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search Term</label>
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Enter search term..."
                  required
                  autoFocus
                />
              </div>
              <div className="flex space-x-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsSearchOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  Search
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Notification Panel */}
      <NotificationPanel
        isOpen={isNotificationPanelOpen}
        onClose={() => setIsNotificationPanelOpen(false)}
      />

      {/* Profile Settings */}
      <ProfileSettings
        isOpen={isProfileSettingsOpen}
        onClose={() => setIsProfileSettingsOpen(false)}
      />
    </div>
  );
};
