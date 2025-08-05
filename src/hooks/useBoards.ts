import { useEffect } from "react";
import { useBoardStore } from "../store/boards";

export const useBoards = () => {
  const {
    boards,
    currentBoard,
    lists,
    cards,
    loading,
    error,
    fetchBoards,
    createBoard,
    updateBoard,
    deleteBoard,
    setCurrentBoard,
    toggleStarBoard,
    subscribeToBoards,
    subscribeToBoard,
    subscribeToLists,
    subscribeToCards,
    unsubscribeFromAll,
    fetchLists,
    fetchAllCards,
    createList,
    updateList,
    deleteList,
    moveList,
    fetchCards,
    createCard,
    updateCard,
    deleteCard,
    moveCard,
  } = useBoardStore();

  useEffect(() => {
    fetchBoards();
  }, [fetchBoards]);

  return {
    boards,
    currentBoard,
    lists,
    cards,
    loading,
    error,
    createBoard,
    updateBoard,
    deleteBoard,
    setCurrentBoard,
    toggleStarBoard,
    subscribeToBoards,
    subscribeToBoard,
    subscribeToLists,
    subscribeToCards,
    unsubscribeFromAll,
    fetchLists,
    fetchAllCards,
    createList,
    updateList,
    deleteList,
    moveList,
    fetchCards,
    createCard,
    updateCard,
    deleteCard,
    moveCard,
  };
};
