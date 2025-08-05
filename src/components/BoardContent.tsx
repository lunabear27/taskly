import React, { useMemo, useCallback } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { List } from "./List";
import { Button } from "./ui/button";
import { Card as UICard, CardContent } from "./ui/card";
import { Plus, Sparkles, GripVertical, Calendar, Tag } from "lucide-react";
import type { List as ListType, Card as CardType } from "../types";

interface BoardContentProps {
  lists: ListType[];
  cards: CardType[];
  boardId: string;
  activeId: string | null;
  onDragStart: (event: any) => void;
  onDragOver: (event: any) => void;
  onDragEnd: (event: any) => void;
  onCreateList: (title?: string) => void;
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
  setIsCreateListModalOpen: (open: boolean) => void;
}

export const BoardContent = React.memo<BoardContentProps>(
  ({
    lists,
    cards,
    boardId,
    activeId,
    onDragStart,
    onDragOver,
    onDragEnd,
    onCreateList,
    onCreateCard,
    onUpdateList,
    onDeleteList,
    onMoveList,
    onUpdateCard,
    onDeleteCard,
    setIsCreateListModalOpen,
  }) => {
    const sensors = useSensors(
      useSensor(PointerSensor, {
        activationConstraint: {
          distance: 4,
        },
      }),
      useSensor(KeyboardSensor)
    );

    // Memoize the active card for the drag overlay
    const activeCard = useMemo(() => {
      if (!activeId) return null;
      return cards.find((card) => card.id === activeId);
    }, [activeId, cards]);

    // Memoize sorted lists
    const sortedLists = useMemo(() => {
      return [...lists].sort((a, b) => a.position - b.position);
    }, [lists]);

    // Memoize cards grouped by list
    const cardsByList = useMemo(() => {
      const grouped: Record<string, CardType[]> = {};
      cards.forEach((card) => {
        if (!grouped[card.list_id]) {
          grouped[card.list_id] = [];
        }
        grouped[card.list_id].push(card);
      });
      return grouped;
    }, [cards]);

    return (
      <div className="h-full overflow-x-auto">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={onDragStart}
          onDragOver={onDragOver}
          onDragEnd={onDragEnd}
        >
          <div className="flex items-start space-x-6 p-6 min-h-full">
            {/* Lists */}
            <SortableContext
              items={sortedLists.map((list) => list.id)}
              strategy={horizontalListSortingStrategy}
            >
              {sortedLists.map((list) => (
                <List
                  key={list.id}
                  list={list}
                  cards={cardsByList[list.id] || []}
                  boardId={boardId}
                  onCreateCard={onCreateCard}
                  onUpdateList={onUpdateList}
                  onDeleteList={onDeleteList}
                  onMoveList={onMoveList}
                  onUpdateCard={onUpdateCard}
                  onDeleteCard={onDeleteCard}
                />
              ))}
            </SortableContext>

            {/* Add List Button */}
            <div className="flex-shrink-0 w-80">
              <div className="bg-gradient-to-br from-background to-muted/20 rounded-xl border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 transition-all duration-300 hover:shadow-md">
                <div className="p-6">
                  <Button
                    variant="ghost"
                    onClick={() => setIsCreateListModalOpen(true)}
                    className="w-full h-12 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Add List
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Empty State */}
          {sortedLists.length === 0 && (
            <div className="flex items-center justify-center h-64">
              <div className="text-center space-y-6">
                <div className="flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-primary/10 to-primary/20">
                  <Sparkles className="h-12 w-12 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold">No lists yet</h3>
                  <p className="text-muted-foreground text-lg">
                    Create your first list to get started
                  </p>
                </div>
                <Button
                  onClick={() => setIsCreateListModalOpen(true)}
                  className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create your first list
                </Button>
              </div>
            </div>
          )}

          {/* Drag Overlay */}
          <DragOverlay>
            {activeId && activeCard ? (
              <div className="w-80 bg-gradient-to-br from-card to-card/95 border border-primary/30 rounded-lg shadow-xl backdrop-blur-sm">
                <div className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-4 h-4 text-muted-foreground/60">
                        <GripVertical className="h-3 w-3" />
                      </div>
                      <h4 className="font-medium text-foreground text-sm leading-tight flex-1">
                        {activeCard.title}
                      </h4>
                    </div>

                    {activeCard.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                        {activeCard.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        {activeCard.due_date && (
                          <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-500/10 rounded-md">
                            <Calendar className="h-3 w-3 text-blue-500" />
                            <span className="font-medium text-blue-600">
                              Due{" "}
                              {new Date(
                                activeCard.due_date
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                        {activeCard.tags && activeCard.tags.length > 0 && (
                          <div className="flex items-center gap-1.5 px-2 py-1 bg-purple-500/10 rounded-md">
                            <Tag className="h-3 w-3 text-purple-500" />
                            <span className="font-medium text-purple-600">
                              {activeCard.tags.length}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    );
  }
);
