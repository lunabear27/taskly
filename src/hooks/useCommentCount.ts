import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { logger } from "../lib/logger";

export const useCommentCount = (cardId: string) => {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!cardId) return;

    const fetchCount = async () => {
      try {
        const { data, error } = await supabase
          .from("comments")
          .select("id", { count: "exact", head: true })
          .eq("card_id", cardId);

        if (error) {
          logger.error("Error fetching comment count", error);
          return;
        }

        // The count is returned in the response metadata
        setCount(data?.length || 0);
      } catch (error) {
        logger.error("Error fetching comment count", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCount();

    // Subscribe to real-time updates
    const channel = supabase
      .channel(`comment-count-${cardId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "comments",
          filter: `card_id=eq.${cardId}`,
        },
        () => {
          // Refetch count when comments change
          fetchCount();
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          logger.realtime(`Subscribed to comment count for card ${cardId}`);
        } else if (status === "CHANNEL_ERROR") {
          logger.error(
            `Failed to subscribe to comment count for card ${cardId}`
          );
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [cardId]);

  return { count, loading };
};
