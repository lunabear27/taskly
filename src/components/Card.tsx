import React, { useState, useCallback } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Card as UICard, CardContent } from "./ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Tag,
  Edit,
  Trash2,
  Clock,
  AlertCircle,
  MoreHorizontal,
  GripVertical,
  Calendar,
  MessageSquare,
  CheckSquare,
  Square,
  CheckCircle,
  Sparkles,
  MessageCircle,
} from "lucide-react";
import { formatDate, isOverdue } from "../lib/utils";
import type { Card as CardType } from "../types";
import { useCommentCount } from "../hooks/useCommentCount";
import { useTagStore } from "../store/tags";
import { CardDetailModal } from "./CardDetailModal";

interface CardProps {
  card: CardType;
  boardId: string;
  onUpdate: (id: string, updates: Partial<CardType>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export const Card = React.memo<CardProps>(
  ({ card, boardId, onUpdate, onDelete }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState(card.title);
    const [editDescription, setEditDescription] = useState(
      card.description || ""
    );
    const [isCardDetailOpen, setIsCardDetailOpen] = useState(false);
    const { count: commentCount } = useCommentCount(card.id);
    const { tags } = useTagStore();

    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: card.id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };

    const handleSaveTitle = useCallback(async () => {
      if (editTitle.trim() && editTitle !== card.title) {
        await onUpdate(card.id, { title: editTitle.trim() });
      }
      setIsEditing(false);
    }, [editTitle, card.title, card.id, onUpdate]);

    const handleCancelEdit = useCallback(() => {
      setEditTitle(card.title);
      setIsEditing(false);
    }, [card.title]);

    const handleSaveDescription = useCallback(async () => {
      await onUpdate(card.id, {
        description: editDescription.trim() || undefined,
      });
      setIsDetailModalOpen(false);
    }, [editDescription, card.id, onUpdate]);

    const handleDelete = useCallback(async () => {
      if (
        window.confirm(
          "Are you sure you want to delete this card? This action cannot be undone."
        )
      ) {
        await onDelete(card.id);
      }
    }, [card.id, onDelete]);

    const handleCheckboxToggle = useCallback(async () => {
      await onUpdate(card.id, { completed: !card.completed });
    }, [card.id, card.completed, onUpdate]);

    // Calculate checklist progress
    const checklistProgress = useCallback(() => {
      if (!card.checklist || card.checklist.length === 0) return null;

      const completedCount = card.checklist.filter(
        (item) => item.completed
      ).length;
      const totalCount = card.checklist.length;

      return { completed: completedCount, total: totalCount };
    }, [card.checklist]);

    const getDueDateStatus = useCallback(() => {
      if (!card.due_date) return null;

      if (isOverdue(card.due_date)) {
        return {
          status: "overdue",
          icon: AlertCircle,
          color: "text-destructive",
          variant: "destructive" as const,
        };
      }

      const dueDate = new Date(card.due_date);
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      if (dueDate.toDateString() === today.toDateString()) {
        return {
          status: "today",
          icon: Clock,
          color: "text-warning-600",
          variant: "secondary" as const,
        };
      }

      if (dueDate.toDateString() === tomorrow.toDateString()) {
        return {
          status: "tomorrow",
          icon: Clock,
          color: "text-warning-600",
          variant: "secondary" as const,
        };
      }

      return {
        status: "upcoming",
        icon: Calendar,
        color: "text-muted-foreground",
        variant: "outline" as const,
      };
    }, [card.due_date]);

    const dueDateStatus = getDueDateStatus();

    return (
      <>
        <div
          ref={setNodeRef}
          style={style}
          className={`${isDragging ? "opacity-50" : ""}`}
        >
          <div
            {...attributes}
            {...listeners}
            className={`group relative bg-gradient-to-br from-card to-card/80 border border-border/50 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 cursor-grab active:cursor-grabbing ${
              card.completed ? "opacity-75" : ""
            }`}
            onClick={(e) => {
              // Don't open modal if clicking on dropdown or editing
              if (!e.target.closest("[data-dropdown]") && !isEditing) {
                setIsCardDetailOpen(true);
              }
            }}
          >
            <div className="p-4">
              <div className="space-y-3">
                {/* Card Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {/* Drag Handle */}
                    <div className="flex items-center justify-center w-4 h-4 text-muted-foreground/60 group-hover:text-muted-foreground rounded flex-shrink-0 mt-0.5 transition-colors">
                      <GripVertical className="h-3 w-3" />
                    </div>

                    {/* Checkbox */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCheckboxToggle();
                      }}
                      className="flex-shrink-0 mt-0.5 p-1 hover:bg-muted/50 rounded-md transition-colors"
                    >
                      {card.completed ? (
                        <CheckSquare className="h-4 w-4 text-primary" />
                      ) : (
                        <Square className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
                      )}
                    </button>

                    {/* Card Title */}
                    {isEditing ? (
                      <div className="flex-1 min-w-0">
                        <Input
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onBlur={handleSaveTitle}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleSaveTitle();
                            }
                            if (e.key === "Escape") {
                              e.preventDefault();
                              handleCancelEdit();
                            }
                            if (e.key === " ") {
                              e.stopPropagation();
                            }
                          }}
                          className="py-1 px-2 text-sm font-medium border-0 bg-transparent focus:ring-0 focus:border-primary"
                          autoFocus
                        />
                      </div>
                    ) : (
                      <h4
                        className={`font-medium text-foreground text-sm leading-tight flex-1 min-w-0 break-words cursor-pointer hover:text-primary transition-colors ${
                          card.completed
                            ? "line-through text-muted-foreground"
                            : ""
                        }`}
                        onDoubleClick={() => setIsEditing(true)}
                      >
                        {card.title}
                      </h4>
                    )}
                  </div>

                  {/* Card Actions */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted/50"
                        data-dropdown
                      >
                        <MoreHorizontal className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem
                        onClick={() => setIsCardDetailOpen(true)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Open Card
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={handleDelete}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete card
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Card Description */}
                {card.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed break-words">
                    {card.description}
                  </p>
                )}

                {/* Card Metadata */}
                <div className="space-y-3">
                  {/* Tags */}
                  {card.tags && card.tags.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {card.tags.map((tagId) => {
                        const tag = tags.find((t) => t.id === tagId);
                        return tag ? (
                          <Badge
                            key={tag.id}
                            variant="secondary"
                            className="text-xs px-2 py-0.5 font-medium"
                            style={{
                              backgroundColor: tag.color + "15",
                              color: tag.color,
                              border: `1px solid ${tag.color}30`,
                            }}
                          >
                            {tag.name}
                          </Badge>
                        ) : null;
                      })}
                    </div>
                  )}

                  {/* Metadata Row */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      {dueDateStatus && (
                        <Badge
                          variant={dueDateStatus.variant}
                          className="text-xs font-medium"
                        >
                          <dueDateStatus.icon className="h-3 w-3 mr-1" />
                          {dueDateStatus.status === "overdue" && "Overdue"}
                          {dueDateStatus.status === "today" && "Due today"}
                          {dueDateStatus.status === "tomorrow" &&
                            "Due tomorrow"}
                          {dueDateStatus.status === "upcoming" &&
                            formatDate(card.due_date!)}
                        </Badge>
                      )}
                      {checklistProgress() && (
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-muted/50 rounded-md">
                          <CheckCircle
                            className={`h-3 w-3 ${
                              checklistProgress()?.completed ===
                              checklistProgress()?.total
                                ? "text-green-500"
                                : "text-muted-foreground"
                            }`}
                          />
                          <span
                            className={
                              checklistProgress()?.completed ===
                              checklistProgress()?.total
                                ? "text-green-600 font-medium"
                                : "font-medium"
                            }
                          >
                            {checklistProgress()?.completed}/
                            {checklistProgress()?.total}
                          </span>
                        </div>
                      )}
                      {commentCount > 0 && (
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-500/10 rounded-md">
                          <MessageCircle className="h-3 w-3 text-blue-500" />
                          <span className="font-medium text-blue-600">
                            {commentCount}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card Detail Modal */}
        <CardDetailModal
          card={card}
          boardId={boardId}
          isOpen={isCardDetailOpen}
          onClose={() => setIsCardDetailOpen(false)}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      </>
    );
  }
);
