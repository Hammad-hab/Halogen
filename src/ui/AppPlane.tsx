import { AppItem, useAppStore } from "../hooks/AppStore";
import { Text, useTexture } from "@react-three/drei";
import { convertFileSrc, invoke } from "@tauri-apps/api/core";
import * as THREE from "three";
import { useWindowCursorCallback } from "../hooks/useTauriEvent";
import { useAppSettings } from "../hooks/useAppSettings";
import { useState } from "react";
import { useThree } from "@react-three/fiber";

const AppPlane = ({
  name,
  app,
  position,
}: {
  name: string;
  app: AppItem;
  position: [number, number, number];
}) => {
  const { settings } = useAppSettings();
  const { appItem } = settings;
  const { invalidate } = useThree();
  const src = convertFileSrc(app.icn);
  const { to, from } = useWindowCursorCallback(appItem.onHoverCursor);
  const { iconShader } = useAppStore();

  const texture = useTexture(src, (t) => {
    t.colorSpace = THREE.SRGBColorSpace;
    t.needsUpdate = true;
  });

  const [isMouseOver, setIsMouseOver] = useState(false);

  const onMouseOver = () => {
    setIsMouseOver(true);
    invalidate();
    to();
  };

  const onMouseOut = () => {
    setIsMouseOver(false);
    invalidate();
    from();
  };

  return (
    <group
      position={position}
      onPointerOver={onMouseOver}
      onPointerOut={onMouseOut}
      onClick={() => {
        invoke("open_app", { path: app.path });
      }}
    >
      <mesh>
        <planeGeometry args={[appItem.size, appItem.size]} />
        <shaderMaterial
          fragmentShader={app.shader ?? iconShader}
          vertexShader={`
              varying vec2 vUv;
              varying vec3 vPosition;
              varying vec3 vNormal; 
              void main() {
                vUv = uv;
                vPosition = position;
                vNormal = normal;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
              }
            `}
          uniforms={{
            icon: { value: texture },
            mouse: { value: isMouseOver ? 0.0 : 1.0 },
            position: { value: new THREE.Vector3().fromArray(position) },
          }}
          transparent
        />
      </mesh>

      {!appItem.disableText && (
        <Text
        scale={appItem.textScale}
        position={appItem.textRelativePosition}
        rotation={appItem.textRelativeRotation}
        color={appItem.textColor}
      >
          {name}
        </Text>
      )}
    </group>
  );
};

export default AppPlane;
