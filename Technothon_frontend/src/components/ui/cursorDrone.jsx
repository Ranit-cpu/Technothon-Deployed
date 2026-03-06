"use client";

import React, { useRef, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, useAnimations } from "@react-three/drei";
import * as THREE from "three";

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(/Mobi|Android/i.test(navigator.userAgent));
  }, []);

  return isMobile;
}

function AnimatedCursorModel({ isPaused }) {
  const group = useRef();
  const { scene, animations } = useGLTF("/models/animedrone1.glb");
  const { actions } = useAnimations(animations, group);

  const targetPos = useRef(new THREE.Vector3());
  const currentPos = useRef(new THREE.Vector3());
  const { camera, size } = useThree();

  const manualRotationY = useRef(0);
  const autoRotationY = useRef(0);

  const isMobile = useIsMobile();
  const [droneScale, setDroneScale] = useState(0.35);

  // Responsive scaling
  useEffect(() => {
    const updateScale = () =>
      setDroneScale(window.innerWidth < 768 ? 0.1 : 0.35);

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  const updateTargetFromPointer = (x, y) => {
    const nx = (x / size.width) * 2 - 1;
    const ny = -(y / size.height) * 2 + 1;

    const vector = new THREE.Vector3(nx, ny, 0.5).unproject(camera);
    const dir = vector.sub(camera.position).normalize();
    const distance = -camera.position.z / dir.z;

    targetPos.current.copy(camera.position).add(dir.multiplyScalar(distance));
  };

  useEffect(() => {
    if (isMobile) {
      const handleTouch = (e) => {
        if (e.touches[0]) {
          updateTargetFromPointer(
            e.touches[0].clientX,
            e.touches[0].clientY
          );
        }
      };
      window.addEventListener("touchstart", handleTouch, { passive: true });
      return () => window.removeEventListener("touchstart", handleTouch);
    }

    const handleMove = (e) =>
      updateTargetFromPointer(e.clientX, e.clientY);

    const handleDrag = (e) => {
      manualRotationY.current += (e.movementX || 0) * 0.01;
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mousedown", () =>
      window.addEventListener("mousemove", handleDrag)
    );
    window.addEventListener("mouseup", () =>
      window.removeEventListener("mousemove", handleDrag)
    );

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mousemove", handleDrag);
    };
  }, [camera, size, isMobile]);

  useEffect(() => {
    Object.values(actions).forEach((a) =>
      a.reset().fadeIn(0.4).play()
    );
  }, [actions]);

  useFrame((_, delta) => {
    if (!group.current || isPaused) return;

    currentPos.current.lerp(targetPos.current, 0.12);
    group.current.position.copy(currentPos.current);

    autoRotationY.current += delta * 0.4;
    group.current.rotation.y =
      autoRotationY.current + manualRotationY.current;
  });

  return <primitive ref={group} object={scene} scale={droneScale} />;
}

useGLTF.preload("/models/animedrone1.glb");

export default function Cursor({ isVisible, isReady }) {
  const [isPaused, setIsPaused] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const onVisibility = () => setIsPaused(document.hidden);
    const onLeave = () => setIsPaused(true);
    const onEnter = () => setIsPaused(false);

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("mouseleave", onLeave);
    window.addEventListener("mouseenter", onEnter);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("mouseenter", onEnter);
    };
  }, []);

  if (isMobile && !isReady) return null;

  return (
    <div
      className={`fixed inset-0 pointer-events-none z-[9999] transition-opacity duration-700 ${
        isReady && isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      <Canvas
        dpr={[1, 1]}
        camera={{ position: [0, 0, 5], fov: 75 }}
        gl={{
          alpha: true,
          antialias: false,
          powerPreference: "low-power",
        }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={0.6} />
        <AnimatedCursorModel isPaused={isPaused} />
      </Canvas>
    </div>
  );
}
