import { Suspense, useEffect, useRef, useState } from "react";
import { convertFileSrc } from "@tauri-apps/api/core";
import AppGrid from "./AppGrid";
import "./App.css";
import { homeDir } from "@tauri-apps/api/path";
import { join } from "@tauri-apps/api/path";
import { Files } from "./Files";
import { useApplications } from "./hooks/useAppList";
import { useAppSettings } from "./hooks/useAppSettings";
import AppInit from "./AppInit";
import AppCanvas from "./ui/AppCanvas";

function App() {
  useApplications();
  const mainRef = useRef<HTMLDivElement>(null);
  const [wallpaperSrc, setWallpaperSrc] = useState("");
  const { settings } = useAppSettings();

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
      style={{
        backgroundImage: `url(${wallpaperSrc})`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        ...settings.appOverrideStyle,
      }}
    >
      <div className="search-bar-container">
        <input
          placeholder={settings.searchBar.placeholder}
          id="search-bar"
          style={settings.searchBar.overrideStyle}
        />
      </div>

      <AppInit mainElementRef={mainRef}>
        <AppCanvas>
          <Suspense fallback={null}>
            <AppGrid />
          </Suspense>
        </AppCanvas>
      </AppInit>
    </main>
  );
}

export default App;
