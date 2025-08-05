import { create } from "zustand";
import { supabase } from "../lib/supabase";
import type { Tag } from "../types";

interface TagState {
  tags: Tag[];
  loading: boolean;
  error: string | null;

  // Tag actions
  fetchTags: (boardId: string) => Promise<void>;
  createTag: (
    boardId: string,
    name: string,
    color: string
  ) => Promise<Tag | null>;
  updateTag: (id: string, updates: Partial<Tag>) => Promise<void>;
  deleteTag: (id: string) => Promise<void>;
  assignTagToCard: (cardId: string, tagId: string) => Promise<void>;
  removeTagFromCard: (cardId: string, tagId: string) => Promise<void>;

  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useTagStore = create<TagState>((set, get) => ({
  tags: [],
  loading: false,
  error: null,

  fetchTags: async (boardId: string) => {
    set({ loading: true, error: null });
    try {
      const { data: tags, error } = await supabase
        .from("tags")
        .select("*")
        .eq("board_id", boardId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      set({ tags: tags || [], loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  createTag: async (boardId: string, name: string, color: string) => {
    set({ loading: true, error: null });
    try {
      const { data: tag, error } = await supabase
        .from("tags")
        .insert({
          name,
          color,
          board_id: boardId,
        })
        .select()
        .single();

      if (error) throw error;

      const { tags } = get();
      set({ tags: [...tags, tag], loading: false });
      return tag;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      return null;
    }
  },

  updateTag: async (id: string, updates: Partial<Tag>) => {
    set({ loading: true, error: null });
    try {
      const { data: tag, error } = await supabase
        .from("tags")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      const { tags } = get();
      set({
        tags: tags.map((t) => (t.id === id ? tag : t)),
        loading: false,
      });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  deleteTag: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase.from("tags").delete().eq("id", id);
      if (error) throw error;

      const { tags } = get();
      set({
        tags: tags.filter((t) => t.id !== id),
        loading: false,
      });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  assignTagToCard: async (cardId: string, tagId: string) => {
    set({ loading: true, error: null });
    try {
      // Get current card tags
      const { data: card, error: fetchError } = await supabase
        .from("cards")
        .select("tags")
        .eq("id", cardId)
        .single();

      if (fetchError) throw fetchError;

      const currentTags = card.tags || [];
      if (!currentTags.includes(tagId)) {
        const updatedTags = [...currentTags, tagId];

        const { error } = await supabase
          .from("cards")
          .update({ tags: updatedTags })
          .eq("id", cardId);

        if (error) throw error;
      }
      set({ loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  removeTagFromCard: async (cardId: string, tagId: string) => {
    set({ loading: true, error: null });
    try {
      // Get current card tags
      const { data: card, error: fetchError } = await supabase
        .from("cards")
        .select("tags")
        .eq("id", cardId)
        .single();

      if (fetchError) throw fetchError;

      const currentTags = card.tags || [];
      const updatedTags = currentTags.filter((id: string) => id !== tagId);

      const { error } = await supabase
        .from("cards")
        .update({ tags: updatedTags })
        .eq("id", cardId);

      if (error) throw error;
      set({ loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  setLoading: (loading: boolean) => set({ loading }),
  setError: (error: string | null) => set({ error }),
}));
