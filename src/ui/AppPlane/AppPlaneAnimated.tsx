import { AppItem, useAppStore } from "../../hooks/AppStore";
import { Text, useTexture } from "@react-three/drei";
import { convertFileSrc, invoke } from "@tauri-apps/api/core";
import * as THREE from "three";
import { useWindowCursorCallback } from "../../hooks/useTauriEvent";
import { useAppSettings } from "../../hooks/useAppSettings";
import { useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";

const AppPlaneAnimated = ({
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
  const ref = useRef<THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>>(null);
  const [isMouseOver, setIsMouseOver] = useState(false);
  const texture = useTexture(src, (t) => {
    t.colorSpace = THREE.SRGBColorSpace;
    t.needsUpdate = true;
  });
  
  const uniforms = useMemo(() => ({
    icon: { value: texture },
    mouse: { value: 1.0 },
    time: { value: 0 },
    position: { value: new THREE.Vector3().fromArray(position) },
  }), [texture, position]);

  useFrame((state) => {
    if (ref.current) {
      // Update time uniform directly on the material
      ref.current.material.uniforms.time.value = state.clock.elapsedTime;
      
      // Smoothly animate mouse uniform
      const targetMouse = isMouseOver ? 0.0 : 1.0;
      ref.current.material.uniforms.mouse.value = THREE.MathUtils.lerp(
        ref.current.material.uniforms.mouse.value,
        targetMouse,
        0.1
      );
    }
  });

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

  if (settings.renderLoopMode !== "always") {
    throw new Error("AppPlaneAnimated can only be used with renderLoopMode 'always'");
  }

  return (
    <group
      position={position}
      onPointerOver={onMouseOver}
      onPointerOut={onMouseOut}
      onClick={() => {
        invoke("open_app", { path: app.path });
      }}
    >
      <mesh ref={ref}>
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
          uniforms={uniforms}
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

export default AppPlaneAnimated;