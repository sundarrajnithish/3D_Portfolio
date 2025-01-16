import React, { Suspense, useEffect, useState, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Preload, useGLTF } from "@react-three/drei";

import CanvasLoader from "../Loader";

const Computers = ({ isMobile }) => {
  const computer = useGLTF("./aesthetic/scene.gltf");

  return (
    <mesh>
      <hemisphereLight intensity={0.001} groundColor="black" />
      <spotLight
        position={[-20, 50, 10]}
        angle={0.12}
        penumbra={1}
        intensity={1}
        castShadow
        shadow-mapSize={1024}
      />
      <pointLight intensity={1} />
      <primitive
        object={computer.scene}
        scale={isMobile ? 0.13 : 0.3}
        position={isMobile ? [0, -3, -2.2] : [-1.25, -1.25, 10]}
        rotation={isMobile ? [0, Math.PI / 4, 0] : [-0.01, -0.2, -0.1]} // Adjusted rotation
      />
    </mesh>
  );
};

const ComputersCanvas = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [rotationAngle, setRotationAngle] = useState(0);  // Store the current rotation angle
  const scrollRef = useRef(0); // Store scroll position to track progress

  useEffect(() => {
    // Add a listener for changes to the screen size
    const mediaQuery = window.matchMedia("(max-width: 500px)");

    // Set the initial value of the `isMobile` state variable
    setIsMobile(mediaQuery.matches);

    // Define a callback function to handle changes to the media query
    const handleMediaQueryChange = (event) => {
      setIsMobile(event.matches);
    };

    // Add the callback function as a listener for changes to the media query
    mediaQuery.addEventListener("change", handleMediaQueryChange);

    // Remove the listener when the component is unmounted
    return () => {
      mediaQuery.removeEventListener("change", handleMediaQueryChange);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;  // Get the vertical scroll position
      const documentHeight = document.documentElement.scrollHeight;
      const windowHeight = window.innerHeight;

      // Calculate how far down the page the user has scrolled
      const scrollProgress = scrollY / (documentHeight - windowHeight);
      
      // Limit the scroll progress to a range of 0 to 1
      const progress = Math.min(Math.max(scrollProgress, 0), 1);
      
      // Map scroll progress to rotation angle (from min to max azimuth angle)
      const newRotationAngle = (Math.PI / 4) * progress - Math.PI / 18;

      // Update the rotation angle based on the scroll progress
      setRotationAngle(newRotationAngle);

      // Allow the page to continue scrolling after the rotation is done
      if (scrollProgress >= 1) {
        scrollRef.current = scrollY;
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <Canvas
      frameloop="demand"
      shadows
      dpr={[1, 2]}
      camera={{ position: [20, 3, 5], fov: 25 }}
      gl={{ preserveDrawingBuffer: true }}
    >
      <Suspense fallback={<CanvasLoader />}>
        <OrbitControls
          enableZoom={false}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 2}
          maxAzimuthAngle={Math.PI / 4}   // Restrict horizontal rotation
          minAzimuthAngle={-Math.PI / 18}  // Restrict horizontal rotation
          azimuthAngle={rotationAngle}  // Bind rotation to state
        />
        <Computers isMobile={isMobile} />
      </Suspense>

      <Preload all />
    </Canvas>
  );
};

export default ComputersCanvas;
