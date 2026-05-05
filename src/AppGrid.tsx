import { AppInfo, useAppStore } from "./AppStore";
import { OrbitControls, Text, useTexture } from "@react-three/drei";
import { useMemo } from "react";
import { convertFileSrc, invoke } from "@tauri-apps/api/core";
import * as THREE from "three";
import { ScrollControls, Scroll } from "@react-three/drei";
const AppGrid = () => {
  const { appInfos } = useAppStore();
  // Calculate grid dimensions
  const gridConfig = useMemo(() => {
    const count = appInfos.length;
    const cols = Math.ceil(Math.sqrt(count));
    const rows = Math.ceil(count / cols);
    const spacing = 1.4;

    return { cols, rows, spacing };
  }, [appInfos.length]);

  return (
    <group>
      <ScrollControls pages={2} damping={0.15}>
        <Scroll>
          {appInfos.map((app, index) => {
            const col = index % gridConfig.cols;
            const row = Math.floor(index / gridConfig.cols);

            const x = (col - (gridConfig.cols - 1) / 2) * gridConfig.spacing;
            const y =
              -4 + ((gridConfig.rows - 1) / 2 - row) * gridConfig.spacing;

            return (
              <AppPlane
                key={`${x}${y}${app.name}`}
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

const AppPlane = ({
  app,
  position,
}: {
  app: AppInfo;
  position: [number, number, number];
}) => {
  const src = convertFileSrc(`${app.icon}`);
  const texture = useTexture(src);
  texture.colorSpace = THREE.SRGBColorSpace;
  return (
    <group position={position} onPointerOver={() => {
        document.body.style.cursor = "pointer"
    }} onPointerOut={() => {
        document.body.style.cursor = "auto"
    }} onClick={() => {
      (async () => {
        // await openPath(app.path);
        invoke("open_app", { path: app.path });
      })()
    }}>
      <mesh>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial map={texture} transparent />
      </mesh>
      <Text scale={0.1} position={[0, -0.6, 0]} color={'white'}>{app.name}</Text>
    </group>
  );
};

export default AppGrid;
