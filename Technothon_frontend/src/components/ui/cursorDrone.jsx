import React, { useRef, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, useAnimations } from "@react-three/drei";
import * as THREE from "three";

function AnimatedCursorModel({ isPaused }) {
  const group = useRef();
  const { scene, animations } = useGLTF("/models/animedrone1.glb");
  const { actions } = useAnimations(animations, group);

  const targetPos = useRef(new THREE.Vector3());
  const currentPos = useRef(new THREE.Vector3());
  const { camera, size } = useThree();

  const manualRotationY = useRef(0);
  const autoRotationY = useRef(0);
  const [droneScale, setDroneScale] = useState(size.width < 768 ? 0.1 : 0.350);

  const isMobile = /Mobi|Android/i.test(navigator.userAgent);

  // Responsive scaling
  useEffect(() => {
  const updateScale = () =>
      setDroneScale(window.innerWidth < 768 ? 0.1 : 0.350);

      updateScale();
      window.addEventListener("resize", updateScale);
      return () => window.removeEventListener("resize", updateScale);
    }, []);

  // Convert pointer coords to world coords
  const updateTargetFromPointer = (clientX, clientY) => {
    const x = (clientX / size.width) * 2 - 1;
    const y = -(clientY / size.height) * 2 + 1;
    const vector = new THREE.Vector3(x, y, 0.5).unproject(camera);
    const dir = vector.sub(camera.position).normalize();
    const distance = -camera.position.z / dir.z;
    targetPos.current.copy(camera.position).add(dir.multiplyScalar(distance));
  };

  useEffect(() => {
    const handleMouseMove = (e) => updateTargetFromPointer(e.clientX, e.clientY);

    const handleMouseDragRotation = (e) => {
      manualRotationY.current += (e.movementX || 0) * 0.01;
    };

    const handleTouchTap = (e) => {
      if (e.touches.length) {
        const touch = e.touches[0];
        updateTargetFromPointer(touch.clientX, touch.clientY);
      }
    };

    if (isMobile) {
      // On mobile: move only on tap
      window.addEventListener("touchstart", handleTouchTap, { passive: true });
    } else {
      // On desktop: follow mouse + drag rotation
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mousedown", () =>
        window.addEventListener("mousemove", handleMouseDragRotation)
      );
      window.addEventListener("mouseup", () =>
        window.removeEventListener("mousemove", handleMouseDragRotation)
      );
    }

    return () => {
      if (isMobile) {
        window.removeEventListener("touchstart", handleTouchTap);
      } else {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mousemove", handleMouseDragRotation);
      }
    };
  }, [camera, size.width, size.height, isMobile]);

  // Start animations
  useEffect(() => {
    Object.values(actions).forEach((action) =>
      action.reset().fadeIn(0.5).play()
    );
  }, [actions]);

  // Cleanup GPU resources on unmount
  useEffect(() => {
    return () => {
      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose && m.dispose());
          } else {
            obj.material.dispose && obj.material.dispose();
          }
        }
      });
    };
  }, [scene]);

  // Smooth movement + rotation
  useFrame((_, delta) => {
    if (isPaused || !group.current) return; // 🔧 skip when paused

    currentPos.current.lerp(targetPos.current, 0.1); // 🔧 faster interpolation
    group.current.position.copy(currentPos.current);

    autoRotationY.current += delta * 0.5;
    group.current.rotation.y =
      autoRotationY.current + manualRotationY.current;
  });

  return <primitive ref={group} object={scene} scale={droneScale} />;
}

useGLTF.preload("/models/animedrone1.glb");

export default function Cursor({ isVisible, isReady }) {
  const [isPaused, setIsPaused] = useState(false);

  // Pause animation when tab not visible or mouse leaves window
  useEffect(() => {
    const handleVisibility = () => setIsPaused(document.hidden);
    const handleMouseLeave = () => setIsPaused(true);
    const handleMouseEnter = () => setIsPaused(false);

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, []);

  const isLowEnd = /Mobi|Android/i.test(navigator.userAgent);
  if (isLowEnd && !isReady) return null;

  return (
    <div
      className={`fixed top-0 left-0 w-screen h-screen pointer-events-none z-[9999] transition-opacity duration-700 ease-in-out ${
        isReady ? (isVisible ? "opacity-100" : "opacity-0") : "opacity-0"
      }`}
    >
      <Canvas
        gl={{
          alpha: true,
          antialias: false, // 🔧 turned off
          powerPreference: "low-power",
          preserveDrawingBuffer: false,
          stencil: false,
          depth: true,
        }}
        dpr={[1, 1]} // 🔧 force low DPR
        camera={{ position: [0, 0, 5], fov: 75 }}
        className="!bg-transparent"
        style={{ pointerEvents: "none" }}
        onCreated={({ gl }) => {
          gl.domElement.addEventListener("webglcontextlost", (e) => {
            e.preventDefault();
            console.warn("WebGL context lost");
          });
          gl.domElement.addEventListener("webglcontextrestored", () => {
            console.log("WebGL context restored");
          });
        }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={0.6} />
        <AnimatedCursorModel isPaused={isPaused} />
      </Canvas>
    </div>
  );
}
