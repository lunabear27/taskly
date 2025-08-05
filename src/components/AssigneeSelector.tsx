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
import { User, Search, X } from "lucide-react";
import { useAssigneeStore } from "../store/assignees";
import { useUserProfileStore } from "../store/userProfile";

interface AssigneeSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  cardId: string;
  boardId: string;
}

export const AssigneeSelector = ({
  isOpen,
  onClose,
  cardId,
  boardId,
}: AssigneeSelectorProps) => {
  const { getBoardMembers, assignUser } = useAssigneeStore();
  const { getAvatarUrl } = useUserProfileStore();
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (isOpen) {
      loadBoardMembers();
    }
  }, [isOpen, boardId]);

  const loadBoardMembers = async () => {
    setLoading(true);
    try {
      const boardMembers = await getBoardMembers(boardId);
      setMembers(boardMembers);
    } catch (error) {
      console.error("Error loading board members:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignUser = async (userId: string) => {
    try {
      await assignUser(cardId, userId);
      onClose();
    } catch (error) {
      console.error("Error assigning user:", error);
    }
  };

  const filteredMembers = members.filter(
    (member) =>
      member.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.user?.full_name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      member.user?.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getUserDisplayName = (email: string) => {
    const username = email.split("@")[0];
    return username.charAt(0).toUpperCase() + username.slice(1);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Member</DialogTitle>
          <DialogDescription>
            Select a board member to assign to this card.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Members List */}
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {loading ? (
              <div className="text-center py-4">
                <div className="text-sm text-muted-foreground">
                  Loading members...
                </div>
              </div>
            ) : filteredMembers.length === 0 ? (
              <div className="text-center py-4">
                <div className="text-sm text-muted-foreground">
                  {searchTerm ? "No members found" : "No board members"}
                </div>
              </div>
            ) : (
              filteredMembers.map((member) => (
                <div
                  key={member.user_id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent cursor-pointer transition-colors"
                  onClick={() => handleAssignUser(member.user_id)}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={getAvatarUrl(
                          member.user?.email || "",
                          member.user?.avatar_url
                        )}
                      />
                      <AvatarFallback className="text-xs bg-primary/10 text-primary">
                        {member.user?.full_name
                          ? member.user.full_name.charAt(0).toUpperCase()
                          : member.user?.username
                          ? member.user.username.charAt(0).toUpperCase()
                          : member.user?.email
                          ? member.user.email.charAt(0).toUpperCase()
                          : "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-sm font-medium">
                        {member.user?.full_name ||
                          member.user?.username ||
                          (member.user?.email
                            ? getUserDisplayName(member.user.email)
                            : member.user_id
                            ? `User ${member.user_id.substring(0, 8)}`
                            : "Unknown User")}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {member.user?.email ||
                          (member.user_id
                            ? `User ${member.user_id.substring(0, 8)}`
                            : "Unknown User")}
                      </div>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {member.role}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
