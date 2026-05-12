import { CSSProperties, Suspense, useEffect, useRef, useState } from "react";
import { convertFileSrc } from "@tauri-apps/api/core";
import { Canvas } from "@react-three/fiber";
import AppGrid from "./AppGrid";
import "./App.css";
import { SRGBColorSpace } from "three";
import { homeDir } from "@tauri-apps/api/path";
import { join } from "@tauri-apps/api/path";
import { Files } from "./Files";
import { useApplications } from "./hooks/useAppList";
import {useTauriWindowEvent} from "./hooks/useTauriEvent";
import { useAppSettings } from "./hooks/useAppSettings";

function App() {
  const _ = useApplications();
  const mainRef = useRef(null);
  const [wallpaperSrc, setWallpaperSrc] = useState("");
  const [anim, setAnim] = useState("fade-in");
  const fadeTimeout = useRef<number>(null);
  const animLock = useRef(false);
  const { settings } = useAppSettings();

  function fadeOut(win: any) {
    if (animLock.current) return;
    animLock.current = true;

    setAnim("fade-out");

    if (fadeTimeout.current) clearTimeout(fadeTimeout.current);

    fadeTimeout.current = setTimeout(() => {
      win.hide();
      animLock.current = false;
    }, 250);
  }

  async function fadeIn(win: any) {
    if (animLock.current) return;
    animLock.current = true;

    await win.show();

    requestAnimationFrame(() => {
      setAnim("fade-in");

      setTimeout(() => {
        animLock.current = false;
      }, 250);
    });
  }

  useTauriWindowEvent("tauri://blur", (_, win) => {
    fadeOut(win);
  });
  useTauriWindowEvent("fade-out", (_, win) => {
    fadeOut(win);
  });
  useTauriWindowEvent("fade-in", (_, win) => {
    fadeIn(win);
  });

  useEffect(() => {
    (async () => {
      const home = await homeDir();
      if (!settings.appBg) {
        const wallpaperPath = await join(
          home,
          Files.ICONSDIR,
          Files.WALLPAPERFILE,
        );
        setWallpaperSrc(convertFileSrc(wallpaperPath));
      } else {
        setWallpaperSrc(convertFileSrc(settings.appBg));
      }
    })();
  }, []);

  return (
    <main
      ref={mainRef}
      className={anim}
      style={{
        backgroundImage: `url(${wallpaperSrc})`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        ...(settings.appOverrideStyle)
      }}
    >
      <div className="search-bar-container">
        <input placeholder={settings.searchBar.placeholder} id="search-bar" style={settings.searchBar.overrideStyle} />
      </div>
      
      <Canvas gl={{ outputColorSpace: SRGBColorSpace }} frameloop={settings.renderLoopMode}>
        <Suspense fallback={null}>
          <AppGrid />
        </Suspense>
      </Canvas>
    </main>
  );
}

export default App;
