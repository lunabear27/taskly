import { useState, useCallback } from "react";
import type { Card, List } from "../types";

interface UseDragAndDropProps {
  cards: Card[];
  lists: List[];
  moveCard: (
    cardId: string,
    newListId: string,
    newPosition: number
  ) => Promise<void>;
  moveList: (listId: string, newPosition: number) => Promise<void>;
}

export const useDragAndDrop = ({
  cards,
  lists,
  moveCard,
  moveList,
}: UseDragAndDropProps) => {
  const [activeId, setActiveId] = useState<string | null>(null);

  const handleDragStart = useCallback((event: any) => {
    const { active } = event;
    setActiveId(active.id);
    console.log("🚀 Drag start:", active.id);
  }, []);

  const handleDragOver = useCallback((event: any) => {
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    console.log("📍 Drag over:", { activeId, overId });
  }, []);

  const handleDragEnd = useCallback(
    async (event: any) => {
      const { active, over } = event;

      if (!over) {
        console.log("❌ No drop target");
        setActiveId(null);
        return;
      }

      const activeId = active.id;
      const overId = over.id;

      if (activeId === overId) {
        console.log("❌ Same item");
        setActiveId(null);
        return;
      }

      console.log("🎯 Drag end:", { activeId, overId });

      // Check if we're dragging a card
      const activeCard = cards.find((card) => card.id === activeId);
      const activeList = lists.find((list) => list.id === activeId);

      if (activeCard) {
        console.log("📋 Dragging card:", activeCard.title);
      } else if (activeList) {
        console.log("📋 Dragging list:", activeList.title);
      } else {
        console.log("❓ Not dragging a card or list");
        setActiveId(null);
        return;
      }

      // Handle list dragging
      if (activeList) {
        const overList = lists.find((list) => list.id === overId);
        if (overList) {
          console.log("📥 Moving list to position:", overList.title);
          try {
            const overListIndex = lists.findIndex((list) => list.id === overId);
            await moveList(activeId, overListIndex);
            console.log("✅ List moved successfully");
          } catch (error) {
            console.error("❌ Error moving list:", error);
          }
        } else {
          console.log("❓ Unknown drop target for list");
        }
      }
      // Handle card dragging
      else if (activeCard) {
        // Check if we're dropping on a list
        const overList = lists.find((list) => list.id === overId);
        if (overList) {
          console.log("📥 Moving card to list:", overList.title);
          try {
            // Get the position for the new list (add to end)
            const targetListCards = cards.filter(
              (card) => card.list_id === overId
            );
            const newPosition = targetListCards.length;
            await moveCard(activeId, overId, newPosition);
            console.log("✅ Card moved successfully to list");
          } catch (error) {
            console.error("❌ Error moving card to list:", error);
          }
        } else {
          // Check if we're dropping on another card
          const overCard = cards.find((card) => card.id === overId);
          if (overCard) {
            console.log("📥 Dropping on card:", overCard.title);
            try {
              // Get the position for the target list
              const targetListCards = cards.filter(
                (card) => card.list_id === overCard.list_id
              );
              const overCardIndex = targetListCards.findIndex(
                (card) => card.id === overId
              );
              const newPosition = overCardIndex;
              await moveCard(activeId, overCard.list_id, newPosition);
              console.log("✅ Card moved successfully via card drop");
            } catch (error) {
              console.error("❌ Error moving card via card drop:", error);
            }
          } else {
            console.log("❓ Unknown drop target");
          }
        }
      }

      setActiveId(null);
    },
    [cards, lists, moveCard]
  );

  return {
    activeId,
    onDragStart: handleDragStart,
    onDragOver: handleDragOver,
    onDragEnd: handleDragEnd,
  };
};
