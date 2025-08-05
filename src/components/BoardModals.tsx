import React, { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./ui/dialog";

interface BoardModalsProps {
  isCreateListModalOpen: boolean;
  isCreateCardModalOpen: boolean;
  selectedListId: string;
  onCreateList: (title?: string) => void;
  onCreateCard: (
    listId: string,
    title: string,
    description?: string
  ) => Promise<void>;
  setIsCreateListModalOpen: (open: boolean) => void;
  setIsCreateCardModalOpen: (open: boolean) => void;
  setSelectedListId: (id: string) => void;
}

export const BoardModals: React.FC<BoardModalsProps> = ({
  isCreateListModalOpen,
  isCreateCardModalOpen,
  selectedListId,
  onCreateList,
  onCreateCard,
  setIsCreateListModalOpen,
  setIsCreateCardModalOpen,
  setSelectedListId,
}) => {
  const [newListTitle, setNewListTitle] = useState("");
  const [newCardTitle, setNewCardTitle] = useState("");
  const [newCardDescription, setNewCardDescription] = useState("");

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListTitle.trim()) return;

    await onCreateList(newListTitle.trim());
    setNewListTitle("");
    setIsCreateListModalOpen(false);
  };

  const handleCreateCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCardTitle.trim() || !selectedListId) return;

    await onCreateCard(
      selectedListId,
      newCardTitle.trim(),
      newCardDescription.trim() || undefined
    );
    setNewCardTitle("");
    setNewCardDescription("");
    setSelectedListId("");
    setIsCreateCardModalOpen(false);
  };

  const handleCloseListModal = () => {
    setNewListTitle("");
    setIsCreateListModalOpen(false);
  };

  const handleCloseCardModal = () => {
    setNewCardTitle("");
    setNewCardDescription("");
    setSelectedListId("");
    setIsCreateCardModalOpen(false);
  };

  return (
    <>
      {/* Create List Dialog */}
      <Dialog
        open={isCreateListModalOpen}
        onOpenChange={setIsCreateListModalOpen}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New List</DialogTitle>
            <DialogDescription>
              Add a new list to organize your cards.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateList} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">List Title</label>
              <Input
                value={newListTitle}
                onChange={(e) => setNewListTitle(e.target.value)}
                placeholder="Enter list title"
                required
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseListModal}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="shadow-glow hover:shadow-glow-lg"
              >
                Create List
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create Card Dialog */}
      <Dialog
        open={isCreateCardModalOpen}
        onOpenChange={setIsCreateCardModalOpen}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Card</DialogTitle>
            <DialogDescription>Add a new card to your list.</DialogDescription>
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
                onClick={handleCloseCardModal}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="shadow-glow hover:shadow-glow-lg"
              >
                Create Card
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};
