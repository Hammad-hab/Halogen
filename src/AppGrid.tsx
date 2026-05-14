import { useAppStore } from "./hooks/AppStore";
import { useEffect, useMemo } from "react";
import { ScrollControls, Scroll } from "@react-three/drei";

import AppPlane from "./ui/AppPlane";
import { useThree } from "@react-three/fiber";
import { useAppSettings } from "./hooks/useAppSettings";
import { useGlobalStorage } from "./hooks/GlobalStore";


const AppGrid = () => {
  const { appInfos } = useAppStore();
  const { settings } = useAppSettings();
  const { appGrid } = settings;
  const entries = useMemo(() => Object.entries(appInfos), [appInfos]);
  const { viewport } = useThree();
  const global = useGlobalStorage();

  useEffect(() => {
    if (entries.length > 0) {
      global.setGlobalProperty("enableRendering", true);
    }
  }, [entries.length]);
  const gridConfig = useMemo(() => {
    const count = entries.length;
    const cols = Math.ceil(Math.sqrt(count));
    const rows = Math.ceil(count / cols);
    const spacingX = appGrid.spacingX;
    const spacingY = appGrid.spacingY;

    return { cols, rows, spacingX, spacingY };
  }, [entries.length]);

  const pages = useMemo(() => {
    // const spacingX = gridConfig.spacingX; // ?
    const spacingY = gridConfig.spacingY;
    const contentHeight = (gridConfig.rows - 1) * spacingY;
  
    // convert world height -> scroll pages
    return Math.max(1.55, contentHeight / viewport.height);
  }, [gridConfig.rows, gridConfig.spacingX, gridConfig.spacingY, viewport.height]);
  
  return (
    <group>
      <ScrollControls pages={pages} damping={appGrid.scrollDamping}>
        <Scroll>
          {entries.map(([name, app], index) => {
            const col = index % gridConfig.cols;
            const row = Math.floor(index / gridConfig.cols);

            const x = appGrid.xOffset + (col - (gridConfig.cols - 1) / 2) * gridConfig.spacingX;
            const y = appGrid.yOffset + ((gridConfig.rows - 1) / 2 - row) * gridConfig.spacingY;
            return (
              <AppPlane
                key={name}
                name={name}
                app={app}
                position={[x, y, 0]}
              />
            );
          })}
        </Scroll>
      </ScrollControls>
    </group>
  );
};


export default AppGrid;
