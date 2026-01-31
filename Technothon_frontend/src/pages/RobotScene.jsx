import React, { Suspense, useRef, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, useHelper } from "@react-three/drei";
import * as THREE from "three";

function RobotModel({ selectedAnimation, robotPosition, robotRotation, robotScale }) {
  const { scene, animations } = useGLTF("/models/robot.glb");
  const mixer = useRef();
  const actions = useRef([]);
  const opacityRef = useRef(0);

  const playAnimation = (index) => {
    if (!actions.current[index]) return;
    actions.current.forEach((action, i) => {
      if (i !== index) action.fadeOut(0.5);
    });
    actions.current[index].reset().fadeIn(0.5).play();
  };

  useEffect(() => {
    if (animations.length > 0) {
      mixer.current = new THREE.AnimationMixer(scene);
      actions.current = animations.map((clip) => mixer.current.clipAction(clip));
      playAnimation(selectedAnimation);
    }

    scene.traverse((obj) => {
      if (obj.isMesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
        if (!obj.geometry.hasAttribute("normal")) {
          obj.geometry.computeVertexNormals();
        }
        obj.material.side = THREE.DoubleSide;
        obj.material.transparent = true;
        obj.material.opacity = 0;
      }
    });
  }, [animations, scene]);

  useEffect(() => {
    playAnimation(selectedAnimation);
  }, [selectedAnimation]);

  useFrame((_, delta) => {
    mixer.current?.update(delta);

    if (opacityRef.current < 1) {
      opacityRef.current = Math.min(opacityRef.current + delta, 1);
      scene.traverse((obj) => {
        if (obj.isMesh && obj.material) {
          obj.material.opacity = opacityRef.current;
        }
      });
    }

    scene.position.set(...robotPosition);
    scene.rotation.set(...robotRotation);
    scene.scale.set(robotScale, robotScale, robotScale);
  });

  return <primitive object={scene} />;
}

function LightWithHelper({ position, intensity, color, showHelper = false }) {
  const lightRef = useRef();
  if (showHelper) {
    useHelper(lightRef, THREE.PointLightHelper, 0.2, color);
  }
  return (
    <pointLight
      ref={lightRef}
      position={position}
      intensity={intensity}
      color={color}
      castShadow
      shadow-bias={-0.001}
      shadow-mapSize-width={1024}
      shadow-mapSize-height={1024}
    />
  );
}

useGLTF.preload("/models/robot.glb");

export default function RobotScene({ selectedAnimation }) {
  const [showRobot, setShowRobot] = useState(window.innerWidth >= 1200);

  useEffect(() => {
    const handleResize = () => {
      setShowRobot(window.innerWidth >= 1100);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!showRobot) {
    return null; // Don't render anything if width < 1100px
  }

  const purpleLightPosition = [1, 0, 2];
  const purpleLightIntensity = 20;
  const purpleLightColor = "#db0bd5";

  const pinkLightPosition = [-2, 0, 2];
  const pinkLightIntensity = 20;
  const pinkLightColor = "#112aaa";

  const cyanLightPosition = [-2, 2, 1];
  const cyanLightIntensity = 4.8;
  const cyanLightColor = "#00ffff";

  const greenLightPosition = [-0.8, 1.2, 0];
  const greenLightIntensity = 0.1;
  const greenLightColor = "#00ff00";

  const robotPosition = [-1.0, -1.4, 0];
  const robotRotation = [0, 0, -0.1];
  const robotScale = 3;

  const showHelpers = false;

  return (
    <Canvas
      shadows
      camera={{ position: [0, 2, 5], fov: 50 }}
      gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
    >
      <ambientLight intensity={0.2} />
      <LightWithHelper position={purpleLightPosition} intensity={purpleLightIntensity} color={purpleLightColor} showHelper={showHelpers} />
      <LightWithHelper position={pinkLightPosition} intensity={pinkLightIntensity} color={pinkLightColor} showHelper={showHelpers} />
      <LightWithHelper position={cyanLightPosition} intensity={cyanLightIntensity} color={cyanLightColor} showHelper={showHelpers} />
      <LightWithHelper position={greenLightPosition} intensity={greenLightIntensity} color={greenLightColor} showHelper={showHelpers} />
      <Suspense fallback={null}>
        <RobotModel
          selectedAnimation={selectedAnimation}
          robotPosition={robotPosition}
          robotRotation={robotRotation}
          robotScale={robotScale}
        />
      </Suspense>
    </Canvas>
  );
}
