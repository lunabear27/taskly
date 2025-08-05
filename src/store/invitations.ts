import { create } from "zustand";
import { supabase } from "../lib/supabase";
import { useNotificationStore } from "./notifications";

interface Invitation {
  id: string;
  board_id: string;
  invited_by: string;
  invited_email: string;
  role: "admin" | "member";
  status: "pending" | "accepted" | "rejected" | "expired";
  expires_at: string;
  created_at: string;
  updated_at: string;
  board?: {
    id: string;
    title: string;
  };
  invited_by_user?: {
    id: string;
    email: string;
  };
}

interface InvitationState {
  invitations: Invitation[];
  loading: boolean;
  error: string | null;

  // Actions
  fetchInvitations: () => Promise<void>;
  createInvitation: (
    boardId: string,
    invitedEmail: string,
    role: "admin" | "member"
  ) => Promise<Invitation | null>;
  acceptInvitation: (invitationId: string) => Promise<void>;
  rejectInvitation: (invitationId: string) => Promise<void>;
  deleteInvitation: (invitationId: string) => Promise<void>;
  resendInvitation: (invitationId: string) => Promise<void>;

  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useInvitationStore = create<InvitationState>((set, get) => ({
  invitations: [],
  loading: false,
  error: null,

  fetchInvitations: async () => {
    set({ loading: true, error: null });
    try {
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) throw new Error("User not authenticated");

      const { data: invitations, error } = await supabase
        .from("invitations")
        .select(
          `
          *,
          board:boards(id, title)
        `
        )
        .eq("invited_email", currentUser.user.email)
        .order("created_at", { ascending: false });

      if (error) throw error;

      console.log(
        "📧 Fetched invitations:",
        invitations?.map((i) => ({
          id: i.id,
          status: i.status,
          email: i.invited_email,
        }))
      );

      set({ invitations: invitations || [], loading: false });
    } catch (error: any) {
      console.error("❌ Error fetching invitations:", error);
      set({ error: error.message, loading: false });
    }
  },

  createInvitation: async (
    boardId: string,
    invitedEmail: string,
    role: "admin" | "member"
  ) => {
    set({ loading: true, error: null });
    try {
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) throw new Error("User not authenticated");

      // Check if the invited user is already a member (only if they exist in the system)
      const { data: userLookup } = await supabase.rpc("find_user_by_email", {
        email_address: invitedEmail.trim().toLowerCase(),
      });

      if (userLookup) {
        // Check if the invited user is already a member
        try {
          const { data: existingMember } = await supabase
            .from("board_members")
            .select("*")
            .eq("board_id", boardId)
            .eq("user_id", userLookup)
            .single();

          if (existingMember) {
            throw new Error("This user is already a member of this board");
          }
        } catch (error: any) {
          // If we get a 406 error, assume the user is not a member and continue
          if (error.code === "PGRST116" || error.message?.includes("406")) {
            console.log(
              "⚠️ Could not check existing member status, proceeding with invitation"
            );
          } else {
            throw error;
          }
        }
      }

      // Check if invitation already exists
      try {
        const { data: existingInvitation } = await supabase
          .from("invitations")
          .select("*")
          .eq("board_id", boardId)
          .eq("invited_email", invitedEmail)
          .eq("status", "pending")
          .single();

        if (existingInvitation) {
          throw new Error(
            "An invitation has already been sent to this email. Please wait for a response or cancel the existing invitation first."
          );
        }
      } catch (error: any) {
        // If we get a 406 error, assume no existing invitation and continue
        if (error.code === "PGRST116" || error.message?.includes("406")) {
          console.log(
            "⚠️ Could not check existing invitation status, proceeding with new invitation"
          );
        } else {
          throw error;
        }
      }

      // Check if there's a rejected invitation for this user and board
      try {
        const { data: rejectedInvitation } = await supabase
          .from("invitations")
          .select("*")
          .eq("board_id", boardId)
          .eq("invited_email", invitedEmail)
          .eq("status", "rejected")
          .single();

        // If there's a rejected invitation, delete it first
        if (rejectedInvitation) {
          await supabase
            .from("invitations")
            .delete()
            .eq("id", rejectedInvitation.id);
        }
      } catch (error: any) {
        // If we get a 406 error, assume no rejected invitation and continue
        if (error.code === "PGRST116" || error.message?.includes("406")) {
          console.log("⚠️ Could not check rejected invitations, proceeding");
        } else {
          console.log("⚠️ Error checking rejected invitations:", error);
        }
      }

      // Also check for accepted invitations that might need to be cleaned up
      try {
        const { data: acceptedInvitation } = await supabase
          .from("invitations")
          .select("*")
          .eq("board_id", boardId)
          .eq("invited_email", invitedEmail)
          .eq("status", "accepted")
          .single();

        if (acceptedInvitation) {
          await supabase
            .from("invitations")
            .delete()
            .eq("id", acceptedInvitation.id);
        }
      } catch (error: any) {
        // If we get a 406 error, assume no accepted invitation and continue
        if (error.code === "PGRST116" || error.message?.includes("406")) {
          console.log("⚠️ Could not check accepted invitations, proceeding");
        } else {
          console.log("⚠️ Error checking accepted invitations:", error);
        }
      }

      // Create invitation
      const { data: invitation, error } = await supabase
        .from("invitations")
        .insert({
          board_id: boardId,
          invited_by: currentUser.user.id,
          invited_email: invitedEmail.trim().toLowerCase(),
          role: role,
        })
        .select("*")
        .single();

      if (error) throw error;

      console.log("✅ Created invitation:", {
        id: invitation.id,
        status: invitation.status,
        email: invitation.invited_email,
      });

      // Send notification to the invited user if they exist in the system
      if (userLookup) {
        const notificationStore = useNotificationStore.getState();
        await notificationStore.createNotification(
          userLookup,
          "invitation",
          "Board Invitation",
          `You've been invited to join a board as ${role}`,
          {
            invitation_id: invitation.id,
            board_id: boardId,
            role: role,
            status: invitation.status,
            invited_by: currentUser.user.id,
            invited_by_email: currentUser.user.email,
          }
        );
      }

      // Refresh invitations
      await get().fetchInvitations();

      return invitation;
    } catch (error: any) {
      console.error("❌ Error creating invitation:", error);
      set({ error: error.message, loading: false });
      return null;
    }
  },

  acceptInvitation: async (invitationId: string) => {
    set({ loading: true, error: null });
    try {
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) throw new Error("User not authenticated");

      // Get invitation details
      const { data: invitation, error: fetchError } = await supabase
        .from("invitations")
        .select("*")
        .eq("id", invitationId)
        .single();

      if (fetchError) throw fetchError;

      if (!invitation) {
        throw new Error("Invitation not found");
      }

      console.log(
        "🔍 Invitation status:",
        invitation.status,
        "for invitation:",
        invitationId
      );

      if (invitation.status !== "pending") {
        throw new Error(
          `Invitation is no longer pending. Current status: ${invitation.status}`
        );
      }

      // Add user to board members with email
      const { error: memberError } = await supabase
        .from("board_members")
        .insert({
          board_id: invitation.board_id,
          user_id: currentUser.user.id,
          role: invitation.role,
          user_email: currentUser.user.email, // Store the email
        });

      if (memberError) throw memberError;

      // Update invitation status
      const { error: updateError } = await supabase
        .from("invitations")
        .update({
          status: "accepted",
          updated_at: new Date().toISOString(),
        })
        .eq("id", invitationId);

      if (updateError) throw updateError;

      // Send notification to the person who sent the invitation
      const notificationStore = useNotificationStore.getState();
      await notificationStore.createNotification(
        invitation.invited_by,
        "invitation_accepted",
        "Invitation Accepted",
        `${currentUser.user.email} accepted your invitation to join the board`,
        {
          board_id: invitation.board_id,
          accepted_by: currentUser.user.id,
          accepted_by_email: currentUser.user.email,
        }
      );

      // Remove the original invitation notification since it's no longer pending
      try {
        const { data: notifications } = await supabase
          .from("notifications")
          .select("*")
          .eq("user_id", currentUser.user.id)
          .eq("type", "invitation")
          .eq("data->>invitation_id", invitation.id);

        if (notifications && notifications.length > 0) {
          await notificationStore.deleteNotification(notifications[0].id);
        }
      } catch (error) {
        console.log("⚠️ Could not delete invitation notification:", error);
      }

      // Refresh invitations
      await get().fetchInvitations();
    } catch (error: any) {
      console.error("❌ Error accepting invitation:", error);
      set({ error: error.message, loading: false });
    }
  },

  rejectInvitation: async (invitationId: string) => {
    set({ loading: true, error: null });
    try {
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) throw new Error("User not authenticated");

      // Get invitation details
      const { data: invitation, error: fetchError } = await supabase
        .from("invitations")
        .select("*")
        .eq("id", invitationId)
        .single();

      if (fetchError) throw fetchError;

      if (!invitation) {
        throw new Error("Invitation not found");
      }

      // Update invitation status
      const { error: updateError } = await supabase
        .from("invitations")
        .update({
          status: "rejected",
          updated_at: new Date().toISOString(),
        })
        .eq("id", invitationId);

      if (updateError) throw updateError;

      // Send notification to the person who sent the invitation
      const notificationStore = useNotificationStore.getState();
      await notificationStore.createNotification(
        invitation.invited_by,
        "invitation_rejected",
        "Invitation Rejected",
        `${currentUser.user.email} declined your invitation to join the board`,
        {
          board_id: invitation.board_id,
          rejected_by: currentUser.user.id,
          rejected_by_email: currentUser.user.email,
        }
      );

      // Remove the original invitation notification since it's no longer pending
      try {
        const { data: notifications } = await supabase
          .from("notifications")
          .select("*")
          .eq("user_id", currentUser.user.id)
          .eq("type", "invitation")
          .eq("data->>invitation_id", invitation.id);

        if (notifications && notifications.length > 0) {
          await notificationStore.deleteNotification(notifications[0].id);
        }
      } catch (error) {
        console.log("⚠️ Could not delete invitation notification:", error);
      }

      // Refresh invitations
      await get().fetchInvitations();
    } catch (error: any) {
      console.error("❌ Error rejecting invitation:", error);
      set({ error: error.message, loading: false });
    }
  },

  deleteInvitation: async (invitationId: string) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from("invitations")
        .delete()
        .eq("id", invitationId);

      if (error) throw error;

      // Refresh invitations
      await get().fetchInvitations();
    } catch (error: any) {
      console.error("❌ Error deleting invitation:", error);
      set({ error: error.message, loading: false });
    }
  },

  resendInvitation: async (invitationId: string) => {
    set({ loading: true, error: null });
    try {
      // Get invitation details
      const { data: invitation, error: fetchError } = await supabase
        .from("invitations")
        .select("*")
        .eq("id", invitationId)
        .single();

      if (fetchError) throw fetchError;

      if (!invitation) {
        throw new Error("Invitation not found");
      }

      // Update invitation to extend expiry
      const { error: updateError } = await supabase
        .from("invitations")
        .update({
          expires_at: new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000
          ).toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", invitationId);

      if (updateError) throw updateError;

      // Try to find the invited user and send them a notification
      const { data: userLookup } = await supabase.rpc("find_user_by_email", {
        email_address: invitation.invited_email,
      });

      if (userLookup) {
        // User exists - send them a notification
        const notificationStore = useNotificationStore.getState();
        await notificationStore.createNotification(
          userLookup,
          "invitation",
          "Board Invitation (Resent)",
          `You've been invited to join a board as ${invitation.role}`,
          {
            invitation_id: invitation.id,
            board_id: invitation.board_id,
            role: invitation.role,
            invited_by: invitation.invited_by,
          }
        );
      }

      // Refresh invitations
      await get().fetchInvitations();
    } catch (error: any) {
      console.error("❌ Error resending invitation:", error);
      set({ error: error.message, loading: false });
    }
  },

  setLoading: (loading: boolean) => set({ loading }),
  setError: (error: string | null) => set({ error }),
}));
