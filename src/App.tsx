import { useEffect, useState } from "react";
import { convertFileSrc, invoke } from "@tauri-apps/api/core";
import { useAppStore } from "./AppStore";
import { Canvas } from "@react-three/fiber";
import AppGrid from "./AppGrid";
import "./App.css";
import { SRGBColorSpace } from "three";
// import { ScrollControls, Scroll } from "@react-three/drei";
import { getCurrentWindow } from '@tauri-apps/api/window';
import { homeDir } from '@tauri-apps/api/path';
import { join } from '@tauri-apps/api/path';


type AppInfo = {
  name: string;
  path: string;
  icon: string;
};

function App() {
  const apps = useAppStore();
  const src = convertFileSrc("~/.icons/wallpaper.png")
  const [wallpaperSrc, setWallpaperSrc] = useState("");
  useEffect(() => {
    invoke<AppInfo[]>("list_apps").then((data) => {
      data = data.filter(app => !app.name.includes('wallpaper'))
      apps.setInformation(data);
    });

    (async () => {
      const home = await homeDir();
      const wallpaperPath = await join(home, '.icons', 'wallpaper.png');
      const src = convertFileSrc(wallpaperPath);
      setWallpaperSrc(src);
    })();

    // Add keyboard listener
    const handleKeyDown = (event: KeyboardEvent) => {
      console.log("Key pressed:", event.key);
      if (event.key === 'Escape') {
        console.log("Escape pressed, closing window");
        getCurrentWindow().close();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <main style={{
      backgroundImage: `url(${wallpaperSrc})`,
      backgroundSize: "cover",
      backgroundRepeat: "no-repeat",
      backgroundPosition: "center",
    }}>
      <input placeholder="Search" id="search-bar" />
      <Canvas gl={{ outputColorSpace: SRGBColorSpace }}>
       
            <AppGrid />
        
      </Canvas>
    </main>
  );
}

export default App;
