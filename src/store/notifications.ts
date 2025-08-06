import { create } from "zustand";
import { supabase } from "../lib/supabase";
import { logger } from "../lib/logger";

interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  data: any;
  is_read: boolean;
  created_at: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;

  // Actions
  fetchNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  createNotification: (
    userId: string,
    type: string,
    title: string,
    message: string,
    data?: any
  ) => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  updateNotification: (
    notificationId: string,
    updates: Partial<Notification>
  ) => Promise<void>;

  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => {
  let subscription: any = null;

  const setupRealtimeSubscription = async () => {
    const { data: currentUser } = await supabase.auth.getUser();
    if (!currentUser.user) return;

    // Clean up existing subscription
    if (subscription) {
      subscription.unsubscribe();
    }

    // Set up real-time subscription for notifications
    subscription = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${currentUser.user.id}`,
        },
        (payload) => {
          logger.realtime("Notification change", {
            eventType: payload.eventType,
          });
          // Refresh notifications when there's a change
          get().fetchNotifications();
        }
      )
      .subscribe();
  };

  return {
    notifications: [],
    unreadCount: 0,
    loading: false,
    error: null,

    fetchNotifications: async () => {
      set({ loading: true, error: null });
      try {
        const { data: currentUser } = await supabase.auth.getUser();
        if (!currentUser.user) throw new Error("User not authenticated");

        const { data: notifications, error } = await supabase
          .from("notifications")
          .select("*")
          .eq("user_id", currentUser.user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;

        const unreadCount =
          notifications?.filter((n) => !n.is_read).length || 0;

        set({
          notifications: notifications || [],
          unreadCount,
          loading: false,
        });

        // Set up real-time subscription after fetching
        await setupRealtimeSubscription();
      } catch (error: any) {
        logger.error("Error fetching notifications", error);
        set({ error: error.message, loading: false });
      }
    },

    markAsRead: async (notificationId: string) => {
      try {
        const { error } = await supabase
          .from("notifications")
          .update({ is_read: true })
          .eq("id", notificationId);

        if (error) throw error;

        // Update local state
        const updatedNotifications = get().notifications.map((n) =>
          n.id === notificationId ? { ...n, is_read: true } : n
        );

        const unreadCount = updatedNotifications.filter(
          (n) => !n.is_read
        ).length;

        set({ notifications: updatedNotifications, unreadCount });
      } catch (error: any) {
        logger.error("Error marking notification as read", error);
        set({ error: error.message });
      }
    },

    markAllAsRead: async () => {
      try {
        const { data: currentUser } = await supabase.auth.getUser();
        if (!currentUser.user) throw new Error("User not authenticated");

        const { error } = await supabase
          .from("notifications")
          .update({ is_read: true })
          .eq("user_id", currentUser.user.id)
          .eq("is_read", false);

        if (error) throw error;

        // Update local state
        const updatedNotifications = get().notifications.map((n) => ({
          ...n,
          is_read: true,
        }));

        set({ notifications: updatedNotifications, unreadCount: 0 });
      } catch (error: any) {
        logger.error("Error marking all notifications as read", error);
        set({ error: error.message });
      }
    },

    createNotification: async (
      userId: string,
      type: string,
      title: string,
      message: string,
      data: any = {}
    ) => {
      try {
        const { error } = await supabase.from("notifications").insert({
          user_id: userId,
          type,
          title,
          message,
          data,
        });

        if (error) throw error;

        // Refresh notifications if this is for the current user
        const { data: currentUser } = await supabase.auth.getUser();
        if (currentUser.user && currentUser.user.id === userId) {
          await get().fetchNotifications();
        }
      } catch (error: any) {
        logger.error("Error creating notification", error);
        set({ error: error.message });
      }
    },

    deleteNotification: async (notificationId: string) => {
      try {
        const { error } = await supabase
          .from("notifications")
          .delete()
          .eq("id", notificationId);

        if (error) throw error;

        // Update local state
        const updatedNotifications = get().notifications.filter(
          (n) => n.id !== notificationId
        );

        const unreadCount = updatedNotifications.filter(
          (n) => !n.is_read
        ).length;

        set({ notifications: updatedNotifications, unreadCount });
      } catch (error: any) {
        logger.error("Error deleting notification", error);
        set({ error: error.message });
      }
    },

    updateNotification: async (
      notificationId: string,
      updates: Partial<Notification>
    ) => {
      try {
        const { error } = await supabase
          .from("notifications")
          .update(updates)
          .eq("id", notificationId);

        if (error) throw error;

        // Update local state
        const updatedNotifications = get().notifications.map((n) =>
          n.id === notificationId ? { ...n, ...updates } : n
        );

        set({ notifications: updatedNotifications });
      } catch (error: any) {
        logger.error("Error updating notification", error);
        set({ error: error.message });
      }
    },

    setLoading: (loading: boolean) => set({ loading }),
    setError: (error: string | null) => set({ error }),
  };
});
