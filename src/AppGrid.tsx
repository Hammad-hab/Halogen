import { useAppStore } from "./hooks/AppStore";
import { useMemo } from "react";
import { ScrollControls, Scroll } from "@react-three/drei";

import AppPlane from "./ui/AppPlane";
import { useThree } from "@react-three/fiber";
import { useAppSettings } from "./hooks/useAppSettings";


const AppGrid = () => {
  const { appInfos } = useAppStore();
  const { settings } = useAppSettings();
  const { appGrid } = settings;
  const entries = useMemo(() => Object.entries(appInfos), [appInfos]);
  const { viewport } = useThree();

  const gridConfig = useMemo(() => {
    const count = entries.length;
    const cols = Math.ceil(Math.sqrt(count));
    const rows = Math.ceil(count / cols);
    const spacing = appGrid.spacing;

    return { cols, rows, spacing };
  }, [entries.length]);

  const pages = useMemo(() => {
    const spacing = gridConfig.spacing;
    const contentHeight = (gridConfig.rows - 1) * spacing;
  
    // convert world height -> scroll pages
    return Math.max(1.55, contentHeight / viewport.height);
  }, [gridConfig.rows, gridConfig.spacing, viewport.height]);
  
  return (
    <group>
      <ScrollControls pages={pages} damping={appGrid.scrollDamping}>
        <Scroll>
          {entries.map(([name, app], index) => {
            const col = index % gridConfig.cols;
            const row = Math.floor(index / gridConfig.cols);

            const x = appGrid.xOffset + (col - (gridConfig.cols - 1) / 2) * gridConfig.spacing;
            const y = appGrid.yOffset + ((gridConfig.rows - 1) / 2 - row) * gridConfig.spacing;

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
