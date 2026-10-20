class CommentsAardvark {
  /**
   * Modern Aardvark In-Situ Inspector for Comments System & DocumentReader.
   * Enables seamless spatial inspection:
   * - W (Wider: navigate to parent container)
   * - N (Narrower: navigate down history stack to child)
   * - C / M / A: Attach a note/directive via CommentsItemNotes
   * - Right-Click: Opens a contextual Radial Menu
   */
  constructor(options = {}) {
    this.options = options || {};
    this.isActive = false;
    this.currentElement = null;
    this.widerStack = [];
    this.overlayElement = null;
    this.hudElement = null;
    this.radialMenuElement = null;

    this._onMouseMove = this._handleMouseMove.bind(this);
    this._onKeyDown = this._handleKeyDown.bind(this);
    this._onContextMenu = this._handleContextMenu.bind(this);
  }

  init() {
    this._injectStyles();
    this._createDomElements();
  }

  activate() {
    if (this.isActive) return;
    this.isActive = true;
    this.widerStack = [];
    this.isElementLocked = false;
    this.lockedElement = null;

    if (typeof KeyCommandHandler !== 'undefined' && typeof KeyCommandHandler.setPaused === 'function') {
      KeyCommandHandler.setPaused(true);
      this._restoredKeyCommand = true;
    }

    this._onClick = this._handleClick.bind(this);
    document.addEventListener('mousemove', this._onMouseMove, true);
    document.addEventListener('keydown', this._onKeyDown, true);
    document.addEventListener('contextmenu', this._onContextMenu, true);
    document.addEventListener('click', this._onClick, true);

    this._showHudMessage("🔍 Aardvark Active: Click or press 'C' to attach comment/note | 'W' wider | 'N' narrower | 'Esc' to exit");
  }

  deactivate() {
    if (!this.isActive) return;
    this.isActive = false;
    this.isElementLocked = false;
    this.lockedElement = null;

    if (this._restoredKeyCommand && typeof KeyCommandHandler !== 'undefined' && typeof KeyCommandHandler.setPaused === 'function') {
      KeyCommandHandler.setPaused(false);
      this._restoredKeyCommand = false;
    }

    document.removeEventListener('mousemove', this._onMouseMove, true);
    document.removeEventListener('keydown', this._onKeyDown, true);
    document.removeEventListener('contextmenu', this._onContextMenu, true);
    if (this._onClick) document.removeEventListener('click', this._onClick, true);

    this._hideOverlay();
    this._hideHud();
    this._closeRadialMenu();
  }

  toggle() {
    if (this.isActive) this.deactivate();
    else this.activate();
  }

  _injectStyles() {
    const css = `
      .comments-aardvark-overlay {
        position: fixed;
        pointer-events: none;
        z-index: 999980;
        border: 2px solid #00f2fe;
        background: rgba(0, 242, 254, 0.08);
        box-shadow: 0 0 14px rgba(0, 242, 254, 0.35);
        border-radius: 4px;
        transition: top 0.04s ease-out, left 0.04s ease-out, width 0.04s ease-out, height 0.04s ease-out;
        display: none;
        box-sizing: border-box;
      }
      .comments-aardvark-tag {
        position: absolute;
        top: -18px;
        left: -2px;
        background: #00f2fe;
        color: #070a13;
        font-family: monospace;
        font-size: 10.5px;
        font-weight: 800;
        padding: 1px 6px;
        border-radius: 3px 3px 0 0;
        white-space: nowrap;
        pointer-events: none;
      }
      .comments-aardvark-hud {
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 999995;
        background: rgba(15, 23, 42, 0.95);
        border: 1px solid #334155;
        color: #f8fafc;
        border-radius: 20px;
        padding: 6px 18px;
        font-family: monospace;
        font-size: 11px;
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.7);
        pointer-events: none;
        display: none;
        white-space: nowrap;
      }
      .comments-aardvark-radial {
        position: fixed;
        z-index: 999990;
        background: rgba(15, 23, 42, 0.98);
        backdrop-filter: blur(16px);
        border: 1.5px solid rgba(0, 242, 254, 0.4);
        border-radius: 12px;
        padding: 8px;
        display: none;
        flex-direction: column;
        gap: 4px;
        box-shadow: 0 16px 40px rgba(0,0,0,0.85);
        min-width: 200px;
      }
      .comments-aardvark-radial button {
        background: transparent;
        border: none;
        color: #f8fafc;
        padding: 6px 10px;
        border-radius: 6px;
        cursor: pointer;
        font-family: var(--dr-font-sans, system-ui, sans-serif);
        font-size: 11px;
        font-weight: 600;
        display: flex;
        justify-content: space-between;
        align-items: center;
        transition: background 0.12s ease;
      }
      .comments-aardvark-radial button:hover {
        background: rgba(0, 242, 254, 0.15);
        color: #00f2fe;
      }
    `;
    if (typeof applyCss === 'function') {
      applyCss(css, 'CommentsAardvarkStyles');
    }
  }

  _createDomElements() {
    if (!this.overlayElement) {
      this.overlayElement = document.createElement('div');
      this.overlayElement.className = 'comments-aardvark-overlay';
      this.overlayElement.setAttribute('data-style-exclude', '');

      this.tagElement = document.createElement('div');
      this.tagElement.className = 'comments-aardvark-tag';
      this.overlayElement.appendChild(this.tagElement);

      document.body.appendChild(this.overlayElement);
    }
    if (!this.hudElement) {
      this.hudElement = document.createElement('div');
      this.hudElement.className = 'comments-aardvark-hud';
      this.hudElement.setAttribute('data-style-exclude', '');
      document.body.appendChild(this.hudElement);
    }
    if (!this.radialMenuElement) {
      this.radialMenuElement = document.createElement('div');
      this.radialMenuElement.className = 'comments-aardvark-radial';
      this.radialMenuElement.setAttribute('data-style-exclude', '');
      document.body.appendChild(this.radialMenuElement);
    }
  }

  _handleMouseMove(e) {
    if (!this.isActive) return;
    if (this.isElementLocked || this.lockedElement) return;

    if (this.radialMenuElement && this.radialMenuElement.style.display === 'flex') return;

    const target = e.target;
    if (!target || target.hasAttribute('data-style-exclude') || target.closest('[data-style-exclude], .uw-dialog, .comments-aardvark-radial')) {
      return;
    }
    this.currentElement = target;
    this.widerStack = [];
    this._highlightElement(target);
  }

  _highlightElement(el) {
    if (!el || !this.overlayElement) return;
    const rect = el.getBoundingClientRect();
    this.overlayElement.style.display = 'block';
    this.overlayElement.style.top = `${rect.top}px`;
    this.overlayElement.style.left = `${rect.left}px`;
    this.overlayElement.style.width = `${rect.width}px`;
    this.overlayElement.style.height = `${rect.height}px`;

    const blockId = el.getAttribute('data-block') || el.getAttribute('data-block-id') || (el.id && !el.id.startsWith('uw') ? el.id : '');
    const tagName = el.tagName.toLowerCase();
    const tagDisplay = blockId ? `${tagName}#${blockId}` : tagName;

    if (this.tagElement) {
      this.tagElement.textContent = `<${tagDisplay}>`;
    }

    this._showHudMessage(`<${tagDisplay}> — Click or press 'C' to attach comment | 'W' wider | 'N' narrower | 'Esc' to exit`);
  }

  _selectParent() {
    if (this.currentElement && this.currentElement.parentElement && this.currentElement.tagName !== 'BODY') {
      this.widerStack.push(this.currentElement);
      this.currentElement = this.currentElement.parentElement;
      this._highlightElement(this.currentElement);
    }
  }

  _selectChild() {
    if (this.widerStack.length > 0) {
      this.currentElement = this.widerStack.pop();
      this._highlightElement(this.currentElement);
    }
  }

  _handleKeyDown(e) {
    if (!this.isActive) return;
    const key = e.key.toLowerCase();

    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      this.deactivate();
      return;
    }

    if (key === 'c' || key === 'm' || key === 'a') {
      e.preventDefault();
      e.stopPropagation();
      this._openNoteOnSelected();
      return;
    }

    if (key === 'w') {
      e.preventDefault();
      e.stopPropagation();
      this._selectParent();
      return;
    }

    if (key === 'n') {
      e.preventDefault();
      e.stopPropagation();
      this._selectChild();
      return;
    }
  }

  _handleContextMenu(e) {
    if (!this.isActive || !this.currentElement) return;
    e.preventDefault();
    e.stopPropagation();
    this._openRadialMenu(e.clientX, e.clientY);
  }

  _openRadialMenu(x, y) {
    if (!this.radialMenuElement || !this.currentElement) return;
    const el = this.currentElement;

    const loc = (typeof CommentsItemNotes !== 'undefined' && typeof CommentsItemNotes.generateElementLocator === 'function')
      ? CommentsItemNotes.generateElementLocator(el)
      : { key: el.id || el.tagName.toLowerCase(), isOfficial: false, xpath: '' };

    this.radialMenuElement.innerHTML = '';

    const header = document.createElement('div');
    header.style.cssText = 'color:#00f2fe; font-weight:800; border-bottom:1px solid #232d3f; padding-bottom:5px; margin-bottom:4px; font-size:10.5px;';
    header.innerHTML = `<span>Target: <strong>${loc.key}</strong></span>`;
    this.radialMenuElement.appendChild(header);

    const makeBtn = (label, icon, shortcut, onClick) => {
      const b = document.createElement('button');
      b.innerHTML = `<span>${icon} ${label}</span> <span style="color:#64748b; font-size:9.5px;">[${shortcut}]</span>`;
      b.onclick = (e) => {
        e.stopPropagation();
        this._closeRadialMenu();
        onClick();
      };
      return b;
    };

    this.radialMenuElement.appendChild(makeBtn('Attach Comment', '💬', 'C', () => this._openNoteOnSelected()));
    this.radialMenuElement.appendChild(makeBtn('Wider (Parent Node)', '⬆️', 'W', () => this._selectParent()));
    if (this.widerStack.length > 0) {
      this.radialMenuElement.appendChild(makeBtn('Narrower (Child Node)', '⬇️', 'N', () => this._selectChild()));
    }

    this.radialMenuElement.style.left = `${Math.min(x, window.innerWidth - 220)}px`;
    this.radialMenuElement.style.top = `${Math.min(y, window.innerHeight - 180)}px`;
    this.radialMenuElement.style.display = 'flex';
  }

  _closeRadialMenu() {
    if (this.radialMenuElement) {
      this.radialMenuElement.style.display = 'none';
    }
  }

  _openNoteOnSelected() {
    if (!this.currentElement) return;
    const el = this.currentElement;

    this.isElementLocked = true;
    this.lockedElement = el;
    this._highlightElement(el);
    this._closeRadialMenu();

    const loc = (typeof CommentsItemNotes !== 'undefined' && typeof CommentsItemNotes.generateElementLocator === 'function')
      ? CommentsItemNotes.generateElementLocator(el)
      : { key: el.id || 'target_block', isOfficial: false, xpath: '' };

    const ctx = (typeof CommentsDataRegistry !== 'undefined')
      ? CommentsDataRegistry.getElementContext(el)
      : { blockId: loc.key, pageId: 'overview' };

    if (typeof CommentsItemNotes !== 'undefined' && typeof CommentsItemNotes.openBlockNotesDialog === 'function') {
      const dlg = CommentsItemNotes.openBlockNotesDialog(
        ctx.pageId,
        loc.key,
        globalThis.CommentsDocs || { name: 'CommentsDocs' },
        () => {},
        null,
        { targetElement: el, locator: loc }
      );

      if (dlg && dlg.options) {
        const origClose = dlg.options.onClose;
        dlg.options.onClose = () => {
          this.isElementLocked = false;
          this.lockedElement = null;
          if (this.isActive) this._highlightElement(el);
          if (typeof origClose === 'function') origClose();
        };
      }
    }
  }

  _showHudMessage(text) {
    if (this.hudElement) {
      this.hudElement.textContent = text;
      this.hudElement.style.display = 'block';
    }
  }

  _hideHud() {
    if (this.hudElement) this.hudElement.style.display = 'none';
  }

  _hideOverlay() {
    if (this.overlayElement) this.overlayElement.style.display = 'none';
  }

  destroy() {
    this.deactivate();
    if (this.overlayElement) this.overlayElement.remove();
    if (this.hudElement) this.hudElement.remove();
    if (this.radialMenuElement) this.radialMenuElement.remove();
    this.overlayElement = null;
    this.hudElement = null;
    this.radialMenuElement = null;
  }

  _handleClick(e) {
    if (!this.isActive) return;

    if (e.target.closest('[data-style-exclude], .uw-dialog, .comments-aardvark-radial, #dr-header-overflow-menu, .dr-nav-bar')) {
      return;
    }

    if (this.isElementLocked) return;

    e.preventDefault();
    e.stopPropagation();
    this.currentElement = e.target;
    this._openNoteOnSelected();
  }
}

globalThis.CommentsAardvark = CommentsAardvark;
globalThis.CadPlanAardvark = CommentsAardvark;
if (typeof module !== 'undefined' && module.exports) module.exports = CommentsAardvark;