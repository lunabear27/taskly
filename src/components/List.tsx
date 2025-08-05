import React, { useState, useCallback } from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card as CardComponent } from "./Card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card as UICard, CardContent, CardHeader } from "./ui/card";
import { Badge } from "./ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import {
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  GripVertical,
  Calendar,
  Tag,
  Sparkles,
  FileText,
} from "lucide-react";
import type { List as ListType, Card as CardType } from "../types";

interface ListProps {
  list: ListType;
  cards: CardType[];
  boardId: string;
  onCreateCard: (
    listId: string,
    title: string,
    description?: string
  ) => Promise<void>;
  onUpdateList: (id: string, updates: Partial<ListType>) => Promise<void>;
  onDeleteList: (id: string) => Promise<void>;
  onMoveList: (listId: string, newPosition: number) => Promise<void>;
  onUpdateCard: (id: string, updates: Partial<CardType>) => Promise<void>;
  onDeleteCard: (id: string) => Promise<void>;
}

export const List = React.memo<ListProps>(
  ({
    list,
    cards,
    boardId,
    onCreateCard,
    onUpdateList,
    onDeleteList,
    onMoveList,
    onUpdateCard,
    onDeleteCard,
  }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState(list.title);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newCardTitle, setNewCardTitle] = useState("");
    const [newCardDescription, setNewCardDescription] = useState("");

    // Make the list draggable and droppable
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({
      id: list.id,
    });

    // Make the list a droppable area for cards
    const { setNodeRef: setDroppableRef } = useDroppable({
      id: list.id,
    });

    const handleSaveTitle = useCallback(async () => {
      if (editTitle.trim() && editTitle !== list.title) {
        await onUpdateList(list.id, { title: editTitle.trim() });
      }
      setIsEditing(false);
    }, [editTitle, list.title, list.id, onUpdateList]);

    const handleCancelEdit = useCallback(() => {
      setEditTitle(list.title);
      setIsEditing(false);
    }, [list.title]);

    const handleCreateCard = useCallback(
      async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCardTitle.trim()) return;

        await onCreateCard(
          list.id,
          newCardTitle.trim(),
          newCardDescription.trim() || undefined
        );
        setNewCardTitle("");
        setNewCardDescription("");
        setIsCreateModalOpen(false);
      },
      [list.id, newCardTitle, newCardDescription, onCreateCard]
    );

    const handleDeleteList = useCallback(async () => {
      if (
        window.confirm(
          "Are you sure you want to delete this list? This action cannot be undone."
        )
      ) {
        await onDeleteList(list.id);
      }
    }, [list.id, onDeleteList]);

    const sortedCards = [...cards].sort((a, b) => a.position - b.position);

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };

    // Calculate list statistics
    const totalCards = cards.length;
    const cardsWithDueDate = cards.filter((card) => card.due_date).length;
    const cardsWithTags = cards.filter(
      (card) => card.tags && card.tags.length > 0
    ).length;

    return (
      <>
        <div
          ref={setNodeRef}
          style={style}
          className={`flex-shrink-0 w-80 ${isDragging ? "opacity-50" : ""}`}
        >
          <div className="bg-gradient-to-br from-background to-muted/20 rounded-xl border border-border/50 shadow-sm hover:shadow-md transition-all duration-300">
            {/* List Header */}
            <div className="p-4 border-b border-border/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  {/* Drag Handle */}
                  <div
                    {...attributes}
                    {...listeners}
                    className="flex items-center justify-center w-6 h-6 text-muted-foreground/60 hover:text-muted-foreground rounded-md hover:bg-muted/50 transition-colors cursor-grab active:cursor-grabbing"
                  >
                    <GripVertical className="h-4 w-4" />
                  </div>

                  {/* List Title */}
                  {isEditing ? (
                    <div className="flex-1">
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
                        className="py-1 px-2 text-sm font-semibold border-0 bg-transparent focus:ring-0 focus:border-primary"
                        autoFocus
                      />
                    </div>
                  ) : (
                    <h3
                      className="font-semibold text-foreground text-sm flex-1 cursor-pointer hover:text-primary transition-colors"
                      onDoubleClick={() => setIsEditing(true)}
                    >
                      {list.title}
                    </h3>
                  )}
                </div>

                {/* List Actions */}
                <div className="flex items-center gap-2">
                  {/* List Stats */}
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    {totalCards > 0 && (
                      <div className="flex items-center gap-1 px-2 py-1 bg-muted/50 rounded-md">
                        <FileText className="h-3 w-3" />
                        <span className="font-medium">{totalCards}</span>
                      </div>
                    )}
                    {cardsWithDueDate > 0 && (
                      <div className="flex items-center gap-1 px-2 py-1 bg-blue-500/10 rounded-md">
                        <Calendar className="h-3 w-3 text-blue-500" />
                        <span className="font-medium text-blue-600">
                          {cardsWithDueDate}
                        </span>
                      </div>
                    )}
                    {cardsWithTags > 0 && (
                      <div className="flex items-center gap-1 px-2 py-1 bg-purple-500/10 rounded-md">
                        <Tag className="h-3 w-3 text-purple-500" />
                        <span className="font-medium text-purple-600">
                          {cardsWithTags}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Dropdown Menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-muted/50"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => setIsEditing(true)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit list
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={handleDeleteList}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete list
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>

            {/* Cards Container */}
            <div className="p-4">
              <div ref={setDroppableRef} className="space-y-3 min-h-4">
                <SortableContext
                  items={sortedCards.map((card) => card.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {sortedCards.map((card) => (
                    <CardComponent
                      key={card.id}
                      card={card}
                      boardId={boardId}
                      onUpdate={onUpdateCard}
                      onDelete={onDeleteCard}
                    />
                  ))}
                </SortableContext>
              </div>

              {/* Add Card Button */}
              <Button
                variant="ghost"
                onClick={() => setIsCreateModalOpen(true)}
                className="w-full mt-4 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg text-sm py-3 transition-all duration-200 border border-dashed border-muted-foreground/30 hover:border-primary/50"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Card
              </Button>
            </div>
          </div>
        </div>

        {/* Create Card Dialog */}
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Add New Card
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateCard} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Card Title</label>
                <Input
                  value={newCardTitle}
                  onChange={(e) => setNewCardTitle(e.target.value)}
                  placeholder="Enter card title"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Description (optional)
                </label>
                <Input
                  value={newCardDescription}
                  onChange={(e) => setNewCardDescription(e.target.value)}
                  placeholder="Enter card description"
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
                  className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                >
                  Create Card
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </>
    );
  }
);
