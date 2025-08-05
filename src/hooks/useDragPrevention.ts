import { useEffect } from "react";

export const useDragPrevention = () => {
  useEffect(() => {
    const preventDefaultEvents = (e: Event) => {
      // Temporarily disable form submission prevention to test
      // if (e.type === "submit" || e.type === "formdata") {
      //   const target = e.target as HTMLElement;
      //   const isModalForm = target.closest(".fixed.inset-0.z-50") ||
      //                        target.closest('[role="dialog"]') ||
      //                        target.closest('.modal') ||
      //                        target.closest('.Modal');
      //
      //   if (!isModalForm) {
      //     e.preventDefault();
      //     e.stopPropagation();
      //     console.log("🚫 Prevented form submission");
      //   } else {
      //     console.log("✅ Allowing modal form submission");
      //   }
      // }
    };

    const preventDragEvents = (e: DragEvent) => {
      // Only prevent drag events on draggable elements, not on buttons
      const target = e.target as HTMLElement;
      const isButton = target.closest("button") || target.tagName === "BUTTON";

      if (
        e.type === "dragstart" ||
        e.type === "dragover" ||
        e.type === "drop"
      ) {
        if (!isButton) {
          e.preventDefault();
          e.stopPropagation();
          console.log("🚫 Prevented drag event:", e.type);
        }
      }
    };

    const preventAllEvents = (e: Event) => {
      // Prevent any events that might cause page refresh during drag
      if (e.type === "beforeunload" || e.type === "unload") {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    // Add global event listeners
    document.addEventListener("submit", preventDefaultEvents, true);
    document.addEventListener("formdata", preventDefaultEvents, true);
    document.addEventListener("dragstart", preventDragEvents, true);
    document.addEventListener("dragover", preventDragEvents, true);
    document.addEventListener("drop", preventDragEvents, true);
    document.addEventListener("beforeunload", preventAllEvents, true);
    document.addEventListener("unload", preventAllEvents, true);

    return () => {
      document.removeEventListener("submit", preventDefaultEvents, true);
      document.removeEventListener("formdata", preventDefaultEvents, true);
      document.removeEventListener("dragstart", preventDragEvents, true);
      document.removeEventListener("dragover", preventDragEvents, true);
      document.removeEventListener("drop", preventDragEvents, true);
      document.removeEventListener("beforeunload", preventAllEvents, true);
      document.removeEventListener("unload", preventAllEvents, true);
    };
  }, []);
};
