import React, { useState, useMemo, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useBoards } from "../hooks/useBoards";
import { supabase } from "../lib/supabase";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { BoardMembers } from "../components/BoardMembers";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog";
import {
  Plus,
  Search,
  Calendar,
  Clock,
  Users,
  Star,
  ChevronDown,
  Pin,
  Grid3X3,
  List,
  Filter,
  MoreHorizontal,
  Settings,
  Share2,
  Trash2,
  Edit,
  Copy,
  Archive,
  TrendingUp,
  Activity,
  Zap,
  Globe,
  Shield,
  Kanban,
} from "lucide-react";
import { formatDate } from "../lib/utils";

// Enhanced BoardCard Component
const EnhancedBoardCard = ({
  board,
  onToggleStar,
  isShared = false,
}: {
  board: any;
  onToggleStar?: (id: string) => void;
  isShared?: boolean;
}) => {
  return (
    <Card className="group h-full hover:shadow-md transition-all duration-200 border-border/50">
      <Link to={`/board/${board.id}`} className="block">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                  <Kanban className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-base font-semibold line-clamp-1">
                    {board.title}
                  </CardTitle>
                </div>
              </div>
              {board.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                  {board.description}
                </p>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleStar?.(board.id);
              }}
            >
              <Star
                className={`h-3 w-3 ${
                  board.is_starred
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-muted-foreground"
                }`}
              />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="space-y-3">
            {/* Activity and status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>
                  {formatDate(
                    board.last_opened_at || board.updated_at || board.created_at
                  )}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {isShared && (
                  <Badge variant="outline" className="text-xs">
                    <Users className="h-3 w-3 mr-1" />
                    Shared
                  </Badge>
                )}
                {board.is_starred && (
                  <Badge variant="outline" className="text-xs">
                    <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                    Starred
                  </Badge>
                )}
              </div>
            </div>

            {/* Team members */}
            <div className="flex items-center justify-between">
              <BoardMembers
                boardId={board.id}
                maxDisplay={3}
                showCount={false}
                size="sm"
              />
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
};

// List BoardCard Component
const ListBoardCard = ({ board }: { board: any }) => {
  return (
    <Card className="card-interactive hover:shadow-md transition-all duration-200">
      <CardContent className="p-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold line-clamp-1">{board.title}</h3>
                {board.description && (
                  <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                    {board.description}
                  </p>
                )}
              </div>
              <div className="flex items-center space-x-2 ml-4">
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>
                    {formatDate(
                      board.last_opened_at ||
                        board.updated_at ||
                        board.created_at
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const Dashboard = () => {
  const {
    boards,
    createBoard,
    loading,
    error,
    toggleStarBoard,
    subscribeToBoards,
    unsubscribeFromAll,
  } = useBoards();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [newBoardTitle, setNewBoardTitle] = useState("");
  const [newBoardDescription, setNewBoardDescription] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);

  const [sortBy, setSortBy] = useState("last-edited");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setCurrentUser(user);
    };
    getUser();
  }, []);

  // Subscribe to real-time board updates
  useEffect(() => {
    subscribeToBoards();

    // Cleanup subscriptions on unmount
    return () => {
      unsubscribeFromAll();
    };
  }, [subscribeToBoards, unsubscribeFromAll]);

  // Add visual feedback for real-time updates
  useEffect(() => {
    const handleRealTimeUpdate = () => {
      // You can add a toast notification here if needed
      console.log("🔄 Real-time update received");
    };

    // Listen for any real-time updates
    window.addEventListener("realtime-update", handleRealTimeUpdate);

    return () => {
      window.removeEventListener("realtime-update", handleRealTimeUpdate);
    };
  }, []);

  // Handle search parameter from URL
  useEffect(() => {
    const searchFromUrl = searchParams.get("search");
    if (searchFromUrl) {
      setSearchTerm(searchFromUrl);
    }
  }, [searchParams]);

  const filteredBoards = useMemo(() => {
    let filtered = boards.filter((board) =>
      board.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sort boards based on selected option
    switch (sortBy) {
      case "last-edited":
        filtered.sort(
          (a, b) =>
            new Date(
              b.last_opened_at || b.updated_at || b.created_at
            ).getTime() -
            new Date(a.last_opened_at || a.updated_at || a.created_at).getTime()
        );
        break;
      case "name":
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "name-desc":
        filtered.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case "created":
        filtered.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        break;
      case "starred":
        filtered.sort((a, b) => {
          // Starred boards first, then by last opened
          if (a.is_starred && !b.is_starred) return -1;
          if (!a.is_starred && b.is_starred) return 1;
          return (
            new Date(
              b.last_opened_at || b.updated_at || b.created_at
            ).getTime() -
            new Date(a.last_opened_at || a.updated_at || a.created_at).getTime()
          );
        });
        break;
      default:
        break;
    }

    return filtered;
  }, [boards, searchTerm, sortBy]);

  // Separate boards into categories and apply sorting
  const sortBoards = (boardsToSort: any[]) => {
    const sorted = [...boardsToSort];
    switch (sortBy) {
      case "last-edited":
        sorted.sort(
          (a, b) =>
            new Date(
              b.last_opened_at || b.updated_at || b.created_at
            ).getTime() -
            new Date(a.last_opened_at || a.updated_at || a.created_at).getTime()
        );
        break;
      case "name":
        sorted.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "name-desc":
        sorted.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case "created":
        sorted.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        break;
      case "starred":
        sorted.sort((a, b) => {
          // Starred boards first, then by last opened
          if (a.is_starred && !b.is_starred) return -1;
          if (!a.is_starred && b.is_starred) return 1;
          return (
            new Date(
              b.last_opened_at || b.updated_at || b.created_at
            ).getTime() -
            new Date(a.last_opened_at || a.updated_at || a.created_at).getTime()
          );
        });
        break;
      default:
        break;
    }
    return sorted;
  };

  const starredBoards = sortBoards(boards.filter((board) => board.is_starred));
  const ownedBoards = sortBoards(
    boards.filter((board) => board.created_by === currentUser?.id)
  );
  const sharedBoards = sortBoards(
    boards.filter((board) => board.created_by !== currentUser?.id)
  );

  // Enhanced board statistics
  const boardStats = useMemo(() => {
    const total = boards.length;

    const recentBoards = boards.filter((b) => {
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);
      return new Date(b.updated_at || b.created_at) > lastWeek;
    }).length;

    return { total, recentBoards };
  }, [boards]);

  const navigate = useNavigate();

  const handleCreateBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBoardTitle.trim()) return;

    try {
      const newBoard = await createBoard(
        newBoardTitle.trim(),
        newBoardDescription.trim() || ""
      );

      setNewBoardTitle("");
      setNewBoardDescription("");
      setIsCreateModalOpen(false);

      // Redirect to the new board
      if (newBoard && newBoard.id) {
        navigate(`/board/${newBoard.id}`);
      }
    } catch (error) {
      console.error("Error creating board:", error);
    }
  };

  return (
    <div className="p-8">
      {/* Enhanced Title Bar with Stats */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Boards</h1>
            <p className="text-muted-foreground mt-1">
              Manage your projects and collaborate with your team
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="shadow-glow hover:shadow-glow-lg"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Board
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-card rounded-lg p-4 border border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Boards
                </p>
                <p className="text-2xl font-bold">{boardStats.total}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg p-4 border border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Recent Activity
                </p>
                <p className="text-2xl font-bold">{boardStats.recentBoards}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10">
                <Activity className="h-5 w-5 text-orange-500" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Search + Filter Toolbar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search boards..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1 border rounded-md">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="rounded-r-none"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="rounded-l-none"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Sort:</span>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last-edited">Last Opened</SelectItem>
                  <SelectItem value="name">Name (A-Z)</SelectItem>
                  <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                  <SelectItem value="created">Date Created</SelectItem>
                  <SelectItem value="starred">Starred First</SelectItem>
                </SelectContent>
              </Select>
              {sortBy !== "last-edited" && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSortBy("last-edited")}
                  className="h-8 px-2 text-xs"
                >
                  Reset
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Starred Boards Section */}
      {starredBoards.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <Star className="h-5 w-5 text-yellow-500" />
            <h2 className="text-xl font-semibold">Starred Boards</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {starredBoards.map((board) => (
              <EnhancedBoardCard
                key={board.id}
                board={board}
                onToggleStar={toggleStarBoard}
                isShared={board.created_by !== currentUser?.id}
              />
            ))}
          </div>
        </div>
      )}

      {/* My Boards Section */}
      {ownedBoards.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <Grid3X3 className="h-5 w-5 text-green-500" />
            <h2 className="text-xl font-semibold">My Boards</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {ownedBoards.map((board) => (
              <EnhancedBoardCard
                key={board.id}
                board={board}
                onToggleStar={toggleStarBoard}
                isShared={false}
              />
            ))}
          </div>
        </div>
      )}

      {/* Shared With Me Section */}
      {sharedBoards.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <Users className="h-5 w-5 text-blue-500" />
            <h2 className="text-xl font-semibold">Shared With Me</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {sharedBoards.map((board) => (
              <EnhancedBoardCard
                key={board.id}
                board={board}
                onToggleStar={toggleStarBoard}
                isShared={true}
              />
            ))}
          </div>
        </div>
      )}

      {/* Enhanced Boards Display */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <h2 className="text-xl font-semibold">All Boards</h2>
            {sortBy !== "last-edited" && (
              <Badge variant="secondary" className="text-xs">
                Sorted by{" "}
                {sortBy === "last-edited"
                  ? "Last Opened"
                  : sortBy === "name"
                  ? "Name (A-Z)"
                  : sortBy === "name-desc"
                  ? "Name (Z-A)"
                  : sortBy === "created"
                  ? "Date Created"
                  : sortBy === "starred"
                  ? "Starred First"
                  : "Custom"}
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <span>{filteredBoards.length} boards</span>
            {filteredBoards.length !== boards.length && (
              <span>• {boards.length - filteredBoards.length} hidden</span>
            )}
          </div>
        </div>

        {filteredBoards.length > 0 ? (
          viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredBoards.map((board) => (
                <EnhancedBoardCard
                  key={board.id}
                  board={board}
                  onToggleStar={toggleStarBoard}
                  isShared={board.created_by !== currentUser?.id}
                />
              ))}
              {/* New Board Card */}
              <Card className="h-full border-dashed border-2 border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors">
                <CardContent className="flex flex-col items-center justify-center h-full p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
                    <Plus className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-medium text-center mb-2">New Board</h3>
                  <p className="text-sm text-muted-foreground text-center">
                    Create a new board to get started
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsCreateModalOpen(true)}
                    className="mt-4"
                  >
                    Create Board
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredBoards.map((board) => (
                <ListBoardCard key={board.id} board={board} />
              ))}
            </div>
          )
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-primary-20">
                <Calendar className="h-12 w-12 text-primary" />
              </div>
            </div>
            <h3 className="empty-state-title">No boards found</h3>
            <p className="empty-state-description">
              {searchTerm
                ? "Try adjusting your search terms or filters"
                : "Create your first board to get started with project management"}
            </p>
            {!searchTerm && (
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                className="shadow-glow hover:shadow-glow-lg"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create your first board
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Enhanced Create Board Dialog */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Board</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Start organizing your projects with a new board
            </p>
          </DialogHeader>
          <form onSubmit={handleCreateBoard} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Board Title</label>
              <Input
                value={newBoardTitle}
                onChange={(e) => setNewBoardTitle(e.target.value)}
                placeholder="Enter board title"
                required
                autoFocus
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

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="shadow-glow hover:shadow-glow-lg"
              >
                Create Board
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
