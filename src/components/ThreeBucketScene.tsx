/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { ExecutionStep } from '../types';
import { Maximize2, RotateCcw, Eye, Sparkles, Droplet, Box, AlertTriangle } from 'lucide-react';

interface ThreeBucketSceneProps {
  currentStep: ExecutionStep | null;
  bucketSize: number;
  storedCount: number;
  droppedCount: number;
  sentCount: number;
  incomingCount: number;
  isOverflowing: boolean;
  visualMode: 'packets' | 'water';
  onToggleVisualMode: () => void;
}

export const ThreeBucketScene: React.FC<ThreeBucketSceneProps> = ({
  currentStep,
  bucketSize,
  storedCount,
  droppedCount,
  sentCount,
  incomingCount,
  isOverflowing,
  visualMode,
  onToggleVisualMode,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [cameraView, setCameraView] = useState<'iso' | 'front' | 'top'>('iso');
  const [isHovered, setIsHovered] = useState(false);

  // References for Three.js state
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const bucketGroupRef = useRef<THREE.Group | null>(null);
  const fluidMeshRef = useRef<THREE.Mesh | null>(null);
  const storedPacketsGroupRef = useRef<THREE.Group | null>(null);
  const dynamicParticlesGroupRef = useRef<THREE.Group | null>(null);
  const shakeIntensityRef = useRef<number>(0);
  const tickMarksGroupRef = useRef<THREE.Group | null>(null);

  // Animation frame ID
  const animationFrameRef = useRef<number | null>(null);

  // Mouse orbit state
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const orbitAnglesRef = useRef({ theta: 0.6, phi: 0.45, radius: 18 });

  // Update target orbit based on camera view preset
  const setCameraPreset = (view: 'iso' | 'front' | 'top') => {
    setCameraView(view);
    if (view === 'iso') {
      orbitAnglesRef.current.theta = 0.6;
      orbitAnglesRef.current.phi = 0.45;
      orbitAnglesRef.current.radius = 18;
    } else if (view === 'front') {
      orbitAnglesRef.current.theta = 0;
      orbitAnglesRef.current.phi = 0.15;
      orbitAnglesRef.current.radius = 17;
    } else if (view === 'top') {
      orbitAnglesRef.current.theta = 0;
      orbitAnglesRef.current.phi = 1.45;
      orbitAnglesRef.current.radius = 18;
    }
  };

  // Initialize Three.js scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x070b14);
    scene.fog = new THREE.FogExp2(0x070b14, 0.025);

    // Camera
    const aspect = container.clientWidth / container.clientHeight;
    const camera = new THREE.PerspectiveCamera(42, aspect, 0.1, 1000);
    cameraRef.current = camera;
    camera.position.set(10, 8, 14);
    camera.lookAt(0, 1, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    rendererRef.current = renderer;
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x38bdf8, 0.45);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(12, 20, 15);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);

    const rimLight = new THREE.PointLight(0x38bdf8, 2, 25);
    rimLight.position.set(-8, 5, -8);
    scene.add(rimLight);

    const bottomGlow = new THREE.PointLight(0x10b981, 1.5, 15);
    bottomGlow.position.set(0, -4, 0);
    scene.add(bottomGlow);

    // Grid Floor
    const gridHelper = new THREE.GridHelper(40, 40, 0x1e293b, 0x0f172a);
    gridHelper.position.y = -4.5;
    scene.add(gridHelper);

    // Base pedestal
    const pedestalGeo = new THREE.CylinderGeometry(4.5, 5, 0.5, 32);
    const pedestalMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.8,
      roughness: 0.3,
    });
    const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
    pedestal.position.y = -4.25;
    pedestal.receiveShadow = true;
    scene.add(pedestal);

    // Glowing circle on pedestal
    const ringGeo = new THREE.RingGeometry(3.6, 3.8, 48);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide });
    const glowRing = new THREE.Mesh(ringGeo, ringMat);
    glowRing.rotation.x = Math.PI / 2;
    glowRing.position.y = -3.99;
    scene.add(glowRing);

    // Bucket Group
    const bucketGroup = new THREE.Group();
    bucketGroupRef.current = bucketGroup;
    bucketGroup.position.set(0, 0.5, 0);
    scene.add(bucketGroup);

    // --- Build 3D Bucket Structure ---
    const bucketRadiusTop = 3.2;
    const bucketRadiusBottom = 2.4;
    const bucketHeight = 6.0;

    // Outer Glass Bucket Wall
    const glassGeo = new THREE.CylinderGeometry(bucketRadiusTop, bucketRadiusBottom, bucketHeight, 36, 1, true);
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x7dd3fc,
      transparent: true,
      opacity: 0.35,
      roughness: 0.1,
      metalness: 0.1,
      transmission: 0.6,
      ior: 1.4,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const glassBucket = new THREE.Mesh(glassGeo, glassMat);
    glassBucket.position.y = 0;
    bucketGroup.add(glassBucket);

    // Top Chrome Rim
    const topRimGeo = new THREE.TorusGeometry(bucketRadiusTop, 0.16, 16, 48);
    const chromeMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.95,
      roughness: 0.15,
    });
    const topRim = new THREE.Mesh(topRimGeo, chromeMat);
    topRim.rotation.x = Math.PI / 2;
    topRim.position.y = bucketHeight / 2;
    bucketGroup.add(topRim);

    // Bottom Rim
    const bottomRimGeo = new THREE.TorusGeometry(bucketRadiusBottom, 0.16, 16, 48);
    const bottomRim = new THREE.Mesh(bottomRimGeo, chromeMat);
    bottomRim.rotation.x = Math.PI / 2;
    bottomRim.position.y = -bucketHeight / 2;
    bucketGroup.add(bottomRim);

    // Bottom plate
    const bottomPlateGeo = new THREE.CylinderGeometry(bucketRadiusBottom, bucketRadiusBottom, 0.2, 32);
    const bottomPlate = new THREE.Mesh(bottomPlateGeo, chromeMat);
    bottomPlate.position.y = -bucketHeight / 2;
    bucketGroup.add(bottomPlate);

    // Top Input Funnel / Hopper
    const funnelGeo = new THREE.ConeGeometry(3.6, 1.8, 32, 1, true);
    const funnelMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.8,
      roughness: 0.2,
      side: THREE.DoubleSide,
    });
    const topFunnel = new THREE.Mesh(funnelGeo, funnelMat);
    topFunnel.position.y = bucketHeight / 2 + 2.4;
    topFunnel.rotation.x = Math.PI; // upside down funnel
    bucketGroup.add(topFunnel);

    // Top funnel glow ring
    const funnelRing = new THREE.Mesh(
      new THREE.TorusGeometry(3.6, 0.1, 16, 36),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
    );
    funnelRing.rotation.x = Math.PI / 2;
    funnelRing.position.y = bucketHeight / 2 + 3.3;
    bucketGroup.add(funnelRing);

    // Bottom Outlet Pipe (Nozzle)
    const pipeGeo = new THREE.CylinderGeometry(0.75, 0.65, 1.8, 24);
    const pipeMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.8,
      roughness: 0.3,
    });
    const bottomPipe = new THREE.Mesh(pipeGeo, pipeMat);
    bottomPipe.position.y = -bucketHeight / 2 - 0.9;
    bucketGroup.add(bottomPipe);

    // Outgoing Transmission Channel / Tube
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, -bucketHeight / 2 - 1.8, 0),
      new THREE.Vector3(0, -bucketHeight / 2 - 2.4, 1.5),
      new THREE.Vector3(3.5, -bucketHeight / 2 - 2.5, 2.5),
      new THREE.Vector3(8.0, -bucketHeight / 2 - 2.5, 2.5),
    ]);
    const tubeGeo = new THREE.TubeGeometry(curve, 32, 0.45, 16, false);
    const tubeMat = new THREE.MeshPhysicalMaterial({
      color: 0x059669,
      transparent: true,
      opacity: 0.5,
      roughness: 0.1,
      metalness: 0.4,
      transmission: 0.5,
    });
    const outletTube = new THREE.Mesh(tubeGeo, tubeMat);
    bucketGroup.add(outletTube);

    // Network Destination Station
    const stationGeo = new THREE.BoxGeometry(1.6, 1.6, 1.6);
    const stationMat = new THREE.MeshStandardMaterial({
      color: 0x064e3b,
      metalness: 0.8,
      roughness: 0.2,
    });
    const station = new THREE.Mesh(stationGeo, stationMat);
    station.position.set(8.5, -bucketHeight / 2 - 2.5, 2.5);
    bucketGroup.add(station);

    // Station pulse core
    const coreMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.4, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0x34d399 })
    );
    coreMesh.position.set(8.5, -bucketHeight / 2 - 2.5, 2.5);
    bucketGroup.add(coreMesh);

    // Fluid / Buffer volume mesh inside bucket
    const fluidGeo = new THREE.CylinderGeometry(bucketRadiusBottom + 0.1, bucketRadiusBottom, 1, 32);
    const fluidMat = new THREE.MeshPhysicalMaterial({
      color: 0x0284c7,
      emissive: 0x0369a1,
      emissiveIntensity: 0.2,
      transparent: true,
      opacity: 0.55,
      roughness: 0.15,
      metalness: 0.1,
      transmission: 0.5,
    });
    const fluidMesh = new THREE.Mesh(fluidGeo, fluidMat);
    fluidMesh.position.y = -bucketHeight / 2 + 0.5;
    fluidMesh.visible = false;
    bucketGroup.add(fluidMesh);
    fluidMeshRef.current = fluidMesh;

    // Groups for packets and particles
    const storedGroup = new THREE.Group();
    storedPacketsGroupRef.current = storedGroup;
    bucketGroup.add(storedGroup);

    const particlesGroup = new THREE.Group();
    dynamicParticlesGroupRef.current = particlesGroup;
    scene.add(particlesGroup);

    const tickGroup = new THREE.Group();
    tickMarksGroupRef.current = tickGroup;
    bucketGroup.add(tickGroup);

    // Mouse / Touch orbit interaction
    const handleMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const deltaX = e.clientX - previousMousePositionRef.current.x;
      const deltaY = e.clientY - previousMousePositionRef.current.y;

      orbitAnglesRef.current.theta -= deltaX * 0.008;
      orbitAnglesRef.current.phi = Math.max(0.05, Math.min(Math.PI / 2 - 0.05, orbitAnglesRef.current.phi + deltaY * 0.008));

      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      orbitAnglesRef.current.radius = Math.max(10, Math.min(30, orbitAnglesRef.current.radius + e.deltaY * 0.015));
    };

    const domEl = renderer.domElement;
    domEl.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    domEl.addEventListener('wheel', handleWheel, { passive: false });

    // Touch support for mobile
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDraggingRef.current = true;
        previousMousePositionRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (!isDraggingRef.current || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - previousMousePositionRef.current.x;
      const deltaY = e.touches[0].clientY - previousMousePositionRef.current.y;

      orbitAnglesRef.current.theta -= deltaX * 0.01;
      orbitAnglesRef.current.phi = Math.max(0.05, Math.min(Math.PI / 2 - 0.05, orbitAnglesRef.current.phi + deltaY * 0.01));

      previousMousePositionRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };
    const handleTouchEnd = () => {
      isDraggingRef.current = false;
    };
    domEl.addEventListener('touchstart', handleTouchStart);
    domEl.addEventListener('touchmove', handleTouchMove);
    domEl.addEventListener('touchend', handleTouchEnd);

    // Resize Observer
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    resizeObserver.observe(container);

    // Main Animation Loop
    let clock = new THREE.Clock();
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();

      // Smooth camera interpolation
      const { theta, phi, radius } = orbitAnglesRef.current;
      const targetX = radius * Math.cos(phi) * Math.sin(theta);
      const targetY = radius * Math.sin(phi);
      const targetZ = radius * Math.cos(phi) * Math.cos(theta);

      camera.position.x += (targetX - camera.position.x) * 0.1;
      camera.position.y += (targetY - camera.position.y) * 0.1;
      camera.position.z += (targetZ - camera.position.z) * 0.1;
      camera.lookAt(0, 0.5, 0);

      // Bucket Shake on Overflow
      if (shakeIntensityRef.current > 0.01 && bucketGroupRef.current) {
        bucketGroupRef.current.position.x = (Math.random() - 0.5) * shakeIntensityRef.current;
        bucketGroupRef.current.position.z = (Math.random() - 0.5) * shakeIntensityRef.current;
        shakeIntensityRef.current *= 0.92;
      } else if (bucketGroupRef.current) {
        bucketGroupRef.current.position.x = 0;
        bucketGroupRef.current.position.z = 0;
      }

      // Stored packets gentle floating bob
      if (storedPacketsGroupRef.current) {
        storedPacketsGroupRef.current.children.forEach((child, idx) => {
          child.position.y += Math.sin(elapsedTime * 2.5 + idx) * 0.0015;
          child.rotation.y += 0.008;
        });
      }

      // Animate dynamic in-flight particles
      if (dynamicParticlesGroupRef.current) {
        const toRemove: THREE.Object3D[] = [];
        dynamicParticlesGroupRef.current.children.forEach((obj) => {
          const userData = obj.userData;
          if (userData.update) {
            userData.update();
            if (userData.isDead) {
              toRemove.push(obj);
            }
          }
        });
        toRemove.forEach((obj) => {
          dynamicParticlesGroupRef.current?.remove(obj);
          if ((obj as THREE.Mesh).geometry) (obj as THREE.Mesh).geometry.dispose();
        });
      }

      // Pulse core in network station
      if (coreMesh) {
        const s = 1 + Math.sin(elapsedTime * 5) * 0.15;
        coreMesh.scale.set(s, s, s);
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      resizeObserver.disconnect();
      domEl.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      domEl.removeEventListener('wheel', handleWheel);
      domEl.removeEventListener('touchstart', handleTouchStart);
      domEl.removeEventListener('touchmove', handleTouchMove);
      domEl.removeEventListener('touchend', handleTouchEnd);
      renderer.dispose();
      if (container.contains(domEl)) {
        container.removeChild(domEl);
      }
    };
  }, []);

  // Update Tick Marks when bucketSize changes
  useEffect(() => {
    const tickGroup = tickMarksGroupRef.current;
    if (!tickGroup) return;

    // Clear old ticks
    while (tickGroup.children.length > 0) {
      const child = tickGroup.children[0];
      tickGroup.remove(child);
      if ((child as THREE.Mesh).geometry) (child as THREE.Mesh).geometry.dispose();
    }

    const bucketHeight = 6.0;
    const bucketRadius = 2.8;

    // Draw capacity indicator marks
    const intervalsCount = Math.min(bucketSize, 12);
    for (let k = 1; k <= intervalsCount; k++) {
      const fraction = k / bucketSize;
      const yPos = -bucketHeight / 2 + fraction * bucketHeight;

      // Small tick ring or notch
      const tickRingGeo = new THREE.TorusGeometry(bucketRadius + 0.05, 0.04, 8, 32, Math.PI * 0.4);
      const isMax = k === bucketSize;
      const tickMat = new THREE.MeshBasicMaterial({
        color: isMax ? 0xf43f5e : 0x38bdf8,
      });
      const tickMesh = new THREE.Mesh(tickRingGeo, tickMat);
      tickMesh.rotation.x = Math.PI / 2;
      tickMesh.rotation.z = -Math.PI * 0.2;
      tickMesh.position.y = yPos;
      tickGroup.add(tickMesh);
    }
  }, [bucketSize]);

  // Trigger shake on overflow
  useEffect(() => {
    if (isOverflowing || currentStep?.visualAction.type === 'overflow') {
      shakeIntensityRef.current = 0.55;
    }
  }, [isOverflowing, currentStep]);

  // Update Stored Packets / Fluid Level
  useEffect(() => {
    const storedGroup = storedPacketsGroupRef.current;
    const fluidMesh = fluidMeshRef.current;
    if (!storedGroup) return;

    // Clear old stored packet meshes
    while (storedGroup.children.length > 0) {
      const child = storedGroup.children[0];
      storedGroup.remove(child);
      if ((child as THREE.Mesh).geometry) (child as THREE.Mesh).geometry.dispose();
    }

    const bucketHeight = 6.0;
    const safeStored = Math.min(storedCount, bucketSize);

    // Update Fluid Mesh (used in water mode or as glowing buffer volume)
    if (fluidMesh) {
      if (safeStored > 0) {
        fluidMesh.visible = true;
        const fillHeight = Math.max(0.3, (safeStored / bucketSize) * (bucketHeight - 0.4));
        fluidMesh.scale.set(1, fillHeight, 1);
        fluidMesh.position.y = -bucketHeight / 2 + fillHeight / 2;

        const mat = fluidMesh.material as THREE.MeshPhysicalMaterial;
        if (visualMode === 'water') {
          mat.color.setHex(0x0284c7);
          mat.opacity = 0.75;
        } else {
          mat.color.setHex(safeStored >= bucketSize ? 0xe11d48 : 0x0284c7);
          mat.opacity = 0.35;
        }
      } else {
        fluidMesh.visible = false;
      }
    }

    // Spawn 3D Packets inside bucket if visualMode is 'packets'
    if (visualMode === 'packets' && safeStored > 0) {
      const packetRadius = 0.42;
      const layers = Math.ceil(safeStored / 4);

      for (let i = 0; i < safeStored; i++) {
        const layer = Math.floor(i / 4);
        const posInLayer = i % 4;
        const angle = (posInLayer / 4) * Math.PI * 2 + layer * 0.5;
        const r = 1.1 + (layer % 2) * 0.2;

        const px = Math.cos(angle) * r;
        const pz = Math.sin(angle) * r;
        const py = -bucketHeight / 2 + 0.6 + layer * 1.05;

        // Glowing packet cube with rounded look
        const boxGeo = new THREE.BoxGeometry(0.72, 0.72, 0.72);
        const isNearFull = safeStored >= bucketSize * 0.8;
        const boxMat = new THREE.MeshStandardMaterial({
          color: isNearFull ? 0xf59e0b : 0x06b6d4,
          emissive: isNearFull ? 0xd97706 : 0x0891b2,
          emissiveIntensity: 0.5,
          metalness: 0.5,
          roughness: 0.2,
        });

        const packetMesh = new THREE.Mesh(boxGeo, boxMat);
        packetMesh.position.set(px, py, pz);
        packetMesh.castShadow = true;
        packetMesh.receiveShadow = true;

        // Wireframe cage for cyber aesthetic
        const wireGeo = new THREE.WireframeGeometry(boxGeo);
        const wireMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.6 });
        const wire = new THREE.LineSegments(wireGeo, wireMat);
        packetMesh.add(wire);

        storedGroup.add(packetMesh);
      }
    }
  }, [storedCount, bucketSize, visualMode]);

  // Spawn Dynamic Action Particles (Arrival, Overflow Dropped, Sent)
  useEffect(() => {
    const particlesGroup = dynamicParticlesGroupRef.current;
    if (!particlesGroup || !currentStep) return;

    const action = currentStep.visualAction;
    const bucketHeight = 6.0;

    // Action: Incoming Packets arriving from the top
    if (action.type === 'arriving' && action.packetCount > 0) {
      const count = Math.min(action.packetCount, 12);
      for (let i = 0; i < count; i++) {
        const geo = visualMode === 'water' ? new THREE.SphereGeometry(0.28, 12, 12) : new THREE.BoxGeometry(0.6, 0.6, 0.6);
        const mat = new THREE.MeshStandardMaterial({
          color: visualMode === 'water' ? 0x38bdf8 : 0x06b6d4,
          emissive: 0x0284c7,
          emissiveIntensity: 0.8,
        });
        const p = new THREE.Mesh(geo, mat);

        const startX = (Math.random() - 0.5) * 1.8;
        const startZ = (Math.random() - 0.5) * 1.8;
        const startY = bucketHeight / 2 + 5.0 + i * 0.6;
        p.position.set(startX, startY, startZ);

        let vy = -0.15;
        p.userData = {
          update: () => {
            vy -= 0.012; // gravity
            p.position.y += vy;
            p.rotation.x += 0.05;
            p.rotation.y += 0.05;
            if (p.position.y < -bucketHeight / 2 + 1.2) {
              p.userData.isDead = true;
            }
          },
        };
        particlesGroup.add(p);
      }
    }

    // Action: Overflow Packets dropped over the brim
    if (action.type === 'overflow' && action.overflowCount && action.overflowCount > 0) {
      const dropCount = Math.min(action.overflowCount, 8);
      for (let i = 0; i < dropCount; i++) {
        const geo = new THREE.BoxGeometry(0.65, 0.65, 0.65);
        const mat = new THREE.MeshStandardMaterial({
          color: 0xf43f5e,
          emissive: 0xe11d48,
          emissiveIntensity: 1.0,
        });
        const dropMesh = new THREE.Mesh(geo, mat);

        const angle = (i / dropCount) * Math.PI * 2 + Math.random() * 0.4;
        const brimR = 3.3;
        dropMesh.position.set(Math.cos(angle) * brimR, bucketHeight / 2 + 0.3, Math.sin(angle) * brimR);

        const vx = Math.cos(angle) * (0.12 + Math.random() * 0.05);
        const vz = Math.sin(angle) * (0.12 + Math.random() * 0.05);
        let vy = 0.12;

        dropMesh.userData = {
          life: 0,
          maxLife: 60,
          update: () => {
            dropMesh.userData.life++;
            vy -= 0.012;
            dropMesh.position.x += vx;
            dropMesh.position.z += vz;
            dropMesh.position.y += vy;
            dropMesh.rotation.x += 0.1;
            dropMesh.rotation.y += 0.1;

            const scale = Math.max(0, 1 - dropMesh.userData.life / dropMesh.userData.maxLife);
            dropMesh.scale.set(scale, scale, scale);

            if (dropMesh.userData.life >= dropMesh.userData.maxLife) {
              dropMesh.userData.isDead = true;
            }
          },
        };
        particlesGroup.add(dropMesh);
      }
    }

    // Action: Packets being sent out the bottom pipe
    if (action.type === 'sending' && action.sentCount && action.sentCount > 0) {
      const sendCount = Math.min(action.sentCount, 6);
      for (let i = 0; i < sendCount; i++) {
        const geo = visualMode === 'water' ? new THREE.SphereGeometry(0.24, 12, 12) : new THREE.BoxGeometry(0.55, 0.55, 0.55);
        const mat = new THREE.MeshStandardMaterial({
          color: 0x10b981,
          emissive: 0x059669,
          emissiveIntensity: 0.9,
        });
        const sentMesh = new THREE.Mesh(geo, mat);

        sentMesh.position.set(0, -bucketHeight / 2 - 1.0 - i * 0.5, 0);

        let progress = 0;
        const speed = 0.02 + i * 0.003;
        sentMesh.userData = {
          update: () => {
            progress += speed;
            if (progress < 0.35) {
              sentMesh.position.y -= 0.08;
            } else {
              // Move along the transmission wire
              sentMesh.position.x += 0.15;
              sentMesh.position.z += 0.04;
            }

            if (sentMesh.position.x >= 8.5) {
              sentMesh.userData.isDead = true;
            }
          },
        };
        particlesGroup.add(sentMesh);
      }
    }
  }, [currentStep, visualMode]);

  return (
    <div
      id="three-bucket-container"
      className="relative w-full h-[420px] md:h-[480px] lg:h-[530px] rounded-2xl overflow-hidden glass-panel-glow border border-slate-700/60 shadow-2xl flex flex-col"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Top HUD Overlay */}
      <div className="absolute top-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Buffer Status Capsule */}
        <div className="flex items-center gap-2 pointer-events-auto bg-slate-900/80 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-700/80 shadow-lg">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                storedCount >= bucketSize
                  ? 'bg-rose-500 animate-ping'
                  : storedCount > 0
                  ? 'bg-cyan-400 animate-pulse'
                  : 'bg-slate-500'
              }`}
            />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              {visualMode === 'packets' ? 'Buffer' : 'Water Volume'}:
            </span>
            <span className="text-sm font-bold font-mono text-cyan-300">
              {storedCount} / {bucketSize}
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              ({Math.round((storedCount / bucketSize) * 100)}%)
            </span>
          </div>

          {/* Mini progress gauge */}
          <div className="w-16 h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
            <div
              className={`h-full transition-all duration-300 ${
                storedCount >= bucketSize
                  ? 'bg-rose-500'
                  : storedCount >= bucketSize * 0.7
                  ? 'bg-amber-400'
                  : 'bg-cyan-400'
              }`}
              style={{ width: `${Math.min(100, (storedCount / bucketSize) * 100)}%` }}
            />
          </div>
        </div>

        {/* Action Indicators & Mode Switcher */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Mode Switcher Button */}
          <button
            id="toggle-visual-mode-btn"
            onClick={onToggleVisualMode}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-700 hover:border-cyan-500/50 hover:bg-slate-800 text-xs font-medium text-slate-200 transition-all shadow-md"
            title="Toggle between Packet Buffer and Real-life Water Bucket analogy"
          >
            {visualMode === 'packets' ? (
              <>
                <Box className="w-3.5 h-3.5 text-cyan-400" />
                <span>Packets Mode</span>
              </>
            ) : (
              <>
                <Droplet className="w-3.5 h-3.5 text-sky-400" />
                <span>Water Analogy Mode</span>
              </>
            )}
          </button>

          {/* Camera Presets */}
          <div className="flex items-center bg-slate-900/80 backdrop-blur-md border border-slate-700 rounded-xl p-0.5">
            <button
              onClick={() => setCameraPreset('iso')}
              className={`px-2 py-1 text-[11px] rounded-lg font-medium transition-all ${
                cameraView === 'iso' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              3D Iso
            </button>
            <button
              onClick={() => setCameraPreset('front')}
              className={`px-2 py-1 text-[11px] rounded-lg font-medium transition-all ${
                cameraView === 'front' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Front
            </button>
            <button
              onClick={() => setCameraPreset('top')}
              className={`px-2 py-1 text-[11px] rounded-lg font-medium transition-all ${
                cameraView === 'top' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Top
            </button>
          </div>
        </div>
      </div>

      {/* Overflow Warning Banner */}
      {(isOverflowing || currentStep?.visualAction.type === 'overflow') && (
        <div
          id="overflow-warning-banner"
          className="absolute top-16 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2.5 px-4 py-2 bg-rose-950/90 border border-rose-500/80 rounded-2xl shadow-xl shadow-rose-950/50 text-rose-200 text-xs md:text-sm font-semibold animate-bounce"
        >
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>OVERFLOW! BUFFER FULL — PACKETS DROPPED</span>
        </div>
      )}

      {/* Dynamic 3D Mount Canvas */}
      <div ref={mountRef} className="w-full flex-1 cursor-grab active:cursor-grabbing relative" />

      {/* Bottom 3D Scene HUD Annotations */}
      <div className="absolute bottom-3 left-3 right-3 z-10 flex items-end justify-between pointer-events-none">
        {/* Legend Indicators */}
        <div className="flex flex-wrap items-center gap-2 text-[11px] bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-slate-300">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-cyan-400 shadow-xs shadow-cyan-400" />
            <span>Stored in Bucket</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-400 shadow-xs shadow-emerald-400" />
            <span>Sent (Rate: {currentStep?.variables.outputRate ?? 3})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-rose-500 shadow-xs shadow-rose-500" />
            <span>Dropped Packets</span>
          </div>
        </div>

        {/* Orbit Helper Tip */}
        <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-400 bg-slate-950/60 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-slate-800">
          <Eye className="w-3.5 h-3.5 text-slate-400" />
          <span>Click & drag to rotate 3D view</span>
        </div>
      </div>
    </div>
  );
};
