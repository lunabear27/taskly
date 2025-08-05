import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  User,
  Plus,
  X,
  Crown,
  Shield,
  User as UserIcon,
  Mail,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useBoardMemberStore } from "../store/boardMembers";
import { useInvitationStore } from "../store/invitations";
import { useUserProfileStore } from "../store/userProfile";
import { useBoards } from "../hooks/useBoards";
import { useBoardPermissions } from "../hooks/useBoardPermissions";
import { toast } from "sonner";

interface BoardMemberManagerProps {
  isOpen: boolean;
  onClose: () => void;
  boardId: string;
}

export const BoardMemberManager = ({
  isOpen,
  onClose,
  boardId,
}: BoardMemberManagerProps) => {
  const {
    membersByBoard,
    loading: membersLoading,
    error: membersError,
    fetchBoardMembers,
    removeBoardMember,
    updateMemberRole,
    getBoardMembers,
  } = useBoardMemberStore();

  // Get members for this specific board
  const members = getBoardMembers(boardId);

  const {
    invitations,
    loading: invitationsLoading,
    error: invitationsError,
    fetchInvitations,
    createInvitation,
    deleteInvitation,
    resendInvitation,
  } = useInvitationStore();

  const { getAvatarUrl } = useUserProfileStore();

  const { boards } = useBoards();
  const permissions = useBoardPermissions(boardId);

  // Get the current board name
  const currentBoard = boards.find((board) => board.id === boardId);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberRole, setNewMemberRole] = useState<"admin" | "member">(
    "member"
  );
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchBoardMembers(boardId);
      fetchInvitations();
      setSuccessMessage("");
    }
  }, [isOpen, boardId, fetchBoardMembers, fetchInvitations]);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMemberEmail.trim()) {
      alert("Please enter an email address");
      return;
    }

    setIsAddingMember(true);
    try {
      const result = await createInvitation(
        boardId,
        newMemberEmail.trim(),
        newMemberRole
      );
      setNewMemberEmail("");
      setNewMemberRole("member");

      if (result) {
        setSuccessMessage("Invitation sent successfully!");
      }
    } catch (error) {
      console.error("Error adding member:", error);
    } finally {
      setIsAddingMember(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    const member = members.find((m) => m.user_id === userId);

    // Prevent removing owners
    if (member?.role === "owner") {
      toast.error("Cannot remove board owner");
      return;
    }

    // Only owners can remove admins
    if (member?.role === "admin" && !permissions.isOwner()) {
      toast.error("Only owners can remove admins");
      return;
    }

    if (window.confirm("Are you sure you want to remove this member?")) {
      await removeBoardMember(boardId, userId);
    }
  };

  const handleUpdateRole = async (
    userId: string,
    role: "owner" | "admin" | "member"
  ) => {
    // Prevent promoting to owner unless current user is owner
    if (role === "owner" && !permissions.isOwner()) {
      toast.error("Only owners can promote to owner");
      return;
    }

    await updateMemberRole(boardId, userId, role);
  };

  const handleAddOwner = async () => {
    setIsAddingMember(true);
    try {
      await createInvitation(boardId, "", "admin");
    } catch (error) {
      console.error("Error adding owner:", error);
    } finally {
      setIsAddingMember(false);
    }
  };

  const handleResendInvitation = async (invitationId: string) => {
    try {
      await resendInvitation(invitationId);
      setSuccessMessage("Invitation resent successfully!");
    } catch (error) {
      console.error("Error resending invitation:", error);
    }
  };

  const handleDeleteInvitation = async (invitationId: string) => {
    if (window.confirm("Are you sure you want to cancel this invitation?")) {
      await deleteInvitation(invitationId);
    }
  };

  const getUserDisplayName = (member: any) => {
    // Use username if available, otherwise extract from email
    if (member.user?.username) {
      return (
        member.user.username.charAt(0).toUpperCase() +
        member.user.username.slice(1)
      );
    }
    if (member.user?.email) {
      const username = member.user.email.split("@")[0];
      return username.charAt(0).toUpperCase() + username.slice(1);
    }
    return `User ${member.user_id.substring(0, 8)}`;
  };

  const getUserInitials = (member: any) => {
    if (member.user?.username) {
      return member.user.username.substring(0, 2).toUpperCase();
    }
    if (member.user?.email) {
      return member.user.email.substring(0, 2).toUpperCase();
    }
    return "U";
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "owner":
        return <Crown className="h-3 w-3" />;
      case "admin":
        return <Shield className="h-3 w-3" />;
      default:
        return <UserIcon className="h-3 w-3" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "owner":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "admin":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-3 w-3 text-orange-500" />;
      case "accepted":
        return <CheckCircle className="h-3 w-3 text-green-500" />;
      case "rejected":
        return <XCircle className="h-3 w-3 text-red-500" />;
      default:
        return <Clock className="h-3 w-3 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "accepted":
        return "bg-green-100 text-green-800 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Filter invitations for this board
  const boardInvitations = invitations.filter(
    (inv) => inv.board_id === boardId
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Manage Board Members
            {currentBoard && (
              <span className="text-sm font-normal text-muted-foreground block mt-1">
                Board: {currentBoard.title}
              </span>
            )}
          </DialogTitle>
          <DialogDescription>
            Add or remove members from this board and manage their roles.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Owner Info */}
          {members.find((m) => m.role === "owner") ? (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                <Crown className="h-4 w-4 text-amber-600" />
                <span className="font-medium text-amber-800">Board Owner</span>
              </div>
              <p className="text-xs text-amber-700 mt-1">
                The owner has full control over this board and cannot be
                removed.
              </p>
            </div>
          ) : (
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                <Crown className="h-4 w-4 text-orange-600" />
                <span className="font-medium text-orange-800">No Owner</span>
              </div>
              <p className="text-xs text-orange-700 mt-1">
                This board has no owner. Add yourself as owner to get full
                control.
              </p>
              <Button
                size="sm"
                onClick={handleAddOwner}
                disabled={isAddingMember}
                className="mt-3"
              >
                <Crown className="h-3 w-3 mr-1" />
                Add Yourself as Owner
              </Button>
            </div>
          )}

          {/* Add New Member */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Send Invitation</h3>
            <form onSubmit={handleAddMember} className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Enter the email address of the person you want to invite to this
                board.
              </div>

              <div className="space-y-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="Enter email address..."
                      value={newMemberEmail}
                      onChange={(e) => setNewMemberEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Role</label>
                  <Select
                    value={newMemberRole}
                    onValueChange={(value: "admin" | "member") =>
                      setNewMemberRole(value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="member">
                        <div className="flex items-center gap-2">
                          <UserIcon className="h-3 w-3" />
                          <span>Member</span>
                          <span className="text-xs text-muted-foreground">
                            - Can view and edit cards
                          </span>
                        </div>
                      </SelectItem>
                      <SelectItem value="admin">
                        <div className="flex items-center gap-2">
                          <Shield className="h-3 w-3" />
                          <span>Admin</span>
                          <span className="text-xs text-muted-foreground">
                            - Can manage members and board settings
                          </span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                type="submit"
                size="sm"
                disabled={isAddingMember || !newMemberEmail.trim()}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-1" />
                {isAddingMember ? "Sending Invitation..." : "Send Invitation"}
              </Button>
            </form>
          </div>

          {/* Error Display */}
          {(membersError || invitationsError) && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive">
                {membersError || invitationsError}
              </p>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-700">{successMessage}</p>
            </div>
          )}

          {/* Pending Invitations */}
          {boardInvitations.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Pending Invitations</h3>
              <div className="space-y-3 max-h-40 overflow-y-auto">
                {boardInvitations.map((invitation) => (
                  <div
                    key={invitation.id}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Avatar className="h-10 w-10 flex-shrink-0">
                        <AvatarFallback className="text-xs bg-primary/10 text-primary">
                          {invitation.invited_email
                            .substring(0, 2)
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">
                          {getUserDisplayName(invitation.invited_email)}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {invitation.invited_email}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Invited as {invitation.role}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <Badge
                        variant="secondary"
                        className={`text-xs ${getStatusColor(
                          invitation.status
                        )}`}
                      >
                        {getStatusIcon(invitation.status)}
                        <span className="ml-1">{invitation.status}</span>
                      </Badge>
                      {invitation.status === "pending" && (
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              handleResendInvitation(invitation.id)
                            }
                            className="h-8 w-8 p-0"
                            title="Resend invitation"
                          >
                            <Mail className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              handleDeleteInvitation(invitation.id)
                            }
                            className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                            title="Cancel invitation"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Members List */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Current Members</h3>
            {membersLoading ? (
              <div className="text-center py-4">
                <div className="text-sm text-muted-foreground">
                  Loading members...
                </div>
              </div>
            ) : members.length === 0 ? (
              <div className="text-center py-4">
                <div className="text-sm text-muted-foreground">
                  No members yet
                </div>
              </div>
            ) : (
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Avatar className="h-10 w-10 flex-shrink-0">
                        <AvatarImage
                          src={getAvatarUrl(
                            member.user?.email || "",
                            member.user?.avatar_url
                          )}
                        />
                        <AvatarFallback className="text-xs bg-primary/10 text-primary">
                          {getUserInitials(member)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">
                          {getUserDisplayName(member)}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {member.user?.email ||
                            `User ${member.user_id.substring(0, 8)}`}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {member.role === "owner" ? (
                        <Badge
                          variant="secondary"
                          className={`text-xs ${getRoleColor(member.role)}`}
                        >
                          {getRoleIcon(member.role)}
                          <span className="ml-1">Owner</span>
                        </Badge>
                      ) : (
                        <>
                          <Select
                            value={member.role}
                            onValueChange={(
                              value: "owner" | "admin" | "member"
                            ) => handleUpdateRole(member.user_id, value)}
                          >
                            <SelectTrigger className="h-8 px-3">
                              <div className="flex items-center gap-2">
                                {getRoleIcon(member.role)}
                                <span className="text-xs capitalize">
                                  {member.role}
                                </span>
                              </div>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="member">
                                <div className="flex items-center gap-2">
                                  <UserIcon className="h-3 w-3" />
                                  <span>Member</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="admin">
                                <div className="flex items-center gap-2">
                                  <Shield className="h-3 w-3" />
                                  <span>Admin</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="owner">
                                <div className="flex items-center gap-2">
                                  <Crown className="h-3 w-3" />
                                  <span>Owner</span>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRemoveMember(member.user_id)}
                            className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                            title="Remove member"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
