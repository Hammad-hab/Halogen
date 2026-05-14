import { Canvas } from "@react-three/fiber";
import { SRGBColorSpace } from "three";
import { useAppSettings } from "../hooks/useAppSettings";

const AppCanvas = (props: { children: React.ReactNode }) => {
  const { settings } = useAppSettings();

  return (
    <Canvas
      gl={{ outputColorSpace: SRGBColorSpace }}
      frameloop={settings.renderLoopMode}
    >
      {props.children}
    </Canvas>
  );
};

export default AppCanvas;
