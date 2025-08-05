import React, { useState, useCallback, useEffect } from "react";
import { useCommentStore } from "../store/comments";
import { useAuthStore } from "../store/auth";
import { useUserProfileStore } from "../store/userProfile";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  MessageSquare,
  Send,
  Edit,
  Trash2,
  MoreHorizontal,
  User,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Comment } from "../types";

interface CommentsProps {
  cardId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const Comments = React.memo<CommentsProps>(
  ({ cardId, isOpen, onClose }) => {
    const {
      comments,
      loading,
      fetchComments,
      createComment,
      updateComment,
      deleteComment,
      subscribeToComments,
      unsubscribeFromComments,
    } = useCommentStore();
    const { user } = useAuthStore();
    const { getAvatarUrl } = useUserProfileStore();
    const [newComment, setNewComment] = useState("");
    const [editingComment, setEditingComment] = useState<string | null>(null);
    const [editContent, setEditContent] = useState("");

    useEffect(() => {
      if (isOpen && cardId) {
        console.log(
          "🔍 Comments component: Fetching comments for cardId:",
          cardId
        );
        fetchComments(cardId);

        // Subscribe to real-time comment updates
        subscribeToComments(cardId);
      }
    }, [isOpen, cardId, fetchComments, subscribeToComments]);

    // Cleanup subscriptions when component unmounts or cardId changes
    useEffect(() => {
      return () => {
        if (cardId) {
          unsubscribeFromComments();
        }
      };
    }, [cardId, unsubscribeFromComments]);

    // Debug logging for comments state
    useEffect(() => {
      console.log("📋 Comments component: Current comments state:", comments);
      console.log("📋 Comments component: Loading state:", loading);
    }, [comments, loading]);

    const handleSubmitComment = useCallback(
      async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        await createComment(cardId, newComment.trim());
        setNewComment("");
      },
      [cardId, newComment, createComment]
    );

    const handleEditComment = useCallback(
      async (commentId: string, content: string) => {
        await updateComment(commentId, content);
        setEditingComment(null);
        setEditContent("");
      },
      [updateComment]
    );

    const handleDeleteComment = useCallback(
      async (commentId: string) => {
        if (
          window.confirm(
            "Are you sure you want to delete this comment? This action cannot be undone."
          )
        ) {
          await deleteComment(commentId);
        }
      },
      [deleteComment]
    );

    const startEditing = useCallback((comment: Comment) => {
      setEditingComment(comment.id);
      setEditContent(comment.content);
    }, []);

    const cancelEditing = useCallback(() => {
      setEditingComment(null);
      setEditContent("");
    }, []);

    const getUserInitials = (email: string) => {
      return email.substring(0, 2).toUpperCase();
    };

    const getUserDisplayName = (email: string) => {
      const username = email.split("@")[0];
      return username.charAt(0).toUpperCase() + username.slice(1);
    };

    // Debug: Log the current user and comments
    useEffect(() => {
      console.log("👤 Current user in Comments component:", user);
      console.log("📋 Comments in component:", comments);
    }, [user, comments]);

    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Comments ({comments.length})
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-4 min-h-0">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No comments yet</p>
                <p className="text-sm">Be the first to add a comment!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="flex gap-3 p-3 rounded-lg border bg-card"
                  >
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarImage
                        src={getAvatarUrl(
                          comment.user?.email || "",
                          comment.user?.avatar_url
                        )}
                      />
                      <AvatarFallback className="text-xs bg-primary/10 text-primary">
                        {comment.user?.username
                          ? comment.user.username.substring(0, 2).toUpperCase()
                          : comment.user?.email
                          ? comment.user.email.substring(0, 2).toUpperCase()
                          : "U"}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">
                          {comment.user?.username ||
                            comment.user?.full_name ||
                            "Unknown User"}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {formatDistanceToNow(new Date(comment.created_at), {
                            addSuffix: true,
                          })}
                        </Badge>
                      </div>

                      {editingComment === comment.id ? (
                        <div className="space-y-2">
                          <Textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            placeholder="Edit your comment..."
                            className="min-h-[80px]"
                            autoFocus
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() =>
                                handleEditComment(comment.id, editContent)
                              }
                              disabled={!editContent.trim()}
                            >
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={cancelEditing}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm text-foreground leading-relaxed">
                            {comment.content}
                          </p>
                          {user?.id === comment.user_id && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <MoreHorizontal className="h-3 w-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => startEditing(comment)}
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleDeleteComment(comment.id)
                                  }
                                  className="text-destructive"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <form onSubmit={handleSubmitComment} className="pt-4 border-t">
            <div className="flex gap-2">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="min-h-[80px] resize-none"
                disabled={loading}
              />
            </div>
            <div className="flex justify-end mt-2">
              <Button
                type="submit"
                size="sm"
                disabled={!newComment.trim() || loading}
                className="flex items-center gap-2"
              >
                <Send className="h-4 w-4" />
                Comment
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    );
  }
);
