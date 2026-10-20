import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

interface Biometric3DProps {
  currentStage: 'idle' | 'front' | 'back' | 'face' | 'analyzing' | 'approved' | 'rejected';
  biometricScore?: number;
}

// Module-scope pre-allocated scratch objects for zero GC in render loop
const _vec3 = new THREE.Vector3();
const _rot = new THREE.Euler();

export const Biometric3DCanvas: React.FC<Biometric3DProps> = ({ currentStage, biometricScore }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeMode, setActiveMode] = useState<'biometric' | 'hologram' | 'quantum'>('biometric');
  const [scanSpeed, setScanSpeed] = useState(1);

  // References to animate scene parts
  const headGroupRef = useRef<THREE.Group | null>(null);
  const scanRingGroupRef = useRef<THREE.Group | null>(null);
  const ineCardGroupRef = useRef<THREE.Group | null>(null);
  const laserPlaneRef = useRef<THREE.Mesh | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);
  const currentStageRef = useRef(currentStage);

  useEffect(() => {
    currentStageRef.current = currentStage;
  }, [currentStage]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Detect software WebGL from unmasked GPU renderer string
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    const width = container.clientWidth || 400;
    const height = container.clientHeight || 300;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x030712); // slate-950
    scene.fog = new THREE.FogExp2(0x030712, 0.08);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 1.2, 3.8);
    camera.lookAt(0, 0.8, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // Studio Environment reflection using RoomEnvironment + PMREMGenerator
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // Balanced 3-point Studio Lighting Rig
    const keyLight = new THREE.DirectionalLight(0x38bdf8, 2.5); // Warm cyan key
    keyLight.position.set(3, 4, 3);
    keyLight.castShadow = !isSoftwareGl;
    scene.add(keyLight);

    const fillLight = new THREE.HemisphereLight(0x06b6d4, 0x1e1b4b, 1.2); // Cool cyan sky to violet ground
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0x10b981, 2.0); // Emerald rim
    rimLight.position.set(-3, 2, -2);
    scene.add(rimLight);

    // Soft radial contact shadow plane
    const shadowGeo = new THREE.PlaneGeometry(3.5, 3.5);
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 128;
    shadowCanvas.height = 128;
    const sctx = shadowCanvas.getContext('2d')!;
    const grad = sctx.createRadialGradient(64, 64, 0, 64, 64, 60);
    grad.addColorStop(0, 'rgba(0, 240, 255, 0.25)');
    grad.addColorStop(0.5, 'rgba(0, 0, 0, 0.35)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    sctx.fillStyle = grad;
    sctx.fillRect(0, 0, 128, 128);

    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    shadowTex.colorSpace = THREE.SRGBColorSpace;
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
    });
    const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = 0.01;
    scene.add(shadowPlane);

    // -------------------------------------------------------------
    // Composite 3–12 Part Procedural Biometric Head & INE Hologram
    // -------------------------------------------------------------
    const heroGroup = new THREE.Group();
    heroGroup.position.set(0, 0, 0);
    scene.add(heroGroup);
    headGroupRef.current = heroGroup;

    // Part 1: Cranium Wireframe / Glassy Shell (Silhouette)
    const craniumGeo = new THREE.IcosahedronGeometry(0.72, 3);
    const craniumMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.2,
      metalness: 0.85,
      wireframe: true,
      transparent: true,
      opacity: 0.45,
    });
    const craniumMesh = new THREE.Mesh(craniumGeo, craniumMat);
    craniumMesh.position.set(0, 0.95, 0);
    heroGroup.add(craniumMesh);

    // Part 2: Inner Core (Procedural Brain / Biometric Quantum Core)
    const coreGeo = new THREE.SphereGeometry(0.48, 16, 16);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      roughness: 0.1,
      metalness: 0.9,
      emissive: 0x0891b2,
      emissiveIntensity: 0.4,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    coreMesh.position.set(0, 0.95, 0);
    heroGroup.add(coreMesh);

    // Part 3: Facial Landmark Nodes (Instanced 24 biometric keypoints)
    const landmarkCount = 28;
    const landmarkGeo = new THREE.SphereGeometry(0.024, 8, 8);
    const landmarkMat = new THREE.MeshBasicMaterial({ color: 0x34d399 });
    const landmarkInst = new THREE.InstancedMesh(landmarkGeo, landmarkMat, landmarkCount);
    const dummy = new THREE.Object3D();

    // Generate face topography positions
    let lIdx = 0;
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 7; c++) {
        const u = (c - 3) * 0.14;
        const v = 0.65 + (r * 0.18);
        const z = Math.sqrt(Math.max(0, 0.72 * 0.72 - u * u - (v - 0.95) * (v - 0.95))) * 0.95 + 0.05;
        dummy.position.set(u, v, z);
        dummy.scale.setScalar(1);
        dummy.updateMatrix();
        landmarkInst.setMatrixAt(lIdx++, dummy.matrix);
      }
    }
    landmarkInst.instanceMatrix.needsUpdate = true;
    heroGroup.add(landmarkInst);

    // Part 4: Mandible and Zygomatic Arch (Secondary Structure)
    const jawCurve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(-0.45, 0.85, 0.1),
      new THREE.Vector3(0, 0.35, 0.6),
      new THREE.Vector3(0.45, 0.85, 0.1)
    );
    const jawGeo = new THREE.TubeGeometry(jawCurve, 20, 0.035, 8, false);
    const jawMat = new THREE.MeshStandardMaterial({
      color: 0x0ea5e9,
      roughness: 0.45,
      metalness: 0.7,
    });
    const jawMesh = new THREE.Mesh(jawGeo, jawMat);
    heroGroup.add(jawMesh);

    // Part 5: Ocular Biometric Lenses (Eyes)
    const eyeGeo = new THREE.CylinderGeometry(0.055, 0.055, 0.08, 16);
    const eyeMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      roughness: 0.1,
      metalness: 0.95,
      emissive: 0x059669,
      emissiveIntensity: 0.6,
    });
    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.rotation.x = Math.PI / 2;
    leftEye.position.set(-0.2, 0.98, 0.62);
    heroGroup.add(leftEye);

    const rightEye = leftEye.clone();
    rightEye.position.set(0.2, 0.98, 0.62);
    heroGroup.add(rightEye);

    // Part 6: Quantum Biometric Lattice Rings (Scan Ring Group)
    const scanRings = new THREE.Group();
    heroGroup.add(scanRings);
    scanRingGroupRef.current = scanRings;

    for (let i = 0; i < 3; i++) {
      const ringGeo = new THREE.TorusGeometry(0.85 + i * 0.16, 0.012, 8, 48);
      const ringMat = new THREE.MeshStandardMaterial({
        color: i === 0 ? 0x06b6d4 : i === 1 ? 0x10b981 : 0xa855f7,
        roughness: 0.2,
        metalness: 0.9,
        transparent: true,
        opacity: 0.7,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.y = 0.95;
      ring.rotation.x = Math.PI / 2 + (i * 0.35);
      ring.rotation.y = i * 0.4;
      scanRings.add(ring);
    }

    // Part 7: Vertical Laser Scanning Plane
    const laserGeo = new THREE.PlaneGeometry(2.0, 0.04);
    const laserMat = new THREE.MeshBasicMaterial({
      color: 0x22d3ee,
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide,
    });
    const laserMesh = new THREE.Mesh(laserGeo, laserMat);
    laserMesh.position.set(0, 0.95, 0.7);
    heroGroup.add(laserMesh);
    laserPlaneRef.current = laserMesh;

    // Part 8: 3D Holographic INE Card Model
    const cardGroup = new THREE.Group();
    cardGroup.position.set(1.1, 0.75, 0.3);
    cardGroup.scale.setScalar(0.7);
    scene.add(cardGroup);
    ineCardGroupRef.current = cardGroup;

    // Procedural INE Card Canvas Texture
    const ineCanvas = document.createElement('canvas');
    ineCanvas.width = 512;
    ineCanvas.height = 320;
    const ictx = ineCanvas.getContext('2d')!;
    // Background gradient
    const cgrad = ictx.createLinearGradient(0, 0, 512, 320);
    cgrad.addColorStop(0, '#0f172a');
    cgrad.addColorStop(0.5, '#1e293b');
    cgrad.addColorStop(1, '#090d16');
    ictx.fillStyle = cgrad;
    ictx.fillRect(0, 0, 512, 320);

    // Guilloche security pattern simulation
    ictx.strokeStyle = 'rgba(6, 182, 212, 0.25)';
    ictx.lineWidth = 1;
    for (let i = 0; i < 512; i += 24) {
      ictx.beginPath();
      ictx.arc(i, 160, 90, 0, Math.PI * 2);
      ictx.stroke();
    }

    // Mexican Seal & INE Header
    ictx.fillStyle = '#f8fafc';
    ictx.font = 'bold 22px sans-serif';
    ictx.fillText('INSTITUTO NACIONAL ELECTORAL', 120, 42);
    ictx.fillStyle = '#06b6d4';
    ictx.font = '14px monospace';
    ictx.fillText('CREDENCIAL PARA VOTAR • MÉXICO', 120, 64);

    // Photo Box Placeholder
    ictx.fillStyle = '#0284c7';
    ictx.fillRect(32, 90, 110, 150);
    ictx.fillStyle = '#ffffff';
    ictx.font = '12px sans-serif';
    ictx.fillText('FOTO TITULAR', 44, 170);

    // Ghost Photo UV simulation
    ictx.fillStyle = 'rgba(52, 211, 153, 0.4)';
    ictx.beginPath();
    ictx.arc(430, 150, 40, 0, Math.PI * 2);
    ictx.fill();
    ictx.fillStyle = '#a7f3d0';
    ictx.font = '10px monospace';
    ictx.fillText('FOTO UV', 412, 154);

    // Optical Microtext lines
    ictx.fillStyle = '#94a3b8';
    ictx.font = '11px monospace';
    ictx.fillText('NOMBRE: REGISTRO FEDERAL DE ELECTORES', 160, 115);
    ictx.fillText('CURP: MEX-POST-QUANTUM-LATTICE-001', 160, 140);
    ictx.fillText('CLAVE ELECTOR: INE900101MEXICO100', 160, 165);
    ictx.fillText('VIGENCIA: 2024 - 2034 • SECCIÓN: 0524', 160, 190);
    ictx.fillText('MODELO G / H • CERTIFICACIÓN BIOCUÁNTICA', 160, 215);

    // Barcode bands on card
    ictx.fillStyle = '#38bdf8';
    for (let b = 160; b < 470; b += 8) {
      ictx.fillRect(b, 255, (b % 16 === 0 ? 4 : 2), 35);
    }

    const ineTex = new THREE.CanvasTexture(ineCanvas);
    ineTex.colorSpace = THREE.SRGBColorSpace;
    ineTex.anisotropy = renderer.capabilities.getMaxAnisotropy();

    const cardPlateGeo = new THREE.BoxGeometry(1.6, 1.0, 0.02);
    const cardPlateMat = new THREE.MeshPhysicalMaterial({
      map: ineTex,
      roughness: 0.25,
      metalness: 0.8,
      clearcoat: 0.9,
    });
    const cardMesh = new THREE.Mesh(cardPlateGeo, cardPlateMat);
    cardGroup.add(cardMesh);

    // Part 9: Quantum Space Particles (Lattice Cloud)
    const particleCount = isSoftwareGl ? 80 : 350;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(particleCount * 3);
    for (let p = 0; p < particleCount; p++) {
      pPos[p * 3] = (Math.random() - 0.5) * 5;
      pPos[p * 3 + 1] = Math.random() * 3;
      pPos[p * 3 + 2] = (Math.random() - 0.5) * 4;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.035,
      transparent: true,
      opacity: 0.6,
    });
    const pMesh = new THREE.Points(pGeo, pMat);
    scene.add(pMesh);
    particlesRef.current = pMesh;

    // -------------------------------------------------------------
    // Lossless 60fps Animation Loop with exponential damping
    // -------------------------------------------------------------
    let frameId = 0;
    let clock = new THREE.Clock();

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    function tick() {
      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime() * scanSpeed;

      // Rotate cranium head gently
      if (heroGroup) {
        heroGroup.rotation.y = Math.sin(elapsedTime * 0.6) * 0.18;
      }

      // Rotate quantum rings around head
      if (scanRings) {
        scanRings.children.forEach((r, idx) => {
          r.rotation.z += (idx % 2 === 0 ? 1 : -1) * delta * (0.8 + idx * 0.3);
          r.rotation.x += delta * 0.2;
        });
      }

      // Sweep vertical laser scanner plane up and down face
      if (laserMesh) {
        const laserY = 0.95 + Math.sin(elapsedTime * 2.8) * 0.42;
        laserMesh.position.y = laserY;

        // Change color based on stage
        if (currentStageRef.current === 'approved') {
          (laserMat as THREE.MeshBasicMaterial).color.setHex(0x10b981);
        } else if (currentStageRef.current === 'analyzing') {
          (laserMat as THREE.MeshBasicMaterial).color.setHex(0xa855f7);
        } else {
          (laserMat as THREE.MeshBasicMaterial).color.setHex(0x22d3ee);
        }
      }

      // Tilt and float 3D INE card with optical hologram sheen
      if (cardGroup) {
        cardGroup.position.y = 0.75 + Math.sin(elapsedTime * 1.5) * 0.05;
        cardGroup.rotation.y = Math.PI * 0.15 + Math.sin(elapsedTime * 1.2) * 0.15;
        cardGroup.rotation.x = Math.cos(elapsedTime * 0.9) * 0.08;
      }

      // Rotate quantum lattice particles
      if (pMesh) {
        pMesh.rotation.y = elapsedTime * 0.05;
      }

      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    }

    // Start loop
    if (isSoftwareGl) {
      afterDraw(tick);
    } else {
      frameId = requestAnimationFrame(tick);
    }

    // Resize handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      craniumGeo.dispose();
      craniumMat.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      landmarkGeo.dispose();
      landmarkMat.dispose();
      jawGeo.dispose();
      jawMat.dispose();
      eyeGeo.dispose();
      eyeMat.dispose();
      cardPlateGeo.dispose();
      cardPlateMat.dispose();
      ineTex.dispose();
      pGeo.dispose();
      pMat.dispose();
      shadowGeo.dispose();
      shadowMat.dispose();
      shadowTex.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [scanSpeed]);

  return (
    <div className="relative w-full h-full min-h-[340px] rounded-2xl overflow-hidden border border-cyan-500/20 bg-slate-950/80 shadow-2xl">
      {/* 3D WebGL Canvas Container outside React sibling HUD */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full" />

      {/* Top Telemetry Overlay */}
      <div className="absolute top-3 left-4 right-4 flex items-center justify-between pointer-events-none">
        <div className="flex items-center space-x-2 bg-slate-900/90 border border-cyan-500/30 px-3 py-1.5 rounded-lg shadow-lg">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
          <span className="text-xs font-mono font-semibold tracking-wider text-cyan-200">
            MOTOR 3D BIOCUÁNTICO • 60 FPS
          </span>
        </div>
        {biometricScore !== undefined && (
          <div className="bg-slate-900/90 border border-emerald-500/40 px-3 py-1.5 rounded-lg shadow-lg flex items-center space-x-2">
            <span className="text-xs font-mono text-emerald-400 font-bold">
              MATCH: {biometricScore.toFixed(1)}%
            </span>
          </div>
        )}
      </div>

      {/* Collapsible Bottom Control Dock (<=15% Viewport footprint, no backdrop-filter over WebGL) */}
      <div
        className={`absolute bottom-3 left-1/2 -translate-x-1/2 w-[94%] max-w-xl transition-all duration-300 z-10 ${
          isCollapsed ? 'translate-y-[calc(100%-32px)]' : 'translate-y-0'
        }`}
      >
        <div className="bg-slate-900 border border-cyan-500/30 rounded-xl shadow-2xl overflow-hidden">
          {/* Header & Collapse Toggle */}
          <div className="flex items-center justify-between px-3 py-1.5 bg-slate-950/80 border-b border-cyan-500/20">
            <span className="text-[11px] font-mono font-medium text-cyan-300 uppercase tracking-wider">
              Control de Inspección 3D
            </span>
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="text-cyan-400 hover:text-cyan-200 text-xs font-mono px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/40 transition-colors cursor-pointer"
            >
              {isCollapsed ? '▲ Mostrar Dock' : '▼ Ocultar'}
            </button>
          </div>

          {/* Dock Controls */}
          {!isCollapsed && (
            <div className="p-3 grid grid-cols-3 gap-2">
              <button
                onClick={() => {
                  setActiveMode('biometric');
                  if (headGroupRef.current) headGroupRef.current.visible = true;
                  if (ineCardGroupRef.current) ineCardGroupRef.current.visible = true;
                }}
                className={`px-2.5 py-1.5 text-xs font-mono rounded-lg transition-all ${
                  activeMode === 'biometric'
                    ? 'bg-cyan-500/20 border border-cyan-400 text-cyan-100 font-semibold shadow-inner'
                    : 'bg-slate-800/60 border border-slate-700/60 text-slate-300 hover:bg-slate-800'
                }`}
              >
                Malla Biometría
              </button>

              <button
                onClick={() => {
                  setActiveMode('hologram');
                  if (headGroupRef.current) headGroupRef.current.visible = false;
                  if (ineCardGroupRef.current) {
                    ineCardGroupRef.current.visible = true;
                    ineCardGroupRef.current.position.set(0, 0.9, 0);
                    ineCardGroupRef.current.scale.setScalar(1.2);
                  }
                }}
                className={`px-2.5 py-1.5 text-xs font-mono rounded-lg transition-all ${
                  activeMode === 'hologram'
                    ? 'bg-cyan-500/20 border border-cyan-400 text-cyan-100 font-semibold shadow-inner'
                    : 'bg-slate-800/60 border border-slate-700/60 text-slate-300 hover:bg-slate-800'
                }`}
              >
                Holograma INE
              </button>

              <button
                onClick={() => {
                  setActiveMode('quantum');
                  if (headGroupRef.current) headGroupRef.current.visible = true;
                  if (ineCardGroupRef.current) ineCardGroupRef.current.visible = true;
                  setScanSpeed(prev => (prev === 1 ? 2.2 : 1));
                }}
                className={`px-2.5 py-1.5 text-xs font-mono rounded-lg transition-all ${
                  activeMode === 'quantum'
                    ? 'bg-purple-500/20 border border-purple-400 text-purple-200 font-semibold shadow-inner'
                    : 'bg-slate-800/60 border border-slate-700/60 text-slate-300 hover:bg-slate-800'
                }`}
              >
                Lattice Cuántico {scanSpeed > 1 ? '2X' : '1X'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
