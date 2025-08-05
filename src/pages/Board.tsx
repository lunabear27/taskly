import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useBoardState } from "../hooks/useBoardState";
import { useBoards } from "../hooks/useBoards";
import { useDragAndDrop } from "../hooks/useDragAndDrop";
import { useDragPrevention } from "../hooks/useDragPrevention";
import { useAuth } from "../hooks/useAuth";

import { BoardHeader } from "../components/BoardHeader";
import { BoardContent } from "../components/BoardContent";
import { BoardModals } from "../components/BoardModals";
import { BoardLoading } from "../components/BoardLoading";
import { BoardNotFound } from "../components/BoardNotFound";
import { TagManager } from "../components/TagManager";
import { PermissionTest } from "../components/PermissionTest";
import { RealtimeTest } from "../components/RealtimeTest";

export const Board = () => {
  const { boardId } = useParams<{ boardId: string }>();
  const { user } = useAuth();

  if (!boardId) {
    return <BoardNotFound />;
  }

  const {
    board,
    lists,
    cards,
    loading,
    error,
    isCreateListModalOpen,
    isCreateCardModalOpen,
    selectedListId,
    onCreateList,
    onCreateCard,
    onUpdateList,
    onDeleteList,
    onMoveList,
    onUpdateCard,
    onDeleteCard,
    onMoveCard,
    setIsCreateListModalOpen,
    setIsCreateCardModalOpen,
    setSelectedListId,
  } = useBoardState(boardId);

  const { updateBoard, deleteBoard } = useBoards();
  const [isTagManagerOpen, setIsTagManagerOpen] = useState(false);

  const { activeId, onDragStart, onDragOver, onDragEnd } = useDragAndDrop({
    lists,
    cards,
    moveCard: onMoveCard,
    moveList: onMoveList,
  });

  useDragPrevention();

  if (loading) {
    return <BoardLoading />;
  }

  if (error || !board) {
    return <BoardNotFound />;
  }

  return (
    <div className="h-full">
      {/* Board Header */}
      <BoardHeader
        board={board}
        user={user}
        onManageTags={() => setIsTagManagerOpen(true)}
        onUpdateBoard={updateBoard}
        onDeleteBoard={deleteBoard}
      />

      <BoardContent
        lists={lists}
        cards={cards}
        boardId={board?.id || ""}
        activeId={activeId}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
        onCreateList={onCreateList}
        onCreateCard={onCreateCard}
        onUpdateList={onUpdateList}
        onDeleteList={onDeleteList}
        onMoveList={onMoveList}
        onUpdateCard={onUpdateCard}
        onDeleteCard={onDeleteCard}
        setIsCreateListModalOpen={setIsCreateListModalOpen}
      />

      <BoardModals
        isCreateListModalOpen={isCreateListModalOpen}
        isCreateCardModalOpen={isCreateCardModalOpen}
        selectedListId={selectedListId}
        onCreateList={onCreateList}
        onCreateCard={onCreateCard}
        setIsCreateListModalOpen={setIsCreateListModalOpen}
        setIsCreateCardModalOpen={setIsCreateCardModalOpen}
        setSelectedListId={setSelectedListId}
      />

      {/* Tag Manager Modal */}
      <TagManager
        boardId={board.id}
        isOpen={isTagManagerOpen}
        onClose={() => setIsTagManagerOpen(false)}
      />

      {/* Permission Test Component - Remove this in production */}
      <div className="p-4">
        <PermissionTest boardId={board.id} />
      </div>

      {/* Realtime Test Component - Remove this in production */}
      <div className="p-4">
        <RealtimeTest />
      </div>
    </div>
  );
};
