import { Event, EventName } from "@tauri-apps/api/event";
import { getCurrentWindow, Window } from "@tauri-apps/api/window";
import { useEffect } from "react";

const useTauriWindowEvent = (event: EventName, handler: (e: Event<unknown>, win: Window) => void) => {
  useEffect(() => {
    const win = getCurrentWindow();
    const e = win.listen(event, (e) => handler(e, win))
    return () => {
        e.then((f) => f());
      };
  }, []);
};

export default useTauriWindowEvent