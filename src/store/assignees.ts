import { create } from "zustand";
import { supabase } from "../lib/supabase";
import type { Assignee } from "../types";
import { useUserProfileStore } from "./userProfile";

interface AssigneeState {
  assignees: Assignee[];
  loading: boolean;
  error: string | null;

  // Assignee actions
  fetchAssignees: (cardId: string) => Promise<void>;
  assignUser: (cardId: string, userId: string) => Promise<Assignee | null>;
  unassignUser: (cardId: string, userId: string) => Promise<void>;
  getBoardMembers: (boardId: string) => Promise<any[]>;

  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAssigneeStore = create<AssigneeState>((set, get) => ({
  assignees: [],
  loading: false,
  error: null,

  fetchAssignees: async (cardId: string) => {
    set({ loading: true, error: null });
    try {
      console.log("🔍 Fetching assignees for cardId:", cardId);

      // First, fetch assignees
      const { data: assignees, error } = await supabase
        .from("assignees")
        .select("*")
        .eq("card_id", cardId)
        .order("assigned_at", { ascending: true });

      console.log("📊 Assignees fetch result:", { assignees, error });

      if (error) throw error;

      // Get user data for each assignee (same approach as BoardMemberManager)
      const { data: currentUser } = await supabase.auth.getUser();

      const assigneesWithUsers = (assignees || []).map((assignee) => {
        // If this is the current user, use their real info
        if (currentUser?.user?.id === assignee.user_id) {
          return {
            ...assignee,
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

        // For other users, use stored email if available (like BoardMemberManager)
        const userEmail =
          assignee.user_email || `User ${assignee.user_id.substring(0, 8)}`;
        const username = userEmail.includes("@")
          ? userEmail.split("@")[0]
          : `User ${assignee.user_id.substring(0, 8)}`;

        return {
          ...assignee,
          user: {
            id: assignee.user_id,
            email: userEmail,
            username: username,
            full_name: username,
          },
        };
      });

      set({ assignees: assigneesWithUsers, loading: false });
      console.log("✅ Assignees set in store:", assigneesWithUsers);
    } catch (error: any) {
      console.error("❌ Error fetching assignees:", error);
      set({ error: error.message, loading: false });
    }
  },

  assignUser: async (cardId: string, userId: string) => {
    set({ loading: true, error: null });
    try {
      console.log("➕ Assigning user to card:", { cardId, userId });

      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) throw new Error("User not authenticated");

      // Get the real user data from board_members to store the correct email
      let userEmail = currentUser.user.email;

      // If we're assigning a different user, get their real data from board_members
      if (currentUser.user.id !== userId) {
        // Get the board_id from the card
        const { data: card } = await supabase
          .from("cards")
          .select("list_id")
          .eq("id", cardId)
          .single();

        if (card) {
          // Get the list's board_id
          const { data: list } = await supabase
            .from("lists")
            .select("board_id")
            .eq("id", card.list_id)
            .single();

          if (list) {
            // Get the user's real data from board_members
            const { data: boardMember } = await supabase
              .from("board_members")
              .select("*")
              .eq("board_id", list.board_id)
              .eq("user_id", userId)
              .single();

            if (boardMember && boardMember.user_email) {
              userEmail = boardMember.user_email;
            } else {
              // Fallback if we can't get the real email
              userEmail = `user-${userId.substring(0, 8)}@example.com`;
            }
          }
        }
      }

      const { data: assignee, error } = await supabase
        .from("assignees")
        .insert({
          card_id: cardId,
          user_id: userId,
          assigned_by: currentUser.user.id,
          user_email: userEmail, // Store the real email
        })
        .select("*")
        .single();

      console.log("📝 Assignee creation result:", { assignee, error });

      if (error) throw error;

      console.log("✅ User assigned successfully:", assignee);

      // Refresh assignees to ensure we have the latest data
      await get().fetchAssignees(cardId);

      return assignee;
    } catch (error: any) {
      console.error("❌ Error assigning user:", error);
      set({ error: error.message, loading: false });
      return null;
    }
  },

  unassignUser: async (cardId: string, userId: string) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from("assignees")
        .delete()
        .eq("card_id", cardId)
        .eq("user_id", userId);

      if (error) throw error;

      // Refresh assignees to get the updated data
      await get().fetchAssignees(cardId);
    } catch (error: any) {
      console.error("❌ Error unassigning user:", error);
      set({ error: error.message, loading: false });
    }
  },

  getBoardMembers: async (boardId: string) => {
    try {
      // First, fetch board members with user_email field
      const { data: members, error } = await supabase
        .from("board_members")
        .select("*")
        .eq("board_id", boardId);

      if (error) throw error;

      // Get user data for each member (same approach as BoardMemberManager)
      const { data: currentUser } = await supabase.auth.getUser();

      const membersWithUsers = (members || []).map((member) => {
        // If this is the current user, use their real info
        if (currentUser?.user?.id === member.user_id) {
          return {
            ...member,
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

        // For other users, use stored email if available (like BoardMemberManager)
        const userEmail =
          member.user_email || `User ${member.user_id.substring(0, 8)}`;
        const username = userEmail.includes("@")
          ? userEmail.split("@")[0]
          : `User ${member.user_id.substring(0, 8)}`;

        return {
          ...member,
          user: {
            id: member.user_id,
            email: userEmail,
            username: username,
            full_name: username,
          },
        };
      });

      return membersWithUsers;
    } catch (error: any) {
      console.error("❌ Error fetching board members:", error);
      return [];
    }
  },

  setLoading: (loading: boolean) => set({ loading }),
  setError: (error: string | null) => set({ error }),
}));
