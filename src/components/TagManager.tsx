import React, { useState, useCallback, useEffect } from "react";
import { useTagStore } from "../store/tags";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
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
import { Tag, Plus, Edit, Trash2, MoreHorizontal, Palette } from "lucide-react";
import type { Tag as TagType } from "../types";

interface TagManagerProps {
  boardId: string;
  isOpen: boolean;
  onClose: () => void;
}

const TAG_COLORS = [
  "#ef4444", // red
  "#f97316", // orange
  "#eab308", // yellow
  "#22c55e", // green
  "#06b6d4", // cyan
  "#3b82f6", // blue
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#6b7280", // gray
  "#84cc16", // lime
];

export const TagManager = React.memo<TagManagerProps>(
  ({ boardId, isOpen, onClose }) => {
    const { tags, loading, fetchTags, createTag, updateTag, deleteTag } =
      useTagStore();
    const [newTagName, setNewTagName] = useState("");
    const [newTagColor, setNewTagColor] = useState(TAG_COLORS[0]);
    const [editingTag, setEditingTag] = useState<TagType | null>(null);
    const [editName, setEditName] = useState("");
    const [editColor, setEditColor] = useState("");

    useEffect(() => {
      if (isOpen && boardId) {
        fetchTags(boardId);
      }
    }, [isOpen, boardId, fetchTags]);

    const handleCreateTag = useCallback(
      async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTagName.trim()) return;

        await createTag(boardId, newTagName.trim(), newTagColor);
        setNewTagName("");
        setNewTagColor(TAG_COLORS[0]);
      },
      [boardId, newTagName, newTagColor, createTag]
    );

    const handleUpdateTag = useCallback(
      async (tagId: string, name: string, color: string) => {
        await updateTag(tagId, { name, color });
        setEditingTag(null);
        setEditName("");
        setEditColor("");
      },
      [updateTag]
    );

    const handleDeleteTag = useCallback(
      async (tagId: string) => {
        if (
          window.confirm(
            "Are you sure you want to delete this tag? This action cannot be undone."
          )
        ) {
          await deleteTag(tagId);
        }
      },
      [deleteTag]
    );

    const startEditing = useCallback((tag: TagType) => {
      setEditingTag(tag);
      setEditName(tag.name);
      setEditColor(tag.color);
    }, []);

    const cancelEditing = useCallback(() => {
      setEditingTag(null);
      setEditName("");
      setEditColor("");
    }, []);

    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Manage Tags
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Create New Tag */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Create New Tag</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateTag} className="space-y-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tag Name</label>
                    <Input
                      value={newTagName}
                      onChange={(e) => setNewTagName(e.target.value)}
                      placeholder="Enter tag name..."
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Color</label>
                    <div className="flex flex-wrap gap-2">
                      {TAG_COLORS.map((color) => (
                        <button
                          key={color}
                          type="button"
                          className={`w-8 h-8 rounded-full border-2 transition-all ${
                            newTagColor === color
                              ? "border-foreground scale-110"
                              : "border-border hover:scale-105"
                          }`}
                          style={{ backgroundColor: color }}
                          onClick={() => setNewTagColor(color)}
                        />
                      ))}
                    </div>
                  </div>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={!newTagName.trim() || loading}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Tag
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Existing Tags */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Existing Tags</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                ) : tags.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    <Tag className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No tags created yet</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {tags.map((tag) => (
                      <div
                        key={tag.id}
                        className="flex items-center justify-between p-3 rounded-lg border bg-card"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: tag.color }}
                          />
                          <span className="text-sm font-medium">
                            {tag.name}
                          </span>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                            >
                              <MoreHorizontal className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => startEditing(tag)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteTag(tag.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Edit Tag Dialog */}
          <Dialog open={!!editingTag} onOpenChange={() => setEditingTag(null)}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Edit className="h-5 w-5" />
                  Edit Tag
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tag Name</label>
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Enter tag name..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Color</label>
                  <div className="flex flex-wrap gap-2">
                    {TAG_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={`w-8 h-8 rounded-full border-2 transition-all ${
                          editColor === color
                            ? "border-foreground scale-110"
                            : "border-border hover:scale-105"
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setEditColor(color)}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={cancelEditing}>
                  Cancel
                </Button>
                <Button
                  onClick={() =>
                    editingTag &&
                    handleUpdateTag(editingTag.id, editName, editColor)
                  }
                  disabled={!editName.trim()}
                >
                  Save Changes
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </DialogContent>
      </Dialog>
    );
  }
);
