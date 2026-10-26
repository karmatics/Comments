class CommentsAardvark extends globalThis.Aardvark {
  /**
   * Authentic Aardvark implementation for Comments System.
   * Inherits directly from AardvarkExtension/features/Aardvark.js,
   * retaining authentic KeystrokeHandler popups, AardvarkOverlay, and AardvarkActions.
   */
  constructor(options = {}) {
    super();
    this.options = options || {};
    this.dossierId = options.dossierId || 'Comments';
  }

  _drawOuterCornerConnectors(element, dialogElement) {
    let svg = document.getElementById('comments-corner-rays-svg');
    if (!svg) {
      svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.id = 'comments-corner-rays-svg';
      svg.className = 'comments-corner-rays-canvas';
      svg.setAttribute('style', 'position:fixed;top:0;left:0;width:100vw;height:100vh;pointer-events:none;overflow:visible;');

      // 4 corner rays: TL->TL, TR->TR, BR->BR, BL->BL
      for (let i = 0; i < 4; i++) {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.id = `comments-corner-ray-${i}`;
        line.setAttribute('stroke', '#00f2fe');
        line.setAttribute('stroke-width', '1.3');
        line.setAttribute('stroke-dasharray', '4,3');
        line.setAttribute('opacity', '0.65');
        svg.appendChild(line);
      }

      document.body.appendChild(svg);
    }

    // Force SVG z-index strictly lower than dialog window so lines pass BEHIND the box
    const getDlgZ = () => {
      const zStr = dialogElement.style.zIndex || window.getComputedStyle(dialogElement).zIndex;
      const parsed = parseInt(zStr, 10);
      return isNaN(parsed) ? 100000 : parsed;
    };

    svg.style.zIndex = String(Math.max(1, getDlgZ() - 1));

    let rafId = null;

    const updateFrame = () => {
      if (!element || !element.isConnected || !dialogElement || !dialogElement.isConnected) {
        if (svg) svg.remove();
        return;
      }

      const targetZ = String(Math.max(1, getDlgZ() - 1));
      if (svg.style.zIndex !== targetZ) {
        svg.style.zIndex = targetZ;
      }

      const eRect = element.getBoundingClientRect();
      const dRect = dialogElement.getBoundingClientRect();

      const eCorners = [
        { x: eRect.left,  y: eRect.top },
        { x: eRect.right, y: eRect.top },
        { x: eRect.right, y: eRect.bottom },
        { x: eRect.left,  y: eRect.bottom }
      ];

      const dCorners = [
        { x: dRect.left,  y: dRect.top },
        { x: dRect.right, y: dRect.top },
        { x: dRect.right, y: dRect.bottom },
        { x: dRect.left,  y: dRect.bottom }
      ];

      for (let i = 0; i < 4; i++) {
        const ray = document.getElementById(`comments-corner-ray-${i}`);
        if (ray) {
          ray.setAttribute('x1', eCorners[i].x);
          ray.setAttribute('y1', eCorners[i].y);
          ray.setAttribute('x2', dCorners[i].x);
          ray.setAttribute('y2', dCorners[i].y);
          ray.style.display = 'block';
        }
      }

      rafId = requestAnimationFrame(updateFrame);
    };

    rafId = requestAnimationFrame(updateFrame);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      const s = document.getElementById('comments-corner-rays-svg');
      if (s) s.remove();
    };
  }
}

globalThis.CommentsAardvark = CommentsAardvark;
globalThis.CadPlanAardvark = CommentsAardvark;
if (typeof module !== 'undefined' && module.exports) module.exports = CommentsAardvark;