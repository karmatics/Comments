class CadIsolatedCompass3DComponent {

  static async render(container) {
      container.innerHTML = '';

      const wrap = makeElement('div', {
        style: {
          background: '#070a13',
          border: '1.5px solid #21262d',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 16px 40px rgba(0,0,0,0.65)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative'
        }
      });

      const header = makeElement('div', {
        style: {
          padding: '10px 16px',
          background: 'rgba(15, 23, 42, 0.95)',
          borderBottom: '1px solid #21262d',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '8px',
          zIndex: 10
        }
      }, [
        makeElement('div', { style: { display: 'flex', alignItems: 'center', gap: '8px' } }, [
          makeElement('span', { style: { fontSize: '15px' } }, '🧭'),
          makeElement('strong', { style: { fontSize: '13px', color: '#38bdf8', fontFamily: 'monospace' } }, 'Authentic 3D AccuDraw Compass (Zoomed Viewport)'),
          makeElement('span', { style: { fontSize: '10px', background: '#10b981', color: '#000', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' } }, 'Native accuCad Class')
        ]),
        makeElement('span', { style: { fontSize: '11px', color: '#94a3b8', fontStyle: 'italic' } }, 'Click canvas to activate keyboard focus [T/F/S/V/Space]')
      ]);
      wrap.appendChild(header);

      const canvasMount = makeElement('div', {
        id: 'accucad-mount-compass-gym',
        style: { width: '100%', height: '360px', position: 'relative', background: '#050811' }
      });
      wrap.appendChild(canvasMount);

      const hud = makeElement('div', {
        style: {
          padding: '8px 14px', background: '#0d1117', borderTop: '1px solid #161e2b',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: '8px', fontSize: '11px', fontFamily: 'monospace', zIndex: 10
        }
      }, [
        makeElement('div', { style: { display: 'flex', gap: '6px', alignItems: 'center' } }, [
          makeElement('span', { style: { color: '#94a3b8' } }, 'Plane:'),
          makeElement('button', { className: 'dr-nav-btn primary', onclick: () => setPlane([ [1,0,0], [0,0,-1], [0,1,0] ], 'Top') }, '[T] Top'),
          makeElement('button', { className: 'dr-nav-btn', onclick: () => setPlane([ [1,0,0], [0,1,0], [0,0,1] ], 'Front') }, '[F] Front'),
          makeElement('button', { className: 'dr-nav-btn', onclick: () => setPlane([ [0,0,1], [0,1,0], [-1,0,0] ], 'Side') }, '[S] Side'),
          makeElement('button', { className: 'dr-nav-btn', onclick: () => togglePulse() }, 'Pulse Ticks')
        ]),
        makeElement('label', { style: { display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8' } }, [
          'Squircle: ',
          makeElement('input', {
            type: 'range', min: '0', max: '1', step: '0.05', value: '0.5',
            style: { width: '70px', accentColor: '#38bdf8', cursor: 'pointer' },
            oninput: (e) => {
              if (activeCompass && typeof activeCompass.setSquircleAnimated === 'function') {
                activeCompass.setSquircleAnimated(parseFloat(e.target.value), 0);
              }
            }
          })
        ])
      ]);
      wrap.appendChild(hud);
      container.appendChild(wrap);

      let threeLoader = null;
      let activeCompass = null;
      let instId = null;

      const boot = async () => {
        if (typeof CadStudioDemoComponent !== 'undefined') {
          await CadStudioDemoComponent.ensureAccuCadLoaded();
        }

        threeLoader = new ThreeJSLoader(null, {
          cameraPos: { x: 0, y: 1.2, z: 2.4 },
          enableControls: true,
          useThickLines: true,
          lighting: true,
          environment: false
        });

        await threeLoader.init(canvasMount);
        const THREE = threeLoader.THREE;
        threeLoader.scene.background = new THREE.Color(0x050811);

        const threeDView = {
          scene: threeLoader.scene,
          camera: threeLoader.camera,
          renderer: threeLoader.renderer,
          target: new THREE.Vector3(0, 0, 0)
        };
        threeLoader.camera.lookAt(threeDView.target);

        const AccuDrawClass = globalThis.AccuDraw || (typeof window !== 'undefined' ? window.AccuDraw : null);
        if (AccuDrawClass) {
          activeCompass = new AccuDrawClass(threeDView, {
            squircleAmount: 0.5,
            center: [0, 0, 0],
            size: 0.9,
            outlineThickness: 3,
            color: 0x38bdf8
          });
          threeLoader.scene.add(activeCompass.getObject3D());
        }

        if (typeof CadStudioDemoComponent !== 'undefined') {
          instId = CadStudioDemoComponent.registerInstance(
            { threeLoader, baseController: { handleKeyDown: (e) => handleKey(e) } },
            canvasMount,
            'Compass Gym'
          );
        }
      };

      boot();

      function setPlane(matrix, name) {
        if (activeCompass && typeof activeCompass.setRotationAnimated === 'function') {
          activeCompass.setRotationAnimated(matrix, 0.3);
        }
      }

      let isPulsing = false;
      function togglePulse() {
        isPulsing = !isPulsing;
        if (activeCompass && typeof activeCompass.setAxisAnimation === 'function') {
          activeCompass.setAxisAnimation(isPulsing ? 'x' : null);
        }
      }

      function handleKey(e) {
        const k = e.key.toUpperCase();
        if (k === 'T') setPlane([ [1,0,0], [0,0,-1], [0,1,0] ], 'Top');
        else if (k === 'F') setPlane([ [1,0,0], [0,1,0], [0,0,1] ], 'Front');
        else if (k === 'S') setPlane([ [0,0,1], [0,1,0], [-1,0,0] ], 'Side');
        else if (e.key === ' ') {
          e.preventDefault();
          if (activeCompass && typeof activeCompass.setSquircleAnimated === 'function') {
            const next = activeCompass.squircleAmount >= 0.9 ? 0.15 : (activeCompass.squircleAmount <= 0.25 ? 0.5 : 1.0);
            activeCompass.setSquircleAnimated(next, 0.2);
          }
        }
      }

      const observer = new MutationObserver(() => {
        if (!document.body.contains(wrap)) {
          if (instId && typeof CadStudioDemoComponent !== 'undefined') {
            CadStudioDemoComponent.unregisterInstance(instId);
          }
          if (threeLoader && typeof threeLoader.destroy === 'function') {
            threeLoader.destroy();
          }
          observer.disconnect();
        }
      });
      observer.observe(wrap.parentNode || document.body, { childList: true });
    }
}

globalThis.CadIsolatedCompass3DComponent = CadIsolatedCompass3DComponent;
if (typeof module !== 'undefined' && module.exports) module.exports = CadIsolatedCompass3DComponent;