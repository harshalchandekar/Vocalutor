"use client";

import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { SUBJECTS_CONFIG } from './data';

interface SmallBall {
  mesh: THREE.Mesh;
  baseOffset: THREE.Vector3;
  orbitRadius: number;
  orbitAngle: number;
  orbitSpeed: number;
  floatPhase: number;
  floatSpeed: number;
  type: 'white' | 'black' | 'glass';
}

interface DandelionSpoke {
  id?: string;
  dir: THREE.Vector3;
  baseLength: number;
  currentLength: number;
  line: THREE.Line;
  tipMesh: THREE.Mesh;
  dotsPoints: THREE.Points;
  isSubject: boolean;
  subjectId?: string;
}

export const Hero3DScene: React.FC<{
  activeSubject: string;
  onSelectSubject: (subject: string) => void;
  isSpeaking?: boolean;
}> = ({ activeSubject, onSelectSubject, isSpeaking = false }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const stateRef = useRef<{
    renderer?: THREE.WebGLRenderer;
    scene?: THREE.Scene;
    camera?: THREE.PerspectiveCamera;
    dandelionGroup?: THREE.Group;
    ballsGroup?: THREE.Group;
    spokes?: DandelionSpoke[];
    smallBalls?: SmallBall[];
    coreMesh?: THREE.Mesh;
    clock?: THREE.Clock;
    pointerTarget: THREE.Vector2;
    pointerCurrent: THREE.Vector2;
    pointerVelocity: THREE.Vector2;
    activeSubId?: string;
    hoveredSubId?: string | null;
    isSpeakingRef?: boolean;
    raycaster?: THREE.Raycaster;
    pointer?: THREE.Vector2;
  }>({
    pointerTarget: new THREE.Vector2(0, 0),
    pointerCurrent: new THREE.Vector2(0, 0),
    pointerVelocity: new THREE.Vector2(0, 0)
  });

  useEffect(() => {
    stateRef.current.activeSubId = activeSubject;
  }, [activeSubject]);

  useEffect(() => {
    stateRef.current.hoveredSubId = hoveredNode;
  }, [hoveredNode]);

  useEffect(() => {
    stateRef.current.isSpeakingRef = isSpeaking;
  }, [isSpeaking]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const width = container.clientWidth || 550;
    const height = container.clientHeight || 550;

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0, 8.8);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: true
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    container.appendChild(renderer.domElement);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.5);
    keyLight.position.set(5, 8, 7);
    scene.add(keyLight);

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x111114, 1.4);
    hemiLight.position.set(0, 10, 0);
    scene.add(hemiLight);

    const coralLight = new THREE.PointLight(0xe03e1a, 2.0, 12);
    coralLight.position.set(0, 0, 0);
    scene.add(coralLight);

    const dandelionGroup = new THREE.Group();
    dandelionGroup.position.set(0, 0, 0);
    scene.add(dandelionGroup);

    const coreGeo = new THREE.SphereGeometry(0.18, 32, 32);
    const coreMat = new THREE.MeshBasicMaterial({ color: 0x0f0f10 });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    dandelionGroup.add(coreMesh);

    const haloGeo = new THREE.SphereGeometry(0.32, 16, 16);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0xe03e1a,
      wireframe: true,
      transparent: true,
      opacity: 0.35
    });
    const haloMesh = new THREE.Mesh(haloGeo, haloMat);
    dandelionGroup.add(haloMesh);

    const spokes: DandelionSpoke[] = [];
    const TOTAL_SPOKES = 120;
    const outerNodePoints: THREE.Vector3[] = [];

    const blackMat = new THREE.MeshStandardMaterial({ color: 0x0f0f10, metalness: 0.8, roughness: 0.2 });
    const whiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.4, roughness: 0.1 });
    const coralMat = new THREE.MeshStandardMaterial({ color: 0xe03e1a, emissive: 0xe03e1a, emissiveIntensity: 0.85 });

    const subjectIndices = [8, 22, 36, 50, 64, 78, 92, 106];

    for (let i = 0; i < TOTAL_SPOKES; i++) {
      const phi = Math.acos(1 - (2 * (i + 0.5)) / TOTAL_SPOKES);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;

      const dir = new THREE.Vector3(
        Math.sin(phi) * Math.cos(theta),
        Math.sin(phi) * Math.sin(theta),
        Math.cos(phi)
      ).normalize();

      const subjectIndex = subjectIndices.indexOf(i);
      const isSubject = subjectIndex !== -1;
      const isAntenna = isSubject || i % 7 === 0;
      const baseLength = isSubject ? 3.3 : isAntenna ? 3.0 : 1.9 + Math.random() * 0.45;

      const linePoints = [new THREE.Vector3(0, 0, 0), dir.clone().multiplyScalar(baseLength)];
      const lineGeo = new THREE.BufferGeometry().setFromPoints(linePoints);
      const lineMat = new THREE.LineBasicMaterial({
        color: isSubject ? 0x0f0f10 : 0x888890,
        transparent: true,
        opacity: isSubject ? 0.85 : 0.45
      });
      const line = new THREE.Line(lineGeo, lineMat);
      dandelionGroup.add(line);

      const DOTS_PER_SPOKE = isAntenna ? 14 : 9;
      const dotCoords: number[] = [];
      for (let d = 1; d <= DOTS_PER_SPOKE; d++) {
        const factor = d / DOTS_PER_SPOKE;
        const p = dir.clone().multiplyScalar(baseLength * factor);
        dotCoords.push(p.x, p.y, p.z);
      }
      const dotsGeo = new THREE.BufferGeometry();
      dotsGeo.setAttribute('position', new THREE.Float32BufferAttribute(dotCoords, 3));
      const dotsMat = new THREE.PointsMaterial({
        color: isSubject ? 0x0f0f10 : 0x55555c,
        size: 0.045,
        transparent: true,
        opacity: 0.75
      });
      const dotsPoints = new THREE.Points(dotsGeo, dotsMat);
      dandelionGroup.add(dotsPoints);

      const tipRadius = isSubject ? 0.11 : isAntenna ? 0.08 : 0.045;
      const tipGeo = new THREE.SphereGeometry(tipRadius, 16, 16);
      const tipMesh = new THREE.Mesh(tipGeo, isSubject ? coralMat : i % 2 === 0 ? blackMat : whiteMat);
      const tipPos = dir.clone().multiplyScalar(baseLength);
      tipMesh.position.copy(tipPos);

      const subObj = isSubject ? SUBJECTS_CONFIG[subjectIndex] : undefined;
      if (subObj) {
        tipMesh.userData = { id: subObj.id, name: subObj.name };
      }

      dandelionGroup.add(tipMesh);
      outerNodePoints.push(tipPos);

      spokes.push({
        id: subObj?.id,
        dir,
        baseLength,
        currentLength: baseLength,
        line,
        tipMesh,
        dotsPoints,
        isSubject,
        subjectId: subObj?.id
      });
    }

    const webPoints: THREE.Vector3[] = [];
    for (let i = 0; i < outerNodePoints.length; i++) {
      for (let j = i + 1; j < outerNodePoints.length; j++) {
        const dist = outerNodePoints[i].distanceTo(outerNodePoints[j]);
        if (dist > 0.4 && dist < 0.95) {
          webPoints.push(outerNodePoints[i], outerNodePoints[j]);
        }
      }
    }
    const webGeo = new THREE.BufferGeometry().setFromPoints(webPoints);
    const webMat = new THREE.LineBasicMaterial({ color: 0x9999a0, transparent: true, opacity: 0.18 });
    const webLines = new THREE.LineSegments(webGeo, webMat);
    dandelionGroup.add(webLines);

    const ballsGroup = new THREE.Group();
    dandelionGroup.add(ballsGroup);

    const smallBalls: SmallBall[] = [];
    const BALL_COUNT = 52;

    for (let b = 0; b < BALL_COUNT; b++) {
      const randType = Math.random();
      const type: 'white' | 'black' | 'glass' =
        randType < 0.5 ? 'white' : randType < 0.85 ? 'black' : 'glass';

      const radius = Math.random() * 0.038 + 0.032;
      const ballGeo = new THREE.SphereGeometry(radius, 16, 16);

      let ballMat: THREE.Material;
      if (type === 'white') {
        ballMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.2, roughness: 0.1, transparent: true, opacity: 0.9 });
      } else if (type === 'black') {
        ballMat = new THREE.MeshStandardMaterial({ color: 0x0f0f10, metalness: 0.9, roughness: 0.2, transparent: true, opacity: 0.85 });
      } else {
        ballMat = new THREE.MeshStandardMaterial({ color: 0x888890, metalness: 0.5, roughness: 0.1, transparent: true, opacity: 0.5 });
      }

      const ballMesh = new THREE.Mesh(ballGeo, ballMat);
      const orbitRadius = Math.random() < 0.5 ? 0.9 + Math.random() * 1.1 : 2.1 + Math.random() * 1.5;
      const orbitAngle = Math.random() * Math.PI * 2;
      const baseHeight = (Math.random() - 0.5) * 3.2;

      const baseOffset = new THREE.Vector3(
        Math.cos(orbitAngle) * orbitRadius,
        baseHeight,
        Math.sin(orbitAngle) * orbitRadius
      );

      ballMesh.position.copy(baseOffset);
      ballsGroup.add(ballMesh);

      smallBalls.push({
        mesh: ballMesh,
        baseOffset,
        orbitRadius,
        orbitAngle,
        orbitSpeed: (Math.random() - 0.5) * 0.45,
        floatPhase: Math.random() * Math.PI * 2,
        floatSpeed: Math.random() * 0.025 + 0.012,
        type
      });
    }

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    const onPointerMove = (e: MouseEvent) => {
      if (!container) return;
      const rect = container.getBoundingClientRect();

      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const halfW = Math.max(180, rect.width * 0.5);
      const halfH = Math.max(180, rect.height * 0.5);

      const rawX = (e.clientX - centerX) / halfW;
      const rawY = -(e.clientY - centerY) / halfH;

      const targetX = Math.max(-1.5, Math.min(1.5, rawX));
      const targetY = Math.max(-1.5, Math.min(1.5, rawY));

      const prevX = stateRef.current.pointerTarget.x;
      const prevY = stateRef.current.pointerTarget.y;
      stateRef.current.pointerVelocity.x = (targetX - prevX) * 2.0;
      stateRef.current.pointerVelocity.y = (targetY - prevY) * 2.0;

      stateRef.current.pointerTarget.x = targetX;
      stateRef.current.pointerTarget.y = targetY;

      const localX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const localY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      pointer.x = localX;
      pointer.y = localY;

      if (
        e.clientX >= rect.left - 40 &&
        e.clientX <= rect.right + 40 &&
        e.clientY >= rect.top - 40 &&
        e.clientY <= rect.bottom + 40
      ) {
        raycaster.setFromCamera(pointer, camera);
        const interactiveMeshes = spokes.filter((s) => s.isSubject).map((s) => s.tipMesh);
        const intersects = raycaster.intersectObjects(interactiveMeshes, false);

        if (intersects.length > 0) {
          const hit = intersects[0].object;
          if (hit.userData?.id) {
            const hoveredId = hit.userData.id;
            setHoveredNode(hoveredId);
            onSelectSubject(hoveredId);
            container.style.cursor = 'pointer';
            return;
          }
        }
        setHoveredNode(null);
        container.style.cursor = 'default';
      } else {
        setHoveredNode(null);
      }
    };

    window.addEventListener('mousemove', onPointerMove, { passive: true });

    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w === 0 || h === 0) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    stateRef.current = {
      renderer,
      scene,
      camera,
      dandelionGroup,
      ballsGroup,
      spokes,
      smallBalls,
      coreMesh,
      clock: new THREE.Clock(),
      pointerTarget: stateRef.current.pointerTarget,
      pointerCurrent: stateRef.current.pointerCurrent,
      pointerVelocity: stateRef.current.pointerVelocity,
      activeSubId: activeSubject,
      hoveredSubId: hoveredNode,
      isSpeakingRef: isSpeaking,
      raycaster,
      pointer
    };

    let animId: number;
    let isVisible = true;
    const clock = new THREE.Clock();

    const tempTipTarget = new THREE.Vector3();
    const tempScaleVec = new THREE.Vector3();

    const observer = new IntersectionObserver(
      ([entry]) => {
        const wasVisible = isVisible;
        isVisible = entry.isIntersecting;
        if (isVisible && !wasVisible) {
          clock.getDelta();
          animId = requestAnimationFrame(animate);
        }
      },
      { threshold: 0.05 }
    );
    observer.observe(container);

    const animate = () => {
      if (!isVisible) return;
      animId = requestAnimationFrame(animate);
      const dt = Math.min(0.05, clock.getDelta());
      const time = clock.getElapsedTime();

      const damp = 1 - Math.exp(-14.0 * dt);
      const { pointerTarget, pointerCurrent, pointerVelocity } = stateRef.current;

      pointerCurrent.x += (pointerTarget.x - pointerCurrent.x) * damp;
      pointerCurrent.y += (pointerTarget.y - pointerCurrent.y) * damp;
      pointerVelocity.multiplyScalar(0.88);

      dandelionGroup.position.set(0, 0, 0);
      dandelionGroup.rotation.y = time * 0.12;
      dandelionGroup.rotation.x = Math.sin(time * 0.2) * 0.05;

      camera.position.set(0, 0, 8.8);
      camera.lookAt(0, 0, 0);

      const isSpk = stateRef.current.isSpeakingRef;
      const coreScale = isSpk ? 1 + Math.sin(time * 10) * 0.15 : 1 + Math.sin(time * 2) * 0.04;
      coreMesh.scale.set(coreScale, coreScale, coreScale);

      const activeId = stateRef.current.activeSubId;
      const hoveredId = stateRef.current.hoveredSubId;

      const shiftX = pointerCurrent.x * 2.2 + pointerVelocity.x * 0.15;
      const shiftY = pointerCurrent.y * 2.2 + pointerVelocity.y * 0.15;

      spokes.forEach((spoke) => {
        const isAct = spoke.subjectId === activeId;
        const isHov = spoke.subjectId === hoveredId;

        let targetLen = spoke.baseLength;
        if (isHov || isAct) {
          targetLen = spoke.baseLength * 1.25;
        }
        spoke.currentLength += (targetLen - spoke.currentLength) * damp * 4.0;

        const dotDisplacementFactor = Math.pow(spoke.currentLength / 3.3, 1.15);
        tempTipTarget.set(
          spoke.dir.x * spoke.currentLength + shiftX * 0.9 * dotDisplacementFactor,
          spoke.dir.y * spoke.currentLength + shiftY * 0.9 * dotDisplacementFactor,
          spoke.dir.z * spoke.currentLength
        );

        spoke.tipMesh.position.lerp(tempTipTarget, damp * 4.0);

        const tipScale = isAct ? 1.45 : isHov ? 1.3 : 1.0;
        tempScaleVec.set(tipScale, tipScale, tipScale);
        spoke.tipMesh.scale.lerp(tempScaleVec, damp * 4.0);

        const positions = spoke.line.geometry.attributes.position.array as Float32Array;
        positions[0] = 0;
        positions[1] = 0;
        positions[2] = 0;
        positions[3] = spoke.tipMesh.position.x;
        positions[4] = spoke.tipMesh.position.y;
        positions[5] = spoke.tipMesh.position.z;
        spoke.line.geometry.attributes.position.needsUpdate = true;

        const lineMat = spoke.line.material as THREE.LineBasicMaterial;
        if (isAct || isHov) {
          lineMat.color.setHex(0xe03e1a);
          lineMat.opacity = 0.95;
        } else if (spoke.isSubject) {
          lineMat.color.setHex(0x0f0f10);
          lineMat.opacity = 0.75;
        }
      });

      smallBalls.forEach((b) => {
        b.orbitAngle += b.orbitSpeed * dt;
        b.floatPhase += b.floatSpeed;

        const baseOrbitX = Math.cos(b.orbitAngle) * b.orbitRadius;
        const baseOrbitZ = Math.sin(b.orbitAngle) * b.orbitRadius;
        const baseOrbitY = b.baseOffset.y + Math.sin(b.floatPhase) * 0.22;

        const ballTargetX = baseOrbitX + shiftX * (1.1 + b.orbitRadius * 0.35);
        const ballTargetY = baseOrbitY + shiftY * (1.1 + b.orbitRadius * 0.35);
        const ballTargetZ = baseOrbitZ;

        b.mesh.position.x += (ballTargetX - b.mesh.position.x) * damp * 4.0;
        b.mesh.position.y += (ballTargetY - b.mesh.position.y) * damp * 4.0;
        b.mesh.position.z += (ballTargetZ - b.mesh.position.z) * damp * 4.0;
      });

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      observer.disconnect();
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('mousemove', onPointerMove);
      renderer.dispose();
      scene.clear();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative w-full h-full select-none flex items-center justify-center">
      <div ref={containerRef} className="w-full h-full relative cursor-crosshair" style={{ touchAction: 'none' }} />
      <div className="hidden sm:flex absolute inset-0 pointer-events-none items-center justify-center">
        {SUBJECTS_CONFIG.map((sub) => {
          const isActive = sub.id === activeSubject;
          const isHover = sub.id === hoveredNode;
          const radiusPercentX = 40;
          const radiusPercentY = 32;

          const left = 50 + Math.cos(sub.angle) * radiusPercentX;
          const top = 50 - (Math.sin(sub.angle) * radiusPercentY + sub.elevation * 14);

          return (
            <div
              key={sub.id}
              style={{ left: `${left}%`, top: `${top}%`, transform: 'translate(-50%, -50%)' }}
              className="absolute pointer-events-auto transition-all duration-300"
            >
              <button
                type="button"
                onMouseEnter={() => {
                  setHoveredNode(sub.id);
                  onSelectSubject(sub.id);
                }}
                onMouseLeave={() => setHoveredNode(null)}
                onClick={() => onSelectSubject(sub.id)}
                className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium transition-all duration-200 border cursor-pointer ${
                  isActive
                    ? 'bg-[#0F0F10] text-white border-[#0F0F10] shadow-lg scale-108'
                    : isHover
                    ? 'bg-white text-[#E03E1A] border-[#E03E1A]/50 shadow-md scale-105'
                    : 'bg-white/90 text-neutral-700 border-neutral-200/90 backdrop-blur-md hover:bg-white'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-[#E03E1A]' : 'bg-neutral-400 group-hover:bg-[#E03E1A]'}`} />
                <span className="font-mono tracking-tight font-semibold">{sub.name}</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Hero3DScene;
