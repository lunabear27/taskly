import { useAuth } from "./useAuth";
import { useBoardMemberStore } from "../store/boardMembers";
import { useBoardStore } from "../store/boards";

export interface BoardPermissions {
  getUserRole: () => "owner" | "admin" | "member" | "none";
  isOwner: () => boolean;
  isAdmin: () => boolean;
  isMember: () => boolean;
  isOwnerOrAdmin: () => boolean;
  canManageMembers: boolean;
  canDeleteBoard: boolean;
  canUpdateBoardSettings: boolean;
  canTransferOwnership: boolean;
  canSendInvitations: boolean;
  canCancelInvitations: boolean;
  canInviteAsOwner: boolean;
}

export const useBoardPermissions = (boardId: string): BoardPermissions => {
  const { user } = useAuth();
  const { membersByBoard, getBoardMembers } = useBoardMemberStore();
  const { boards } = useBoardStore();

  const getUserRole = (): "owner" | "admin" | "member" | "none" => {
    if (!user) return "none";

    // First check if user is the board creator
    const board = boards.find((b) => b.id === boardId);
    if (board && board.created_by === user.id) {
      return "owner";
    }

    // Then check board_members table
    const members = getBoardMembers(boardId);
    const member = members.find((bm) => bm.user_id === user.id);

    return member?.role || "none";
  };

  const isOwner = () => getUserRole() === "owner";
  const isAdmin = () => getUserRole() === "admin";
  const isMember = () => getUserRole() === "member";
  const isOwnerOrAdmin = () => isOwner() || isAdmin();

  return {
    getUserRole,
    isOwner,
    isAdmin,
    isMember,
    isOwnerOrAdmin,
    canManageMembers: isOwnerOrAdmin(),
    canDeleteBoard: isOwner(),
    canUpdateBoardSettings: isOwner(),
    canTransferOwnership: isOwner(),
    canSendInvitations: isOwnerOrAdmin(),
    canCancelInvitations: isOwnerOrAdmin(),
    canInviteAsOwner: isOwner(),
  };
};
