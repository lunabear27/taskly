import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useBoardMemberStore } from "../store/boardMembers";
import { useUserProfileStore } from "../store/userProfile";
import { useBoards } from "../hooks/useBoards";
import { useAuth } from "../hooks/useAuth";

interface BoardMembersProps {
  boardId: string;
  maxDisplay?: number;
  showCount?: boolean;
  size?: "sm" | "md" | "lg";
}

export const BoardMembers: React.FC<BoardMembersProps> = ({
  boardId,
  maxDisplay = 3,
  showCount = true,
  size = "sm",
}) => {
  const { getBoardMembers, getBoardMembersWithCreator, loading } =
    useBoardMemberStore();
  const { getAvatarUrl } = useUserProfileStore();
  const { boards } = useBoards();
  const { user } = useAuth();
  const [boardMembers, setBoardMembers] = useState<any[]>([]);

  // Get the current board to access creator info
  const currentBoard = boards.find((board) => board.id === boardId);

  useEffect(() => {
    // Get members for this specific board from the store, prioritizing the creator
    const members = currentBoard
      ? getBoardMembersWithCreator(boardId, currentBoard.created_by)
      : getBoardMembers(boardId);

    setBoardMembers(members);
  }, [
    boardId,
    getBoardMembers,
    getBoardMembersWithCreator,
    user,
    currentBoard,
    loading, // Add loading as dependency to update when data is loaded
  ]);

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "h-6 w-6 text-xs";
      case "md":
        return "h-8 w-8 text-sm";
      case "lg":
        return "h-10 w-10 text-base";
      default:
        return "h-6 w-6 text-xs";
    }
  };

  const getSpacingClasses = () => {
    switch (size) {
      case "sm":
        return "-space-x-1";
      case "md":
        return "-space-x-2";
      case "lg":
        return "-space-x-3";
      default:
        return "-space-x-1";
    }
  };

  const getInitials = (email: string) => {
    if (!email) return "U";
    const username = email.split("@")[0];
    return username.substring(0, 2).toUpperCase();
  };

  const getDisplayMembers = () => {
    return boardMembers.slice(0, maxDisplay);
  };

  const getHiddenCount = () => {
    return Math.max(0, boardMembers.length - maxDisplay);
  };

  // Show loading state
  if (loading && boardMembers.length === 0) {
    return (
      <div className="flex items-center space-x-2">
        <div className={`flex ${getSpacingClasses()}`}>
          <div
            className={`${getSizeClasses()} rounded-full bg-muted animate-pulse`}
          />
        </div>
        {process.env.NODE_ENV === "development" && (
          <span className="text-xs text-muted-foreground">
            Loading members...
          </span>
        )}
      </div>
    );
  }

  // If no members found, show the board creator as a fallback
  if (boardMembers.length === 0 && currentBoard) {
    // Use current user's email if they are the creator, otherwise show a placeholder
    const creatorEmail =
      currentBoard.created_by === user?.id ? user.email : "creator@example.com";

    return (
      <div className="flex items-center space-x-2">
        <div className={`flex ${getSpacingClasses()}`}>
          <Avatar className={`${getSizeClasses()} border-2 border-background`}>
            <AvatarImage src={getAvatarUrl(creatorEmail, undefined)} />
            <AvatarFallback className="bg-primary/10 text-primary font-medium">
              {getInitials(creatorEmail)}
            </AvatarFallback>
          </Avatar>
        </div>
        {showCount && (
          <span className="text-xs text-muted-foreground">1 member</span>
        )}
      </div>
    );
  }

  // Show nothing if no members and no board info
  if (boardMembers.length === 0) {
    return null;
  }

  const displayMembers = getDisplayMembers();
  const hiddenCount = getHiddenCount();

  return (
    <div className="flex items-center space-x-2">
      <div className={`flex ${getSpacingClasses()}`}>
        {displayMembers.map((member, index) => {
          const email = member.user?.email || member.user_email || "";
          const avatarUrl = getAvatarUrl(email, member.user?.avatar_url);

          return (
            <Avatar
              key={member.id}
              className={`${getSizeClasses()} border-2 border-background`}
              style={{ zIndex: displayMembers.length - index }}
            >
              <AvatarImage src={avatarUrl} />
              <AvatarFallback className="bg-primary/10 text-primary font-medium">
                {getInitials(email)}
              </AvatarFallback>
            </Avatar>
          );
        })}
        {hiddenCount > 0 && (
          <div
            className={`${getSizeClasses()} rounded-full bg-secondary/10 flex items-center justify-center text-secondary-foreground font-medium border-2 border-background`}
            style={{ zIndex: 0 }}
          >
            +{hiddenCount}
          </div>
        )}
      </div>
      {showCount && boardMembers.length > 0 && (
        <span className="text-xs text-muted-foreground">
          {boardMembers.length} member{boardMembers.length !== 1 ? "s" : ""}
        </span>
      )}
    </div>
  );
};
