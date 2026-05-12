import { Event, EventName } from "@tauri-apps/api/event";
import { getCurrentWindow, Window } from "@tauri-apps/api/window";
import { useCallback, useEffect } from "react";

enum Cursor {
  DEFAULT = "auto",
  POINTER = "pointer",
  MOVE = "move",
  RESIZE = "resize",
  DRAG = "drag",
  DROP = "drop",
  SCROLL = "scroll",
  SELECT = "select",
  COPY = "copy",
  PASTE = "paste",
  CUT = "cut",
  GRAB = "grab",
  GRABBING = "grabbing",
  HELP = "help",
  NOT_ALLOWED = "not-allowed",
  PROGRESS = "progress",
  WAIT = "wait",
  WAITING = "waiting",
  CELL = "cell",
  CROSSHAIR = "crosshair",
}

const useTauriWindowEvent = (event: EventName, handler: (e: Event<unknown>, win: Window) => void) => {
  useEffect(() => {
    const win = getCurrentWindow();
    const e = win.listen(event, (e) => handler(e, win))
    return () => {
        e.then((f) => f());
      };
  }, []);
};

const useWindowCursorCallback = (cursor: Cursor) => {
  const to = useCallback(() => {
    document.body.style.cursor = cursor;
  }, [cursor]);
  const from = useCallback(() => {
    document.body.style.cursor = "auto";
  }, []);
  return { to, from };
};

export { useTauriWindowEvent, useWindowCursorCallback };
export { Cursor };