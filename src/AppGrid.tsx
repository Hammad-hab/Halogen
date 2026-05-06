import { useAppStore } from "./hooks/AppStore";
import { Text, useTexture } from "@react-three/drei";
import { useMemo } from "react";
import { convertFileSrc, invoke } from "@tauri-apps/api/core";
import * as THREE from "three";
import { ScrollControls, Scroll } from "@react-three/drei";


const AppGrid = () => {
  const { appInfos } = useAppStore();

  const entries = useMemo(() => Object.entries(appInfos), [appInfos]);

  const gridConfig = useMemo(() => {
    const count = entries.length;
    const cols = Math.ceil(Math.sqrt(count));
    const rows = Math.ceil(count / cols);
    const spacing = 1.4;

    return { cols, rows, spacing };
  }, [entries.length]);

  return (
    <group>
      <ScrollControls pages={2} damping={0.15}>
        <Scroll>
          {entries.map(([name, app], index) => {
            const col = index % gridConfig.cols;
            const row = Math.floor(index / gridConfig.cols);

            const x = (col - (gridConfig.cols - 1) / 2) * gridConfig.spacing;
            const y =
              -4 + ((gridConfig.rows - 1) / 2 - row) * gridConfig.spacing;

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

const AppPlane = ({
  name,
  app,
  position,
}: {
  name: string;
  app: { path: string; icn: string };
  position: [number, number, number];
}) => {
  const src = convertFileSrc(app.icn);
  const texture = useTexture(src);
  texture.colorSpace = THREE.SRGBColorSpace;

  return (
    <group
      position={position}
      onPointerOver={() => (document.body.style.cursor = "pointer")}
      onPointerOut={() => (document.body.style.cursor = "auto")}
      onClick={() => {
        invoke("open_app", { path: app.path });
      }}
    >
      <mesh>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial map={texture} transparent />
      </mesh>

      <Text scale={0.1} position={[0, -0.6, 0]} color="white">
        {name}
      </Text>
    </group>
  );
};
export default AppGrid;
