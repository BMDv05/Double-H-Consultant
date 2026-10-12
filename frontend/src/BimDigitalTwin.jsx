import { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { useLang } from './LangContext.jsx';
import { useBook } from './LegacyApp.jsx';
import {
  IconBIM,
  IconShield,
  IconArrow,
  IconCheckBadge,
} from './icons.jsx';

/**
 * BimDigitalTwin — Executive 3D WebGL Architectural Digital Twin & BIM LOD 400 Experience
 *
 * Implements:
 * - Real-time parametric architectural tower with structural steel frame, concrete floor plates,
 *   glass curtain wall envelope, and MEP distribution conduits.
 * - Layer filtering (All, Structure, Facade, MEP Systems).
 * - Interactive mouse/touch orbit controls with smooth inertia damping.
 * - Live HUD telemetry (Azimuth, Structural Load, Code Compliance, Elevation).
 * - Direct conversion CTA linked to the 15-minute diagnostic advisory modal.
 * - IntersectionObserver lifecycle optimization (freezes rendering when off-screen).
 * - Graceful 2D CAD fallback if WebGL is unavailable.
 */
export default function BimDigitalTwin({ className = '' }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const book = useBook();
  const { t, lang } = useLang();

  const [activeLayer, setActiveLayer] = useState('all'); // 'all' | 'structure' | 'envelope' | 'mep'
  const [wireframeMode, setWireframeMode] = useState(false);
  const [isRotating, setIsRotating] = useState(true);
  const [activeNode, setActiveNode] = useState(null);
  const [azimuth, setAzimuth] = useState(142);
  const [webGlSupported, setWebGlSupported] = useState(true);

  // References for Three.js instance
  const threeStateRef = useRef({
    scene: null,
    camera: null,
    renderer: null,
    animFrameId: null,
    structureGroup: null,
    envelopeGroup: null,
    mepGroup: null,
    allTowerGroup: null,
    isInteracting: false,
    mouseX: 0,
    mouseY: 0,
    targetRotY: 0,
    targetRotX: 0.15,
    currentRotY: 0,
    currentRotX: 0.15,
    isVisible: true,
  });

  // Check WebGL availability
  useEffect(() => {
    try {
      const testCanvas = document.createElement('canvas');
      const gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
      if (!gl) setWebGlSupported(false);
    } catch {
      setWebGlSupported(false);
    }
  }, []);

  // Initialize Three.js scene
  useEffect(() => {
    if (!webGlSupported) return;
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    let width = container.clientWidth || 540;
    let height = container.clientHeight || 480;

    // SCENE
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x12393a, 0.015);

    // CAMERA
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 1.8, 14.5);
    camera.lookAt(0, 2.8, 0);

    // RENDERER
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(width, height);
      renderer.setClearColor(0x000000, 0);
    } catch {
      setWebGlSupported(false);
      return;
    }

    // LIGHTING - Architectural studio lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xe6ecec, 2.2);
    dirLight1.position.set(8, 16, 10);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x46766f, 1.8);
    dirLight2.position.set(-10, 8, -6);
    scene.add(dirLight2);

    const floorGlowLight = new THREE.PointLight(0x46766f, 1.5, 12);
    floorGlowLight.position.set(0, 0.5, 0);
    scene.add(floorGlowLight);

    // ROOT TOWER GROUP
    const allTowerGroup = new THREE.Group();
    scene.add(allTowerGroup);

    // -------------------------------------------------------------
    // CAD BASE GRID & GROUND AXES
    // -------------------------------------------------------------
    const gridHelper = new THREE.GridHelper(16, 24, 0x46766f, 0x1d4d4c);
    gridHelper.position.y = -2.6;
    allTowerGroup.add(gridHelper);

    // Concentric CAD target rings on ground
    const ringGeo = new THREE.RingGeometry(3.8, 3.84, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x46766f,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.35,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 2;
    ringMesh.position.y = -2.59;
    allTowerGroup.add(ringMesh);

    const outerRingGeo = new THREE.RingGeometry(6.2, 6.23, 64);
    const outerRingMesh = new THREE.Mesh(outerRingGeo, ringMat);
    outerRingMesh.rotation.x = Math.PI / 2;
    outerRingMesh.position.y = -2.59;
    allTowerGroup.add(outerRingMesh);

    // -------------------------------------------------------------
    // 1. STRUCTURE GROUP (Core, Columns, Slabs, Trusses)
    // -------------------------------------------------------------
    const structureGroup = new THREE.Group();
    allTowerGroup.add(structureGroup);

    // CENTRAL ELEVATOR & SHEAR CORE (Massive reinforced concrete)
    const coreGeo = new THREE.BoxGeometry(1.6, 10.4, 1.6);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x134c4b,
      metalness: 0.3,
      roughness: 0.6,
      transparent: true,
      opacity: 0.88,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    coreMesh.position.y = 2.6;
    structureGroup.add(coreMesh);

    // Core Wireframe outline
    const coreWireGeo = new THREE.EdgesGeometry(coreGeo);
    const coreWireMat = new THREE.LineBasicMaterial({ color: 0x82b4ac, linewidth: 1.5 });
    const coreWireMesh = new THREE.LineSegments(coreWireGeo, coreWireMat);
    coreMesh.add(coreWireMesh);

    // FLOOR SLABS & COLUMNS (18 Architectural Cantilever Levels)
    const numFloors = 18;
    const floorHeight = 0.56;
    const slabHeight = 0.08;

    const slabMat = new THREE.MeshStandardMaterial({
      color: 0x1d4e4e,
      roughness: 0.4,
      metalness: 0.5,
      transparent: true,
      opacity: 0.92,
    });

    const columnMat = new THREE.MeshStandardMaterial({
      color: 0x46766f,
      roughness: 0.2,
      metalness: 0.7,
    });

    for (let i = 0; i < numFloors; i++) {
      const y = -2.4 + i * floorHeight;
      // Parametric twist & subtle taper
      const progress = i / numFloors;
      const scale = 1 - progress * 0.28;
      const twist = (i * Math.PI) / 36;

      // Slab Geometry with chamfered polygonal profile
      const slabRadius = 2.4 * scale;
      const slabGeo = new THREE.CylinderGeometry(slabRadius, slabRadius * 1.02, slabHeight, 8);
      const slabMesh = new THREE.Mesh(slabGeo, slabMat);
      slabMesh.position.y = y;
      slabMesh.rotation.y = twist;
      structureGroup.add(slabMesh);

      // Floor Edge CAD wireframe
      const slabEdges = new THREE.EdgesGeometry(slabGeo);
      const edgeLine = new THREE.LineSegments(
        slabEdges,
        new THREE.LineBasicMaterial({ color: 0x8cc4be, transparent: true, opacity: 0.65 })
      );
      slabMesh.add(edgeLine);

      // Load-bearing perimeter columns between floors
      if (i < numFloors - 1) {
        const numCols = 6;
        for (let c = 0; c < numCols; c++) {
          const colAngle = twist + (c * (Math.PI * 2)) / numCols;
          const colDist = slabRadius * 0.82;
          const colGeo = new THREE.CylinderGeometry(0.04, 0.04, floorHeight, 6);
          const colMesh = new THREE.Mesh(colGeo, columnMat);
          colMesh.position.set(
            Math.cos(colAngle) * colDist,
            y + floorHeight / 2,
            Math.sin(colAngle) * colDist
          );
          structureGroup.add(colMesh);
        }
      }

      // Outrigger Wind Trusses on mechanical floors (Floors 6 and 12)
      if (i === 6 || i === 12) {
        const trussRingGeo = new THREE.TorusGeometry(slabRadius * 0.94, 0.05, 6, 8);
        const trussRing = new THREE.Mesh(
          trussRingGeo,
          new THREE.MeshStandardMaterial({ color: 0xc59b27, metalness: 0.8, roughness: 0.2 })
        );
        trussRing.rotation.x = Math.PI / 2;
        trussRing.position.y = y + 0.12;
        structureGroup.add(trussRing);
      }
    }

    // -------------------------------------------------------------
    // 2. ENVELOPE / FACADE GROUP (Curtain Wall, Mullions, Glass)
    // -------------------------------------------------------------
    const envelopeGroup = new THREE.Group();
    allTowerGroup.add(envelopeGroup);

    // Parametric Glass Volume
    const glassGeo = new THREE.CylinderGeometry(1.68, 2.52, 10.2, 8, 18, true);
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x6ca39c,
      transparent: true,
      opacity: 0.28,
      roughness: 0.1,
      metalness: 0.15,
      transmission: 0.6,
      ior: 1.5,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const glassMesh = new THREE.Mesh(glassGeo, glassMat);
    glassMesh.position.y = 2.5;
    envelopeGroup.add(glassMesh);

    // Facade Diamond Truss / Louver Wireframe
    const envelopeWireGeo = new THREE.WireframeGeometry(glassGeo);
    const envelopeWireMat = new THREE.LineBasicMaterial({
      color: 0xe6ecec,
      transparent: true,
      opacity: 0.45,
    });
    const envelopeWire = new THREE.LineSegments(envelopeWireGeo, envelopeWireMat);
    glassMesh.add(envelopeWire);

    // Vertical sun-shading architectural fins
    const finMat = new THREE.MeshStandardMaterial({
      color: 0x46766f,
      roughness: 0.3,
      metalness: 0.6,
      transparent: true,
      opacity: 0.75,
    });
    for (let f = 0; f < 8; f++) {
      const finAngle = (f * Math.PI * 2) / 8;
      const finGeo = new THREE.BoxGeometry(0.04, 10.2, 0.35);
      const finMesh = new THREE.Mesh(finGeo, finMat);
      const finRadius = 2.15;
      finMesh.position.set(
        Math.cos(finAngle) * finRadius,
        2.5,
        Math.sin(finAngle) * finRadius
      );
      finMesh.rotation.y = finAngle;
      envelopeGroup.add(finMesh);
    }

    // -------------------------------------------------------------
    // 3. MEP & SYSTEMS GROUP (Mechanical, Electrical, Risers, Nodes)
    // -------------------------------------------------------------
    const mepGroup = new THREE.Group();
    allTowerGroup.add(mepGroup);

    // Vertical HVAC and Electrical Risers (Glowing conduits)
    const conduitColors = [0x50c878, 0x4db6ac, 0x81d4fa, 0xffb74d];
    for (let r = 0; r < 4; r++) {
      const angle = (r * Math.PI) / 2 + Math.PI / 4;
      const dist = 1.1;
      const curve = new THREE.LineCurve3(
        new THREE.Vector3(Math.cos(angle) * dist, -2.4, Math.sin(angle) * dist),
        new THREE.Vector3(Math.cos(angle) * (dist * 0.7), 7.6, Math.sin(angle) * (dist * 0.7))
      );
      const tubeGeo = new THREE.TubeGeometry(curve, 20, 0.05, 8, false);
      const tubeMat = new THREE.MeshStandardMaterial({
        color: conduitColors[r],
        emissive: conduitColors[r],
        emissiveIntensity: 0.6,
        roughness: 0.2,
      });
      const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
      mepGroup.add(tubeMesh);
    }

    // Distribution nodes (Pulsing sensor points)
    const nodeGeo = new THREE.SphereGeometry(0.12, 12, 12);
    const nodeMat = new THREE.MeshStandardMaterial({
      color: 0x81d4fa,
      emissive: 0x81d4fa,
      emissiveIntensity: 0.9,
    });
    const nodePositions = [
      [0, 1.2, 1.4],
      [1.3, 3.8, 0],
      [-1.1, 5.6, -0.6],
      [0, -1.2, -1.3],
    ];
    nodePositions.forEach(([nx, ny, nz]) => {
      const nodeMesh = new THREE.Mesh(nodeGeo, nodeMat);
      nodeMesh.position.set(nx, ny, nz);
      mepGroup.add(nodeMesh);

      // Node ring pulse
      const pulseGeo = new THREE.RingGeometry(0.18, 0.22, 16);
      const pulseMat = new THREE.MeshBasicMaterial({
        color: 0x81d4fa,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.7,
      });
      const pulseMesh = new THREE.Mesh(pulseGeo, pulseMat);
      pulseMesh.position.set(nx, ny, nz);
      mepGroup.add(pulseMesh);
    });

    // Store references
    threeStateRef.current.scene = scene;
    threeStateRef.current.camera = camera;
    threeStateRef.current.renderer = renderer;
    threeStateRef.current.structureGroup = structureGroup;
    threeStateRef.current.envelopeGroup = envelopeGroup;
    threeStateRef.current.mepGroup = mepGroup;
    threeStateRef.current.allTowerGroup = allTowerGroup;

    // -------------------------------------------------------------
    // ANIMATION LOOP WITH INERTIA DAMPING
    // -------------------------------------------------------------
    let clock = new THREE.Clock();
    let pulseTime = 0;

    const animate = () => {
      threeStateRef.current.animFrameId = requestAnimationFrame(animate);

      if (!threeStateRef.current.isVisible) return;

      const delta = clock.getDelta();
      pulseTime += delta;

      // Auto-rotation when not dragging
      if (isRotating && !threeStateRef.current.isInteracting) {
        threeStateRef.current.targetRotY += delta * 0.35;
      }

      // Smooth inertia interpolation
      const state = threeStateRef.current;
      state.currentRotY += (state.targetRotY - state.currentRotY) * 0.08;
      state.currentRotX += (state.targetRotX - state.currentRotX) * 0.08;

      allTowerGroup.rotation.y = state.currentRotY;
      allTowerGroup.rotation.x = state.currentRotX;

      // Update Azimuth display
      const deg = Math.round((((state.currentRotY * 180) / Math.PI) % 360 + 360) % 360);
      setAzimuth(deg);

      // Subtle pulse on MEP systems
      mepGroup.children.forEach((child, idx) => {
        if (child.material && child.material.emissiveIntensity !== undefined) {
          child.material.emissiveIntensity = 0.5 + Math.sin(pulseTime * 3 + idx) * 0.3;
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    // -------------------------------------------------------------
    // RESIZE OBSERVER
    // -------------------------------------------------------------
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // -------------------------------------------------------------
    // INTERSECTION OBSERVER (Performance: pause off-screen)
    // -------------------------------------------------------------
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      threeStateRef.current.isVisible = entry.isIntersecting;
    }, { threshold: 0.1 });
    intersectionObserver.observe(container);

    // CLEANUP
    return () => {
      if (threeStateRef.current.animFrameId) {
        cancelAnimationFrame(threeStateRef.current.animFrameId);
      }
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      renderer.dispose();
      // Dispose geometries & materials
      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else {
            obj.material.dispose();
          }
        }
      });
    };
  }, [webGlSupported, isRotating]);

  // Update Layer Visibility based on UI State
  useEffect(() => {
    const { structureGroup, envelopeGroup, mepGroup } = threeStateRef.current;
    if (!structureGroup || !envelopeGroup || !mepGroup) return;

    if (activeLayer === 'all') {
      structureGroup.visible = true;
      envelopeGroup.visible = true;
      mepGroup.visible = true;
    } else if (activeLayer === 'structure') {
      structureGroup.visible = true;
      envelopeGroup.visible = false;
      mepGroup.visible = false;
    } else if (activeLayer === 'envelope') {
      structureGroup.visible = false;
      envelopeGroup.visible = true;
      mepGroup.visible = false;
    } else if (activeLayer === 'mep') {
      structureGroup.visible = false;
      envelopeGroup.visible = false;
      mepGroup.visible = true;
    }
  }, [activeLayer]);

  // Update Wireframe Mode
  useEffect(() => {
    const { scene } = threeStateRef.current;
    if (!scene) return;
    scene.traverse((obj) => {
      if (obj.isMesh && obj.material && obj.material.wireframe !== undefined) {
        obj.material.wireframe = wireframeMode;
      }
    });
  }, [wireframeMode]);

  // Mouse & Touch Orbit Handlers
  const handlePointerDown = (e) => {
    threeStateRef.current.isInteracting = true;
    threeStateRef.current.mouseX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    threeStateRef.current.mouseY = e.clientY || (e.touches && e.touches[0].clientY) || 0;
  };

  const handlePointerMove = (e) => {
    if (!threeStateRef.current.isInteracting) return;
    const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    const clientY = e.clientY || (e.touches && e.touches[0].clientY) || 0;

    const deltaX = clientX - threeStateRef.current.mouseX;
    const deltaY = clientY - threeStateRef.current.mouseY;

    threeStateRef.current.mouseX = clientX;
    threeStateRef.current.mouseY = clientY;

    threeStateRef.current.targetRotY += deltaX * 0.008;
    threeStateRef.current.targetRotX = Math.max(
      -0.3,
      Math.min(0.6, threeStateRef.current.targetRotX + deltaY * 0.005)
    );
  };

  const handlePointerUp = () => {
    threeStateRef.current.isInteracting = false;
  };

  const handleResetCamera = () => {
    threeStateRef.current.targetRotY = 0;
    threeStateRef.current.targetRotX = 0.15;
    setIsRotating(true);
  };

  const handleDiagnosticBooking = () => {
    book({
      division: 'bim',
      subject: '3D BIM LOD 400 & Structural Feasibility Review',
      phase: 'bim',
    });
  };

  return (
    <div
      className={`bim-digital-twin-wrapper ${className}`}
      ref={containerRef}
      onMouseDown={handlePointerDown}
      onMouseMove={handlePointerMove}
      onMouseUp={handlePointerUp}
      onMouseLeave={handlePointerUp}
      onTouchStart={handlePointerDown}
      onTouchMove={handlePointerMove}
      onTouchEnd={handlePointerUp}
    >
      {/* CAD Precision Blueprint Background Grid */}
      <div className="bim-blueprint-grid" aria-hidden="true" />

      {/* Top HUD Telemetry Bar */}
      <div className="bim-hud-top">
        <div className="bim-hud-live-tag">
          <span className="bim-pulse-dot" />
          <span className="bim-mono-text">BIM LOD 400 // DIGITAL TWIN</span>
        </div>

        <div className="bim-telemetry-cluster">
          <div className="bim-telemetry-item">
            <span className="telemetry-lbl">{lang === 'ar' ? 'السمت' : 'AZIMUTH'}</span>
            <span className="telemetry-val">{azimuth}°</span>
          </div>
          <div className="bim-telemetry-divider" />
          <div className="bim-telemetry-item">
            <span className="telemetry-lbl">{lang === 'ar' ? 'الارتفاع' : 'ELEVATION'}</span>
            <span className="telemetry-val">+248.5m</span>
          </div>
          <div className="bim-telemetry-divider" />
          <div className="bim-telemetry-item">
            <span className="telemetry-lbl">{lang === 'ar' ? 'المعيار' : 'STANDARD'}</span>
            <span className="telemetry-val">AIA E203</span>
          </div>
        </div>
      </div>

      {/* WebGL Canvas or 2D Vector CAD Fallback */}
      {webGlSupported ? (
        <canvas ref={canvasRef} className="bim-webgl-canvas" />
      ) : (
        <div className="bim-fallback-schematic">
          <svg viewBox="0 0 500 400" className="bim-cad-svg" aria-label="BIM LOD 400 CAD Schematic">
            <defs>
              <linearGradient id="bimGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#12393a" />
                <stop offset="100%" stopColor="#134c4b" />
              </linearGradient>
            </defs>
            <rect x="20" y="20" width="460" height="360" fill="none" stroke="#46766f" strokeWidth="1" strokeDasharray="4 4" />
            <polygon points="250,50 380,120 380,320 250,380 120,320 120,120" fill="url(#bimGrad)" stroke="#e6ecec" strokeWidth="1.5" />
            <line x1="250" y1="50" x2="250" y2="380" stroke="#82b4ac" strokeWidth="1.5" />
            <line x1="120" y1="120" x2="250" y2="180" stroke="#82b4ac" strokeWidth="1" />
            <line x1="380" y1="120" x2="250" y2="180" stroke="#82b4ac" strokeWidth="1" />
            <line x1="120" y1="220" x2="250" y2="280" stroke="#82b4ac" strokeWidth="1" />
            <line x1="380" y1="220" x2="250" y2="280" stroke="#82b4ac" strokeWidth="1" />
            <circle cx="250" cy="180" r="6" fill="#c59b27" />
            <text x="265" y="185" fill="#e6ecec" fontSize="12" fontFamily="monospace">NODE 01 // CORE LOAD</text>
          </svg>
        </div>
      )}

      {/* Interactive Layer Selector Bar */}
      <div className="bim-layers-panel">
        <span className="bim-panel-title">
          {lang === 'ar' ? 'طبقات الفحص الهندسي' : 'INSPECTION LAYERS'}
        </span>
        <div className="bim-layer-buttons">
          <button
            type="button"
            className={`bim-layer-btn ${activeLayer === 'all' ? 'active' : ''}`}
            onClick={() => setActiveLayer('all')}
          >
            {lang === 'ar' ? 'الكل' : 'Complete Model'}
          </button>
          <button
            type="button"
            className={`bim-layer-btn ${activeLayer === 'structure' ? 'active' : ''}`}
            onClick={() => setActiveLayer('structure')}
          >
            {lang === 'ar' ? 'الهيكل الإنشائي' : 'Structure (LOD 400)'}
          </button>
          <button
            type="button"
            className={`bim-layer-btn ${activeLayer === 'envelope' ? 'active' : ''}`}
            onClick={() => setActiveLayer('envelope')}
          >
            {lang === 'ar' ? 'الغلاف والواجهة' : 'Envelope / Facade'}
          </button>
          <button
            type="button"
            className={`bim-layer-btn ${activeLayer === 'mep' ? 'active' : ''}`}
            onClick={() => setActiveLayer('mep')}
          >
            {lang === 'ar' ? 'الأنظمة الكهروميكانيكية' : 'MEP Systems'}
          </button>
        </div>
      </div>

      {/* Interactive Camera & Mode Controls */}
      <div className="bim-viewport-tools">
        <button
          type="button"
          className={`bim-tool-btn ${wireframeMode ? 'active' : ''}`}
          onClick={() => setWireframeMode(!wireframeMode)}
          title="Toggle Wireframe CAD Mode"
        >
          <span>{wireframeMode ? (lang === 'ar' ? 'مجسم' : 'Solid') : (lang === 'ar' ? 'سلكي' : 'Wireframe')}</span>
        </button>

        <button
          type="button"
          className={`bim-tool-btn ${isRotating ? 'active' : ''}`}
          onClick={() => setIsRotating(!isRotating)}
          title="Auto-Rotation"
        >
          <span>{isRotating ? (lang === 'ar' ? 'إيقاف' : 'Pause') : (lang === 'ar' ? 'دوران' : 'Rotate')}</span>
        </button>

        <button
          type="button"
          className="bim-tool-btn"
          onClick={handleResetCamera}
          title="Reset Camera View"
        >
          <span>{lang === 'ar' ? 'إعادة ضبط' : 'Reset View'}</span>
        </button>
      </div>

      {/* Diagnostic Conversion Banner (Direct 15-Minute Link) */}
      <div className="bim-conversion-strip">
        <div className="bim-conversion-info">
          <IconCheckBadge size={16} className="bim-trust-icon" />
          <span className="bim-conversion-text">
            {lang === 'ar'
              ? 'احجز جلسة تشخيصية 15 دقيقة مع مهندس معتمد لمراجعة نموذج مشروعك مجاناً'
              : 'Book a 15-min diagnostic session with a licensed P.E. to audit your BIM model'}
          </span>
        </div>
        <button
          type="button"
          className="bim-action-cta-btn"
          onClick={handleDiagnosticBooking}
        >
          <span>{lang === 'ar' ? 'حجز مراجعة النموذج (15 دقيقة مجاناً)' : 'Schedule Diagnostic (15-Min Free)'}</span>
          <IconArrow size={14} />
        </button>
      </div>

      {/* Interactive Drag Hint */}
      <div className="bim-drag-hint">
        <span>{lang === 'ar' ? '⟲ اسحب للتدوير والاستكشاف ثلاثي الأبعاد' : '⟲ Drag to orbit 3D model'}</span>
      </div>
    </div>
  );
}
