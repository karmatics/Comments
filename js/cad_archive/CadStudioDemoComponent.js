class CadStudioDemoComponent {

  static async render(container) {
      container.innerHTML = '';

      const wrap = makeElement('div', {
        style: {
          width: '100%',
          minHeight: '720px',
          position: 'relative',
          background: '#090d16',
          borderRadius: '12px',
          border: '1.5px solid #21262d',
          overflow: 'hidden',
          boxShadow: '0 16px 40px rgba(0,0,0,0.65)',
          display: 'flex',
          flexDirection: 'column'
        }
      });
      container.appendChild(wrap);

      const tabsBar = makeElement('div', {
        style: {
          minHeight: '46px',
          background: 'rgba(15, 20, 28, 0.96)',
          borderBottom: '1px solid #21262d',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '6px 14px',
          zIndex: '50',
          flexWrap: 'wrap',
          gap: '6px'
        }
      });

      const tabsGroup = makeElement('div', {
        style: { display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }
      });

      const makeTabBtn = (label, id, isActive = false) => makeElement('button', {
        id: id,
        className: `dr-tab-btn ${isActive ? 'active' : ''}`,
        style: {
          borderRadius: '6px',
          padding: '5px 12px',
          fontFamily: 'monospace',
          fontSize: '11px',
          fontWeight: 'bold',
          cursor: 'pointer'
        }
      }, label);

      const tabFull = makeTabBtn('📐 accuCad (Full Workstation)', 'studio-tab-full', true);
      const tabSnap = makeTabBtn('🎯 Snapping & Tentative Gym', 'studio-tab-snap');
      const tabCompass = makeTabBtn('🧭 3D Compass Gymnastics', 'studio-tab-compass');
      const tabSvg = makeTabBtn('🌐 Pure SVG AccuDraw', 'studio-tab-svg');
      const tabSpline = makeTabBtn('✍️ On-Curve Spline & Parallax', 'studio-tab-spline');

      tabsGroup.appendChild(tabFull);
      tabsGroup.appendChild(tabSnap);
      tabsGroup.appendChild(tabCompass);
      tabsGroup.appendChild(tabSvg);
      tabsGroup.appendChild(tabSpline);

      const rightControls = makeElement('div', {
        style: { display: 'flex', gap: '8px', alignItems: 'center' }
      });

      const openStandaloneBtn = makeElement('a', {
        href: '../accuCad/index.html',
        target: '_blank',
        style: {
          background: '#1e293b',
          color: '#38bdf8',
          border: '1px solid #38bdf866',
          borderRadius: '6px',
          padding: '5px 10px',
          fontFamily: 'monospace',
          fontSize: '10px',
          fontWeight: 'bold',
          textDecoration: 'none',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px'
        }
      }, '↗ Standalone accuCad');

      rightControls.appendChild(openStandaloneBtn);
      tabsBar.appendChild(tabsGroup);
      tabsBar.appendChild(rightControls);
      wrap.appendChild(tabsBar);

      const stage = makeElement('div', {
        style: {
          flex: '1',
          width: '100%',
          minHeight: '674px',
          position: 'relative',
          background: '#090d16'
        }
      });
      wrap.appendChild(stage);

      const tabButtons = [tabFull, tabSnap, tabCompass, tabSvg, tabSpline];

      function switchView(viewName) {
        // Cleanly unregister any active instances in stage before clearing
        stage.querySelectorAll('[id^="accucad-mount-"]').forEach(mountEl => {
          if (mountEl._accuCadId) {
            CadStudioDemoComponent.unregisterInstance(mountEl._accuCadId);
          }
        });

        stage.innerHTML = '';
        tabButtons.forEach(b => b.classList.remove('active'));

        if (viewName === 'full') {
          tabFull.classList.add('active');
          openStandaloneBtn.style.display = 'inline-flex';
          CadStudioDemoComponent._renderAccuCadIframe(stage);
        } else if (viewName === 'snap') {
          tabSnap.classList.add('active');
          openStandaloneBtn.style.display = 'none';
          CadStudioDemoComponent._renderSnappingGym(stage);
        } else if (viewName === 'compass') {
          tabCompass.classList.add('active');
          openStandaloneBtn.style.display = 'none';
          CadStudioDemoComponent._renderCompassGym(stage);
        } else if (viewName === 'svg') {
          tabSvg.classList.add('active');
          openStandaloneBtn.style.display = 'none';
          CadStudioDemoComponent._renderSvgAccuDrawView(stage);
        } else {
          tabSpline.classList.add('active');
          openStandaloneBtn.style.display = 'none';
          CadStudioDemoComponent._renderAuthenticCurveAndParallaxLab(stage);
        }
      }

      tabFull.onclick = () => switchView('full');
      tabSnap.onclick = () => switchView('snap');
      tabCompass.onclick = () => switchView('compass');
      tabSvg.onclick = () => switchView('svg');
      tabSpline.onclick = () => switchView('spline');

      switchView('full');
    }
  static async _renderAccuCadIframe(container) {
      container.innerHTML = '';

      const frameWrap = makeElement('div', {
        style: {
          width: '100%',
          minHeight: '640px',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          background: '#0d1117'
        }
      });

      const statusHeader = makeElement('div', {
        style: {
          padding: '8px 14px',
          background: '#161b22',
          borderBottom: '1px solid #30363d',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '11px',
          fontFamily: 'monospace',
          color: '#8b949e',
          flexWrap: 'wrap',
          gap: '8px'
        }
      }, [
        makeElement('div', { style: { display: 'flex', alignItems: 'center', gap: '8px' } }, [
          makeElement('strong', { style: { color: '#00f2fe' } }, '📐 accuCad [Instance 2: Production Studio] • Native Embedded (No Iframes)'),
          makeElement('span', { id: 'accucad-inst2-focus', style: { color: '#10b981' } }, '● Active Focus')
        ]),
        makeElement('span', { style: { color: '#64748b' } }, 'Click canvas to focus keyboard shortcuts [T/F/S/L/Space/O/G]')
      ]);
      frameWrap.appendChild(statusHeader);

      const appMount = makeElement('div', {
        id: 'accucad-mount-instance-2',
        style: {
          flex: 1,
          width: '100%',
          minHeight: '600px',
          position: 'relative',
          border: '1.5px solid #21262d',
          transition: 'border-color 0.2s, box-shadow 0.2s'
        }
      });
      frameWrap.appendChild(appMount);
      container.appendChild(frameWrap);

      let activeApp = null;
      let instId = null;

      const boot = async () => {
        const isLoaded = await CadStudioDemoComponent.ensureAccuCadLoaded();
        if (isLoaded && globalThis.Main) {
          try {
            activeApp = new globalThis.Main();
            await activeApp.run({ container: appMount });
            instId = CadStudioDemoComponent.registerInstance(activeApp, appMount, 'Instance 2: Production Studio');
            return;
          } catch (e) {
            console.warn('[CadStudioDemoComponent] Native run notice:', e);
          }
        }
      };

      boot();

      const observer = new MutationObserver(() => {
        if (!document.body.contains(frameWrap)) {
          if (instId) CadStudioDemoComponent.unregisterInstance(instId);
          observer.disconnect();
        }
      });
      observer.observe(frameWrap.parentNode || document.body, { childList: true });
    }
  static async _renderAuthenticCurveAndParallaxLab(container) {
      const wrap = makeElement('div', {
        style: { width: '100%', height: '100%', minHeight: '634px', position: 'relative' }
      });
      container.appendChild(wrap);

      // Initial state with normal: null to prevent TDZ ReferenceError before ThreeJSLoader initializes
      const state = {
        vertices: [],
        vertexDots: [],
        curveLine: null,
        previewLine: null,
        controlPolygonLines: null,
        currentCurvature: 1.0,
        currentBalance: 1.0,
        showControls: true,
        hoverPoint: null,
        normal: null,
        origin: [0, 0, 0],
        lastHitNormal: null,
        gridHelper: null,

        // Motion Parallax Oscillation (Exact math from CameraOrbitAnimator)
        oscillating: true,
        oscDuration: 4.5,
        radiusFraction: 0.045,
        startTime: performance.now(),
        baseCamPos: null,
        baseTarget: null,
        tangent: null,
        bitangent: null,
        distance: null
      };

      // HUD Bar
      const hud = makeElement('div', {
        style: {
          position: 'absolute',
          top: '12px',
          left: '12px',
          right: '12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '8px',
          zIndex: '30',
          pointerEvents: 'none'
        }
      });

      const statusEl = makeElement('div', {
        style: {
          background: 'rgba(15, 20, 28, 0.94)',
          padding: '6px 14px',
          borderRadius: '20px',
          border: '1px solid #10b981',
          fontFamily: 'monospace',
          fontSize: '11px',
          color: '#f0f6fc',
          pointerEvents: 'auto'
        }
      }, 'Plane: TOP [T] • Press [T] Top, [F] Front, [S] Side, [Q] Align to face • Parallax ON');

      const controlsRow = makeElement('div', {
        style: {
          background: 'rgba(15, 20, 28, 0.94)',
          padding: '6px 14px',
          borderRadius: '20px',
          border: '1px solid rgba(255,255,255,0.12)',
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '8px',
          fontFamily: 'monospace',
          fontSize: '11px',
          color: '#e2e8f0',
          pointerEvents: 'auto'
        }
      });

      // Curvature Slider
      const curvLbl = makeElement('span', { style: { color: '#38bdf8', fontWeight: 'bold' } }, 'Curvature: 1.0');
      const curvSlider = makeElement('input', {
        type: 'range',
        min: '0.1',
        max: '2.5',
        step: '0.05',
        value: '1.0',
        style: { width: '65px', accentColor: '#38bdf8', cursor: 'pointer' },
        oninput: (e) => {
          state.currentCurvature = parseFloat(e.target.value);
          curvLbl.textContent = `Curvature: ${state.currentCurvature.toFixed(2)}`;
          state.vertices.forEach(v => { v.curvature = state.currentCurvature; });
          updateFinalCurve();
        }
      });

      // Balance Slider
      const balLbl = makeElement('span', { style: { color: '#f59e0b', fontWeight: 'bold' } }, 'Balance: 1.0');
      const balSlider = makeElement('input', {
        type: 'range',
        min: '0.1',
        max: '1.9',
        step: '0.05',
        value: '1.0',
        style: { width: '65px', accentColor: '#f59e0b', cursor: 'pointer' },
        oninput: (e) => {
          state.currentBalance = parseFloat(e.target.value);
          balLbl.textContent = `Balance: ${state.currentBalance.toFixed(2)}`;
          state.vertices.forEach(v => { v.balance = state.currentBalance; });
          updateFinalCurve();
        }
      });

      // Oscillation Toggle
      const oscBtn = makeElement('button', {
        style: {
          background: '#0284c7',
          color: '#ffffff',
          border: '1px solid #38bdf8',
          padding: '4px 8px',
          borderRadius: '12px',
          cursor: 'pointer',
          fontWeight: 'bold',
          fontSize: '10px'
        },
        onclick: () => {
          state.oscillating = !state.oscillating;
          oscBtn.style.background = state.oscillating ? '#0284c7' : '#1e293b';
          oscBtn.style.color = state.oscillating ? '#ffffff' : '#94a3b8';
          if (state.oscillating) {
            reanchorOscillationBasis();
          } else if (state.baseCamPos && threeLoader?.camera) {
            threeLoader.camera.position.copy(state.baseCamPos);
            threeLoader.camera.lookAt(state.baseTarget);
          }
        }
      }, '🔄 Parallax: ON');

      // Safe plane switcher resolving vector instances via loaded runtime
      const setPlane = (name, normalVec) => {
        const T = threeLoader?.THREE || globalThis.THREE;
        if (!state.normal && T) {
          state.normal = new T.Vector3(0, 1, 0);
        }
        if (state.normal && normalVec) {
          state.normal.copy(normalVec).normalize();
        }
        updateGridOrientation();
        if (state.normal) {
          statusEl.textContent = `Plane: ${name} (Normal: [${state.normal.x.toFixed(2)}, ${state.normal.y.toFixed(2)}, ${state.normal.z.toFixed(2)}])`;
        }
      };

      const btnTop = makeElement('button', {
        style: { background: '#1e293b', color: '#38bdf8', border: '1px solid #38bdf866', padding: '3px 7px', borderRadius: '4px', cursor: 'pointer', fontSize: '10px', fontWeight: 'bold' },
        onclick: () => {
          const T = threeLoader?.THREE || globalThis.THREE;
          if (T) setPlane('TOP', new T.Vector3(0, 1, 0));
        }
      }, 'T: Top');

      const btnFront = makeElement('button', {
        style: { background: '#1e293b', color: '#38bdf8', border: '1px solid #38bdf866', padding: '3px 7px', borderRadius: '4px', cursor: 'pointer', fontSize: '10px', fontWeight: 'bold' },
        onclick: () => {
          const T = threeLoader?.THREE || globalThis.THREE;
          if (T) setPlane('FRONT', new T.Vector3(0, 0, 1));
        }
      }, 'F: Front');

      const btnSide = makeElement('button', {
        style: { background: '#1e293b', color: '#38bdf8', border: '1px solid #38bdf866', padding: '3px 7px', borderRadius: '4px', cursor: 'pointer', fontSize: '10px', fontWeight: 'bold' },
        onclick: () => {
          const T = threeLoader?.THREE || globalThis.THREE;
          if (T) setPlane('SIDE', new T.Vector3(1, 0, 0));
        }
      }, 'S: Side');

      const btnAlignFace = makeElement('button', {
        style: { background: '#1e293b', color: '#a855f7', border: '1px solid #a855f766', padding: '3px 7px', borderRadius: '4px', cursor: 'pointer', fontSize: '10px', fontWeight: 'bold' },
        onclick: () => {
          if (state.lastHitNormal) {
            setPlane('SURFACE FACE', state.lastHitNormal);
          } else {
            alert('Hover or click any 3D shape face first, then click Align Face (or tap Q)!');
          }
        }
      }, 'Q: Align Face');

      const exportBtn = makeElement('button', {
        style: { background: '#1e293b', color: '#10b981', border: '1px solid #10b981', padding: '3px 8px', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', fontSize: '10px' },
        onclick: () => {
          if (state.vertices.length < 2) {
            alert('Place at least 2 vertices to export a DXF drawing!');
            return;
          }
          CadStudioDemoComponent.exportToDxf(state.vertices);
          statusEl.textContent = '✓ Exported standard AutoCAD DXF drawing file!';
        }
      }, '📤 DXF');

      const clearBtn = makeElement('button', {
        style: { background: '#1e293b', color: '#ef4444', border: '1px solid #ef4444', padding: '3px 8px', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', fontSize: '10px' },
        onclick: () => {
          state.vertices = [];
          if (state.curveLine && scene) { scene.remove(state.curveLine); state.curveLine = null; }
          if (state.previewLine && scene) { scene.remove(state.previewLine); state.previewLine = null; }
          if (state.controlPolygonLines && scene) { scene.remove(state.controlPolygonLines); state.controlPolygonLines = null; }
          state.vertexDots.forEach(d => { if (scene) scene.remove(d); });
          state.vertexDots = [];
          statusEl.textContent = 'Cleared spline • Click through-points on surface or plane';
        }
      }, '🗑️');

      controlsRow.appendChild(curvLbl);
      controlsRow.appendChild(curvSlider);
      controlsRow.appendChild(balLbl);
      controlsRow.appendChild(balSlider);
      controlsRow.appendChild(makeElement('span', { style: { color: '#475569' } }, '|'));
      controlsRow.appendChild(btnTop);
      controlsRow.appendChild(btnFront);
      controlsRow.appendChild(btnSide);
      controlsRow.appendChild(btnAlignFace);
      controlsRow.appendChild(oscBtn);
      controlsRow.appendChild(exportBtn);
      controlsRow.appendChild(clearBtn);

      hud.appendChild(controlsRow);
      hud.appendChild(statusEl);
      wrap.appendChild(hud);

      // Initialize ThreeJSLoader
      const threeLoader = new ThreeJSLoader(null, {
        enableControls: true,
        useThickLines: true,
        useRaycaster: true,
        lighting: true,
        environment: false,
        cameraPos: { x: 3.2, y: 3.5, z: 4.8 }
      });

      await threeLoader.init(wrap);

      const THREE = threeLoader.THREE;
      globalThis.THREE = THREE;
      const scene = threeLoader.scene;
      const camera = threeLoader.camera;
      const target = new THREE.Vector3(0, 0.4, 0);
      camera.lookAt(target);

      // Safely instantiate normal vector after Three.js is online
      state.normal = new THREE.Vector3(0, 1, 0);

      const { meshes } = Simple3dShapes.buildPrimitives(threeLoader, scene);

      // Dynamic 3D Construction Grid
      const gridHelper = new THREE.GridHelper(8, 16, 0x00f2fe, 0x21262d);
      gridHelper.position.set(0, 0, 0);
      scene.add(gridHelper);
      state.gridHelper = gridHelper;

      function updateGridOrientation() {
        if (!state.gridHelper || !state.normal) return;
        const up = new THREE.Vector3(0, 1, 0);
        const quat = new THREE.Quaternion().setFromUnitVectors(up, state.normal);
        state.gridHelper.quaternion.copy(quat);
      }

      function reanchorOscillationBasis() {
        state.baseCamPos = camera.position.clone();
        state.baseTarget = target.clone();

        const D_vec = state.baseCamPos.clone().sub(state.baseTarget);
        state.distance = D_vec.length();
        const normal = D_vec.clone().normalize();

        let arbitrary = new THREE.Vector3(0, 1, 0);
        if (Math.abs(normal.dot(arbitrary)) > 0.99) arbitrary.set(1, 0, 0);

        state.tangent = new THREE.Vector3().crossVectors(normal, arbitrary).normalize();
        state.bitangent = new THREE.Vector3().crossVectors(normal, state.tangent).normalize();
        state.startTime = performance.now();
      }

      reanchorOscillationBasis();

      if (threeLoader.controls) {
        threeLoader.controls.addEventListener('start', () => {
          state.isUserInteracting = true;
        });
        threeLoader.controls.addEventListener('end', () => {
          state.isUserInteracting = false;
          reanchorOscillationBasis();
        });
      }

      // Animation Loop: Motion Parallax
      threeLoader.onUpdateCallback = () => {
        if (state.oscillating && !state.isUserInteracting && state.baseCamPos && state.distance) {
          const elapsed = (performance.now() - state.startTime) / 1000;
          const angle = (elapsed / state.oscDuration) * 2 * Math.PI;
          const maxRadius = state.distance * state.radiusFraction;

          const offset = new THREE.Vector3()
            .addScaledVector(state.tangent, Math.cos(angle) * maxRadius)
            .addScaledVector(state.bitangent, Math.sin(angle) * maxRadius);

          camera.position.copy(state.baseCamPos).add(offset);
          camera.lookAt(state.baseTarget);
        }
      };

      function evaluateCubicSpline(vertexArray, segmentsPerSpan = 24) {
        const points = [];
        for (let i = 0; i < vertexArray.length - 1; i++) {
          const vStart = vertexArray[i];
          const vEnd = vertexArray[i + 1];

          const p0 = new THREE.Vector3(vStart.point[0], vStart.point[1], vStart.point[2]);
          const p1 = new THREE.Vector3(vStart.controlPoints[1][0], vStart.controlPoints[1][1], vStart.controlPoints[1][2]);
          const p2 = new THREE.Vector3(vEnd.controlPoints[0][0], vEnd.controlPoints[0][1], vEnd.controlPoints[0][2]);
          const p3 = new THREE.Vector3(vEnd.point[0], vEnd.point[1], vEnd.point[2]);

          const bezier = new THREE.CubicBezierCurve3(p0, p1, p2, p3);
          const subPts = bezier.getPoints(segmentsPerSpan);
          subPts.forEach(pt => points.push(pt));
        }
        return points;
      }

      function updateFinalCurve() {
        if (state.curveLine) scene.remove(state.curveLine);
        if (state.controlPolygonLines) scene.remove(state.controlPolygonLines);

        if (state.vertices.length < 2) return;

        const solver = (typeof UpdateControlPoints !== 'undefined') ? UpdateControlPoints : globalThis.UpdateControlPoints;
        solver.run(state.vertices, 8);

        const pts = evaluateCubicSpline(state.vertices, 24);
        const geom = new THREE.BufferGeometry().setFromPoints(pts);
        const mat = new THREE.LineBasicMaterial({ color: 0x10b981, linewidth: 3 });
        state.curveLine = new THREE.Line(geom, mat);
        scene.add(state.curveLine);

        if (state.showControls) {
          const handleLines = [];
          for (let i = 0; i < state.vertices.length; i++) {
            const v = state.vertices[i];
            const pt = new THREE.Vector3(...v.point);
            if (i > 0) handleLines.push(new THREE.Vector3(...v.controlPoints[0]), pt);
            if (i < state.vertices.length - 1) handleLines.push(pt, new THREE.Vector3(...v.controlPoints[1]));
          }
          if (handleLines.length > 0) {
            const hGeom = new THREE.BufferGeometry().setFromPoints(handleLines);
            const hMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.45 });
            state.controlPolygonLines = new THREE.LineSegments(hGeom, hMat);
            scene.add(state.controlPolygonLines);
          }
        }
      }

      function updateDynamicPreview(candidatePoint) {
        if (state.previewLine) scene.remove(state.previewLine);
        if (state.vertices.length === 0) return;

        const vertexClass = (typeof BezierVertex !== 'undefined') ? BezierVertex : globalThis.BezierVertex;
        const solver = (typeof UpdateControlPoints !== 'undefined') ? UpdateControlPoints : globalThis.UpdateControlPoints;

        const liveVertices = state.vertices.map(v => vertexClass.fromJSON ? vertexClass.fromJSON(v.toJSON()) : new vertexClass(v.point.slice()));
        const floatingV = new vertexClass(candidatePoint);
        floatingV.curvature = state.currentCurvature;
        floatingV.balance = state.currentBalance;
        liveVertices.push(floatingV);

        solver.run(liveVertices, 4);

        const pts = evaluateCubicSpline(liveVertices, 16);
        const geom = new THREE.BufferGeometry().setFromPoints(pts);
        const mat = new THREE.LineBasicMaterial({
          color: 0x38bdf8,
          linewidth: 2,
          transparent: true,
          opacity: 0.8
        });
        state.previewLine = new THREE.Line(geom, mat);
        scene.add(state.previewLine);
      }

      const raycaster = new THREE.Raycaster();
      const mouse = new THREE.Vector2();

      function getRaycastHit(e) {
        const rect = wrap.getBoundingClientRect();
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);

        const hits = raycaster.intersectObjects(meshes, true);
        if (hits.length > 0) {
          if (hits[0].face) {
            const hitWorldNormal = hits[0].face.normal.clone()
              .transformDirection(hits[0].object.matrixWorld)
              .normalize();
            state.lastHitNormal = hitWorldNormal;
          }
          return [hits[0].point.x, hits[0].point.y, hits[0].point.z];
        }

        if (!state.normal) state.normal = new THREE.Vector3(0, 1, 0);
        const plane = new THREE.Plane(state.normal, 0);
        const intersectPt = new THREE.Vector3();
        if (raycaster.ray.intersectPlane(plane, intersectPt)) {
          return [intersectPt.x, intersectPt.y, intersectPt.z];
        }
        return null;
      }

      wrap.addEventListener('pointermove', (e) => {
        if (e.target.closest('input, button, a')) return;
        const hitPt = getRaycastHit(e);
        if (hitPt && state.vertices.length >= 1) {
          state.hoverPoint = hitPt;
          updateDynamicPreview(hitPt);
        }
      });

      wrap.addEventListener('pointerdown', (e) => {
        if (e.button !== 0 || e.target.closest('input, button, a')) return;
        const hitPt = getRaycastHit(e);
        if (!hitPt) return;

        const vertexClass = (typeof BezierVertex !== 'undefined') ? BezierVertex : globalThis.BezierVertex;
        const v = new vertexClass(hitPt);
        v.curvature = state.currentCurvature;
        v.balance = state.currentBalance;
        state.vertices.push(v);

        const dotGeom = new THREE.SphereGeometry(0.045, 16, 16);
        const dotMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
        const dot = new THREE.Mesh(dotGeom, dotMat);
        dot.position.set(hitPt[0], hitPt[1], hitPt[2]);
        scene.add(dot);
        state.vertexDots.push(dot);

        updateFinalCurve();

        if (state.previewLine) {
          scene.remove(state.previewLine);
          state.previewLine = null;
        }

        if (state.normal) {
          statusEl.textContent = `Placed vertex #${state.vertices.length} on ${state.normal.y > 0.9 ? 'TOP' : (state.normal.z > 0.9 ? 'FRONT' : (state.normal.x > 0.9 ? 'SIDE' : 'FACE'))} plane`;
        }
      });

      const keyHandler = (e) => {
        if (!wrap.isConnected) return;
        const tag = e.target?.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA') return;

        const T = threeLoader?.THREE || globalThis.THREE;
        if (!T) return;

        if (e.key === 't' || e.key === 'T') {
          setPlane('TOP', new T.Vector3(0, 1, 0));
        } else if (e.key === 'f' || e.key === 'F') {
          setPlane('FRONT', new T.Vector3(0, 0, 1));
        } else if (e.key === 's' || e.key === 'S') {
          setPlane('SIDE', new T.Vector3(1, 0, 0));
        } else if (e.key === 'q' || e.key === 'Q') {
          if (state.lastHitNormal) {
            setPlane('SURFACE FACE', state.lastHitNormal);
          }
        }
      };
      window.addEventListener('keydown', keyHandler);

      const observer = new MutationObserver(() => {
        if (!document.body.contains(wrap)) {
          window.removeEventListener('keydown', keyHandler);
          threeLoader.destroy();
          observer.disconnect();
        }
      });
      observer.observe(wrap.parentNode || document.body, { childList: true });
    }
  static exportToDxf(vertices) {
    if (!vertices || vertices.length < 2) return;

    const solver = (typeof UpdateControlPoints !== 'undefined') ? UpdateControlPoints : globalThis.UpdateControlPoints;
    solver.run(vertices, 8);

    let dxf = "0\nSECTION\n2\nHEADER\n0\nENDSEC\n0\nSECTION\n2\nENTITIES\n";
    const segSteps = 16;

    for (let i = 0; i < vertices.length - 1; i++) {
      const v0 = vertices[i].point;
      const cp1 = vertices[i].controlPoints[1];
      const cp2 = vertices[i + 1].controlPoints[0];
      const v1 = vertices[i + 1].point;

      let prevX = v0[0], prevY = v0[1], prevZ = v0[2] || 0;

      for (let s = 1; s <= segSteps; s++) {
        const t = s / segSteps;
        const mt = 1 - t;

        const curX = mt*mt*mt*v0[0] + 3*mt*mt*t*cp1[0] + 3*mt*t*t*cp2[0] + t*t*t*v1[0];
        const curY = mt*mt*mt*v0[1] + 3*mt*mt*t*cp1[1] + 3*mt*t*t*cp2[1] + t*t*t*v1[1];
        const curZ = mt*mt*mt*(v0[2]||0) + 3*mt*mt*t*(cp1[2]||0) + 3*mt*t*t*(cp2[2]||0) + t*t*t*(v1[2]||0);

        dxf += "0\nLINE\n8\nCOMPASSDRAW_CURVES\n";
        dxf += `10\n${prevX.toFixed(4)}\n20\n${prevY.toFixed(4)}\n30\n${prevZ.toFixed(4)}\n`;
        dxf += `11\n${curX.toFixed(4)}\n21\n${curY.toFixed(4)}\n31\n${curZ.toFixed(4)}\n`;

        prevX = curX; prevY = curY; prevZ = curZ;
      }
    }

    dxf += "0\nENDSEC\n0\nEOF\n";

    const blob = new Blob([dxf], { type: 'application/dxf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CompassDraw_Export_${Date.now()}.dxf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  static ensureAccuCadLoaded = null;

    static async ensureAccuCadLoaded() {
        if (globalThis.Main && globalThis.BaseController && globalThis.AccuDrawLogic) {
          return true;
        }
        if (CadStudioDemoComponent._accuCadLoadPromise) {
          return CadStudioDemoComponent._accuCadLoadPromise;
        }

        CadStudioDemoComponent._accuCadLoadPromise = (async () => {
          try {
            let meta = null;
            let baseAccuCadUrl = '/accuCad/';

            try {
              const r1 = await fetch('/accuCad/luno.json?v=' + Date.now());
              if (r1.ok) {
                meta = await r1.json();
                baseAccuCadUrl = '/accuCad/';
              }
            } catch (e) {}

            if (!meta) {
              try {
                const r2 = await fetch('../accuCad/luno.json?v=' + Date.now());
                if (r2.ok) {
                  meta = await r2.json();
                  baseAccuCadUrl = '../accuCad/';
                }
              } catch (e) {}
            }

            if (!meta && window.location.hostname.endsWith('.github.io')) {
              const user = window.location.hostname.split('.')[0];
              baseAccuCadUrl = `https://${user}.github.io/accuCad/`;
              try {
                const r3 = await fetch(baseAccuCadUrl + 'luno.json?v=' + Date.now());
                if (r3.ok) meta = await r3.json();
              } catch (e) {}
            }

            if (!meta) {
              console.warn('[CadStudioDemoComponent] Could not fetch accuCad/luno.json manifest.');
              return false;
            }

            const libs = (meta.library || []).map(lib => {
              const clean = lib.replace(/^(?:Library|library)\//, '');
              return (typeof LunoLoader !== 'undefined')
                ? LunoLoader.resolveScriptUrl('Library/' + clean)
                : ('/Library/' + clean);
            });

            if (typeof LunoLoader !== 'undefined' && LunoLoader.loadScriptsInOrder) {
              await LunoLoader.loadScriptsInOrder(libs);
            }

            const mainUrls = (meta.main || []).map(file => {
              if (file.startsWith('http://') || file.startsWith('https://')) return file;
              return baseAccuCadUrl + file.replace(/^\/+/, '');
            });

            if (typeof LunoLoader !== 'undefined' && LunoLoader.loadScriptsInOrder) {
              await LunoLoader.loadScriptsInOrder(mainUrls);
            }

            return Boolean(globalThis.Main);
          } catch (err) {
            console.error('[CadStudioDemoComponent] Exception loading accuCad scripts:', err);
            return false;
          }
        })();

        return CadStudioDemoComponent._accuCadLoadPromise;
      }
  static _renderSnappingGym(stage) {
      stage.innerHTML = '';
      const gymWrap = makeElement('div', {
        style: { width: '100%', height: '100%', minHeight: '660px', position: 'relative', display: 'flex', flexDirection: 'column' }
      });

      const hud = makeElement('div', {
        style: {
          padding: '8px 14px', background: '#0c1220', borderBottom: '1px solid #1e293b',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          fontSize: '11px', color: '#94a3b8', fontFamily: 'monospace'
        }
      }, [
        makeElement('div', { style: { display: 'flex', alignItems: 'center', gap: '8px' } }, [
          makeElement('strong', { style: { color: '#00f2fe' } }, '🎯 Focused Snapping & Tentative Workbench:'),
          makeElement('span', {}, 'Hover wireframes • 50ms Chord / Ctrl Snaps • [G] Origin • Pull away to test Mini-Jack')
        ]),
        makeElement('span', { style: { color: '#10b981', fontWeight: 'bold' } }, '● Screen-Space 14px Thick Pick')
      ]);
      gymWrap.appendChild(hud);

      const mountPoint = makeElement('div', { style: { flex: 1, position: 'relative' } });
      gymWrap.appendChild(mountPoint);
      stage.appendChild(gymWrap);

      if (typeof TentativeSnappingLab !== 'undefined' && TentativeSnappingLab.render) {
        TentativeSnappingLab.render(mountPoint);
      }
    }

  static _renderCompassGym(stage) {
      stage.innerHTML = '';
      const compWrap = makeElement('div', {
        style: { width: '100%', height: '100%', minHeight: '660px', position: 'relative', display: 'flex', flexDirection: 'column' }
      });

      const hud = makeElement('div', {
        style: {
          padding: '8px 14px', background: '#0c1220', borderBottom: '1px solid #1e293b',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          fontSize: '11px', color: '#94a3b8', fontFamily: 'monospace'
        }
      }, [
        makeElement('div', { style: { display: 'flex', alignItems: 'center', gap: '8px' } }, [
          makeElement('strong', { style: { color: '#38bdf8' } }, '🧭 3D Compass Gymnastics & Plane Rotation:'),
          makeElement('span', {}, 'Single-stroke planes [T/F/S/V] • Surface Alignment [Q] • Orbit without scene clutter')
        ]),
        makeElement('span', { style: { color: '#f59e0b', fontWeight: 'bold' } }, '● ThreeAxes Direction Cosines')
      ]);
      compWrap.appendChild(hud);

      const mountPoint = makeElement('div', { style: { flex: 1, position: 'relative' } });
      compWrap.appendChild(mountPoint);
      stage.appendChild(compWrap);

      if (typeof CadIsolatedCompass3DComponent !== 'undefined' && CadIsolatedCompass3DComponent.render) {
        CadIsolatedCompass3DComponent.render(mountPoint);
      }
    }

  static _renderSvgAccuDrawView(stage) {
      stage.innerHTML = '';
      const svgWrap = makeElement('div', {
        style: { width: '100%', height: '100%', minHeight: '660px', position: 'relative', display: 'flex', flexDirection: 'column' }
      });

      const hud = makeElement('div', {
        style: {
          padding: '8px 14px', background: '#0c1220', borderBottom: '1px solid #1e293b',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          fontSize: '11px', color: '#94a3b8', fontFamily: 'monospace'
        }
      }, [
        makeElement('div', { style: { display: 'flex', alignItems: 'center', gap: '8px' } }, [
          makeElement('strong', { style: { color: '#10b981' } }, '🌐 Pure SVG AccuDraw Studio:'),
          makeElement('span', {}, 'Resolution-independent vector drafting • Zero WebGL overhead • Real DXF bulge exports')
        ]),
        makeElement('span', { style: { color: '#00f2fe', fontWeight: 'bold' } }, '● Superellipse Squircle Math')
      ]);
      svgWrap.appendChild(hud);

      const mountPoint = makeElement('div', { style: { flex: 1, position: 'relative' } });
      svgWrap.appendChild(mountPoint);
      stage.appendChild(svgWrap);

      if (typeof SvgSmartLineLab !== 'undefined' && SvgSmartLineLab.render) {
        SvgSmartLineLab.render(mountPoint);
      }
    }

  static registerInstance(app, container, name = 'accuCad') {
      if (!CadStudioDemoComponent._instances) {
        CadStudioDemoComponent._instances = new Map();
        CadStudioDemoComponent._activeInst = null;

        // Single centralized key router for all native accuCad instances
        window.addEventListener('keydown', (e) => {
          const tag = e.target?.tagName;
          if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target?.isContentEditable) return;
          if (globalThis._cadPlanInstance?.aardvark?.isActive) return;

          const cur = CadStudioDemoComponent._activeInst;
          if (cur && !cur.isSuspended && cur.app && cur.app.baseController) {
            if (typeof cur.app.baseController.handleKeyDown === 'function') {
              cur.app.baseController.handleKeyDown(e);
            }
          }
        }, { capture: true });

        // IntersectionObserver to pause off-screen instances
        CadStudioDemoComponent._observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            const item = CadStudioDemoComponent._instances.get(entry.target._accuCadId);
            if (item) {
              item.isSuspended = !entry.isIntersecting;
              if (item.app?.threeLoader) {
                item.app.threeLoader.isPaused = item.isSuspended;
              }
            }
          });
        }, { threshold: 0.15 });
      }

      const id = 'inst_' + Math.random().toString(36).substr(2, 8);
      container._accuCadId = id;
      const item = { id, app, container, name, isSuspended: false };
      CadStudioDemoComponent._instances.set(id, item);

      if (CadStudioDemoComponent._observer) {
        CadStudioDemoComponent._observer.observe(container);
      }

      container.addEventListener('pointerdown', () => {
        CadStudioDemoComponent.setActiveInstance(item);
      });

      CadStudioDemoComponent.setActiveInstance(item);
      return id;
    }

  static setActiveInstance(item) {
      if (CadStudioDemoComponent._instances) {
        CadStudioDemoComponent._instances.forEach(inst => {
          if (inst.container) {
            inst.container.style.boxShadow = 'none';
            inst.container.style.borderColor = '#21262d';
          }
        });
      }

      CadStudioDemoComponent._activeInst = item;
      if (item && item.container) {
        item.container.style.boxShadow = '0 0 16px rgba(0, 242, 254, 0.45)';
        item.container.style.borderColor = '#00f2fe';
        if (item.app?.baseController) {
          window.baseController = item.app.baseController;
        }
      }
    }

  static unregisterInstance(id) {
      if (!CadStudioDemoComponent._instances) return;
      const item = CadStudioDemoComponent._instances.get(id);
      if (item) {
        if (CadStudioDemoComponent._observer && item.container) {
          CadStudioDemoComponent._observer.unobserve(item.container);
        }
        if (CadStudioDemoComponent._activeInst === item) {
          CadStudioDemoComponent._activeInst = null;
        }
        if (item.app && typeof item.app.destroy === 'function') {
          try { item.app.destroy(); } catch(e) {}
        }
        CadStudioDemoComponent._instances.delete(id);
      }
    }
}

globalThis.CadStudioDemoComponent = CadStudioDemoComponent;
if (typeof module !== 'undefined' && module.exports) module.exports = CadStudioDemoComponent;