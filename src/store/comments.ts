import { create } from "zustand";
import { supabase } from "../lib/supabase";
import type { Comment } from "../types";

interface CommentState {
  comments: Comment[];
  loading: boolean;
  error: string | null;
  realtimeChannels: any[];

  // Comment actions
  fetchComments: (cardId: string) => Promise<void>;
  createComment: (cardId: string, content: string) => Promise<Comment | null>;
  updateComment: (id: string, content: string) => Promise<void>;
  deleteComment: (id: string) => Promise<void>;

  // Real-time actions
  subscribeToComments: (cardId: string) => void;
  unsubscribeFromComments: () => void;

  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useCommentStore = create<CommentState>((set, get) => ({
  comments: [],
  loading: false,
  error: null,
  realtimeChannels: [],

  fetchComments: async (cardId: string) => {
    set({ loading: true, error: null });
    try {
      console.log("🔍 Fetching comments for cardId:", cardId);

      const { data: comments, error } = await supabase
        .from("comments")
        .select("*")
        .eq("card_id", cardId)
        .order("created_at", { ascending: true });

      console.log("📊 Comments fetch result:", { comments, error });

      if (error) throw error;

      // Get the board_id for this card to fetch user data
      const { data: card } = await supabase
        .from("cards")
        .select("list_id")
        .eq("id", cardId)
        .single();

      let boardId = null;
      if (card) {
        const { data: list } = await supabase
          .from("lists")
          .select("board_id")
          .eq("id", card.list_id)
          .single();
        boardId = list?.board_id;
      }

      // Get user data for each comment (same approach as assignees)
      const { data: currentUser } = await supabase.auth.getUser();

      // Get all board members for this board to map user data
      let boardMembers: any[] = [];
      if (boardId) {
        const { data: members } = await supabase
          .from("board_members")
          .select("*")
          .eq("board_id", boardId);
        boardMembers = members || [];
      }

      const commentsWithUsers = (comments || []).map((comment) => {
        // If this is the current user, use their real info
        if (currentUser?.user?.id === comment.user_id) {
          return {
            ...comment,
            user: {
              id: currentUser.user.id,
              email: currentUser.user.email,
              username:
                currentUser.user.email?.split("@")[0] ||
                `User ${currentUser.user.id.substring(0, 8)}`,
              full_name:
                currentUser.user.email?.split("@")[0] ||
                `User ${currentUser.user.id.substring(0, 8)}`,
            },
          };
        }

        // For other users, get their real data from board_members
        const boardMember = boardMembers.find(
          (member) => member.user_id === comment.user_id
        );
        let userEmail = `User ${comment.user_id.substring(0, 8)}`;
        let username = `User ${comment.user_id.substring(0, 8)}`;

        if (boardMember && boardMember.user_email) {
          userEmail = boardMember.user_email;
          username = userEmail.includes("@")
            ? userEmail.split("@")[0]
            : `User ${comment.user_id.substring(0, 8)}`;
        }

        return {
          ...comment,
          user: {
            id: comment.user_id,
            email: userEmail,
            username: username,
            full_name: username,
          },
        };
      });

      set({ comments: commentsWithUsers, loading: false });
      console.log("✅ Comments set in store:", commentsWithUsers);
    } catch (error: any) {
      console.error("❌ Error fetching comments:", error);
      set({ error: error.message, loading: false });
    }
  },

  createComment: async (cardId: string, content: string) => {
    set({ loading: true, error: null });
    try {
      console.log(
        "➕ Creating comment for cardId:",
        cardId,
        "content:",
        content
      );

      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("User not authenticated");

      console.log("👤 Current user:", user.user);

      // First, create the comment without the user join
      const { data: comment, error } = await supabase
        .from("comments")
        .insert({
          content,
          card_id: cardId,
          user_id: user.user.id,
        })
        .select("*")
        .single();

      console.log("📝 Comment creation result:", { comment, error });

      if (error) throw error;

      console.log("✅ Comment created successfully:", comment);

      // Refresh comments to ensure we have the latest data with user info
      await get().fetchComments(cardId);

      return comment;
    } catch (error: any) {
      console.error("❌ Error creating comment:", error);
      set({ error: error.message, loading: false });
      return null;
    }
  },

  updateComment: async (id: string, content: string) => {
    set({ loading: true, error: null });
    try {
      const { data: comment, error } = await supabase
        .from("comments")
        .update({ content })
        .eq("id", id)
        .select("*")
        .single();

      if (error) throw error;

      // Refresh comments to get the updated data with user info
      const { comments } = get();
      const currentCardId = comments.length > 0 ? comments[0].card_id : null;
      if (currentCardId) {
        await get().fetchComments(currentCardId);
      }
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  deleteComment: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase.from("comments").delete().eq("id", id);
      if (error) throw error;

      // Refresh comments to get the updated data
      const { comments } = get();
      const currentCardId = comments.length > 0 ? comments[0].card_id : null;
      if (currentCardId) {
        await get().fetchComments(currentCardId);
      }
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  setLoading: (loading: boolean) => set({ loading }),
  setError: (error: string | null) => set({ error }),

  // Real-time subscriptions
  subscribeToComments: (cardId: string) => {
    const { realtimeChannels } = get();

    // Unsubscribe from existing comment subscriptions
    realtimeChannels.forEach((channel) => {
      if (channel.topic === `comments-${cardId}`) {
        supabase.removeChannel(channel);
      }
    });

    // Subscribe to comments table changes for specific card
    const commentsChannel = supabase
      .channel(`comments-${cardId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "comments",
          filter: `card_id=eq.${cardId}`,
        },
        (payload) => {
          console.log("🔄 Comments real-time update:", payload);
          const { comments } = get();

          switch (payload.eventType) {
            case "INSERT":
              // New comment created - fetch updated comments to get user data
              get().fetchComments(cardId);
              break;
            case "UPDATE":
              // Comment updated - fetch updated comments to get user data
              get().fetchComments(cardId);
              break;
            case "DELETE":
              // Comment deleted - fetch updated comments to get user data
              get().fetchComments(cardId);
              break;
          }
        }
      )
      .subscribe();

    set({ realtimeChannels: [...realtimeChannels, commentsChannel] });
  },

  unsubscribeFromComments: () => {
    const { realtimeChannels } = get();

    realtimeChannels.forEach((channel) => {
      if (channel.topic.startsWith("comments-")) {
        supabase.removeChannel(channel);
      }
    });

    set({ realtimeChannels: [] });
  },
}));
