import { Suspense, useEffect, useRef, useState } from "react";
import { convertFileSrc, invoke } from "@tauri-apps/api/core";
import { AppInfo, useAppStore } from "./AppStore";
import { Canvas } from "@react-three/fiber";
import AppGrid from "./AppGrid";
import "./App.css";
import { SRGBColorSpace } from "three";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { homeDir } from "@tauri-apps/api/path";
import { join } from "@tauri-apps/api/path";
import * as TOML from "js-toml";

function App() {
  const apps = useAppStore();
  const mainRef = useRef(null);
  const [wallpaperSrc, setWallpaperSrc] = useState("");
  const [anim, setAnim] = useState("fade-in");
  const fadeTimeout = useRef<number>(null);
  const animLock = useRef(false);

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

  useEffect(() => {
    const win = getCurrentWindow();

    const unblur = win.listen("tauri://blur", () => {
      fadeOut(win);
    });

    const unhide = win.listen("fade-out", () => {
      fadeOut(win);
    });

    const unshow = win.listen("fade-in", () => {
      fadeIn(win);
    });

    return () => {
      unblur.then((f) => f());
      unhide.then((f) => f());
      unshow.then((f) => f());
    };
  }, []);

  useEffect(() => {
    (async () => {
      const home = await homeDir();
      const appListPath = await join(home, ".icons", "applist.toml");
      invoke<string>("read_file", { path: appListPath }).then((data) => {
        const t = TOML.load(data);
        apps.setInformation(t as AppInfo);
      });
      // setWallpaperSrc();
    })();

    // invoke<AppInfo[]>("list_apps").then((data) => {
    //   apps.setInformation(
    //     data.filter((app) => !app.name.includes("wallpaper")),
    //   );
    // });

    (async () => {
      const home = await homeDir();
      const wallpaperPath = await join(home, ".icons", "wallpaper.png");
      setWallpaperSrc(convertFileSrc(wallpaperPath));
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
      }}
    >
      <input placeholder="Search" id="search-bar" />
      <Canvas gl={{ outputColorSpace: SRGBColorSpace }}>
        <Suspense>
          <AppGrid />
        </Suspense>
      </Canvas>
    </main>
  );
}

export default App;
