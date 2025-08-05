import React from "react";
import { BoardHeader } from "./BoardHeader";
import { BoardContent } from "./BoardContent";
import { BoardModals } from "./BoardModals";
import type { Board } from "../types";

interface BoardContainerProps {
  board: Board;
  user: any;
  darkMode: boolean;
  lists: any[];
  cards: any[];
  activeId: string | null;
  isCreateListModalOpen: boolean;
  isCreateCardModalOpen: boolean;
  newListTitle: string;
  newCardTitle: string;
  newCardDescription: string;
  onToggleDarkMode: () => void;
  onSignOut: () => void;
  onDragStart: (event: any) => void;
  onDragOver: (event: any) => void;
  onDragEnd: (event: any) => void;
  onCreateList: () => void;
  onCreateCard: (listId: string) => void;
  onCloseCreateListModal: () => void;
  onCloseCreateCardModal: () => void;
  onNewListTitleChange: (value: string) => void;
  onNewCardTitleChange: (value: string) => void;
  onNewCardDescriptionChange: (value: string) => void;
  onCreateListSubmit: (e: React.FormEvent) => void;
  onCreateCardSubmit: (e: React.FormEvent) => void;
  onUpdateList: (id: string, updates: any) => Promise<void>;
  onDeleteList: (id: string) => Promise<void>;
  onUpdateCard: (id: string, updates: any) => Promise<void>;
  onDeleteCard: (id: string) => Promise<void>;
}

export const BoardContainer: React.FC<BoardContainerProps> = ({
  board,
  user,
  darkMode,
  lists,
  cards,
  activeId,
  isCreateListModalOpen,
  isCreateCardModalOpen,
  newListTitle,
  newCardTitle,
  newCardDescription,
  onToggleDarkMode,
  onSignOut,
  onDragStart,
  onDragOver,
  onDragEnd,
  onCreateList,
  onCreateCard,
  onCloseCreateListModal,
  onCloseCreateCardModal,
  onNewListTitleChange,
  onNewCardTitleChange,
  onNewCardDescriptionChange,
  onCreateListSubmit,
  onCreateCardSubmit,
  onUpdateList,
  onDeleteList,
  onUpdateCard,
  onDeleteCard,
}) => {
  return (
    <div
      className="min-h-screen bg-gray-50 dark:bg-gray-900"
      onDragStart={(e) => {
        // Prevent default drag behavior to avoid page refresh
        e.preventDefault();
        e.stopPropagation();
      }}
      onDragOver={(e) => {
        // Prevent default drag behavior to avoid page refresh
        e.preventDefault();
        e.stopPropagation();
      }}
      onDrop={(e) => {
        // Prevent default drag behavior to avoid page refresh
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <BoardHeader
        board={board}
        user={user}
        darkMode={darkMode}
        onToggleDarkMode={onToggleDarkMode}
        onSignOut={onSignOut}
      />

      <BoardContent
        lists={lists}
        cards={cards}
        activeId={activeId}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
        onCreateList={onCreateList}
        onCreateCard={onCreateCard}
        onUpdateList={onUpdateList}
        onDeleteList={onDeleteList}
        onUpdateCard={onUpdateCard}
        onDeleteCard={onDeleteCard}
      />

      <BoardModals
        isCreateListModalOpen={isCreateListModalOpen}
        isCreateCardModalOpen={isCreateCardModalOpen}
        newListTitle={newListTitle}
        newCardTitle={newCardTitle}
        newCardDescription={newCardDescription}
        onCloseCreateListModal={onCloseCreateListModal}
        onCloseCreateCardModal={onCloseCreateCardModal}
        onNewListTitleChange={onNewListTitleChange}
        onNewCardTitleChange={onNewCardTitleChange}
        onNewCardDescriptionChange={onNewCardDescriptionChange}
        onCreateList={onCreateListSubmit}
        onCreateCard={onCreateCardSubmit}
      />
    </div>
  );
};
