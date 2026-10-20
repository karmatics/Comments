class TentativeSnappingLab {

  static async render(container) {
      container.innerHTML = '';
      const wrap = makeElement('div', {
        style: {
          width: '100%',
          minHeight: '620px',
          background: '#0d1117',
          borderRadius: '12px',
          border: '1.5px solid #21262d',
          overflow: 'hidden',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column'
        }
      });

      const topBar = makeElement('div', {
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
          makeElement('strong', { style: { color: '#00f2fe' } }, '🎯 accuCad [Instance 1: Snapping & Kinematics] • Native Embedded (No Iframes)'),
          makeElement('span', { style: { color: '#10b981' } }, '● Active Focus')
        ]),
        makeElement('span', { style: { color: '#64748b' } }, 'Click canvas to focus keyboard shortcuts [T/F/S/L/Space/O/G]')
      ]);
      wrap.appendChild(topBar);

      const appMount = makeElement('div', {
        id: 'accucad-mount-instance-1',
        style: {
          flex: 1,
          width: '100%',
          minHeight: '580px',
          position: 'relative',
          border: '1.5px solid #21262d',
          transition: 'border-color 0.2s, box-shadow 0.2s'
        }
      });
      wrap.appendChild(appMount);
      container.appendChild(wrap);

      let activeApp = null;
      let instId = null;

      const boot = async () => {
        const isLoaded = await (typeof CadStudioDemoComponent !== 'undefined' ? CadStudioDemoComponent.ensureAccuCadLoaded() : false);
        if (isLoaded && globalThis.Main) {
          try {
            activeApp = new globalThis.Main();
            await activeApp.run({ container: appMount });

            // Preload sample wireframe geometry for immediate snapping demonstration
            if (activeApp.baseController && (!activeApp.baseController.cadElements || activeApp.baseController.cadElements.length === 0)) {
              try {
                if (typeof globalThis.RectangleElement !== 'undefined') {
                  const rectEl = new globalThis.RectangleElement({
                    origin: [0, 0, 0],
                    width: 2.0,
                    height: 1.5,
                    rotationMatrix: [[1,0,0],[0,0,-1],[0,1,0]]
                  });
                  if (typeof rectEl.addToScene === 'function' && activeApp.baseController.scene) {
                    rectEl.addToScene(activeApp.baseController.scene);
                    activeApp.baseController.cadElements.push(rectEl);
                  }
                }
              } catch (geomErr) {}
            }

            if (typeof CadStudioDemoComponent !== 'undefined') {
              instId = CadStudioDemoComponent.registerInstance(activeApp, appMount, 'Instance 1: Snapping Lab');
            }
            return;
          } catch (e) {
            console.warn('[TentativeSnappingLab] Native run notice:', e);
          }
        }
      };

      boot();

      const observer = new MutationObserver(() => {
        if (!document.body.contains(wrap)) {
          if (instId && typeof CadStudioDemoComponent !== 'undefined') {
            CadStudioDemoComponent.unregisterInstance(instId);
          }
          observer.disconnect();
        }
      });
      observer.observe(wrap.parentNode || document.body, { childList: true });
    }
}

globalThis.TentativeSnappingLab = TentativeSnappingLab;
if (typeof module !== 'undefined' && module.exports) module.exports = TentativeSnappingLab;