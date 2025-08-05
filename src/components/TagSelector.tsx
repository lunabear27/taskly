import React, { useState, useCallback, useEffect } from "react";
import { useTagStore } from "../store/tags";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Tag, Plus, X, MoreHorizontal } from "lucide-react";
import type { Tag as TagType } from "../types";

interface TagSelectorProps {
  cardId: string;
  boardId: string;
  currentTags: string[];
  isOpen: boolean;
  onClose: () => void;
  onTagsChange: (tagIds: string[]) => void;
}

export const TagSelector = React.memo<TagSelectorProps>(
  ({ cardId, boardId, currentTags, isOpen, onClose, onTagsChange }) => {
    const { tags, loading, fetchTags, assignTagToCard, removeTagFromCard } =
      useTagStore();

    useEffect(() => {
      if (isOpen && boardId) {
        fetchTags(boardId);
      }
    }, [isOpen, boardId, fetchTags]);

    const handleAssignTag = useCallback(
      async (tagId: string) => {
        await assignTagToCard(cardId, tagId);
        const updatedTags = [...currentTags, tagId];
        onTagsChange(updatedTags);
      },
      [cardId, currentTags, assignTagToCard, onTagsChange]
    );

    const handleRemoveTag = useCallback(
      async (tagId: string) => {
        await removeTagFromCard(cardId, tagId);
        const updatedTags = currentTags.filter((id) => id !== tagId);
        onTagsChange(updatedTags);
      },
      [cardId, currentTags, removeTagFromCard, onTagsChange]
    );

    const getCurrentTagObjects = useCallback(() => {
      return tags.filter((tag) => currentTags.includes(tag.id));
    }, [tags, currentTags]);

    const getAvailableTags = useCallback(() => {
      return tags.filter((tag) => !currentTags.includes(tag.id));
    }, [tags, currentTags]);

    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Manage Card Tags
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Current Tags */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Current Tags</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                ) : getCurrentTagObjects().length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    <Tag className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No tags assigned</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {getCurrentTagObjects().map((tag) => (
                      <div
                        key={tag.id}
                        className="flex items-center justify-between p-2 rounded-lg border bg-card"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: tag.color }}
                          />
                          <span className="text-sm font-medium">
                            {tag.name}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                          onClick={() => handleRemoveTag(tag.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Available Tags */}
            {getAvailableTags().length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Available Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {getAvailableTags().map((tag) => (
                      <div
                        key={tag.id}
                        className="flex items-center justify-between p-2 rounded-lg border bg-card hover:bg-accent transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: tag.color }}
                          />
                          <span className="text-sm font-medium">
                            {tag.name}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-muted-foreground hover:text-primary"
                          onClick={() => handleAssignTag(tag.id)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {tags.length === 0 && !loading && (
              <div className="text-center py-4 text-muted-foreground">
                <Tag className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No tags available</p>
                <p className="text-xs">Create tags in the board settings</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  }
);
