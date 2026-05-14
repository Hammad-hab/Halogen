import { getCurrentWindow } from "@tauri-apps/api/window";
import { useApplications } from "./hooks/useAppList";
import { useTauriWindowEvent } from "./hooks/useTauriEvent";
import { useEffect, useRef } from "react";

const AppInit = (props: { children: React.ReactNode, mainElementRef: React.RefObject<HTMLDivElement | null> }) => {
  useApplications();
  const isFadingOut = useRef(false);


  useEffect(() => {
    const el = props.mainElementRef.current;
    if (!el) return;
  
    const handler = (e: AnimationEvent) => {
      if (e.target !== el) return;
      if (!isFadingOut.current) return;
  
      const win = getCurrentWindow();
      win.hide();
    };
  
    el.addEventListener("animationend", handler);
  
    return () => {
      el.removeEventListener("animationend", handler);
    };
  }, [props.mainElementRef]);

  useTauriWindowEvent('fade-in', () => {
    if (props.mainElementRef.current) {
      isFadingOut.current = false;
      props.mainElementRef.current.classList.remove('fade-out');
      props.mainElementRef.current.classList.add('fade-in');
    }
  });
  
  useTauriWindowEvent('fade-out', () => {
    if (props.mainElementRef.current) {
      props.mainElementRef.current.classList.remove('fade-in');
      props.mainElementRef.current.classList.add('fade-out');
      isFadingOut.current = true;
      
    }
  });
  return props.children;
};

export default AppInit;