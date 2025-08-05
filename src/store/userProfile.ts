import { create } from "zustand";
import { supabase } from "../lib/supabase";

interface UserProfile {
  id: string;
  user_id: string;
  username?: string;
  display_name?: string;
  email?: string;
  avatar_url?: string;
  bio?: string;
  created_at: string;
  updated_at: string;
}

interface UserProfileState {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;

  // Actions
  fetchProfile: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  updateAvatar: (file: File) => Promise<string | null>;
  deleteAvatar: () => Promise<void>;
  getAvatarUrl: (email: string, customUrl?: string) => string;

  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useUserProfileStore = create<UserProfileState>((set, get) => ({
  profile: null,
  loading: false,
  error: null,

  fetchProfile: async () => {
    set({ loading: true, error: null });
    try {
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) throw new Error("User not authenticated");

      // Try to get existing profile
      const { data: profile, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", currentUser.user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      if (!profile) {
        // Create default profile
        const { data: newProfile, error: createError } = await supabase
          .from("user_profiles")
          .insert({
            user_id: currentUser.user.id,
            username: currentUser.user.email?.split("@")[0] || "user",
            display_name: currentUser.user.email?.split("@")[0] || "User",
            email: currentUser.user.email,
          })
          .select("*")
          .single();

        if (createError) throw createError;
        set({ profile: newProfile, loading: false });
      } else {
        set({ profile, loading: false });
      }
    } catch (error: any) {
      console.error("❌ Error fetching profile:", error);
      set({ error: error.message, loading: false });
    }
  },

  updateProfile: async (updates: Partial<UserProfile>) => {
    set({ loading: true, error: null });
    try {
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) throw new Error("User not authenticated");

      const { data: profile, error } = await supabase
        .from("user_profiles")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", currentUser.user.id)
        .select("*")
        .single();

      if (error) throw error;

      set({ profile, loading: false });
    } catch (error: any) {
      console.error("❌ Error updating profile:", error);
      set({ error: error.message, loading: false });
    }
  },

  updateAvatar: async (file: File): Promise<string | null> => {
    set({ loading: true, error: null });
    try {
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) throw new Error("User not authenticated");

      // Upload file to Supabase Storage
      const fileExt = file.name.split(".").pop();
      const fileName = `${currentUser.user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const avatarUrl = urlData.publicUrl;

      // Update profile with new avatar URL
      await get().updateProfile({ avatar_url: avatarUrl });

      return avatarUrl;
    } catch (error: any) {
      console.error("❌ Error updating avatar:", error);
      set({ error: error.message, loading: false });
      return null;
    }
  },

  deleteAvatar: async () => {
    set({ loading: true, error: null });
    try {
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) throw new Error("User not authenticated");

      const profile = get().profile;
      if (profile?.avatar_url) {
        // Extract file path from URL
        const urlParts = profile.avatar_url.split("/");
        const fileName = urlParts[urlParts.length - 1];
        const filePath = `avatars/${fileName}`;

        // Delete from storage
        await supabase.storage.from("avatars").remove([filePath]);
      }

      // Update profile to remove avatar URL
      await get().updateProfile({ avatar_url: null });
    } catch (error: any) {
      console.error("❌ Error deleting avatar:", error);
      set({ error: error.message, loading: false });
    }
  },

  getAvatarUrl: (email: string, customUrl?: string): string => {
    if (customUrl) {
      return customUrl;
    }
    // Use Vercel's avatar service as fallback
    return `https://avatar.vercel.sh/${email}`;
  },

  setLoading: (loading: boolean) => set({ loading }),
  setError: (error: string | null) => set({ error }),
}));
