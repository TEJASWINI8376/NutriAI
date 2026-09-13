import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface NutriScene3DProps {
  scrollProgress: number; // 0 to 1
  className?: string;
}

export const NutriScene3D: React.FC<NutriScene3DProps> = ({ scrollProgress, className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    foodBoxGroup: THREE.Group;
    foodBox: THREE.Mesh;
    phoneGroup: THREE.Group;
    scanBeamGroup: THREE.Group;
    beamPositions: Float32Array;
    beamGeo: THREE.BufferGeometry;
    rayLeftPositions: Float32Array;
    rayLeftGeo: THREE.BufferGeometry;
    rayRightPositions: Float32Array;
    rayRightGeo: THREE.BufferGeometry;
    labelLinePositions: Float32Array;
    labelLineGeo: THREE.BufferGeometry;
    scanPartPositions: Float32Array;
    scanPartGeo: THREE.BufferGeometry;
    beamMat: THREE.MeshBasicMaterial;
    laserBeam: THREE.Mesh;
    laserGlow: THREE.Mesh;
    particlesMesh: THREE.Points;
    aiCoreGroup: THREE.Group;
    leavesGroup: THREE.Group;
    targetScroll: number;
    currentScroll: number;
    frameId: number;
  } | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = null; // transparent to blend with clean gradient background

    // Camera setup
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 0, 7.5);

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;

    container.appendChild(renderer.domElement);

    // Balanced Studio Lighting: Rich contrast, crisp specular highlights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.3);
    keyLight.position.set(5, 8, 6);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xe8f5e9, 0.65);
    fillLight.position.set(-6, 3, 3);
    scene.add(fillLight);

    const emeraldRim = new THREE.PointLight(0x10b981, 2.2, 12);
    emeraldRim.position.set(0, -1, 3);
    scene.add(emeraldRim);

    // Dedicated specular rim light for the smartphone on the right
    const phoneRimLight = new THREE.PointLight(0xa7f3d0, 1.8, 10);
    phoneRimLight.position.set(3.5, 2.0, 3.2);
    scene.add(phoneRimLight);

    // Helper: Create High-DPI canvas texture for Food Package Front Label
    const createFrontTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 1600;
      const ctx = canvas.getContext('2d')!;

      // Background: Crisp off-white cardstock
      ctx.fillStyle = '#f8faf9';
      ctx.fillRect(0, 0, 1024, 1600);

      // Solid Dark Emerald Outer Perimeter Border for maximum box visibility
      ctx.strokeStyle = '#005f40';
      ctx.lineWidth = 14;
      ctx.strokeRect(7, 7, 1010, 1586);

      // Top green botanical accent header band
      ctx.fillStyle = '#005f40';
      ctx.fillRect(0, 0, 1024, 30);

      // Bottom green botanical accent footer band
      ctx.fillStyle = '#005f40';
      ctx.fillRect(0, 1570, 1024, 30);

      // Nature's Harvest Brand header
      ctx.fillStyle = '#052e16';
      ctx.font = 'bold 36px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText("NATURE'S", 90, 140);
      ctx.fillText("HARVEST", 90, 185);

      // Green leaf icon accent
      ctx.beginPath();
      ctx.arc(60, 155, 20, 0, Math.PI * 2);
      ctx.fillStyle = '#059669';
      ctx.fill();

      // Subtitle
      ctx.fillStyle = '#047857';
      ctx.font = '700 24px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('GOOD FOOD. BETTER YOU.', 90, 230);

      // Product Title
      ctx.fillStyle = '#004d34';
      ctx.font = '900 70px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('Organic', 90, 320);
      ctx.fillText('Trail Mix', 90, 395);

      // Clean divider line
      ctx.strokeStyle = '#a7f3d0';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(90, 430);
      ctx.lineTo(934, 430);
      ctx.stroke();

      // Nutrition Facts Table Box (Crisp, High Contrast Black Border)
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.roundRect(90, 460, 844, 940, 16);
      ctx.fill();
      ctx.stroke();

      // Inside Nutrition Facts Title
      ctx.fillStyle = '#000000';
      ctx.font = '900 66px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('Nutrition Facts', 120, 545);

      ctx.font = 'bold 28px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#1e293b';
      ctx.fillText('Serving Size 1 oz (28g)', 120, 595);
      ctx.fillText('Servings Per Container 5', 120, 635);

      // Thick black divider line
      ctx.fillStyle = '#000000';
      ctx.fillRect(120, 655, 784, 16);

      ctx.font = 'bold 26px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('Amount Per Serving', 120, 700);

      // Calories row
      ctx.font = '900 54px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('Calories', 120, 765);
      ctx.textAlign = 'right';
      ctx.fillText('140', 904, 765);
      ctx.textAlign = 'left';

      // Medium black bar
      ctx.fillRect(120, 785, 784, 8);

      // % Daily Value header
      ctx.font = 'bold 26px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('% Daily Value*', 904, 825);
      ctx.textAlign = 'left';

      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 3;

      // Nutrient rows (Bold, 100% Readable)
      const rows = [
        { label: 'Total Fat 9g', dv: '12%', bold: true },
        { label: '  Saturated Fat 1g', dv: '5%', indent: true },
        { label: 'Cholesterol 0mg', dv: '0%' },
        { label: 'Sodium 45mg', dv: '2%', highlight: true },
        { label: 'Total Carbohydrate 14g', dv: '5%', bold: true },
        { label: '  Dietary Fiber 3g', dv: '11%', indent: true },
        { label: '  Total Sugars 6g', dv: '' },
        { label: 'Protein 4g', dv: '8%', bold: true },
      ];

      let yPos = 870;
      rows.forEach((r) => {
        ctx.beginPath();
        ctx.moveTo(120, yPos - 35);
        ctx.lineTo(904, yPos - 35);
        ctx.stroke();

        if (r.highlight) {
          ctx.fillStyle = '#d1fae5';
          ctx.fillRect(120, yPos - 32, 784, 40);
        }

        ctx.fillStyle = r.highlight ? '#064e3b' : '#000000';
        ctx.font = r.bold ? 'bold 32px "Plus Jakarta Sans", sans-serif' : '600 30px "Plus Jakarta Sans", sans-serif';
        ctx.fillText(r.label, r.indent ? 150 : 120, yPos);

        if (r.dv) {
          ctx.textAlign = 'right';
          ctx.fillText(r.dv, 904, yPos);
          ctx.textAlign = 'left';
        }
        yPos += 45;
      });

      // Bottom Ingredients paragraph (High Contrast)
      ctx.fillStyle = '#000000';
      ctx.fillRect(120, yPos, 784, 8);
      yPos += 35;
      ctx.font = 'bold 26px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('Ingredients: Almonds, Cashews, Dried', 120, yPos);
      yPos += 34;
      ctx.fillText('Cranberries, Pumpkin Seeds, Sunflower', 120, yPos);
      yPos += 34;
      ctx.fillText('Seeds, Organic Honey.', 120, yPos);

      // Net weight footer
      ctx.font = 'bold 30px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#0f172a';
      ctx.fillText('NET WT. 5 OZ (142g)', 120, 1500);

      const texture = new THREE.CanvasTexture(canvas);
      texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
      return texture;
    };

    const createSideTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 1600;
      const ctx = canvas.getContext('2d')!;

      // Deep solid forest emerald background
      ctx.fillStyle = '#004d34';
      ctx.fillRect(0, 0, 512, 1600);

      ctx.strokeStyle = '#002f20';
      ctx.lineWidth = 12;
      ctx.strokeRect(6, 6, 500, 1588);

      // Icons and side badges
      const badges = ['100% Organic', 'No Added Sugar', 'High in Fiber', 'Plant Based'];
      badges.forEach((b, i) => {
        const y = 300 + i * 280;
        ctx.beginPath();
        ctx.arc(256, y, 68, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 5;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 32px "Plus Jakarta Sans", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(b, 256, y + 124);
      });

      const texture = new THREE.CanvasTexture(canvas);
      texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
      return texture;
    };

    const createWhiteTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, 256, 256);
      return new THREE.CanvasTexture(canvas);
    };

    // -------------------------------------------------------------
    // 3D FOOD PACKAGE
    // -------------------------------------------------------------
    const foodBoxGroup = new THREE.Group();
    const boxGeometry = new THREE.BoxGeometry(2.1, 3.8, 1.2);
    const frontTex = createFrontTexture();
    const sideTex = createSideTexture();
    const whiteTex = createWhiteTexture();

    const boxMaterials = [
      new THREE.MeshStandardMaterial({ map: sideTex, roughness: 0.35 }), // right
      new THREE.MeshStandardMaterial({ map: sideTex, roughness: 0.35 }), // left
      new THREE.MeshStandardMaterial({ map: whiteTex, roughness: 0.4 }), // top
      new THREE.MeshStandardMaterial({ map: whiteTex, roughness: 0.4 }), // bottom
      new THREE.MeshStandardMaterial({ map: frontTex, roughness: 0.25 }), // front
      new THREE.MeshStandardMaterial({ map: sideTex, roughness: 0.35 }), // back
    ];

    const foodBox = new THREE.Mesh(boxGeometry, boxMaterials);
    foodBox.castShadow = true;
    foodBox.receiveShadow = true;
    foodBoxGroup.add(foodBox);

    // Initial position of package
    foodBoxGroup.position.set(-1.8, 0, 0);
    foodBoxGroup.rotation.set(0.12, 0.42, -0.05);
    scene.add(foodBoxGroup);

    // Laser glow line directly on the food box front face
    const laserGroup = new THREE.Group();
    const laserGeometry = new THREE.PlaneGeometry(2.3, 0.08);
    const laserMaterial = new THREE.MeshBasicMaterial({
      color: 0x34d399,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });
    const laserBeam = new THREE.Mesh(laserGeometry, laserMaterial);

    const glowGeometry = new THREE.PlaneGeometry(2.4, 0.45);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });
    const laserGlow = new THREE.Mesh(glowGeometry, glowMaterial);

    laserGroup.add(laserBeam);
    laserGroup.add(laserGlow);
    laserGroup.position.set(0, 0, 0.62); // in front of package front face
    foodBox.add(laserGroup);

    // -------------------------------------------------------------
    // REALISTIC 3D SMARTPHONE (Placed on RIGHT, scanning package on LEFT)
    // -------------------------------------------------------------
    const createPhoneScreenTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 2048;
      const ctx = canvas.getContext('2d')!;

      // Deep, rich OLED pitch black background
      ctx.fillStyle = '#060911';
      ctx.fillRect(0, 0, 1024, 2048);

      // Subtle top emerald atmospheric glow
      const topGlow = ctx.createRadialGradient(512, 400, 50, 512, 400, 600);
      topGlow.addColorStop(0, 'rgba(16, 185, 129, 0.12)');
      topGlow.addColorStop(1, 'rgba(6, 9, 17, 0)');
      ctx.fillStyle = topGlow;
      ctx.fillRect(0, 0, 1024, 800);

      // 1. Status Bar
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 38px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('9:41', 75, 75);

      // Dynamic Island Pill at top center
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.roundRect(387, 30, 250, 52, 26);
      ctx.fill();
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Camera lens dot in Dynamic Island
      ctx.beginPath();
      ctx.arc(425, 56, 9, 0, Math.PI * 2);
      ctx.fillStyle = '#0f172a';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(425, 56, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#2563eb';
      ctx.fill();

      // Speaker line in Dynamic Island
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.roundRect(455, 53, 90, 6, 3);
      ctx.fill();

      // Icons: 5G & Battery at top right
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 30px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('5G', 890, 74);

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.strokeRect(905, 50, 48, 24);
      ctx.fillStyle = '#10b981';
      ctx.fillRect(908, 53, 36, 18);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(953, 58, 4, 8);

      // 2. Camera HUD Header
      ctx.beginPath();
      ctx.arc(80, 135, 7, 0, Math.PI * 2);
      ctx.fillStyle = '#ef4444';
      ctx.fill();

      ctx.fillStyle = '#f87171';
      ctx.font = 'bold 26px monospace';
      ctx.textAlign = 'left';
      ctx.fillText('4K • 60 FPS', 100, 144);

      // AI OCR Locked Badge
      ctx.fillStyle = '#004d34';
      ctx.beginPath();
      ctx.roundRect(660, 115, 290, 45, 22);
      ctx.fill();
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#a7f3d0';
      ctx.font = 'bold 24px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('⚡ AI OCR 99.8% LOCKED', 805, 146);

      // 3. Live Camera Viewfinder framing the Nutrition Facts
      ctx.fillStyle = '#0b1322';
      ctx.beginPath();
      ctx.roundRect(60, 180, 904, 660, 28);
      ctx.fill();
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Viewfinder Silhouette Preview
      ctx.fillStyle = '#111d33';
      ctx.beginPath();
      ctx.roundRect(85, 205, 854, 610, 20);
      ctx.fill();

      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 24px monospace';
      ctx.textAlign = 'left';
      ctx.fillText("NATURE'S HARVEST — ORGANIC TRAIL MIX", 115, 255);

      ctx.fillStyle = '#ffffff';
      ctx.font = '900 36px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('Nutrition Facts', 115, 305);

      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 22px sans-serif';
      ctx.fillText('Serving Size 1 oz (28g)', 115, 335);

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(115, 350, 794, 5);

      ctx.font = 'bold 30px sans-serif';
      ctx.fillStyle = '#fbbf24';
      ctx.fillText('Calories: 140', 115, 395);

      ctx.fillStyle = '#38bdf8';
      ctx.fillText('Sodium: 45mg (2% DV)', 115, 440);

      ctx.fillStyle = '#34d399';
      ctx.fillText('Total Sugars: 6g', 115, 485);

      ctx.fillStyle = '#e2e8f0';
      ctx.fillText('Protein: 4g', 115, 530);

      // 4 Emerald Viewfinder Corner Brackets
      ctx.strokeStyle = '#00ff9d';
      ctx.lineWidth = 8;
      ctx.lineCap = 'round';
      const bLen = 50;

      // Top-Left
      ctx.beginPath();
      ctx.moveTo(90, 215 + bLen);
      ctx.lineTo(90, 215);
      ctx.lineTo(90 + bLen, 215);
      ctx.stroke();

      // Top-Right
      ctx.beginPath();
      ctx.moveTo(934 - bLen, 215);
      ctx.lineTo(934, 215);
      ctx.lineTo(934, 215 + bLen);
      ctx.stroke();

      // Bottom-Left
      ctx.beginPath();
      ctx.moveTo(90, 785 - bLen);
      ctx.lineTo(90, 785);
      ctx.lineTo(90 + bLen, 785);
      ctx.stroke();

      // Bottom-Right
      ctx.beginPath();
      ctx.moveTo(934 - bLen, 785);
      ctx.lineTo(934, 785);
      ctx.lineTo(934, 785 - bLen);
      ctx.stroke();

      // Viewfinder Scan Laser Line
      const laserG = ctx.createLinearGradient(90, 420, 934, 420);
      laserG.addColorStop(0, 'rgba(0, 255, 157, 0)');
      laserG.addColorStop(0.5, 'rgba(0, 255, 157, 0.95)');
      laserG.addColorStop(1, 'rgba(0, 255, 157, 0)');
      ctx.fillStyle = laserG;
      ctx.fillRect(90, 415, 844, 8);

      // 4. "SCANNING..." Status Banner
      ctx.fillStyle = '#003824';
      ctx.beginPath();
      ctx.roundRect(60, 875, 904, 76, 24);
      ctx.fill();
      ctx.strokeStyle = '#059669';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Blinking Pulse Dot
      ctx.beginPath();
      ctx.arc(120, 913, 14, 0, Math.PI * 2);
      ctx.fillStyle = '#34d399';
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = '900 32px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('SCANNING...', 150, 924);

      ctx.fillStyle = '#a7f3d0';
      ctx.font = 'bold 26px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('NUTRITION LABEL', 920, 924);

      // 5. Four Detected Value Cards (High Contrast, Bold, Legible)
      const detected = [
        { label: 'CALORIES', value: '140 kcal', badge: 'OPTIMAL', color: '#f59e0b', bgBadge: '#78350f', border: '#b45309' },
        { label: 'SODIUM', value: '45 mg', badge: 'LISINOPRIL SAFE', color: '#38bdf8', bgBadge: '#0c4a6e', border: '#0284c7' },
        { label: 'TOTAL SUGARS', value: '6 g', badge: 'LOW GI', color: '#34d399', bgBadge: '#064e3b', border: '#059669' },
        { label: 'PROTEIN', value: '4 g (8% DV)', badge: 'BALANCED', color: '#c084fc', bgBadge: '#581c87', border: '#9333ea' },
      ];

      detected.forEach((item, idx) => {
        const y = 980 + idx * 135;
        // Card Background
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.roundRect(60, y, 904, 115, 22);
        ctx.fill();
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Left color accent stripe
        ctx.fillStyle = item.color;
        ctx.beginPath();
        ctx.roundRect(60, y, 12, 115, 6);
        ctx.fill();

        // Label name
        ctx.fillStyle = '#94a3b8';
        ctx.font = 'bold 22px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(item.label, 95, y + 42);

        // Value text (Large & Bold)
        ctx.fillStyle = '#ffffff';
        ctx.font = '900 42px "Plus Jakarta Sans", sans-serif';
        ctx.fillText(item.value, 95, y + 92);

        // Right Pill Badge
        ctx.fillStyle = item.bgBadge;
        ctx.beginPath();
        ctx.roundRect(670, y + 36, 265, 45, 22);
        ctx.fill();
        ctx.strokeStyle = item.border;
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = item.color;
        ctx.font = 'bold 20px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`● ${item.badge}`, 802, y + 66);
      });

      // 6. Camera Bottom Controls
      // Zoom selector (.5 | 1x | 2x | 3x)
      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 28px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('.5', 380, 1600);

      // Active 1x Zoom Button
      ctx.fillStyle = '#004d34';
      ctx.beginPath();
      ctx.arc(512, 1590, 32, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.fillStyle = '#a7f3d0';
      ctx.font = 'bold 28px sans-serif';
      ctx.fillText('1x', 512, 1600);

      ctx.fillStyle = '#94a3b8';
      ctx.fillText('2x', 644, 1600);
      ctx.fillText('3x', 740, 1600);

      // Mode Selector (PHOTO | LABEL SCAN | BARCODE)
      ctx.fillStyle = '#64748b';
      ctx.font = 'bold 26px sans-serif';
      ctx.fillText('PHOTO', 280, 1685);

      // Active Mode Pill
      ctx.fillStyle = '#004d34';
      ctx.beginPath();
      ctx.roundRect(402, 1655, 220, 46, 23);
      ctx.fill();
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText('LABEL SCAN', 512, 1687);

      ctx.fillStyle = '#64748b';
      ctx.font = 'bold 26px sans-serif';
      ctx.fillText('BARCODE', 744, 1685);

      // Shutter Button
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(512, 1810, 68, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#00e676';
      ctx.beginPath();
      ctx.arc(512, 1810, 56, 0, Math.PI * 2);
      ctx.fill();

      // Left Gallery Preview thumbnail
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.roundRect(140, 1770, 80, 80, 20);
      ctx.fill();
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Right Flip Camera button
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(840, 1810, 42, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 3;
      ctx.stroke();

      // 7. Home Indicator Pill
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.roundRect(362, 1995, 300, 12, 6);
      ctx.fill();

      const texture = new THREE.CanvasTexture(canvas);
      texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
      return texture;
    };

    const createPhoneMesh = (screenTexture: THREE.CanvasTexture) => {
      const phoneGroup = new THREE.Group();

      const w = 1.54;
      const h = 3.18;
      const r = 0.22;
      const depth = 0.12;

      // 1. Phone Body (Titanium chassis)
      const shape = new THREE.Shape();
      shape.moveTo(-w / 2 + r, -h / 2);
      shape.lineTo(w / 2 - r, -h / 2);
      shape.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
      shape.lineTo(w / 2, h / 2 - r);
      shape.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
      shape.lineTo(-w / 2 + r, h / 2);
      shape.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
      shape.lineTo(-w / 2, -h / 2 + r);
      shape.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);

      const extrudeSettings = {
        depth: depth,
        bevelEnabled: true,
        bevelSegments: 6,
        steps: 1,
        bevelSize: 0.025,
        bevelThickness: 0.025,
      };

      const bodyGeo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
      bodyGeo.center();

      const bodyMat = new THREE.MeshStandardMaterial({
        color: 0x18202c,
        metalness: 0.88,
        roughness: 0.24,
      });

      const phoneBody = new THREE.Mesh(bodyGeo, bodyMat);
      phoneBody.castShadow = true;
      phoneBody.receiveShadow = true;
      phoneGroup.add(phoneBody);

      // 2. Metallic Rim Highlight
      const rimMat = new THREE.MeshStandardMaterial({
        color: 0x334155,
        metalness: 0.95,
        roughness: 0.16,
      });

      // 3. Side Buttons
      // Left: Volume Rockers & Action Button
      const volUpGeo = new THREE.BoxGeometry(0.025, 0.32, 0.045);
      const volUp = new THREE.Mesh(volUpGeo, rimMat);
      volUp.position.set(-w / 2 - 0.025, 0.5, 0);
      phoneGroup.add(volUp);

      const volDownGeo = new THREE.BoxGeometry(0.025, 0.32, 0.045);
      const volDown = new THREE.Mesh(volDownGeo, rimMat);
      volDown.position.set(-w / 2 - 0.025, 0.1, 0);
      phoneGroup.add(volDown);

      const actionBtnGeo = new THREE.BoxGeometry(0.025, 0.18, 0.045);
      const actionBtn = new THREE.Mesh(actionBtnGeo, rimMat);
      actionBtn.position.set(-w / 2 - 0.025, 0.9, 0);
      phoneGroup.add(actionBtn);

      // Right: Power Button
      const powerBtnGeo = new THREE.BoxGeometry(0.025, 0.48, 0.045);
      const powerBtn = new THREE.Mesh(powerBtnGeo, rimMat);
      powerBtn.position.set(w / 2 + 0.025, 0.4, 0);
      phoneGroup.add(powerBtn);

      // 4. Rear Camera Island (visible on the back when angled)
      const camIslandShape = new THREE.Shape();
      const iw = 0.65, ih = 0.72, ir = 0.14;
      camIslandShape.moveTo(-iw / 2 + ir, -ih / 2);
      camIslandShape.lineTo(iw / 2 - ir, -ih / 2);
      camIslandShape.quadraticCurveTo(iw / 2, -ih / 2, iw / 2, -ih / 2 + ir);
      camIslandShape.lineTo(iw / 2, ih / 2 - ir);
      camIslandShape.quadraticCurveTo(iw / 2, ih / 2, iw / 2 - ir, ih / 2);
      camIslandShape.lineTo(-iw / 2 + ir, ih / 2);
      camIslandShape.quadraticCurveTo(-iw / 2, ih / 2, -iw / 2, -ih / 2 - ir);
      camIslandShape.lineTo(-iw / 2, -ih / 2 + ir);
      camIslandShape.quadraticCurveTo(-iw / 2, -ih / 2, -iw / 2 + ir, -ih / 2);

      const camIslandGeo = new THREE.ExtrudeGeometry(camIslandShape, {
        depth: 0.04,
        bevelEnabled: true,
        bevelSegments: 4,
        steps: 1,
        bevelSize: 0.015,
        bevelThickness: 0.015,
      });
      camIslandGeo.center();
      const camIslandMesh = new THREE.Mesh(camIslandGeo, bodyMat);
      camIslandMesh.position.set(-0.35, 1.05, -depth / 2 - 0.02);
      phoneGroup.add(camIslandMesh);

      // 3 Camera Lenses on the Island
      const lensRingMat = new THREE.MeshStandardMaterial({
        color: 0x475569,
        metalness: 0.95,
        roughness: 0.15,
      });
      const lensGlassMat = new THREE.MeshStandardMaterial({
        color: 0x071120,
        metalness: 0.9,
        roughness: 0.05,
      });

      const lensPositions = [
        [-0.45, 1.2],
        [-0.45, 0.9],
        [-0.22, 1.05],
      ];

      lensPositions.forEach(([lx, ly]) => {
        const ringGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.03, 24);
        ringGeo.rotateX(Math.PI / 2);
        const ringMesh = new THREE.Mesh(ringGeo, lensRingMat);
        ringMesh.position.set(lx, ly, -depth / 2 - 0.045);
        phoneGroup.add(ringMesh);

        const glassGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.032, 24);
        glassGeo.rotateX(Math.PI / 2);
        const glassMesh = new THREE.Mesh(glassGeo, lensGlassMat);
        glassMesh.position.set(lx, ly, -depth / 2 - 0.046);
        phoneGroup.add(glassMesh);
      });

      // 5. Front OLED Screen
      const screenGeo = new THREE.PlaneGeometry(w - 0.12, h - 0.18);
      const screenMat = new THREE.MeshBasicMaterial({
        map: screenTexture,
        toneMapped: false,
      });
      const screenMesh = new THREE.Mesh(screenGeo, screenMat);
      screenMesh.position.set(0, 0, depth / 2 + 0.026);
      phoneGroup.add(screenMesh);

      // 6. Front Glass Layer (realistic specular gloss reflection)
      const glassGeo = new THREE.PlaneGeometry(w - 0.08, h - 0.14);
      const glassMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.13,
        roughness: 0.04,
        metalness: 0.18,
      });
      const glassMesh = new THREE.Mesh(glassGeo, glassMat);
      glassMesh.position.set(0, 0, depth / 2 + 0.028);
      phoneGroup.add(glassMesh);

      // 7. Soft Drop/Contact Shadow underneath the phone
      const shadowCanvas = document.createElement('canvas');
      shadowCanvas.width = 256;
      shadowCanvas.height = 256;
      const sctx = shadowCanvas.getContext('2d')!;
      const sGrad = sctx.createRadialGradient(128, 128, 10, 128, 128, 128);
      sGrad.addColorStop(0, 'rgba(0, 35, 20, 0.55)');
      sGrad.addColorStop(0.5, 'rgba(0, 35, 20, 0.22)');
      sGrad.addColorStop(1, 'rgba(0, 35, 20, 0)');
      sctx.fillStyle = sGrad;
      sctx.fillRect(0, 0, 256, 256);
      const shadowTex = new THREE.CanvasTexture(shadowCanvas);

      const shadowGeo = new THREE.PlaneGeometry(2.4, 4.2);
      const shadowMat = new THREE.MeshBasicMaterial({
        map: shadowTex,
        transparent: true,
        opacity: 0.6,
        depthWrite: false,
      });
      const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
      shadowMesh.position.set(0.1, -0.1, -0.28);
      phoneGroup.add(shadowMesh);

      return phoneGroup;
    };

    const phoneScreenTex = createPhoneScreenTexture();
    const phoneGroup = createPhoneMesh(phoneScreenTex);
    phoneGroup.position.set(3.5, -0.5, 0);
    phoneGroup.scale.set(0.0001, 0.0001, 0.0001);
    scene.add(phoneGroup);

    // -------------------------------------------------------------
    // 3D VOLUMETRIC SCANNING BEAM (Phone Camera -> Nutrition Label)
    // -------------------------------------------------------------
    const scanBeamGroup = new THREE.Group();

    // 1. Triangular Volumetric Beam from Phone Camera to Nutrition Label
    const beamGeo = new THREE.BufferGeometry();
    const beamPositions = new Float32Array(3 * 3); // 1 triangle: camOrigin, pLeft, pRight
    beamGeo.setAttribute('position', new THREE.BufferAttribute(beamPositions, 3));
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0.32,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const scanBeamMesh = new THREE.Mesh(beamGeo, beamMat);
    scanBeamGroup.add(scanBeamMesh);

    // 2. Left Edge Ray
    const rayLeftGeo = new THREE.BufferGeometry();
    const rayLeftPositions = new Float32Array(2 * 3);
    rayLeftGeo.setAttribute('position', new THREE.BufferAttribute(rayLeftPositions, 3));
    const rayMat = new THREE.LineBasicMaterial({
      color: 0x34d399,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    const rayLeftLine = new THREE.Line(rayLeftGeo, rayMat);
    scanBeamGroup.add(rayLeftLine);

    // 3. Right Edge Ray
    const rayRightGeo = new THREE.BufferGeometry();
    const rayRightPositions = new Float32Array(2 * 3);
    rayRightGeo.setAttribute('position', new THREE.BufferAttribute(rayRightPositions, 3));
    const rayRightLine = new THREE.Line(rayRightGeo, rayMat);
    scanBeamGroup.add(rayRightLine);

    // 4. Glowing Scan Line on the Label
    const labelLineGeo = new THREE.BufferGeometry();
    const labelLinePositions = new Float32Array(2 * 3);
    labelLineGeo.setAttribute('position', new THREE.BufferAttribute(labelLinePositions, 3));
    const labelLineMat = new THREE.LineBasicMaterial({
      color: 0x00ff9d,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      linewidth: 3,
    });
    const labelLine = new THREE.Line(labelLineGeo, labelLineMat);
    scanBeamGroup.add(labelLine);

    // 5. Localized Scanning Particles on the Label
    const scanPartCount = 28;
    const scanPartGeo = new THREE.BufferGeometry();
    const scanPartPositions = new Float32Array(scanPartCount * 3);
    scanPartGeo.setAttribute('position', new THREE.BufferAttribute(scanPartPositions, 3));
    const scanPartMat = new THREE.PointsMaterial({
      size: 0.14,
      color: 0x34d399,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const scanParticles = new THREE.Points(scanPartGeo, scanPartMat);
    scanBeamGroup.add(scanParticles);

    scene.add(scanBeamGroup);

    // Floating Green Organic Particles
    const particleCount = 140;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const scales = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 14;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 12;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 8;
      scales[i] = Math.random() * 0.12 + 0.04;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const particleCanvas = document.createElement('canvas');
    particleCanvas.width = 64;
    particleCanvas.height = 64;
    const pctx = particleCanvas.getContext('2d')!;
    const pGrad = pctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    pGrad.addColorStop(0, 'rgba(52, 211, 153, 0.95)');
    pGrad.addColorStop(0.5, 'rgba(16, 185, 129, 0.4)');
    pGrad.addColorStop(1, 'rgba(16, 185, 129, 0)');
    pctx.fillStyle = pGrad;
    pctx.fillRect(0, 0, 64, 64);

    const particleTexture = new THREE.CanvasTexture(particleCanvas);
    const particleMaterial = new THREE.PointsMaterial({
      size: 0.25,
      map: particleTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const particlesMesh = new THREE.Points(particleGeo, particleMaterial);
    scene.add(particlesMesh);

    // Floating Botanical 3D Leaves
    const leavesGroup = new THREE.Group();
    const leafShape = new THREE.Shape();
    leafShape.moveTo(0, 0);
    leafShape.quadraticCurveTo(0.25, 0.5, 0, 1.0);
    leafShape.quadraticCurveTo(-0.25, 0.5, 0, 0);
    const leafGeo = new THREE.ShapeGeometry(leafShape);
    const leafMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      roughness: 0.4,
      metalness: 0.1,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
    });

    for (let i = 0; i < 7; i++) {
      const leafMesh = new THREE.Mesh(leafGeo, leafMat);
      const angle = (i / 7) * Math.PI * 2;
      leafMesh.position.set(
        Math.cos(angle) * 3.5 + (Math.random() - 0.5),
        Math.sin(angle) * 2.2 + (Math.random() - 0.5),
        (Math.random() - 0.5) * 3
      );
      leafMesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      const s = 0.35 + Math.random() * 0.3;
      leafMesh.scale.set(s, s, s);
      leavesGroup.add(leafMesh);
    }
    scene.add(leavesGroup);

    // 3D AI Neural Core (Stage 4)
    const aiCoreGroup = new THREE.Group();
    const innerCoreGeo = new THREE.IcosahedronGeometry(0.7, 3);
    const innerCoreMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: 0x059669,
      emissiveIntensity: 0.6,
      roughness: 0.2,
      metalness: 0.8,
      wireframe: true,
    });
    const innerCore = new THREE.Mesh(innerCoreGeo, innerCoreMat);
    aiCoreGroup.add(innerCore);

    const ringGeo = new THREE.TorusGeometry(1.1, 0.02, 16, 100);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x34d399,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
    });
    const ring1 = new THREE.Mesh(ringGeo, ringMat);
    const ring2 = new THREE.Mesh(ringGeo, ringMat);
    ring2.rotation.x = Math.PI / 2;
    aiCoreGroup.add(ring1);
    aiCoreGroup.add(ring2);

    aiCoreGroup.position.set(0, 0, -2);
    aiCoreGroup.scale.set(0.001, 0.001, 0.001);
    scene.add(aiCoreGroup);

    sceneRef.current = {
      renderer,
      scene,
      camera,
      foodBoxGroup,
      foodBox,
      phoneGroup,
      scanBeamGroup,
      beamPositions,
      beamGeo,
      rayLeftPositions,
      rayLeftGeo,
      rayRightPositions,
      rayRightGeo,
      labelLinePositions,
      labelLineGeo,
      scanPartPositions,
      scanPartGeo,
      beamMat,
      laserBeam,
      laserGlow,
      particlesMesh,
      aiCoreGroup,
      leavesGroup,
      targetScroll: scrollProgress,
      currentScroll: scrollProgress,
      frameId: 0,
    };

    // Animation Loop
    let clock = new THREE.Clock();
    const animate = () => {
      const elapsed = clock.getElapsedTime();
      const state = sceneRef.current;
      if (!state) return;

      // Smooth scroll interpolation (lerp)
      state.currentScroll += (state.targetScroll - state.currentScroll) * 0.08;
      const p = Math.max(0, Math.min(1, state.currentScroll));

      // -----------------------------------------------------------
      // 1. Food Package & Real 3D Smartphone Placement Across Stages
      // -----------------------------------------------------------
      if (p < 0.18) {
        // Stage 1: Only Hero Text in HTML — 3D Food Box and Phone hidden
        state.foodBoxGroup.scale.set(0.0001, 0.0001, 0.0001);
        state.foodBoxGroup.position.set(-4.0, -1.0, -2.0);
        state.phoneGroup.scale.set(0.0001, 0.0001, 0.0001);
        state.phoneGroup.position.set(3.5, -0.5, 0);
        laserGroup.visible = false;
        state.scanBeamGroup.visible = false;
      } else if (p < 0.40) {
        // Stage 2: Initial Product & Phone Scanning!
        // Food Package on LEFT, Phone on RIGHT tilted toward package
        const enterP = Math.min(1, Math.max(0, (p - 0.18) / 0.07));
        const s = enterP * 1.05;
        state.foodBoxGroup.scale.set(s, s, s);
        state.foodBoxGroup.position.set(
          -2.6 + enterP * 0.95, // rests at -1.65 (left side)
          Math.sin(elapsed * 1.5) * 0.05,
          0.2
        );
        state.foodBoxGroup.rotation.set(
          0.12 + Math.cos(elapsed * 1.2) * 0.02,
          0.38, // angled toward the right so nutrition facts directly face the phone and viewer
          -0.04
        );

        // Real 3D Smartphone on the RIGHT, slightly closer in Z (depth) and angled toward the product
        const phoneS = enterP * 1.0;
        state.phoneGroup.scale.set(phoneS, phoneS, phoneS);
        state.phoneGroup.position.set(
          1.5, // on the right side of the package
          -0.15 + Math.sin(elapsed * 1.5 + 0.5) * 0.04,
          1.15 // closer to viewer than package (0.2) creating authentic 3D depth
        );
        state.phoneGroup.rotation.set(
          0.10 + Math.sin(elapsed * 1.1) * 0.02,
          -0.42 + Math.cos(elapsed * 0.9) * 0.02, // rotated toward the product on left (~ -24 deg)
          -0.03
        );

        // Local laser bar on food box
        laserGroup.visible = enterP > 0.4;
        const scanY = Math.sin(elapsed * 2.8) * 0.75 - 0.05;
        laserGroup.position.y = scanY;
        laserMaterial.opacity = 0.85 + Math.sin(elapsed * 8) * 0.15;

        // 3D Connecting Volumetric Scanning Beam (Phone Camera -> Nutrition Label)
        if (enterP > 0.3) {
          state.scanBeamGroup.visible = true;

          // Compute world coordinates
          state.phoneGroup.updateMatrixWorld(true);
          state.foodBox.updateMatrixWorld(true);

          const phoneCamLocal = new THREE.Vector3(-0.35, 1.15, 0.08);
          const camOrigin = phoneCamLocal.clone().applyMatrix4(state.phoneGroup.matrixWorld);

          const boxLeftLocal = new THREE.Vector3(-0.75, scanY, 0.62);
          const boxRightLocal = new THREE.Vector3(0.75, scanY, 0.62);
          const pLeft = boxLeftLocal.clone().applyMatrix4(state.foodBox.matrixWorld);
          const pRight = boxRightLocal.clone().applyMatrix4(state.foodBox.matrixWorld);

          // Update Volumetric Beam Triangle
          state.beamPositions[0] = camOrigin.x; state.beamPositions[1] = camOrigin.y; state.beamPositions[2] = camOrigin.z;
          state.beamPositions[3] = pLeft.x; state.beamPositions[4] = pLeft.y; state.beamPositions[5] = pLeft.z;
          state.beamPositions[6] = pRight.x; state.beamPositions[7] = pRight.y; state.beamPositions[8] = pRight.z;
          state.beamGeo.attributes.position.needsUpdate = true;

          // Update Edge Rays
          state.rayLeftPositions[0] = camOrigin.x; state.rayLeftPositions[1] = camOrigin.y; state.rayLeftPositions[2] = camOrigin.z;
          state.rayLeftPositions[3] = pLeft.x; state.rayLeftPositions[4] = pLeft.y; state.rayLeftPositions[5] = pLeft.z;
          state.rayLeftGeo.attributes.position.needsUpdate = true;

          state.rayRightPositions[0] = camOrigin.x; state.rayRightPositions[1] = camOrigin.y; state.rayRightPositions[2] = camOrigin.z;
          state.rayRightPositions[3] = pRight.x; state.rayRightPositions[4] = pRight.y; state.rayRightPositions[5] = pRight.z;
          state.rayRightGeo.attributes.position.needsUpdate = true;

          // Update Scan Line on Label
          state.labelLinePositions[0] = pLeft.x; state.labelLinePositions[1] = pLeft.y; state.labelLinePositions[2] = pLeft.z;
          state.labelLinePositions[3] = pRight.x; state.labelLinePositions[4] = pRight.y; state.labelLinePositions[5] = pRight.z;
          state.labelLineGeo.attributes.position.needsUpdate = true;

          // Update Localized Sparkle Particles along the scan line on the label
          for (let i = 0; i < 28; i++) {
            const t = i / 27;
            const jx = Math.sin(elapsed * 18 + i) * 0.03;
            const jy = Math.cos(elapsed * 14 + i) * 0.03;
            const jz = Math.sin(elapsed * 10 + i) * 0.02;
            state.scanPartPositions[i * 3] = pLeft.x + (pRight.x - pLeft.x) * t + jx;
            state.scanPartPositions[i * 3 + 1] = pLeft.y + (pRight.y - pLeft.y) * t + jy;
            state.scanPartPositions[i * 3 + 2] = pLeft.z + (pRight.z - pLeft.z) * t + jz;
          }
          state.scanPartGeo.attributes.position.needsUpdate = true;

          state.beamMat.opacity = (0.28 + Math.sin(elapsed * 6) * 0.08) * enterP;
        } else {
          state.scanBeamGroup.visible = false;
        }
      } else if (p < 0.60) {
        // Stage 3: Real Phone Scanning Meets Patient Profile
        // Package and Phone remain visible on the left/center, framing Eleanor's EHR card on the right
        const localP = (p - 0.40) / 0.20;
        state.foodBoxGroup.position.set(
          -1.65 - localP * 0.35,
          -0.1 + Math.sin(elapsed * 1.4) * 0.04,
          0.2 - localP * 0.3
        );
        state.foodBoxGroup.rotation.set(0.14, 0.42 + localP * 0.08, -0.04);
        const s = 1.05 - localP * 0.1;
        state.foodBoxGroup.scale.set(s, s, s);

        // Phone shifts slightly inwards to frame with the EHR card
        state.phoneGroup.position.set(
          1.5 - localP * 1.4,
          -0.15 + Math.sin(elapsed * 1.5 + 0.5) * 0.04,
          1.15 - localP * 0.1
        );
        state.phoneGroup.rotation.set(0.08, -0.35 + localP * 0.1, -0.02);
        state.phoneGroup.scale.set(1.0, 1.0, 1.0);

        laserGroup.visible = localP < 0.25;
        state.scanBeamGroup.visible = localP < 0.25;
      } else if (p < 0.80) {
        // Stage 4: AI Agent Convergence (Package and phone scale down and move toward core)
        const localP = (p - 0.60) / 0.20;
        state.foodBoxGroup.position.set(
          -2.0 + localP * 2.0,
          -localP * 0.4,
          -0.1 - localP * 1.5
        );
        state.foodBoxGroup.rotation.set(0.15 + localP * 0.3, 0.58 + localP * 0.8, -0.04);
        const s = Math.max(0.01, 0.95 - localP * 0.75);
        state.foodBoxGroup.scale.set(s, s, s);

        const ps = Math.max(0.01, 1.0 - localP * 0.95);
        state.phoneGroup.scale.set(ps, ps, ps);
        state.phoneGroup.position.set(0.1 - localP * 1.0, -0.15, 1.0 - localP * 2.0);

        laserGroup.visible = false;
        state.scanBeamGroup.visible = false;
      } else {
        // Stage 5: Final Sign In / Sign Up Slide (Package in distant background, phone hidden)
        state.foodBoxGroup.position.set(-2.8, -0.8, -3.2);
        state.foodBoxGroup.rotation.set(0.2, 0.8, 0);
        state.foodBoxGroup.scale.set(0.45, 0.45, 0.45);
        state.phoneGroup.scale.set(0.0001, 0.0001, 0.0001);
        laserGroup.visible = false;
        state.scanBeamGroup.visible = false;
      }

      // -----------------------------------------------------------
      // 2. AI Core Appearance & Animation (active in Stage 4 & 5)
      // -----------------------------------------------------------
      if (p >= 0.55 && p <= 0.88) {
        const coreFactor = Math.sin(((p - 0.55) / 0.33) * Math.PI);
        const coreScale = coreFactor * 1.25;
        state.aiCoreGroup.scale.set(coreScale, coreScale, coreScale);
        state.aiCoreGroup.position.set(0, 0.2, 0.2);
        innerCore.rotation.y = elapsed * 1.2;
        innerCore.rotation.x = elapsed * 0.8;
        ring1.rotation.z = elapsed * 1.5;
        ring2.rotation.y = -elapsed * 1.2;
      } else if (p > 0.88) {
        state.aiCoreGroup.scale.set(0.35, 0.35, 0.35);
        state.aiCoreGroup.position.set(0, 2.2, -3.0);
        innerCore.rotation.y = elapsed * 0.5;
      } else {
        state.aiCoreGroup.scale.set(0.001, 0.001, 0.001);
      }

      // -----------------------------------------------------------
      // 3. Ambient Floating Leaves & Particles
      // -----------------------------------------------------------
      state.particlesMesh.rotation.y = elapsed * 0.04;
      state.particlesMesh.rotation.x = Math.sin(elapsed * 0.02) * 0.05;

      state.leavesGroup.children.forEach((child, i) => {
        child.rotation.x += 0.008 * (i % 2 === 0 ? 1 : -1);
        child.rotation.y += 0.01;
        child.position.y += Math.sin(elapsed + i) * 0.004;
      });

      // -----------------------------------------------------------
      // 4. Smooth Camera Trajectory (Dollys closer during Step 2)
      // -----------------------------------------------------------
      if (p < 0.18) {
        state.camera.position.set(0, 0, 7.5);
      } else if (p < 0.40) {
        // Smoothly dollys in closer to frame the food package and scanning phone
        const camP = (p - 0.18) / 0.22;
        state.camera.position.set(camP * 0.1, 0, 7.5 - camP * 0.85); // dollys from 7.5 down to 6.65
      } else if (p < 0.65) {
        const camP = (p - 0.40) / 0.25;
        state.camera.position.set(0.1 - camP * 0.35, 0, 6.65 - camP * 0.3);
      } else {
        const camP = (p - 0.65) / 0.35;
        state.camera.position.set(-0.25 + camP * 0.25, 0, 6.35 + camP * 0.7);
      }
      state.camera.lookAt(0, 0, 0);

      state.renderer.render(state.scene, state.camera);
      state.frameId = requestAnimationFrame(animate);
    };

    sceneRef.current.frameId = requestAnimationFrame(animate);

    // Resize handler
    const handleResize = () => {
      if (!container || !sceneRef.current) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      sceneRef.current.camera.aspect = w / h;
      sceneRef.current.camera.updateProjectionMatrix();
      sceneRef.current.renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (sceneRef.current) {
        cancelAnimationFrame(sceneRef.current.frameId);
        sceneRef.current.renderer.dispose();
        if (renderer.domElement.parentNode) {
          renderer.domElement.parentNode.removeChild(renderer.domElement);
        }
      }
    };
  }, []);

  // Update target scroll in ref
  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.targetScroll = scrollProgress;
    }
  }, [scrollProgress]);

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 pointer-events-none z-0 overflow-hidden ${className}`}
      aria-hidden="true"
    />
  );
};
