import { create } from "zustand";
import { supabase } from "../lib/supabase";
import type { Board, List, Card } from "../types";
import { useBoardMemberStore } from "./boardMembers";

interface BoardState {
  boards: Board[];
  currentBoard: Board | null;
  lists: List[];
  cards: Card[];
  loading: boolean;
  error: string | null;
  realtimeChannels: any[];

  // Board actions
  fetchBoards: () => Promise<void>;
  createBoard: (
    title: string,
    description?: string,
    isPublic?: boolean
  ) => Promise<void>;
  updateBoard: (id: string, updates: Partial<Board>) => Promise<void>;
  deleteBoard: (id: string) => Promise<void>;
  setCurrentBoard: (board: Board | null) => void;
  toggleStarBoard: (id: string) => Promise<void>;

  // Real-time actions
  subscribeToBoards: () => void;
  subscribeToBoard: (boardId: string) => void;
  subscribeToLists: (boardId: string) => void;
  subscribeToCards: (boardId: string) => void;
  unsubscribeFromAll: () => void;

  // List actions
  fetchLists: (boardId: string) => Promise<void>;
  createList: (
    boardId: string,
    title: string,
    position: number
  ) => Promise<List>;
  updateList: (id: string, updates: Partial<List>) => Promise<void>;
  deleteList: (id: string) => Promise<void>;
  moveList: (listId: string, newPosition: number) => Promise<void>;

  // Card actions
  fetchCards: (listId: string) => Promise<void>;
  fetchAllCards: (boardId: string) => Promise<void>;
  createCard: (
    listId: string,
    title: string,
    description?: string,
    position?: number
  ) => Promise<void>;
  updateCard: (id: string, updates: Partial<Card>) => Promise<void>;
  deleteCard: (id: string) => Promise<void>;
  moveCard: (
    cardId: string,
    newListId: string,
    newPosition: number
  ) => Promise<void>;
  reorderPositions: (listId: string, excludeCardId?: string) => void;
  getSortedLists: () => List[];

  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useBoardStore = create<BoardState>((set, get) => ({
  boards: [],
  currentBoard: null,
  lists: [],
  cards: [],
  loading: false,
  error: null,
  realtimeChannels: [],

  fetchBoards: async () => {
    const { loading } = get();

    // Prevent multiple simultaneous fetches
    if (loading) {
      // Only log once per session to reduce console spam
      const hasLogged = sessionStorage.getItem("boards-loading-logged");
      if (!hasLogged) {
        console.log("ℹ️ Boards already loading, skipping fetch");
        sessionStorage.setItem("boards-loading-logged", "true");
        // Clear the flag after 2 seconds
        setTimeout(() => {
          sessionStorage.removeItem("boards-loading-logged");
        }, 2000);
      }
      return;
    }

    set({ loading: true, error: null });
    try {
      // Get current user first
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error("User not authenticated");

      console.log("🔍 Fetching boards for user:", user.id);
      console.log("👤 User email:", user.email);

      // First, get boards where user is the creator
      const { data: ownedBoards, error: ownedError } = await supabase
        .from("boards")
        .select("*")
        .eq("created_by", user.id)
        .order("created_at", { ascending: false });

      if (ownedError) {
        console.error("❌ Error fetching owned boards:", ownedError);
        throw ownedError;
      }

      // Then, get boards where user is a member (but not the creator)
      const { data: memberBoards, error: memberError } = await supabase
        .from("board_members")
        .select(
          `
          board_id,
          boards!inner(*)
        `
        )
        .eq("user_id", user.id)
        .neq("boards.created_by", user.id);

      if (memberError) {
        console.error("❌ Error fetching member boards:", memberError);
        throw memberError;
      }

      // Combine owned and member boards
      const ownedBoardsList = ownedBoards || [];
      const memberBoardsList = memberBoards?.map((mb) => mb.boards) || [];

      const userBoards = [...ownedBoardsList, ...memberBoardsList];

      // Remove duplicates (in case user is both creator and member)
      const uniqueBoards = userBoards.filter(
        (board, index, self) =>
          index === self.findIndex((b) => b.id === board.id)
      );

      console.log("📊 Owned boards:", ownedBoardsList.length);
      console.log("📊 Member boards:", memberBoardsList.length);
      console.log("📊 Total unique boards:", uniqueBoards.length);
      console.log("✅ Setting user's boards:", uniqueBoards);

      set({ boards: uniqueBoards, loading: false });

      // Preload board member data for all boards (only if we don't already have them)
      if (uniqueBoards.length > 0) {
        const boardIds = uniqueBoards.map((board) => board.id);
        const boardMemberStore = useBoardMemberStore.getState();
        const existingMembers = boardMemberStore.membersByBoard;

        // Only fetch if we don't have members for these boards yet
        const boardsWithoutMembers = boardIds.filter(
          (boardId) =>
            !existingMembers[boardId] || existingMembers[boardId].length === 0
        );

        if (boardsWithoutMembers.length > 0) {
          console.log(
            "🔍 Preloading board members for boards:",
            boardsWithoutMembers
          );
          await boardMemberStore.fetchAllBoardMembers(boardsWithoutMembers);
        } else {
          console.log("ℹ️ Board members already loaded, skipping preload");
        }
      }
    } catch (error: any) {
      console.error("❌ fetchBoards error:", error);
      set({ error: error.message, loading: false });
    }
  },

  createBoard: async (title: string, description = "") => {
    set({ loading: true, error: null });
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("User not authenticated");

      console.log("🔍 Creating board for user:", user.user.id);

      const { data: board, error } = await supabase
        .from("boards")
        .insert({
          title,
          description,
          created_by: user.user.id,
        })
        .select()
        .single();

      if (error) {
        console.error("❌ Error creating board:", error);
        throw error;
      }

      console.log("✅ Board created:", board);

      // Check if user is already a member before adding
      const { data: existingMember } = await supabase
        .from("board_members")
        .select("id")
        .eq("board_id", board.id)
        .eq("user_id", user.user.id)
        .single();

      // Only add as member if not already a member
      if (!existingMember) {
        const { error: memberError } = await supabase
          .from("board_members")
          .insert({
            board_id: board.id,
            user_id: user.user.id,
            role: "owner",
          });

        if (memberError && memberError.code !== "23505") {
          console.error("❌ Error adding creator as owner:", memberError);
        } else {
          console.log("✅ User added as board owner");
        }
      } else {
        console.log("ℹ️ User already a member of this board");
      }

      // Don't update local state here - let real-time subscription handle it
      // This prevents duplicates when real-time updates come in
      set({ loading: false });
    } catch (error: any) {
      console.error("❌ createBoard error:", error);
      set({ error: error.message, loading: false });
    }
  },

  updateBoard: async (id: string, updates: Partial<Board>) => {
    set({ loading: true, error: null });
    try {
      const { data: board, error } = await supabase
        .from("boards")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      const { boards } = get();
      set({
        boards: boards.map((b) => (b.id === id ? board : b)),
        loading: false,
      });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  deleteBoard: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase.from("boards").delete().eq("id", id);

      if (error) throw error;

      const { boards } = get();
      set({
        boards: boards.filter((b) => b.id !== id),
        loading: false,
      });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  setCurrentBoard: (board: Board | null) => set({ currentBoard: board }),

  toggleStarBoard: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const { boards } = get();
      const board = boards.find((b) => b.id === id);
      if (!board) throw new Error("Board not found");

      const newStarredValue = !board.is_starred;

      const { error } = await supabase
        .from("boards")
        .update({ is_starred: newStarredValue })
        .eq("id", id);

      if (error) throw error;

      // Update local state
      set({
        boards: boards.map((b) =>
          b.id === id ? { ...b, is_starred: newStarredValue } : b
        ),
        loading: false,
      });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  fetchLists: async (boardId: string) => {
    set({ loading: true, error: null });
    try {
      const { data: lists, error } = await supabase
        .from("lists")
        .select("*")
        .eq("board_id", boardId)
        .order("position", { ascending: true });

      if (error) throw error;
      set({ lists: lists || [], loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  createList: async (
    boardId: string,
    title: string,
    position: number
  ): Promise<List> => {
    set({ loading: true, error: null });
    try {
      console.log("Creating list in store:", { boardId, title, position });

      // Check if user is authenticated
      const { data: user } = await supabase.auth.getUser();
      console.log("Current user:", user);

      if (!user.user) {
        throw new Error("User not authenticated");
      }

      // Check if board exists and user has access
      const { data: board, error: boardError } = await supabase
        .from("boards")
        .select("*")
        .eq("id", boardId)
        .single();

      if (boardError) {
        console.error("Error fetching board:", boardError);
        throw boardError;
      }

      console.log("Board found:", board);
      console.log("Board created by:", board.created_by);
      console.log("Current user ID:", user.user.id);

      const { data: list, error } = await supabase
        .from("lists")
        .insert({
          title,
          board_id: boardId,
          position,
        })
        .select()
        .single();

      if (error) {
        console.error("Supabase error creating list:", error);
        throw error;
      }

      console.log("List created in database:", list);

      // Don't update local state here - let real-time subscription handle it
      // This prevents duplicates when real-time updates come in
      set({ loading: false });

      return list;
    } catch (error: any) {
      console.error("Error in createList:", error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  updateList: async (id: string, updates: Partial<List>) => {
    set({ loading: true, error: null });
    try {
      const { data: list, error } = await supabase
        .from("lists")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      const { lists } = get();
      set({
        lists: lists.map((l) => (l.id === id ? list : l)),
        loading: false,
      });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  deleteList: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase.from("lists").delete().eq("id", id);

      if (error) throw error;

      const { lists } = get();
      set({
        lists: lists.filter((l) => l.id !== id),
        loading: false,
      });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  moveList: async (listId: string, newPosition: number) => {
    set({ loading: true, error: null });
    try {
      console.log("Moving list:", { listId, newPosition });

      const { lists } = get();
      const listToMove = lists.find((l) => l.id === listId);
      if (!listToMove) {
        throw new Error("List not found");
      }

      // Optimistically update the UI first
      const listsWithoutMoved = lists.filter((l) => l.id !== listId);
      listsWithoutMoved.splice(newPosition, 0, listToMove);

      // Update positions for all lists
      const updatedLists = listsWithoutMoved.map((list, index) => ({
        ...list,
        position: index,
      }));

      set({
        lists: updatedLists,
        loading: false,
      });

      // Then update the server - update all list positions to maintain order
      const { data: list, error } = await supabase
        .from("lists")
        .update({
          position: newPosition,
          updated_at: new Date().toISOString(),
        })
        .eq("id", listId)
        .select()
        .single();

      // Update all other list positions to maintain order
      for (let i = 0; i < updatedLists.length; i++) {
        const listToUpdate = updatedLists[i];
        if (listToUpdate.id !== listId) {
          await supabase
            .from("lists")
            .update({
              position: i,
              updated_at: new Date().toISOString(),
            })
            .eq("id", listToUpdate.id);
        }
      }

      if (error) {
        console.error("Supabase error moving list:", error);
        // Revert the optimistic update on error
        set({
          lists: lists,
          loading: false,
        });
        throw error;
      }

      console.log("✅ List moved successfully:", {
        listId,
        newPosition,
        serverResponse: list,
        updatedLists: updatedLists.map((l) => ({
          id: l.id,
          title: l.title,
          position: l.position,
        })),
      });

      // Update with the server response to ensure consistency
      const { lists: currentLists } = get();
      set({
        lists: currentLists.map((l) => (l.id === listId ? list : l)),
        loading: false,
      });
    } catch (error: any) {
      console.error("Error in moveList:", error);
      set({ error: error.message, loading: false });
    }
  },

  fetchCards: async (listId: string) => {
    set({ loading: true, error: null });
    try {
      const { data: cards, error } = await supabase
        .from("cards")
        .select("*")
        .eq("list_id", listId)
        .order("position", { ascending: true });

      if (error) throw error;
      set({ cards: cards || [], loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  fetchAllCards: async (boardId: string) => {
    set({ loading: true, error: null });
    try {
      // First get all lists for this board
      const { data: lists, error: listsError } = await supabase
        .from("lists")
        .select("id")
        .eq("board_id", boardId);

      if (listsError) throw listsError;

      if (!lists || lists.length === 0) {
        set({ cards: [], loading: false });
        return;
      }

      // Then get all cards for these lists
      const listIds = lists.map((list) => list.id);
      const { data: cards, error: cardsError } = await supabase
        .from("cards")
        .select("*")
        .in("list_id", listIds)
        .order("position", { ascending: true });

      if (cardsError) throw cardsError;
      set({ cards: cards || [], loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  createCard: async (
    listId: string,
    title: string,
    description = "",
    position = 0
  ) => {
    set({ loading: true, error: null });
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("User not authenticated");

      const { data: card, error } = await supabase
        .from("cards")
        .insert({
          title,
          description,
          list_id: listId,
          position,
          created_by: user.user.id,
          tags: [],
        })
        .select()
        .single();

      if (error) throw error;

      // Don't update local state here - let real-time subscription handle it
      // This prevents duplicates when real-time updates come in
      set({ loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  updateCard: async (id: string, updates: Partial<Card>) => {
    set({ loading: true, error: null });
    try {
      const { data: card, error } = await supabase
        .from("cards")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      const { cards } = get();
      set({
        cards: cards.map((c) => (c.id === id ? card : c)),
        loading: false,
      });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  deleteCard: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase.from("cards").delete().eq("id", id);

      if (error) throw error;

      const { cards } = get();
      set({
        cards: cards.filter((c) => c.id !== id),
        loading: false,
      });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  // Helper function to reorder positions in a list
  reorderPositions: (listId: string, excludeCardId?: string) => {
    const { cards } = get();
    const listCards = cards
      .filter((c) => c.list_id === listId && c.id !== excludeCardId)
      .sort((a, b) => a.position - b.position);

    console.log("🔄 Reordering positions for list:", listId, {
      listCards: listCards.map((c) => ({ id: c.id, position: c.position })),
      excludeCardId,
    });

    // Update positions to be sequential
    const updatedCards = cards.map((card) => {
      if (card.list_id === listId && card.id !== excludeCardId) {
        const newPosition = listCards.findIndex((c) => c.id === card.id);
        const finalPosition = newPosition >= 0 ? newPosition : card.position;

        console.log("🔄 Updating card position:", {
          cardId: card.id,
          oldPosition: card.position,
          newPosition: finalPosition,
        });

        return {
          ...card,
          position: finalPosition,
        };
      }
      return card;
    });

    set({ cards: updatedCards });
  },

  getSortedLists: () => {
    const { lists } = get();
    return [...lists].sort((a, b) => a.position - b.position);
  },

  moveCard: async (cardId: string, newListId: string, newPosition: number) => {
    set({ loading: true, error: null });
    try {
      console.log("🚀 Moving card:", { cardId, newListId, newPosition });

      // Get current card info
      const { cards } = get();
      const cardToMove = cards.find((c) => c.id === cardId);
      console.log("📋 Card to move:", cardToMove);

      // Optimistically update the UI first
      if (cardToMove) {
        // Check if this is a same-list reorder
        const isSameListReorder = cardToMove.list_id === newListId;

        if (isSameListReorder) {
          // For same-list reordering, use the helper function
          const updatedCard = {
            ...cardToMove,
            list_id: newListId,
            position: newPosition,
          };

          // Update the moved card
          const updatedCards = cards.map((c) =>
            c.id === cardId ? updatedCard : c
          );

          // Set the updated cards first
          set({ cards: updatedCards });

          // Reorder positions in the target list
          const { reorderPositions } = get();
          reorderPositions(newListId, cardId);

          set({ loading: false });
        } else {
          // Moving between different lists
          const updatedCard = {
            ...cardToMove,
            list_id: newListId,
            position: newPosition,
          };

          // Update the moved card
          const updatedCards = cards.map((c) =>
            c.id === cardId ? updatedCard : c
          );

          // Set the updated cards first
          set({ cards: updatedCards });

          // Reorder positions in both lists
          const { reorderPositions } = get();
          reorderPositions(cardToMove.list_id); // Old list
          reorderPositions(newListId, cardId); // New list

          set({ loading: false });
        }
      }

      // Then update the server - handle position management in application layer
      const { data: card, error } = await supabase
        .from("cards")
        .update({
          list_id: newListId,
          position: newPosition,
          updated_at: new Date().toISOString(),
        })
        .eq("id", cardId)
        .select()
        .single();

      // Update positions of other cards in the target list to maintain order
      const targetListCards = cards.filter(
        (c) => c.list_id === newListId && c.id !== cardId
      );
      for (let i = 0; i < targetListCards.length; i++) {
        const cardToUpdate = targetListCards[i];
        const newPos = i >= newPosition ? i + 1 : i;
        await supabase
          .from("cards")
          .update({
            position: newPos,
            updated_at: new Date().toISOString(),
          })
          .eq("id", cardToUpdate.id);
      }

      if (error) {
        console.error("Supabase error moving card:", error);
        // Revert the optimistic update on error
        const { cards } = get();
        set({
          cards: cards.map((c) => (c.id === cardId ? cardToMove! : c)),
          loading: false,
        });
        throw error;
      }

      console.log("✅ Card moved successfully:", {
        cardId,
        newListId,
        newPosition,
        serverResponse: card,
      });

      // Update with the server response to ensure consistency
      const { cards: currentCards } = get();
      const finalCards = currentCards.map((c) => (c.id === cardId ? card : c));

      console.log("🔄 Final cards after server update:", {
        cardId,
        serverCard: card,
        finalCards: finalCards
          .filter((c) => c.list_id === newListId)
          .map((c) => ({ id: c.id, position: c.position })),
      });

      set({
        cards: finalCards,
        loading: false,
      });
    } catch (error: any) {
      console.error("Error in moveCard:", error);
      set({ error: error.message, loading: false });
    }
  },

  setLoading: (loading: boolean) => set({ loading }),
  setError: (error: string | null) => set({ error }),

  // Real-time subscriptions
  subscribeToBoards: () => {
    const { realtimeChannels } = get();

    // Unsubscribe from existing board subscriptions
    realtimeChannels.forEach((channel) => {
      if (channel.topic === "boards") {
        supabase.removeChannel(channel);
      }
    });

    // Subscribe to boards table changes
    const boardsChannel = supabase
      .channel("boards")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "boards",
        },
        (payload) => {
          console.log("🔄 Boards real-time update:", payload);
          const { boards } = get();

          switch (payload.eventType) {
            case "INSERT":
              // New board created - check if it already exists to prevent duplicates
              const existingBoard = boards.find(
                (board) => board.id === payload.new.id
              );
              if (!existingBoard) {
                console.log(
                  "🔄 Adding new board via real-time:",
                  payload.new.id
                );
                set({ boards: [...boards, payload.new as Board] });
              } else {
                console.log(
                  "🔄 Board already exists, skipping duplicate:",
                  payload.new.id
                );
              }
              break;
            case "UPDATE":
              // Board updated
              set({
                boards: boards.map((board) =>
                  board.id === payload.new.id ? (payload.new as Board) : board
                ),
              });
              break;
            case "DELETE":
              // Board deleted
              set({
                boards: boards.filter((board) => board.id !== payload.old.id),
              });
              break;
          }
        }
      )
      .subscribe((status) => {
        console.log("🔄 Boards subscription status:", status);
      });

    set({ realtimeChannels: [...realtimeChannels, boardsChannel] });
  },

  subscribeToBoard: (boardId: string) => {
    const { realtimeChannels } = get();

    // Unsubscribe from existing board-specific subscriptions
    realtimeChannels.forEach((channel) => {
      if (channel.topic === `board-${boardId}`) {
        supabase.removeChannel(channel);
      }
    });

    // Subscribe to specific board changes
    const boardChannel = supabase
      .channel(`board-${boardId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "boards",
          filter: `id=eq.${boardId}`,
        },
        (payload) => {
          console.log("🔄 Board real-time update:", payload);
          const { currentBoard } = get();

          if (currentBoard && currentBoard.id === boardId) {
            set({ currentBoard: payload.new as Board });
          }
        }
      )
      .subscribe((status) => {
        console.log("🔄 Board subscription status:", status);
      });

    set({ realtimeChannels: [...realtimeChannels, boardChannel] });
  },

  subscribeToLists: (boardId: string) => {
    const { realtimeChannels } = get();

    // Unsubscribe from existing list subscriptions
    realtimeChannels.forEach((channel) => {
      if (channel.topic === `lists-${boardId}`) {
        supabase.removeChannel(channel);
      }
    });

    // Subscribe to lists table changes for specific board
    const listsChannel = supabase
      .channel(`lists-${boardId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "lists",
          filter: `board_id=eq.${boardId}`,
        },
        (payload) => {
          console.log("🔄 Lists real-time update:", payload);
          const { lists } = get();

          switch (payload.eventType) {
            case "INSERT":
              // New list created - check if it already exists to prevent duplicates
              const existingList = lists.find(
                (list) => list.id === payload.new.id
              );
              if (!existingList) {
                console.log(
                  "🔄 Adding new list via real-time:",
                  payload.new.id
                );
                set({ lists: [...lists, payload.new as List] });
              } else {
                console.log(
                  "🔄 List already exists, skipping duplicate:",
                  payload.new.id
                );
              }
              break;
            case "UPDATE":
              // List updated
              const updatedLists = lists.map((list) =>
                list.id === payload.new.id ? (payload.new as List) : list
              );

              console.log("🔄 Updating list via real-time:", {
                listId: payload.new.id,
                oldPosition: lists.find((l) => l.id === payload.new.id)
                  ?.position,
                newPosition: payload.new.position,
                updatedLists: updatedLists.map((l) => ({
                  id: l.id,
                  title: l.title,
                  position: l.position,
                })),
              });

              // Sort the updated lists by position to ensure proper order
              const sortedLists = updatedLists.sort(
                (a, b) => a.position - b.position
              );

              console.log(
                "🔄 Setting sorted lists:",
                sortedLists.map((l) => ({
                  id: l.id,
                  title: l.title,
                  position: l.position,
                }))
              );

              set({
                lists: sortedLists,
              });
              break;
            case "DELETE":
              // List deleted
              set({
                lists: lists.filter((list) => list.id !== payload.old.id),
              });
              break;
          }
        }
      )
      .subscribe((status) => {
        console.log("🔄 Lists subscription status:", status);
      });

    set({ realtimeChannels: [...realtimeChannels, listsChannel] });
  },

  subscribeToCards: (boardId: string) => {
    const { realtimeChannels } = get();

    // Unsubscribe from existing card subscriptions
    realtimeChannels.forEach((channel) => {
      if (channel.topic === `cards-${boardId}`) {
        supabase.removeChannel(channel);
      }
    });

    // Subscribe to cards table changes for specific board
    const cardsChannel = supabase
      .channel(`cards-${boardId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "cards",
        },
        (payload) => {
          console.log("🔄 Cards real-time update:", payload);
          const { cards, lists } = get();

          // Check if the card belongs to the current board
          const cardList = lists.find(
            (list) => list.id === payload.new?.list_id || payload.old?.list_id
          );
          if (!cardList || cardList.board_id !== boardId) return;

          switch (payload.eventType) {
            case "INSERT":
              // New card created - check if it already exists to prevent duplicates
              const existingInsertedCard = cards.find(
                (card) => card.id === payload.new.id
              );
              if (!existingInsertedCard) {
                console.log(
                  "🔄 Adding new card via real-time:",
                  payload.new.id
                );
                set({ cards: [...cards, payload.new as Card] });
              } else {
                console.log(
                  "🔄 Card already exists, skipping duplicate:",
                  payload.new.id
                );
              }
              break;
            case "UPDATE":
              // Card updated - be more careful about position updates
              const updatedCard = payload.new as Card;
              const existingUpdatedCard = cards.find(
                (card) => card.id === updatedCard.id
              );

              if (existingUpdatedCard) {
                // Only update if the server data is more recent or if position has changed
                const serverTimestamp = new Date(payload.commit_timestamp);
                const localTimestamp = new Date(
                  existingUpdatedCard.updated_at || 0
                );

                if (
                  serverTimestamp > localTimestamp ||
                  existingUpdatedCard.position !== updatedCard.position ||
                  existingUpdatedCard.list_id !== updatedCard.list_id
                ) {
                  console.log("🔄 Updating card via real-time:", {
                    cardId: updatedCard.id,
                    oldPosition: existingUpdatedCard.position,
                    newPosition: updatedCard.position,
                    oldListId: existingUpdatedCard.list_id,
                    newListId: updatedCard.list_id,
                  });

                  set({
                    cards: cards.map((card) =>
                      card.id === updatedCard.id ? updatedCard : card
                    ),
                  });
                } else {
                  console.log(
                    "🔄 Skipping real-time update - local data is more recent"
                  );
                }
              } else {
                // Card doesn't exist locally, add it
                set({
                  cards: [...cards, updatedCard],
                });
              }
              break;
            case "DELETE":
              // Card deleted
              set({
                cards: cards.filter((card) => card.id !== payload.old.id),
              });
              break;
          }
        }
      )
      .subscribe((status) => {
        console.log("🔄 Cards subscription status:", status);
      });

    set({ realtimeChannels: [...realtimeChannels, cardsChannel] });
  },

  unsubscribeFromAll: () => {
    const { realtimeChannels } = get();

    realtimeChannels.forEach((channel) => {
      supabase.removeChannel(channel);
    });

    set({ realtimeChannels: [] });
  },
}));
