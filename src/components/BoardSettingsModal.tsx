import React, { useState, useEffect } from "react";
import { Modal } from "./ui/Modal";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { toast } from "sonner";

interface BoardSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  board: any;
  onUpdateBoard: (id: string, updates: any) => Promise<void>;
}

export const BoardSettingsModal: React.FC<BoardSettingsModalProps> = ({
  isOpen,
  onClose,
  board,
  onUpdateBoard,
}) => {
  const [title, setTitle] = useState(board?.title || "");
  const [description, setDescription] = useState(board?.description || "");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (board) {
      setTitle(board.title || "");
      setDescription(board.description || "");
    }
  }, [board]);

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("Board title is required");
      return;
    }

    setIsLoading(true);
    try {
      await onUpdateBoard(board.id, {
        title: title.trim(),
        description: description.trim() || null,
      });
      toast.success("Board settings updated successfully");
      onClose();
    } catch (error) {
      toast.error("Failed to update board settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setTitle(board?.title || "");
    setDescription(board?.description || "");
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Board Settings"
      size="lg"
      showCloseButton={false}
    >
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="board-title">Board Title</Label>
          <Input
            id="board-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter board title"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="board-description">Description (Optional)</Label>
          <Textarea
            id="board-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter board description"
            rows={3}
          />
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
