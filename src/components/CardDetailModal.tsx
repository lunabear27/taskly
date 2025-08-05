import React, { useState, useCallback, useEffect } from "react";
import { useTagStore } from "../store/tags";
import { useCommentStore } from "../store/comments";
import { useAssigneeStore } from "../store/assignees";
import { useUserProfileStore } from "../store/userProfile";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Separator } from "./ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import {
  Calendar,
  Clock,
  Tag,
  Plus,
  X,
  Edit,
  Trash2,
  MessageSquare,
  CheckSquare,
  Square,
  Archive,
  Copy,
  Users,
  FileText,
  Check,
  Hash,
  CalendarDays,
  UserPlus,
  Settings,
  Share2,
  Eye,
  MoreHorizontal,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Card as CardType } from "../types";
import { AssigneeSelector } from "./AssigneeSelector";

interface CardDetailModalProps {
  card: CardType;
  boardId: string;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<CardType>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const TAG_COLORS = [
  { name: "Red", value: "#ef4444", emoji: "🔴" },
  { name: "Orange", value: "#f97316", emoji: "🟠" },
  { name: "Yellow", value: "#eab308", emoji: "🟡" },
  { name: "Green", value: "#22c55e", emoji: "🟢" },
  { name: "Blue", value: "#3b82f6", emoji: "🔵" },
  { name: "Purple", value: "#8b5cf6", emoji: "🟣" },
  { name: "Pink", value: "#ec4899", emoji: "🩷" },
  { name: "Gray", value: "#6b7280", emoji: "⚫" },
];

export const CardDetailModal = React.memo<CardDetailModalProps>(
  ({ card, boardId, isOpen, onClose, onUpdate, onDelete }) => {
    const { tags, fetchTags, createTag } = useTagStore();
    const {
      comments,
      loading: commentsLoading,
      fetchComments,
      createComment,
    } = useCommentStore();
    const {
      assignees,
      loading: assigneesLoading,
      fetchAssignees,
      unassignUser,
    } = useAssigneeStore();
    const { getAvatarUrl } = useUserProfileStore();

    // State for different sections
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [editTitle, setEditTitle] = useState(card.title);
    const [isEditingDescription, setIsEditingDescription] = useState(false);
    const [editDescription, setEditDescription] = useState(
      card.description || ""
    );
    const [isAddingChecklist, setIsAddingChecklist] = useState(false);
    const [newChecklistItem, setNewChecklistItem] = useState("");
    const [newComment, setNewComment] = useState("");
    const [isEditingDueDate, setIsEditingDueDate] = useState(false);
    const [editDueDate, setEditDueDate] = useState(card.due_date || "");
    const [isTagPickerOpen, setIsTagPickerOpen] = useState(false);
    const [newTagName, setNewTagName] = useState("");
    const [newTagColor, setNewTagColor] = useState(TAG_COLORS[0].value);
    const [isAssigneeSelectorOpen, setIsAssigneeSelectorOpen] = useState(false);

    // Mock data for demonstration
    const [checklist, setChecklist] = useState(card.checklist || []);

    useEffect(() => {
      if (isOpen) {
        fetchTags(boardId);
        fetchComments(card.id);
        fetchAssignees(card.id);
        setChecklist(card.checklist || []);
      }
    }, [
      isOpen,
      boardId,
      card.id,
      fetchTags,
      fetchComments,
      fetchAssignees,
      card.checklist,
    ]);

    const handleSaveTitle = useCallback(async () => {
      if (editTitle.trim() && editTitle !== card.title) {
        await onUpdate(card.id, { title: editTitle.trim() });
      }
      setIsEditingTitle(false);
    }, [editTitle, card.title, card.id, onUpdate]);

    const handleSaveDescription = useCallback(async () => {
      await onUpdate(card.id, {
        description: editDescription.trim() || undefined,
      });
      setIsEditingDescription(false);
    }, [editDescription, card.id, onUpdate]);

    const handleSaveDueDate = useCallback(async () => {
      await onUpdate(card.id, {
        due_date: editDueDate || undefined,
      });
      setIsEditingDueDate(false);
    }, [editDueDate, card.id, onUpdate]);

    const handleCreateTag = useCallback(async () => {
      if (newTagName.trim()) {
        try {
          const tag = await createTag(boardId, newTagName.trim(), newTagColor);
          if (tag) {
            const currentTags = card.tags || [];
            await onUpdate(card.id, { tags: [...currentTags, tag.id] });
            setNewTagName("");
            setNewTagColor(TAG_COLORS[0].value);
            setIsTagPickerOpen(false);
          }
        } catch (error) {
          console.error("Error creating tag:", error);
        }
      }
    }, [
      boardId,
      newTagName,
      newTagColor,
      createTag,
      card.id,
      onUpdate,
      card.tags,
    ]);

    const handleAssignTag = useCallback(
      async (tagId: string) => {
        try {
          const currentTags = card.tags || [];
          if (!currentTags.includes(tagId)) {
            await onUpdate(card.id, { tags: [...currentTags, tagId] });
          }
        } catch (error) {
          console.error("Error assigning tag:", error);
        }
      },
      [card.id, onUpdate, card.tags]
    );

    const handleRemoveTag = useCallback(
      async (tagId: string) => {
        try {
          const currentTags = card.tags || [];
          const updatedTags = currentTags.filter((id) => id !== tagId);
          await onUpdate(card.id, { tags: updatedTags });
        } catch (error) {
          console.error("Error removing tag:", error);
        }
      },
      [card.id, onUpdate, card.tags]
    );

    const handleAddChecklistItem = useCallback(async () => {
      if (newChecklistItem.trim()) {
        const newItem = {
          id: Date.now().toString(),
          text: newChecklistItem.trim(),
          completed: false,
        };
        const updatedChecklist = [...checklist, newItem];
        setChecklist(updatedChecklist);
        await onUpdate(card.id, { checklist: updatedChecklist });
        setNewChecklistItem("");
        setIsAddingChecklist(false);
      }
    }, [newChecklistItem, checklist, card.id, onUpdate]);

    const handleToggleChecklistItem = useCallback(
      async (itemId: string) => {
        const updatedChecklist = checklist.map((item) =>
          item.id === itemId ? { ...item, completed: !item.completed } : item
        );
        setChecklist(updatedChecklist);
        await onUpdate(card.id, { checklist: updatedChecklist });
      },
      [checklist, card.id, onUpdate]
    );

    const handleRemoveChecklistItem = useCallback(
      async (itemId: string) => {
        const updatedChecklist = checklist.filter((item) => item.id !== itemId);
        setChecklist(updatedChecklist);
        await onUpdate(card.id, { checklist: updatedChecklist });
      },
      [checklist, card.id, onUpdate]
    );

    const handleSubmitComment = useCallback(
      async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        await createComment(card.id, newComment.trim());
        setNewComment("");
      },
      [card.id, newComment, createComment]
    );

    const handleDelete = useCallback(async () => {
      if (
        window.confirm(
          "Are you sure you want to delete this card? This action cannot be undone."
        )
      ) {
        await onDelete(card.id);
        onClose();
      }
    }, [card.id, onDelete, onClose]);

    const getCurrentTagObjects = useCallback(() => {
      return tags.filter((tag) => (card.tags || []).includes(tag.id));
    }, [tags, card.tags]);

    const getAvailableTags = useCallback(() => {
      return tags.filter((tag) => !(card.tags || []).includes(tag.id));
    }, [tags, card.tags]);

    const formatDate = (date: string) => new Date(date).toLocaleDateString();

    const getUserDisplayName = (email: string) => {
      const username = email.split("@")[0];
      return username.charAt(0).toUpperCase() + username.slice(1);
    };

    const completedChecklistItems = checklist.filter(
      (item) => item.completed
    ).length;
    const totalChecklistItems = checklist.length;

    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto p-0">
          {/* Enhanced Header */}
          <div className="flex items-center justify-between p-6 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-xl font-semibold tracking-tight">
                  Card Details
                </DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground">
                  Manage your card information, tasks, and collaboration
                </DialogDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                className="h-9 w-9 p-0"
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: card.title,
                      text:
                        card.description ||
                        `Check out this card: ${card.title}`,
                      url: window.location.href,
                    });
                  } else {
                    // Fallback: copy to clipboard
                    navigator.clipboard.writeText(
                      `${card.title}\n${card.description || ""}\n${
                        window.location.href
                      }`
                    );
                    // You could add a toast notification here
                  }
                }}
                title="Share card"
              >
                <Share2 className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-9 w-9 p-0"
                onClick={() => {
                  // Toggle view mode or open in new tab
                  window.open(`/card/${card.id}`, "_blank");
                }}
                title="View in new tab"
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-9 w-9 p-0"
                onClick={() => {
                  // Show more options menu
                  // This could open a dropdown with additional actions
                  const actions = [
                    {
                      label: "Copy link",
                      action: () =>
                        navigator.clipboard.writeText(window.location.href),
                    },
                    {
                      label: "Export as PDF",
                      action: () => console.log("Export as PDF"),
                    },
                    { label: "Print", action: () => window.print() },
                    {
                      label: "Duplicate card",
                      action: () => console.log("Duplicate card"),
                    },
                  ];
                  // For now, just show the first action
                  actions[0].action();
                }}
                title="More options"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
              {/* Main Content - Left Column */}
              <div className="lg:col-span-2 p-6 space-y-6">
                {/* Enhanced Card Title Section */}
                <Card className="border-0 shadow-none bg-transparent">
                  <CardHeader className="px-0 pt-0 pb-3">
                    <div className="flex items-center gap-2">
                      <Hash className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-muted-foreground">
                        Title
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="px-0 pb-0">
                    {isEditingTitle ? (
                      <div className="space-y-3">
                        <Input
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleSaveTitle();
                            }
                            if (e.key === "Escape") {
                              e.preventDefault();
                              setIsEditingTitle(false);
                            }
                          }}
                          className="text-xl font-semibold border-0 bg-transparent p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                          autoFocus
                          spellCheck={false}
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={handleSaveTitle}>
                            <Check className="h-4 w-4 mr-1" />
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setIsEditingTitle(false)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="group">
                        <h1 className="text-2xl font-semibold text-foreground leading-tight">
                          {card.title}
                        </h1>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="opacity-0 group-hover:opacity-100 transition-opacity mt-2 h-8 px-2"
                          onClick={() => setIsEditingTitle(true)}
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Enhanced Description Section */}
                <Card className="border shadow-sm">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-muted-foreground">
                        Description
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {isEditingDescription ? (
                      <div className="space-y-3">
                        <Textarea
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          placeholder="Add a detailed description..."
                          className="min-h-[120px] resize-none"
                          onKeyDown={(e) => {
                            e.stopPropagation();
                          }}
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={handleSaveDescription}>
                            <Check className="h-4 w-4 mr-1" />
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setIsEditingDescription(false)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="min-h-[80px]">
                          {card.description ? (
                            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                              {card.description}
                            </p>
                          ) : (
                            <p className="text-sm text-muted-foreground italic">
                              No description added
                            </p>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setIsEditingDescription(true)}
                          className="h-8"
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          {card.description
                            ? "Edit Description"
                            : "Add Description"}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Enhanced Checklist Section */}
                <Card className="border shadow-sm">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckSquare className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-muted-foreground">
                          Checklist
                        </span>
                      </div>
                      {totalChecklistItems > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {completedChecklistItems}/{totalChecklistItems}{" "}
                          completed
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {checklist.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors group"
                        >
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                            onClick={() => handleToggleChecklistItem(item.id)}
                          >
                            {item.completed ? (
                              <CheckSquare className="h-4 w-4 text-primary" />
                            ) : (
                              <Square className="h-4 w-4" />
                            )}
                          </Button>
                          <span
                            className={`flex-1 text-sm transition-all ${
                              item.completed
                                ? "line-through text-muted-foreground"
                                : "text-foreground"
                            }`}
                          >
                            {item.text}
                          </span>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleRemoveChecklistItem(item.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}

                      {isAddingChecklist ? (
                        <div className="space-y-3">
                          <div className="flex gap-2">
                            <Input
                              value={newChecklistItem}
                              onChange={(e) =>
                                setNewChecklistItem(e.target.value)
                              }
                              placeholder="Add checklist item..."
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  handleAddChecklistItem();
                                }
                                if (e.key === "Escape") {
                                  e.preventDefault();
                                  setIsAddingChecklist(false);
                                }
                              }}
                              autoFocus
                            />
                            <Button size="sm" onClick={handleAddChecklistItem}>
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setIsAddingChecklist(false)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setIsAddingChecklist(true)}
                          className="w-full h-9"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Checklist Item
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Enhanced Comments Section */}
                <Card className="border shadow-sm">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-muted-foreground">
                        Comments
                      </span>
                      {comments.length > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {comments.length}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {comments.map((comment) => (
                        <div
                          key={comment.id}
                          className="flex gap-3 p-3 rounded-lg border bg-card/50"
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
                                ? comment.user.username
                                    .substring(0, 2)
                                    .toUpperCase()
                                : comment.user?.email
                                ? comment.user.email
                                    .substring(0, 2)
                                    .toUpperCase()
                                : "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-sm font-medium text-foreground">
                                {comment.user?.username ||
                                  comment.user?.full_name ||
                                  "Unknown User"}
                              </span>
                              <Badge variant="secondary" className="text-xs">
                                {formatDistanceToNow(
                                  new Date(comment.created_at),
                                  {
                                    addSuffix: true,
                                  }
                                )}
                              </Badge>
                            </div>
                            <p className="text-sm text-foreground leading-relaxed">
                              {comment.content}
                            </p>
                          </div>
                        </div>
                      ))}

                      <form
                        onSubmit={handleSubmitComment}
                        className="space-y-3"
                      >
                        <div className="flex gap-2">
                          <Input
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Add a comment..."
                            disabled={commentsLoading}
                            className="flex-1"
                          />
                          <Button
                            type="submit"
                            size="sm"
                            disabled={!newComment.trim() || commentsLoading}
                          >
                            Comment
                          </Button>
                        </div>
                      </form>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Enhanced Sidebar - Right Column */}
              <div className="p-6 space-y-6 border-l bg-muted/30">
                {/* Enhanced Labels Section */}
                <Card className="border shadow-sm">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-muted-foreground">
                        Labels
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        {getCurrentTagObjects().map((tag) => (
                          <Badge
                            key={tag.id}
                            variant="secondary"
                            className="cursor-pointer hover:opacity-80 transition-opacity"
                            style={{
                              backgroundColor: tag.color + "20",
                              color: tag.color,
                              border: `1px solid ${tag.color}40`,
                            }}
                            onClick={() => handleRemoveTag(tag.id)}
                          >
                            {tag.name}
                            <X className="h-3 w-3 ml-1" />
                          </Badge>
                        ))}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setIsTagPickerOpen(true)}
                        className="w-full h-9"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Label
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Enhanced Due Date Section */}
                <Card className="border shadow-sm">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-muted-foreground">
                        Due Date
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {isEditingDueDate ? (
                      <div className="space-y-3">
                        <Input
                          type="datetime-local"
                          value={editDueDate}
                          onChange={(e) => setEditDueDate(e.target.value)}
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={handleSaveDueDate}>
                            <Check className="h-4 w-4 mr-1" />
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setIsEditingDueDate(false)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {card.due_date
                              ? formatDate(card.due_date)
                              : "No due date set"}
                          </span>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setIsEditingDueDate(true)}
                          className="w-full h-9"
                        >
                          <CalendarDays className="h-4 w-4 mr-1" />
                          {card.due_date ? "Edit Due Date" : "Set Due Date"}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Enhanced Assignees Section */}
                <Card className="border shadow-sm">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-muted-foreground">
                        Assignees
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-3">
                        {assigneesLoading ? (
                          <div className="text-sm text-muted-foreground">
                            Loading assignees...
                          </div>
                        ) : assignees.length === 0 ? (
                          <div className="text-sm text-muted-foreground">
                            No assignees yet
                          </div>
                        ) : (
                          assignees.map((assignee) => (
                            <div
                              key={assignee.id}
                              className="flex items-center gap-2 p-2 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                              onClick={() =>
                                unassignUser(card.id, assignee.user_id)
                              }
                              title="Click to remove assignee"
                            >
                              <Avatar className="h-6 w-6">
                                <AvatarImage
                                  src={getAvatarUrl(
                                    assignee.user?.email || "",
                                    assignee.user?.avatar_url
                                  )}
                                />
                                <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                  {assignee.user?.full_name
                                    ? assignee.user.full_name
                                        .charAt(0)
                                        .toUpperCase()
                                    : assignee.user?.username
                                    ? assignee.user.username
                                        .charAt(0)
                                        .toUpperCase()
                                    : assignee.user?.email
                                    ? assignee.user.email
                                        .charAt(0)
                                        .toUpperCase()
                                    : assignee.user_id.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium truncate">
                                  {assignee.user?.full_name ||
                                    assignee.user?.username ||
                                    (assignee.user?.email
                                      ? getUserDisplayName(assignee.user.email)
                                      : `User ${assignee.user_id.substring(
                                          0,
                                          8
                                        )}`)}
                                </div>
                                <div className="text-xs text-muted-foreground truncate">
                                  {assignee.user?.email || "Unknown user"}
                                </div>
                              </div>
                              <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                            </div>
                          ))
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full h-9"
                        onClick={() => setIsAssigneeSelectorOpen(true)}
                      >
                        <UserPlus className="h-4 w-4 mr-1" />
                        Add Member
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Enhanced Actions Section */}
                <Card className="border shadow-sm">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <Settings className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-muted-foreground">
                        Actions
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full justify-start h-9"
                      >
                        <Archive className="h-4 w-4 mr-2" />
                        Archive
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full justify-start h-9"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={handleDelete}
                        className="w-full justify-start h-9"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Tag Picker Modal */}
          <Dialog open={isTagPickerOpen} onOpenChange={setIsTagPickerOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add Label</DialogTitle>
                <DialogDescription>
                  Create a new label or assign an existing one to this card.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                {/* Create New Label */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Label Name</label>
                    <Input
                      value={newTagName}
                      onChange={(e) => setNewTagName(e.target.value)}
                      placeholder="Enter label name..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Color</label>
                    <div className="flex flex-wrap gap-2">
                      {TAG_COLORS.map((color) => (
                        <button
                          key={color.value}
                          type="button"
                          className={`w-8 h-8 rounded-full border-2 transition-all ${
                            newTagColor === color.value
                              ? "border-foreground scale-110"
                              : "border-border hover:scale-105"
                          }`}
                          style={{ backgroundColor: color.value }}
                          onClick={() => setNewTagColor(color.value)}
                          title={color.name}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Available Labels */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Available Labels
                  </label>
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {getAvailableTags().map((tag) => (
                      <div
                        key={tag.id}
                        className="flex items-center justify-between p-2 rounded-lg border bg-card hover:bg-accent cursor-pointer transition-colors"
                        onClick={() => handleAssignTag(tag.id)}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: tag.color }}
                          />
                          <span className="text-sm">{tag.name}</span>
                        </div>
                        <Plus className="h-3 w-3" />
                      </div>
                    ))}
                    {getAvailableTags().length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-2">
                        No available labels
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsTagPickerOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateTag}
                  disabled={!newTagName.trim()}
                  className="flex-1"
                >
                  Create & Add
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Assignee Selector Modal */}
          <AssigneeSelector
            isOpen={isAssigneeSelectorOpen}
            onClose={() => setIsAssigneeSelectorOpen(false)}
            cardId={card.id}
            boardId={boardId}
          />
        </DialogContent>
      </Dialog>
    );
  }
);
