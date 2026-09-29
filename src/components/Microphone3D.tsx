import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface Microphone3DProps {
  className?: string;
  scrollProgress?: number;
  interactive?: boolean;
  mode?: 'hero' | 'cta' | 'compact';
}

// Robust WebGL capability & shader precision verification
function checkWebGLSupport(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const testCanvas = document.createElement('canvas');
    const gl = (testCanvas.getContext('webgl2') ||
      testCanvas.getContext('webgl') ||
      testCanvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;
    if (!gl) return false;

    // Critical: check shader precision format to prevent "Cannot read properties of null (reading 'precision')"
    const vertexFormat = gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.HIGH_FLOAT);
    const fragFormat = gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT);
    if (!vertexFormat || typeof vertexFormat.precision !== 'number') return false;
    if (!fragFormat || typeof fragFormat.precision !== 'number') return false;

    return true;
  } catch {
    return false;
  }
}

export const Microphone3D: React.FC<Microphone3DProps> = ({
  className = '',
  scrollProgress = 0,
  interactive = true,
  mode = 'hero',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasWebGL, setHasWebGL] = useState<boolean>(() => checkWebGLSupport());
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const modeRef = useRef(mode);
  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  // Keep scroll progress in a ref to avoid tearing down & recreating WebGL context on scroll
  const scrollProgressRef = useRef<number>(scrollProgress);
  useEffect(() => {
    scrollProgressRef.current = scrollProgress;
  }, [scrollProgress]);

  // Interaction tracking with smooth damping
  const mouseRef = useRef({
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
    isDragging: false,
    lastX: 0,
    lastY: 0,
    dragRotationX: 0,
    dragRotationY: 0,
  });

  const micGroupRef = useRef<THREE.Group | null>(null);

  useEffect(() => {
    if (!hasWebGL) return;

    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    let renderer: THREE.WebGLRenderer | null = null;
    let animationFrameId: number;

    try {
      // 1. Renderer Setup
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      });
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.75);
      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.25;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFShadowMap;

      // 2. Scene & Camera Setup
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(
        36,
        container.clientWidth / container.clientHeight,
        0.1,
        100
      );
      camera.position.set(0, 0.25, 4.8);

      // 3. Studio Environment Reflection Map
      const envCanvas = document.createElement('canvas');
      envCanvas.width = 512;
      envCanvas.height = 256;
      const ctx = envCanvas.getContext('2d');
      if (ctx) {
        const bgGrad = ctx.createLinearGradient(0, 0, 0, 256);
        bgGrad.addColorStop(0, '#0a0a0f');
        bgGrad.addColorStop(0.5, '#121218');
        bgGrad.addColorStop(1, '#050505');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, 512, 256);

        // Key Softbox light reflection on upper right
        const softbox1 = ctx.createRadialGradient(380, 70, 0, 380, 70, 110);
        softbox1.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
        softbox1.addColorStop(0.4, 'rgba(230, 240, 255, 0.6)');
        softbox1.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = softbox1;
        ctx.fillRect(250, 0, 260, 180);

        // Fill Softbox on left
        const softbox2 = ctx.createRadialGradient(120, 100, 0, 120, 100, 90);
        softbox2.addColorStop(0, 'rgba(180, 200, 220, 0.5)');
        softbox2.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = softbox2;
        ctx.fillRect(20, 10, 200, 180);

        // Subtle emerald horizon accent
        const emeraldStreak = ctx.createLinearGradient(0, 180, 512, 180);
        emeraldStreak.addColorStop(0, 'rgba(0, 166, 81, 0.25)');
        emeraldStreak.addColorStop(0.5, 'rgba(0, 255, 120, 0.4)');
        emeraldStreak.addColorStop(1, 'rgba(0, 166, 81, 0.1)');
        ctx.fillStyle = emeraldStreak;
        ctx.fillRect(0, 160, 512, 40);

        const envTexture = new THREE.CanvasTexture(envCanvas);
        envTexture.mapping = THREE.EquirectangularReflectionMapping;
        scene.environment = envTexture;
      }

      // 4. Studio Lighting Architecture
      // Key Light
      const keyLight = new THREE.DirectionalLight(0xffffff, 2.8);
      keyLight.position.set(4, 5, 4.5);
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.width = 1024;
      keyLight.shadow.mapSize.height = 1024;
      keyLight.shadow.bias = -0.001;
      scene.add(keyLight);

      // Fill Light
      const fillLight = new THREE.DirectionalLight(0x8fa8bf, 1.4);
      fillLight.position.set(-4, 2.5, 3);
      scene.add(fillLight);

      // Signature RISE Emerald Rim Light (Back-flank contour edge)
      const emeraldRimLight = new THREE.DirectionalLight(0x00a651, 4.8);
      emeraldRimLight.position.set(-3.5, 3.5, -3.5);
      scene.add(emeraldRimLight);

      const emeraldRimLight2 = new THREE.PointLight(0x00a651, 3.2, 7);
      emeraldRimLight2.position.set(3, -0.5, -2);
      scene.add(emeraldRimLight2);

      const ambientLight = new THREE.AmbientLight(0x141416, 1.2);
      scene.add(ambientLight);

      // Stage 4 Sweep Spotlight across metallic louvers
      const sweepLight = new THREE.SpotLight(0xffffff, 0, 16, Math.PI / 4, 0.35, 1);
      sweepLight.position.set(-4, 2.5, 4);
      scene.add(sweepLight);

      // 5. Materials with Physically Accurate Studio Sheen
      const obsidianChrome = new THREE.MeshStandardMaterial({
        color: 0x141416,
        metalness: 0.92,
        roughness: 0.18,
      });

      const brushedGunmetal = new THREE.MeshStandardMaterial({
        color: 0x1e2024,
        metalness: 0.88,
        roughness: 0.28,
      });

      const vintageLouverChrome = new THREE.MeshStandardMaterial({
        color: 0xa4acb3,
        metalness: 0.90,
        roughness: 0.22,
      });

      const knurledDarkMetal = new THREE.MeshStandardMaterial({
        color: 0x0f0f11,
        metalness: 0.82,
        roughness: 0.42,
      });

      const emeraldAccentMaterial = new THREE.MeshBasicMaterial({
        color: 0x00a651,
      });

      const acousticMeshMaterial = new THREE.MeshStandardMaterial({
        color: 0x08080a,
        roughness: 0.85,
        metalness: 0.4,
      });

      // Root Group
      const rootGroup = new THREE.Group();
      micGroupRef.current = rootGroup;
      scene.add(rootGroup);

      // Microphone Model Assembly
      const micAssembly = new THREE.Group();
      rootGroup.add(micAssembly);

      // ---------------- A. Desktop Weighted Stand ----------------
      const basePlinthGeo = new THREE.CylinderGeometry(0.88, 0.96, 0.12, 64);
      const basePlinth = new THREE.Mesh(basePlinthGeo, obsidianChrome);
      basePlinth.position.y = -1.82;
      basePlinth.receiveShadow = true;
      micAssembly.add(basePlinth);

      const baseTierGeo = new THREE.CylinderGeometry(0.76, 0.86, 0.08, 64);
      const baseTier = new THREE.Mesh(baseTierGeo, brushedGunmetal);
      baseTier.position.y = -1.72;
      micAssembly.add(baseTier);

      const baseTrimRingGeo = new THREE.TorusGeometry(0.74, 0.02, 16, 64);
      baseTrimRingGeo.rotateX(Math.PI / 2);
      const baseTrimRing = new THREE.Mesh(baseTrimRingGeo, obsidianChrome);
      baseTrimRing.position.y = -1.68;
      micAssembly.add(baseTrimRing);

      // ---------------- B. Vertical Riser Stem ----------------
      const stemLowerGeo = new THREE.CylinderGeometry(0.12, 0.13, 0.65, 32);
      const stemLower = new THREE.Mesh(stemLowerGeo, obsidianChrome);
      stemLower.position.y = -1.35;
      micAssembly.add(stemLower);

      const collarNutGeo = new THREE.CylinderGeometry(0.17, 0.17, 0.11, 32);
      const collarNut = new THREE.Mesh(collarNutGeo, knurledDarkMetal);
      collarNut.position.y = -1.02;
      micAssembly.add(collarNut);

      const stemUpperGeo = new THREE.CylinderGeometry(0.11, 0.11, 0.32, 32);
      const stemUpper = new THREE.Mesh(stemUpperGeo, obsidianChrome);
      stemUpper.position.y = -0.82;
      micAssembly.add(stemUpper);

      // ---------------- C. Cast Metal Yoke Bracket (U-Cradle) ----------------
      const yokeGroup = new THREE.Group();
      yokeGroup.position.y = -0.72;
      micAssembly.add(yokeGroup);

      const yokeHubGeo = new THREE.CylinderGeometry(0.19, 0.19, 0.14, 32);
      const yokeHub = new THREE.Mesh(yokeHubGeo, brushedGunmetal);
      yokeGroup.add(yokeHub);

      const yokeCurve = new THREE.EllipseCurve(0, 0.58, 0.74, 0.74, -Math.PI * 0.92, -Math.PI * 0.08, false, 0);
      const yokePoints = yokeCurve.getPoints(40);
      const yokeTubeGeo = new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3(yokePoints.map((p) => new THREE.Vector3(p.x, p.y, 0))),
        40,
        0.052,
        16,
        false
      );
      const yokeArm = new THREE.Mesh(yokeTubeGeo, obsidianChrome);
      yokeGroup.add(yokeArm);

      const knobHubGeo = new THREE.CylinderGeometry(0.13, 0.13, 0.11, 24);
      knobHubGeo.rotateZ(Math.PI / 2);
      const knobScrewGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.18, 16);
      knobScrewGeo.rotateZ(Math.PI / 2);

      const leftKnobGroup = new THREE.Group();
      leftKnobGroup.position.set(-0.71, 0.58, 0);
      const knobHubL = new THREE.Mesh(knobHubGeo, knurledDarkMetal);
      leftKnobGroup.add(knobHubL);
      const knobScrewL = new THREE.Mesh(knobScrewGeo, obsidianChrome);
      leftKnobGroup.add(knobScrewL);
      yokeGroup.add(leftKnobGroup);

      const rightKnobGroup = new THREE.Group();
      rightKnobGroup.position.set(0.71, 0.58, 0);
      const knobHubR = new THREE.Mesh(knobHubGeo, knurledDarkMetal);
      rightKnobGroup.add(knobHubR);
      const knobScrewR = new THREE.Mesh(knobScrewGeo, obsidianChrome);
      rightKnobGroup.add(knobScrewR);
      yokeGroup.add(rightKnobGroup);

      // ---------------- D. Microphone Body & Grille Assembly ----------------
      const micBody = new THREE.Group();
      micBody.position.y = -0.14;
      micAssembly.add(micBody);

      const lowerCapsuleGeo = new THREE.CylinderGeometry(0.56, 0.52, 0.88, 48);
      const lowerCapsule = new THREE.Mesh(lowerCapsuleGeo, obsidianChrome);
      lowerCapsule.position.y = -0.04;
      lowerCapsule.castShadow = true;
      micBody.add(lowerCapsule);

      const bottomDomeGeo = new THREE.SphereGeometry(0.52, 32, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
      const bottomDome = new THREE.Mesh(bottomDomeGeo, obsidianChrome);
      bottomDome.position.y = -0.48;
      micBody.add(bottomDome);

      // Front Dial Housing & Emerald Ring
      const dialHousingGeo = new THREE.CylinderGeometry(0.22, 0.24, 0.08, 32);
      dialHousingGeo.rotateX(Math.PI / 2);
      const dialHousing = new THREE.Mesh(dialHousingGeo, knurledDarkMetal);
      dialHousing.position.set(0, -0.05, 0.53);
      micBody.add(dialHousing);

      const dialRingGeo = new THREE.TorusGeometry(0.17, 0.016, 16, 32);
      const dialRing = new THREE.Mesh(dialRingGeo, emeraldAccentMaterial);
      dialRing.position.set(0, -0.05, 0.575);
      micBody.add(dialRing);

      const dialCenterGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.03, 24);
      dialCenterGeo.rotateX(Math.PI / 2);
      const dialCenter = new THREE.Mesh(dialCenterGeo, brushedGunmetal);
      dialCenter.position.set(0, -0.05, 0.585);
      micBody.add(dialCenter);

      // ---------------- E. Louvered Grille Capsule ----------------
      const acousticCoreGeo = new THREE.CylinderGeometry(0.51, 0.51, 1.05, 32);
      const acousticCore = new THREE.Mesh(acousticCoreGeo, acousticMeshMaterial);
      acousticCore.position.y = 0.92;
      micBody.add(acousticCore);

      const acousticDomeGeo = new THREE.SphereGeometry(0.51, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
      const acousticDome = new THREE.Mesh(acousticDomeGeo, acousticMeshMaterial);
      acousticDome.position.y = 1.44;
      micBody.add(acousticDome);

      // Horizontal Chrome Louvers
      const ribCount = 8;
      for (let i = 0; i < ribCount; i++) {
        const ribY = 0.44 + i * 0.145;
        const ribGeo = new THREE.TorusGeometry(0.548, 0.032, 16, 48);
        ribGeo.rotateX(Math.PI / 2);
        const rib = new THREE.Mesh(ribGeo, vintageLouverChrome);
        rib.position.y = ribY;
        rib.castShadow = true;
        micBody.add(rib);
      }

      const topDomeArchGeo = new THREE.TorusGeometry(0.44, 0.028, 16, 48);
      topDomeArchGeo.rotateX(Math.PI / 2);
      const topDomeArch = new THREE.Mesh(topDomeArchGeo, vintageLouverChrome);
      topDomeArch.position.y = 1.58;
      micBody.add(topDomeArch);

      const topDomeCapGeo = new THREE.SphereGeometry(0.53, 32, 16, 0, Math.PI * 2, 0, Math.PI / 4);
      const topDomeCap = new THREE.Mesh(topDomeCapGeo, obsidianChrome);
      topDomeCap.position.y = 1.45;
      micBody.add(topDomeCap);

      const spineAngles = [0, Math.PI * 0.5, Math.PI, Math.PI * 1.5];
      spineAngles.forEach((angle) => {
        const spineGeo = new THREE.CylinderGeometry(0.024, 0.024, 1.15, 12);
        const spine = new THREE.Mesh(spineGeo, obsidianChrome);
        spine.position.set(Math.cos(angle) * 0.552, 0.94, Math.sin(angle) * 0.552);
        micBody.add(spine);
      });

      // ---------------- F. 3D Geometric Acoustic Soundwave Rings (Priority 2) ----------------
      const waveRings: THREE.Mesh[] = [];
      const ringCount = 5;
      for (let i = 0; i < ringCount; i++) {
        const ringGeo = new THREE.RingGeometry(0.85 + i * 0.42, 0.88 + i * 0.42, 64);
        const waveMat = new THREE.MeshBasicMaterial({
          color: 0x00a651,
          transparent: true,
          opacity: 0,
          side: THREE.DoubleSide,
        });
        const waveRing = new THREE.Mesh(ringGeo, waveMat);
        waveRing.position.set(0, 0.8, -0.1);
        micAssembly.add(waveRing);
        waveRings.push(waveRing);
      }

      // ---------------- Mouse & Touch Interaction Handlers ----------------
      const handleMouseMove = (e: MouseEvent) => {
        if (!interactive) return;
        const rect = container.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
        mouseRef.current.targetX = Math.max(-0.6, Math.min(0.6, x * 0.35));
        mouseRef.current.targetY = Math.max(-0.4, Math.min(0.4, y * 0.25));
      };

      const handleMouseDown = (e: MouseEvent) => {
        mouseRef.current.isDragging = true;
        mouseRef.current.lastX = e.clientX;
        mouseRef.current.lastY = e.clientY;
      };

      const handleMouseUp = () => {
        mouseRef.current.isDragging = false;
      };

      const handleDragMove = (e: MouseEvent) => {
        if (!mouseRef.current.isDragging) return;
        const deltaX = e.clientX - mouseRef.current.lastX;
        const deltaY = e.clientY - mouseRef.current.lastY;
        mouseRef.current.dragRotationY += deltaX * 0.008;
        mouseRef.current.dragRotationX = Math.max(
          -0.5,
          Math.min(0.5, mouseRef.current.dragRotationX + deltaY * 0.006)
        );
        mouseRef.current.lastX = e.clientX;
        mouseRef.current.lastY = e.clientY;
      };

      const handleTouchStart = (e: TouchEvent) => {
        if (e.touches.length > 0) {
          mouseRef.current.isDragging = true;
          mouseRef.current.lastX = e.touches[0].clientX;
          mouseRef.current.lastY = e.touches[0].clientY;
        }
      };

      const handleTouchMove = (e: TouchEvent) => {
        if (!interactive || e.touches.length === 0) return;
        const touch = e.touches[0];
        if (mouseRef.current.isDragging) {
          const deltaX = touch.clientX - mouseRef.current.lastX;
          const deltaY = touch.clientY - mouseRef.current.lastY;
          mouseRef.current.dragRotationY += deltaX * 0.009;
          mouseRef.current.dragRotationX = Math.max(
            -0.5,
            Math.min(0.5, mouseRef.current.dragRotationX + deltaY * 0.007)
          );
          mouseRef.current.lastX = touch.clientX;
          mouseRef.current.lastY = touch.clientY;
        }
      };

      const handleTouchEnd = () => {
        mouseRef.current.isDragging = false;
      };

      if (interactive) {
        window.addEventListener('mousemove', handleMouseMove, { passive: true });
        window.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mouseup', handleMouseUp);
        window.addEventListener('mousemove', handleDragMove);
        container.addEventListener('touchstart', handleTouchStart, { passive: true });
        window.addEventListener('touchmove', handleTouchMove, { passive: true });
        window.addEventListener('touchend', handleTouchEnd);
      }

      // ---------------- Animation Loop with Smooth Interpolation ----------------
      const startTime = performance.now();
      let isVisible = true;

      const observer = new IntersectionObserver(
        (entries) => {
          isVisible = entries[0].isIntersecting;
        },
        { threshold: 0.05 }
      );
      observer.observe(container);

      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      const animate = () => {
        animationFrameId = requestAnimationFrame(animate);
        if (!isVisible || !renderer) return;

        const elapsed = (performance.now() - startTime) / 1000;
        const currentMode = modeRef.current;

        // Cinematic Hero Intro (Requirement 3):
        // Start almost completely black. Reveal a very subtle emerald highlight on the microphone,
        // then gently bring up key and fill studio lights.
        const introProgress = Math.min(1, elapsed / 2.2);
        if (introProgress < 1) {
          // Emerald rim light glows early, etching the microphone silhouette
          emeraldRimLight.intensity = Math.min(4.8, 1.2 + introProgress * 3.6);
          // Key & Fill smoothly fade up as text emerges
          const keyFade = Math.max(0, (introProgress - 0.25) / 0.75);
          keyLight.intensity = keyFade * 2.8;
          fillLight.intensity = keyFade * 1.4;
          ambientLight.intensity = 0.2 + keyFade * 1.0;
        } else {
          keyLight.intensity = 2.8;
          fillLight.intensity = 1.4;
          ambientLight.intensity = 1.2;
          emeraldRimLight.intensity = 4.8;
        }

        // Smooth mouse lerp
        mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.06;
        mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.06;
        mouseRef.current.dragRotationX *= 0.94;
        mouseRef.current.dragRotationY *= 0.94;

        // Current scroll progress (0.0 to 1.0)
        const p = Math.max(0, Math.min(1, scrollProgressRef.current));

        if (currentMode === 'cta') {
          // Final CTA Section Mode (Requirement 14):
          // Subtle presence beside/behind typography, fading into darkness as user scrolls toward footer
          const ctaDim = Math.max(0, 1 - p * 0.85);
          ambientLight.intensity = 0.6 * ctaDim;
          keyLight.intensity = 1.5 * ctaDim;
          emeraldRimLight.intensity = 3.0 * ctaDim;
          camera.position.set(0, 0.1, 4.4);
          if (micGroupRef.current) {
            const floatY = prefersReducedMotion ? 0 : Math.sin(elapsed * 1.2) * 0.06;
            micGroupRef.current.position.set(0.6, floatY, -0.4);
            micGroupRef.current.rotation.y = Math.PI * 0.15 + Math.sin(elapsed * 0.3) * 0.05 + mouseRef.current.x;
            micGroupRef.current.rotation.x = -mouseRef.current.y * 0.2;
            micGroupRef.current.scale.set(0.92, 0.92, 0.92);
          }
          renderer.render(scene, camera);
          return;
        }

        // ---------------- SCROLL-DRIVEN 3D STORY (Requirement 4: 9 STAGES) ----------------
        // Stage 1 (0.00-0.12): Centered in darkness with gentle idle float
        // Stage 2 (0.12-0.24): Camera slowly approaches closer
        // Stage 3 (0.24-0.36): Microphone rotates gracefully
        // Stage 4 (0.36-0.48): Light travels over the metallic surface (sweepLight)
        // Stage 5 (0.48-0.62): Subtle sound-wave geometry appears & ripples
        // Stage 6 (0.62-0.74): Camera moves past/around the microphone
        // Stage 7 (0.74-0.84): Featured episode emerges, microphone shifts to background right
        // Stage 8 (0.84-0.94): Microphone becomes part of the background
        // Stage 9 (0.94-1.00): Editorial content takes visual priority

        let targetCamZ = 4.8;
        let targetCamY = 0.25;
        let targetCamX = 0;

        if (p <= 0.12) {
          // Stage 1
          targetCamZ = 4.8;
          targetCamY = 0.25;
        } else if (p <= 0.24) {
          // Stage 2: Camera approaches
          const subP = (p - 0.12) / 0.12;
          targetCamZ = 4.8 - subP * 0.8; // 4.8 -> 4.0
          targetCamY = 0.25 + subP * 0.2;
        } else if (p <= 0.48) {
          // Stage 3 & 4: Rotation & Light sweep
          targetCamZ = 4.0;
          targetCamY = 0.45;
        } else if (p <= 0.74) {
          // Stage 5 & 6: Soundwaves & Camera pivot
          const subP = (p - 0.48) / 0.26;
          targetCamZ = 4.0 - subP * 0.4;
          targetCamX = subP * 0.4;
          targetCamY = 0.45 + subP * 0.15;
        } else {
          // Stage 7, 8, 9: Shifting into background as content takes over
          const subP = (p - 0.74) / 0.26;
          targetCamZ = 3.6 + subP * 1.6; // 3.6 -> 5.2
          targetCamX = 0.4 - subP * 0.4;
          targetCamY = 0.6 - subP * 0.3;
        }

        camera.position.z += (targetCamZ - camera.position.z) * 0.08;
        camera.position.y += (targetCamY - camera.position.y) * 0.08;
        camera.position.x += (targetCamX - camera.position.x) * 0.08;

        // Stage 4: Light traveling over the metallic surface
        if (p >= 0.32 && p <= 0.58) {
          const lightP = (p - 0.32) / 0.26;
          const arc = Math.sin(lightP * Math.PI);
          sweepLight.intensity = arc * 5.2;
          sweepLight.position.x = -5 + lightP * 10; // sweeps smoothly from left to right
          sweepLight.position.y = 2.5 + Math.sin(lightP * Math.PI) * 0.5;
        } else {
          sweepLight.intensity = 0;
        }

        // Microphone Physical Placement & Movement
        if (micGroupRef.current) {
          const floatY = prefersReducedMotion ? 0 : Math.sin(elapsed * 1.3) * 0.045;
          // Smooth rotation across scroll
          let scrollRotY = 0;
          if (p <= 0.24) {
            scrollRotY = 0;
          } else if (p <= 0.48) {
            scrollRotY = ((p - 0.24) / 0.24) * 0.6; // ~34 degrees rotation
          } else if (p <= 0.74) {
            scrollRotY = 0.6 + ((p - 0.48) / 0.26) * 0.7; // ~74 degrees
          } else {
            scrollRotY = 1.3 + ((p - 0.74) / 0.26) * 0.5; // ~103 degrees
          }

          // Shifting rightward as content emerges
          const shiftX = p > 0.65 ? ((p - 0.65) / 0.35) * 1.6 : 0;
          const targetScale = p > 0.7 ? 1 - ((p - 0.7) / 0.3) * 0.28 : 1;

          micGroupRef.current.position.y = floatY;
          micGroupRef.current.position.x = shiftX;
          micGroupRef.current.scale.set(targetScale, targetScale, targetScale);

          micGroupRef.current.rotation.y =
            scrollRotY +
            (prefersReducedMotion ? 0 : Math.sin(elapsed * 0.35) * 0.04) +
            mouseRef.current.x +
            mouseRef.current.dragRotationY;
          micGroupRef.current.rotation.x =
            -mouseRef.current.y * 0.35 + mouseRef.current.dragRotationX;
        }

        // Stage 5: Sound Wave Geometry (Active between 0.45 and 0.85)
        waveRings.forEach((wave, idx) => {
          let waveOpacity = 0;
          if (p >= 0.42 && p <= 0.85) {
            const normP = (p - 0.42) / 0.43;
            const bell = Math.sin(normP * Math.PI);
            const scale = 1 + ((elapsed * 0.85 + idx * 0.28) % 1.5) * 0.48;
            wave.scale.set(scale, scale, 1);
            waveOpacity = bell * Math.max(0, 0.42 - (scale - 1) * 0.45);
          }
          (wave.material as THREE.MeshBasicMaterial).opacity = waveOpacity;
        });

        renderer.render(scene, camera);
      };

      animate();
      setIsLoaded(true);

      // Resize Handler
      const handleResize = () => {
        if (!container || !renderer) return;
        const width = container.clientWidth;
        const height = container.clientHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
      };

      window.addEventListener('resize', handleResize);

      const handleContextLost = (e: Event) => {
        e.preventDefault();
        setHasWebGL(false);
      };
      canvas.addEventListener('webglcontextlost', handleContextLost);

      return () => {
        cancelAnimationFrame(animationFrameId);
        observer.disconnect();
        if (interactive) {
          window.removeEventListener('mousemove', handleMouseMove);
          window.removeEventListener('mousedown', handleMouseDown);
          window.removeEventListener('mouseup', handleMouseUp);
          window.removeEventListener('mousemove', handleDragMove);
          container.removeEventListener('touchstart', handleTouchStart);
          window.removeEventListener('touchmove', handleTouchMove);
          window.removeEventListener('touchend', handleTouchEnd);
        }
        window.removeEventListener('resize', handleResize);
        canvas.removeEventListener('webglcontextlost', handleContextLost);
        renderer?.dispose();
      };
    } catch (err) {
      console.warn('WebGL init error encountered, gracefully switching to high-definition fallback:', err);
      setHasWebGL(false);
      return;
    }
  }, [hasWebGL, interactive]);

  // Click tactile pulse
  const handleMicrophoneClick = () => {
    if (!micGroupRef.current) return;
    const group = micGroupRef.current;
    let t = 0;
    const interval = setInterval(() => {
      t += 0.12;
      const s = 1 + Math.sin(t * Math.PI) * 0.05;
      group.scale.set(s, s, s);
      if (t >= 1) {
        clearInterval(interval);
        group.scale.set(1, 1, 1);
      }
    }, 16);
  };

  return (
    <div
      ref={containerRef}
      onClick={handleMicrophoneClick}
      className={`relative w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing select-none ${className}`}
      title="Click or drag to interact with RISE Pakistan Studio Microphone"
    >
      {hasWebGL ? (
        <>
          <canvas
            ref={canvasRef}
            className={`w-full h-full object-contain transition-opacity duration-700 ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
          {/* Subtle Emerald Studio Backlight Glow */}
          <div className="absolute inset-0 pointer-events-none -z-10 flex items-center justify-center">
            <div className="w-80 h-80 md:w-[420px] md:h-[420px] rounded-full bg-emerald-500/10 blur-[100px] animate-pulse-glow" />
          </div>
        </>
      ) : (
        /* High-Definition WebGL Fallback Container using supplied microphone image */
        <div className="relative w-full h-full flex items-center justify-center p-6">
          <div className="relative max-w-md w-full aspect-square flex items-center justify-center">
            <img
              src="/assets/microphone.jpg"
              alt="RISE Pakistan Vintage Studio Microphone"
              referrerPolicy="no-referrer"
              className="max-h-full object-contain filter drop-shadow-[0_20px_40px_rgba(0,166,81,0.25)]"
            />
            <div className="absolute inset-0 rounded-full bg-emerald-500/10 blur-3xl -z-10" />
          </div>
        </div>
      )}
    </div>
  );
};
