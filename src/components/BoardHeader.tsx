import React, { useState } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Settings, Users, Trash2, Crown, Shield, User } from "lucide-react";
import { useBoardPermissions } from "../hooks/useBoardPermissions";
import { BoardMemberManager } from "./BoardMemberManager";
import { BoardSettingsModal } from "./BoardSettingsModal";
import { toast } from "sonner";

interface BoardHeaderProps {
  board: any;
  user?: any;
  onManageTags?: () => void;
  onUpdateBoard?: (id: string, updates: any) => Promise<void>;
  onDeleteBoard?: (id: string) => Promise<void>;
}

export const BoardHeader: React.FC<BoardHeaderProps> = ({
  board,
  user: propUser,
  onManageTags,
  onUpdateBoard,
  onDeleteBoard,
}) => {
  const [isMemberManagerOpen, setIsMemberManagerOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const permissions = useBoardPermissions(board.id);

  const handleDeleteBoard = async () => {
    if (!permissions.canDeleteBoard) {
      toast.error("Only board owners can delete boards");
      return;
    }

    if (
      confirm(
        "Are you sure you want to delete this board? This action cannot be undone."
      )
    ) {
      try {
        await onDeleteBoard?.(board.id);
        toast.success("Board deleted successfully");
      } catch (error) {
        toast.error("Failed to delete board");
      }
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "owner":
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case "admin":
        return <Shield className="h-4 w-4 text-blue-500" />;
      case "member":
        return <User className="h-4 w-4 text-gray-500" />;
      default:
        return <User className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "owner":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            Owner
          </Badge>
        );
      case "admin":
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            Admin
          </Badge>
        );
      case "member":
        return (
          <Badge variant="secondary" className="bg-gray-100 text-gray-800">
            Member
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex items-center justify-between p-4 border-b bg-background">
      <div className="flex items-center space-x-4">
        <div>
          <h1 className="text-2xl font-bold">{board.title}</h1>
          {board.description && (
            <p className="text-sm text-muted-foreground">{board.description}</p>
          )}
        </div>

        {/* Role Badge */}
        {getRoleBadge(permissions.getUserRole())}
      </div>

      <div className="flex items-center space-x-2">
        {/* Member Management - Only owners/admins */}
        {permissions.canManageMembers && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsMemberManagerOpen(true)}
          >
            <Users className="h-4 w-4 mr-2" />
            Manage Members
          </Button>
        )}

        {/* Board Settings - Only owners */}
        {permissions.canUpdateBoardSettings && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsSettingsOpen(true)}
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        )}

        {/* Delete Board - Only owners */}
        {permissions.canDeleteBoard && (
          <Button variant="destructive" size="sm" onClick={handleDeleteBoard}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        )}
      </div>

      {/* Member Manager Modal */}
      {isMemberManagerOpen && (
        <BoardMemberManager
          isOpen={isMemberManagerOpen}
          onClose={() => setIsMemberManagerOpen(false)}
          boardId={board.id}
        />
      )}

      {/* Settings Modal */}
      {isSettingsOpen && (
        <BoardSettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          board={board}
          onUpdateBoard={onUpdateBoard}
        />
      )}
    </div>
  );
};
