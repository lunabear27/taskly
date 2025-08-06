import { useState, useEffect, useCallback } from "react";
import { useBoards } from "./useBoards";
import { logger } from "../lib/logger";
import { useTagStore } from "../store/tags";
import { useBoardMemberStore } from "../store/boardMembers";
import type { Board, List, Card } from "../types";

export const useBoardState = (boardId: string) => {
  const [isCreateListModalOpen, setIsCreateListModalOpen] = useState(false);
  const [isCreateCardModalOpen, setIsCreateCardModalOpen] = useState(false);
  const [selectedListId, setSelectedListId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [board, setBoard] = useState<Board | null>(null);

  const {
    boards,
    lists,
    cards,
    fetchLists,
    fetchAllCards,
    createList,
    createCard,
    updateList,
    deleteList,
    moveList,
    updateCard,
    deleteCard,
    moveCard,
    subscribeToBoard,
    subscribeToLists,
    subscribeToCards,
    unsubscribeFromAll,
  } = useBoards();

  const { fetchTags } = useTagStore();
  const { fetchBoardMembers } = useBoardMemberStore();

  // Find the board by ID
  useEffect(() => {
    if (boardId && boards.length > 0) {
      const foundBoard = boards.find((b) => b.id === boardId);
      if (foundBoard) {
        setBoard(foundBoard);
        setError(null);
        // Only set loading to true if we don't have a board yet or if the board ID changed
        if (!board || board.id !== foundBoard.id) {
          setLoading(true);
        }
      } else {
        setError("Board not found");
        setBoard(null);
      }
    }
  }, [boardId, boards, board]);

  // Fetch lists for the board
  useEffect(() => {
    if (board?.id && !error) {
      setLoading(true);
      fetchLists(board.id)
        .then(() => {
          setLoading(false);
        })
        .catch((err) => {
          logger.error("Error fetching lists", err);
          setError("Failed to load lists");
          setLoading(false);
        });
    }
  }, [board?.id, fetchLists, error]);

  // Fetch cards for the board
  useEffect(() => {
    if (board?.id && !error) {
      fetchAllCards(board.id);
    }
  }, [board?.id, fetchAllCards, error]);

  // Fetch tags for the board
  useEffect(() => {
    if (board?.id && !error) {
      fetchTags(board.id);
    }
  }, [board?.id, fetchTags, error]);

  // Fetch board members for the board
  useEffect(() => {
    if (board?.id && !error) {
      fetchBoardMembers(board.id);
    }
  }, [board?.id, fetchBoardMembers, error]);

  // Subscribe to real-time updates for this board
  useEffect(() => {
    if (board?.id && !error) {
      // Subscribe to board changes
      subscribeToBoard(board.id);

      // Subscribe to lists changes
      subscribeToLists(board.id);

      // Subscribe to cards changes
      subscribeToCards(board.id);
    }

    // Cleanup subscriptions when component unmounts or board changes
    return () => {
      if (board?.id) {
        unsubscribeFromAll();
      }
    };
  }, [
    board?.id,
    error,
    subscribeToBoard,
    subscribeToLists,
    subscribeToCards,
    unsubscribeFromAll,
  ]);

  const onCreateList = useCallback(
    async (title?: string) => {
      if (!board) return;

      try {
        const newList = await createList(
          board.id,
          title || "New List",
          lists?.length || 0
        );
        console.log("List created successfully:", newList);
      } catch (error) {
        console.error("Error creating list:", error);
      }
    },
    [board, lists?.length, createList]
  );

  const onCreateCard = useCallback(
    async (listId: string, title: string, description?: string) => {
      try {
        await createCard(listId, title, description);
        console.log("Card created successfully");
      } catch (error) {
        console.error("Error creating card:", error);
      }
    },
    [createCard]
  );

  const onUpdateList = useCallback(
    async (id: string, updates: Partial<List>) => {
      try {
        await updateList(id, updates);
        logger.log("List updated successfully");
      } catch (error) {
        logger.error("Error updating list", error);
      }
    },
    [updateList]
  );

  const onDeleteList = useCallback(
    async (id: string) => {
      try {
        await deleteList(id);
        logger.log("List deleted successfully");
      } catch (error) {
        logger.error("Error deleting list", error);
      }
    },
    [deleteList]
  );

  const onUpdateCard = useCallback(
    async (id: string, updates: Partial<Card>) => {
      try {
        await updateCard(id, updates);
        logger.log("Card updated successfully");
      } catch (error) {
        logger.error("Error updating card", error);
      }
    },
    [updateCard]
  );

  const onDeleteCard = useCallback(
    async (id: string) => {
      try {
        await deleteCard(id);
        logger.log("Card deleted successfully");
      } catch (error) {
        logger.error("Error deleting card", error);
      }
    },
    [deleteCard]
  );

  const onMoveCard = useCallback(
    async (cardId: string, newListId: string, newPosition: number) => {
      try {
        await moveCard(cardId, newListId, newPosition);
        logger.log("Card moved successfully");
      } catch (error) {
        logger.error("Error moving card", error);
      }
    },
    [moveCard]
  );

  const onMoveList = useCallback(
    async (listId: string, newPosition: number) => {
      try {
        await moveList(listId, newPosition);
        logger.log("List moved successfully");
      } catch (error) {
        logger.error("Error moving list", error);
      }
    },
    [moveList]
  );

  return {
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
  };
};
