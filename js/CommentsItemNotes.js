class CommentsItemNotes {
  /**
   * Persistent IndexedDB & LocalStorage Item-Notes Engine for Comments System.
   * Manages the Living Specification lifecycle: attaching thoughts to specific blocks,
   * touring notes sequentially, and compiling them into AI patch prompts.
   */
  static DB_NAME = 'Comments_ItemNotes_DB';
  static DB_VERSION = 1;
  static STORE_NAME = 'item_notes';
  static LOCAL_STORAGE_KEY = 'comments_item_notes_v1';
  static _subscribers = new Set();
  static _dbPromise = null;

  static async getDB() {
    if (this._dbPromise) return this._dbPromise;
    this._dbPromise = new Promise((resolve) => {
      if (typeof indexedDB === 'undefined') {
        resolve(null);
        return;
      }
      const req = indexedDB.open(this.DB_NAME, this.DB_VERSION);
      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          const store = db.createObjectStore(this.STORE_NAME, { keyPath: 'id' });
          store.createIndex('blockKey', 'blockKey', { unique: false });
          store.createIndex('pageId', 'pageId', { unique: false });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => {
        console.warn('[CommentsItemNotes] IndexedDB open error, falling back to localStorage');
        resolve(null);
      };
    });
    return this._dbPromise;
  }

  static getLocalMap() {
      try {
        // Unified storage read across both keys
        const raw1 = localStorage.getItem('comments_item_notes_v1');
        const raw2 = localStorage.getItem('cadplan_item_notes_v1');
        const map1 = raw1 ? JSON.parse(raw1) : {};
        const map2 = raw2 ? JSON.parse(raw2) : {};
        return Object.assign({}, map2, map1);
      } catch (e) {
        return {};
      }
    }

  static saveLocalMap(map) {
      try {
        const json = JSON.stringify(map || {});
        localStorage.setItem('comments_item_notes_v1', json);
        localStorage.setItem('cadplan_item_notes_v1', json);
      } catch (e) {}
    }

  static async getAllNotes(dossierFilter = null) {
      const db = await this.getDB();
      let list = [];

      const map = this.getLocalMap();
      Object.values(map).forEach(notes => {
        if (Array.isArray(notes)) list.push(...notes);
      });

      if (db) {
        try {
          const idbList = await new Promise((resolve) => {
            const tx = db.transaction(this.STORE_NAME, 'readonly');
            const store = tx.objectStore(this.STORE_NAME);
            const req = store.getAll();
            req.onsuccess = () => resolve(req.result || []);
            req.onerror = () => resolve([]);
          });
          if (idbList && idbList.length > 0) {
            const seen = new Set(list.map(n => n.id));
            idbList.forEach(n => {
              if (!seen.has(n.id)) {
                list.push(n);
                seen.add(n.id);
              }
            });
          }
        } catch (e) {}
      }

      return list.sort((a, b) => a.timestamp - b.timestamp);
    }
  static async getNotesForBlock(pageId, blockId, dossierId = null) {
      const all = await this.getAllNotes();
      return all.filter(n => {
        if (n.status === 'resolved') return false;
        // Match by composite blockKey or by blockId
        return n.blockKey === `${pageId}:${blockId}` || n.blockId === blockId;
      });
    }
  static async getAnnotatedBlocks() {
    const all = await this.getAllNotes();
    const active = all.filter(n => n.status !== 'resolved');
    const seen = new Map();
    active.forEach(n => {
      if (!seen.has(n.blockKey)) {
        seen.set(n.blockKey, {
          blockKey: n.blockKey,
          pageId: n.pageId,
          blockId: n.blockId,
          notes: []
        });
      }
      seen.get(n.blockKey).notes.push(n);
    });
    return Array.from(seen.values());
  }

  static async addNote(pageId, blockId, text, options = {}) {
      if (!text || !text.trim()) return null;
      const dossierId = options.dossierId || 'CommentsDocs';
      const blockKey = `${pageId}:${blockId}`;
      const id = 'note_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();

      const entry = {
        id,
        blockKey,
        pageId,
        blockId,
        dossierId,
        text: text.trim(),
        timestamp: Date.now(),
        status: options.status || 'active',
        author: options.author || (options.isLLM ? 'LLM' : 'Author / Reviewer'),
        isLLM: Boolean(options.isLLM || options.author === 'LLM'),
        type: options.type || (options.isLLM ? 'proposal' : 'note'),
        proposedPatch: options.proposedPatch || null,
        proposedText: options.proposedText || null,
        blockPreview: options.blockPreview || '',
        xpath: options.xpath || null,
        cssPath: options.cssPath || null,
        tagName: options.tagName || null,
        isUniversalElement: Boolean(options.xpath || options.isUniversalElement)
      };

      const map = this.getLocalMap();
      const storageCompositeKey = `${dossierId}:${blockKey}`;
      map[storageCompositeKey] = map[storageCompositeKey] || [];
      map[storageCompositeKey].push(entry);
      this.saveLocalMap(map);

      const db = await this.getDB();
      if (db) {
        try {
          const tx = db.transaction(this.STORE_NAME, 'readwrite');
          tx.objectStore(this.STORE_NAME).put(entry);
        } catch (err) {}
      }

      // Apply in-flow indicator to target DOM node immediately
      const targetEl = document.querySelector(`[data-block="${blockId}"], [data-block-id="${blockId}"], #${blockId}`);
      if (targetEl) {
        targetEl.classList.add('comments-has-notes');
      }

      this._notify();
      return entry;
    }

  static async updateNote(noteId, updates) {
      const all = await this.getAllNotes();
      const note = all.find(n => n.id === noteId);
      if (!note) return null;

      Object.assign(note, updates, { updatedTimestamp: Date.now() });

      const map = this.getLocalMap();
      let remainingOnBlock = 0;

      Object.keys(map).forEach(compositeKey => {
        if (compositeKey.endsWith(note.blockKey)) {
          const idx = map[compositeKey].findIndex(n => n.id === noteId);
          if (idx !== -1) map[compositeKey][idx] = note;
          remainingOnBlock += map[compositeKey].filter(n => n.status !== 'resolved').length;
        }
      });
      this.saveLocalMap(map);

      const db = await this.getDB();
      if (db) {
        try {
          const tx = db.transaction(this.STORE_NAME, 'readwrite');
          tx.objectStore(this.STORE_NAME).put(note);
        } catch (err) {}
      }

      // Clean in-flow decorations if resolved
      if (remainingOnBlock === 0) {
        const targetEl = document.querySelector(`[data-block="${note.blockId}"], [data-block-id="${note.blockId}"], #${note.blockId}`);
        if (targetEl) {
          targetEl.classList.remove('comments-has-notes');
          const badge = targetEl.querySelector('.comments-note-pill-badge');
          if (badge) badge.remove();
        }
      }

      this._notify();
      return note;
    }
  static async deleteNote(noteId) {
      const all = await this.getAllNotes();
      const note = all.find(n => n.id === noteId);
      if (!note) return false;

      const map = this.getLocalMap();
      let remainingOnBlock = 0;

      Object.keys(map).forEach(compositeKey => {
        if (compositeKey.endsWith(note.blockKey)) {
          map[compositeKey] = map[compositeKey].filter(n => n.id !== noteId);
          remainingOnBlock += map[compositeKey].filter(n => n.status !== 'resolved').length;
          if (map[compositeKey].length === 0) delete map[compositeKey];
        }
      });
      this.saveLocalMap(map);

      const db = await this.getDB();
      if (db) {
        try {
          const tx = db.transaction(this.STORE_NAME, 'readwrite');
          tx.objectStore(this.STORE_NAME).delete(noteId);
        } catch (err) {}
      }

      // If no active notes remain on this element, restore document to original unadorned state
      if (remainingOnBlock === 0) {
        const targetEl = document.querySelector(`[data-block="${note.blockId}"], [data-block-id="${note.blockId}"], #${note.blockId}`);
        if (targetEl) {
          targetEl.classList.remove('comments-has-notes');
          const badge = targetEl.querySelector('.comments-note-pill-badge');
          if (badge) badge.remove();
        }
      }

      this._notify();
      return true;
    }
  static subscribe(fn) {
    this._subscribers.add(fn);
    return () => this._subscribers.delete(fn);
  }

  static _notify() {
    this._subscribers.forEach(fn => {
      try { fn(); } catch (e) {}
    });
  }

  static async buildNotesDirectivePrompt(docReader = null) {
    const dossierId = docReader?.options?.dossierId || docReader?.brandTitle || 'CommentsDocs';
    const all = await this.getAllNotes(dossierId);
    const active = all.filter(n => n.status !== 'resolved');
    if (active.length === 0) {
      return `# NO ACTIVE LIVING SPEC DIRECTIVES\nThere are currently no active author notes or revision directives attached in the living dossier [${dossierId}].`;
    }

    let out = `# 🎯 LIVING SPECIFICATION EVOLUTION: AUTHOR DIRECTIVES & UNIVERSAL ANNOTATIONS\n`;
    out += `**Dossier:** ${dossierId} • **Generated:** ${new Date().toISOString()} • **Role:** System Architect\n`;
    out += `**Active Directives:** ${active.length} notes across ${new Set(active.map(n => n.blockKey)).size} locations\n`;
    out += '**Execution Directive:** Incorporate the following author directives directly into the specified source files and class methods. Keep all existing verified algorithms, serverless contracts, and prominence rankings fully intact.\n\n';
    out += '---\n\n';

    const grouped = {};
    active.forEach(n => {
      grouped[n.blockKey] = grouped[n.blockKey] || [];
      grouped[n.blockKey].push(n);
    });

    const componentClassMap = {
      comp_styling_lab: { cls: 'CommentsStylingLabComponent', file: 'CommentsDocs/js/CommentsStylingLabComponent.js', desc: 'Live Theming & Micro-Thread Viewport' },
      comp_identity_thread_demo: { cls: 'CommentsInteractiveComponent', file: 'CommentsDocs/js/CommentsInteractiveComponent.js', desc: 'Live Thread: Authors & Discriminators' },
      comp_comments_interactive_demo: { cls: 'CommentsInteractiveComponent', file: 'CommentsDocs/js/CommentsInteractiveComponent.js', desc: 'Live Interactive Comment Thread Simulator' },
      comp_insitu_thread_demo: { cls: 'CommentsInteractiveComponent', file: 'CommentsDocs/js/CommentsInteractiveComponent.js', desc: 'Live In-Situ Paragraph Feedback' },
      comp_ai_feedback_demo: { cls: 'CommentsAiDictationSimulatorComponent', file: 'CommentsDocs/js/CommentsAiDictationSimulatorComponent.js', desc: 'Scripted AI Dictation & Feedback Simulator' },
      comp_prompt_generator: { cls: 'CommentsPromptGeneratorComponent', file: 'CommentsDocs/js/CommentsPromptGeneratorComponent.js', desc: 'Drop-In Deployment Kit & Prompt Generator' },
      comp_code_viewer: { cls: 'CommentsCodeViewerComponent', file: 'CommentsDocs/js/CommentsCodeViewerComponent.js', desc: 'Authentic Comments Engine Code Viewer' }
    };

    const pageClassMap = {
      overview: { cls: 'CommentsOverviewContent', file: 'CommentsDocs/js/CommentsOverviewContent.js' },
      styling: { cls: 'CommentsStylingContent', file: 'CommentsDocs/js/CommentsStylingContent.js' },
      identity: { cls: 'CommentsAuthIdentityContent', file: 'CommentsDocs/js/CommentsAuthIdentityContent.js' },
      threading: { cls: 'CommentsThreadingContent', file: 'CommentsDocs/js/CommentsThreadingContent.js' },
      api_contract: { cls: 'CommentsApiContractContent', file: 'CommentsDocs/js/CommentsApiContractContent.js' },
      dom_anchoring: { cls: 'CommentsDomAnchorContent', file: 'CommentsDocs/js/CommentsDomAnchorContent.js' },
      ai_moderation: { cls: 'CommentsAiModerationContent', file: 'CommentsDocs/js/CommentsAiModerationContent.js' },
      federation: { cls: 'CommentsFederationContent', file: 'CommentsDocs/js/CommentsFederationContent.js' },
      deployment_kit: { cls: 'CommentsDeploymentKitContent', file: 'CommentsDocs/js/CommentsDeploymentKitContent.js' }
    };

    let itemNumber = 1;

    for (const [key, notes] of Object.entries(grouped)) {
      const [pageId, blockId] = key.split(':');
      const isComponent = Boolean(componentClassMap[blockId] || blockId.startsWith('comp_'));
      const isUniversal = Boolean(notes[0]?.isUniversalElement || notes[0]?.xpath);

      let targetCls = '';
      let targetFile = '';
      let targetDesc = '';
      let previewText = '';

      if (isComponent && componentClassMap[blockId]) {
        targetCls = componentClassMap[blockId].cls;
        targetFile = componentClassMap[blockId].file;
        targetDesc = componentClassMap[blockId].desc;
      } else {
        const mapping = pageClassMap[pageId] || {
          cls: pageId.charAt(0).toUpperCase() + pageId.slice(1) + 'Content',
          file: `${dossierId}/js/${pageId.charAt(0).toUpperCase() + pageId.slice(1)}Content.js`
        };
        targetCls = mapping.cls;
        targetFile = mapping.file;

        const docCls = globalThis[targetCls];
        if (docCls && typeof docCls[blockId] === 'function') {
          const val = docCls[blockId]();
          previewText = Array.isArray(val) ? val.join('\n\n') : String(val);
        }
      }

      if (!previewText && notes[0]?.blockPreview) {
        previewText = notes[0].blockPreview;
      }

      out += `## ${itemNumber++}. Target: \`${targetCls}${isComponent ? '' : '.' + blockId}\`\n`;
      out += `**Target File:** \`${targetFile}\`\n`;
      if (targetDesc) out += `**Component Role:** *${targetDesc}*\n`;

      if (isUniversal && notes[0]?.xpath) {
        out += `**DOM XPath Locator:** \`${notes[0].xpath}\`\n`;
        if (notes[0].cssPath) out += `**CSS Selector:** \`${notes[0].cssPath}\`\n`;
      }
      out += '\n';

      if (previewText) {
        out += '### Context / Code Excerpt:\n';
        out += '> ' + previewText.replace(/\n+/g, '\n> ') + '\n\n';
      }

      out += '### Author Directives & Living Annotations:\n';
      notes.sort((a, b) => a.timestamp - b.timestamp).forEach((note, idx) => {
        const timeStr = new Date(note.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const cleanTag = note.status === 'pending_cleanup' ? ' `[🧹 MARKED FOR ARCHIVE]`' : '';
        out += `${idx + 1}. **(${timeStr})${cleanTag}:** ${note.text}\n`;
      });
      out += '\n';

      out += '### Expected Implementation Output Container:\n';
      out += '<' + `script data-file="${targetFile}" data-method="${targetCls}.${isComponent ? 'render' : blockId}" data-action="patch">\n`;
      out += `// Updated implementation incorporating author directives...\n`;
      out += '<' + '/script>\n\n';
      out += '---\n\n';
    }

    return out.trim();
  }

  static async openPromptBuilderDialog(docReader = null) {
    const hostContainer = document.body;
    const promptText = await this.buildNotesDirectivePrompt(docReader);
    const dossierId = docReader?.options?.dossierId || docReader?.brandTitle || 'CommentsDocs';
    const allNotes = await this.getAllNotes(dossierId);
    const activeNotes = allNotes.filter(n => n.status !== 'resolved');

    const wrap = makeElement('div', {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        height: '100%',
        color: '#e2e8f0',
        fontFamily: 'var(--dr-font-sans, system-ui, sans-serif)'
      }
    });

    const topBar = makeElement('div', {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '6px 4px',
        borderBottom: '1px solid #232d3f',
        fontSize: '11.5px',
        fontFamily: 'monospace'
      }
    }, [
      makeElement('span', { style: { color: '#00f2fe', fontWeight: 'bold' } }, `⚡ Active Living Directives [${dossierId}]: ${activeNotes.length}`),
      makeElement('span', { style: { color: '#10b981' } }, 'Connected to Luno Outbox')
    ]);
    wrap.appendChild(topBar);

    const desc = makeElement('div', {
      style: {
        fontSize: '11px',
        color: '#94a3b8',
        lineHeight: '1.4',
        background: 'rgba(0, 242, 254, 0.05)',
        padding: '8px 12px',
        borderRadius: '6px',
        border: '1px solid rgba(0, 242, 254, 0.2)'
      }
    }, 'Packages all comments notes, element XPath locators, and code contexts into a compilable payload. Dispatches directly to Luno Outbox or copies to clipboard.');
    wrap.appendChild(desc);

    const codeArea = makeElement('textarea', {
      style: {
        flex: 1,
        minHeight: '320px',
        background: '#090d16',
        color: '#7ee787',
        border: '1.5px solid #232d3f',
        borderRadius: '8px',
        padding: '12px',
        fontFamily: 'var(--dr-font-mono, monospace)',
        fontSize: '12px',
        lineHeight: '1.5',
        resize: 'vertical',
        outline: 'none',
        whiteSpace: 'pre'
      },
      readonly: true,
      spellcheck: false
    });
    codeArea.value = promptText;
    wrap.appendChild(codeArea);

    const footer = makeElement('div', {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: '8px',
        borderTop: '1px solid #232d3f',
        gap: '8px',
        flexWrap: 'wrap'
      }
    });

    const leftButtons = makeElement('div', { style: { display: 'flex', gap: '8px' } }, [
      makeElement('button', {
        className: 'dr-nav-btn',
        style: { color: '#f59e0b', borderColor: '#f59e0b66', fontSize: '11px' },
        onclick: async () => {
          if (confirm(`Archive/mark all ${activeNotes.length} active notes in [${dossierId}] as incorporated?`)) {
            for (const n of activeNotes) {
              await CommentsItemNotes.updateNote(n.id, { status: 'resolved' });
            }
            alert(`✓ Directives for [${dossierId}] archived.`);
            dlg.close();
            if (docReader && typeof docReader._updateBlockNoteBadges === 'function') {
              docReader._updateBlockNoteBadges();
            }
          }
        }
      }, '🧹 Mark Incorporated')
    ]);

    const rightButtons = makeElement('div', { style: { display: 'flex', gap: '8px', flexWrap: 'wrap' } }, [
      makeElement('button', {
        className: 'dr-nav-btn primary',
        style: { fontWeight: 'bold' },
        onclick: (e) => {
          const btn = e.currentTarget;
          navigator.clipboard.writeText(promptText).then(() => {
            btn.textContent = '✓ Copied!';
            setTimeout(() => { btn.textContent = '📋 Copy Evolution Prompt'; }, 1800);
          });
        }
      }, '📋 Copy Prompt')
    ]);

    footer.appendChild(leftButtons);
    footer.appendChild(rightButtons);
    wrap.appendChild(footer);

    const dlg = UITools.makeDialog({
      title: `⚡ Living Specification Evolution Deck [${dossierId}]`,
      size: [660, 580],
      position: [Math.max(20, (window.innerWidth - 660) / 2), 50],
      contentElement: wrap,
      appendTo: hostContainer
    });

    return dlg;
  }

  static async openBlockNotesDialog(pageId, blockId, currentDoc, onUpdated, hostReader = null, extraOptions = {}) {
    CommentsItemNotes.playHapticSound('click');
    const dossierId = hostReader?.options?.dossierId || currentDoc?.name || 'Comments';
    const existingNotes = await this.getNotesForBlock(pageId, blockId, dossierId);

    let targetEl = extraOptions?.targetElement ||
                   document.querySelector(`[data-block-id="${blockId}"]`) ||
                   document.querySelector(`[data-block="${blockId}"]`) ||
                   document.getElementById(`block-${blockId}`) ||
                   document.getElementById(blockId);

    if (!targetEl && existingNotes.length > 0 && existingNotes[0].xpath) {
      try {
        const res = document.evaluate(existingNotes[0].xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
        if (res.singleNodeValue) targetEl = res.singleNodeValue;
      } catch (e) {}
    }

    const locator = extraOptions?.locator || (targetEl ? CommentsItemNotes.generateElementLocator(targetEl) : { key: blockId, isOfficial: true, xpath: '' });

    const wrap = makeElement('div', {
      style: {
        display: 'flex', flexDirection: 'column', height: '100%', gap: '8px',
        color: '#f8fafc', fontFamily: 'var(--dr-font-sans, system-ui, sans-serif)', fontSize: '12px'
      }
    });

    let activeTab = extraOptions?.defaultTab || 'note';

    const tabNoteBtn = makeElement('button', {
      className: `dr-tab-btn ${activeTab === 'note' ? 'active' : ''}`,
      style: { fontSize: '10.5px', padding: '3px 10px', borderRadius: '12px' },
      onclick: () => switchTab('note')
    }, `📝 Spec Note (${existingNotes.length})`);

    const tabThreadBtn = makeElement('button', {
      className: `dr-tab-btn ${activeTab === 'thread' ? 'active' : ''}`,
      style: { fontSize: '10.5px', padding: '3px 10px', borderRadius: '12px' },
      onclick: () => switchTab('thread')
    }, '💬 Discussion Thread');

    const header = makeElement('div', {
      style: {
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        borderBottom: '1px solid #1e293b', paddingBottom: '6px', flexWrap: 'wrap', gap: '6px'
      }
    }, [
      makeElement('div', { style: { display: 'flex', gap: '6px', alignItems: 'center' } }, tabNoteBtn, tabThreadBtn),
      makeElement('span', { style: { color: '#00f2fe', fontFamily: 'monospace', fontSize: '11px', fontWeight: 'bold' } },
        `<${locator.isOfficial ? blockId : locator.key}>`
      )
    ]);
    wrap.appendChild(header);

    // --- PANEL 1: SPEC DIRECTIVES & VOICE DICTATION ---
    const notePanel = makeElement('div', {
      style: { display: activeTab === 'note' ? 'flex' : 'none', flexDirection: 'column', gap: '8px', flex: 1, overflow: 'hidden' }
    });

    const notesList = makeElement('div', {
      style: { flex: 1, minHeight: '80px', maxHeight: '130px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '5px' }
    });
    notePanel.appendChild(notesList);

    const renderNotes = async () => {
      notesList.innerHTML = '';
      const notes = await CommentsItemNotes.getNotesForBlock(pageId, blockId, dossierId);
      tabNoteBtn.textContent = `📝 Spec Note (${notes.length})`;

      if (notes.length === 0) {
        notesList.appendChild(makeElement('div', {
          style: { padding: '12px 6px', textAlign: 'center', color: '#64748b', fontStyle: 'italic', fontSize: '11px' }
        }, 'No directives on this block yet. Dictate with voice or type below.'));
        return;
      }

      notes.forEach(n => {
        const timeStr = new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const isLLM = Boolean(n.isLLM || n.author === 'LLM');

        notesList.appendChild(makeElement('div', {
          style: {
            background: isLLM ? 'rgba(192, 132, 252, 0.08)' : 'rgba(0, 242, 254, 0.04)',
            borderLeft: `3px solid ${isLLM ? '#c084fc' : '#00f2fe'}`,
            borderRadius: '4px',
            padding: '6px 8px',
            display: 'flex',
            flexDirection: 'column',
            gap: '2px'
          }
        }, [
          makeElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } }, [
            makeElement('span', { style: { color: isLLM ? '#c084fc' : '#00f2fe', fontSize: '9.5px', fontWeight: 'bold' } },
              isLLM ? '🤖 AI Staged' : `👤 ${n.author}`
            ),
            makeElement('div', { style: { display: 'flex', gap: '6px', alignItems: 'center' } }, [
              makeElement('span', { style: { color: '#64748b', fontSize: '9px' } }, timeStr),
              makeElement('button', {
                style: { background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '10px', padding: '0 2px' },
                title: 'Delete note',
                onclick: async () => {
                  CommentsItemNotes.playHapticSound('delete');
                  await CommentsItemNotes.deleteNote(n.id);
                  await renderNotes();
                  if (onUpdated) onUpdated();
                }
              }, '✕')
            ])
          ]),
          makeElement('div', { style: { fontSize: '11px', color: '#f8fafc', lineHeight: '1.45', whiteSpace: 'pre-wrap' } }, n.text)
        ]));
      });
    };

    await renderNotes();

    // Intent Tags & Voice Dictation Toggle Bar
    const tagRow = makeElement('div', {
      style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '4px' }
    });

    const chipBox = makeElement('div', { style: { display: 'flex', gap: '3px' } });
    ['Fix', 'Idea', 'Prompt', 'Video'].forEach(t => {
      chipBox.appendChild(makeElement('button', {
        className: 'cp-tag-chip',
        style: { padding: '1px 6px', fontSize: '9px' },
        onclick: () => {
          if (dictationWidget) {
            dictationWidget.setText(`[${t}] ` + dictationWidget.getText());
            dictationWidget.focus();
          }
        }
      }, t));
    });
    tagRow.appendChild(chipBox);

    // Dictation Widget Mount
    const dictationMount = makeElement('div', {
      style: { flex: 1, minHeight: '120px', display: 'flex', flexDirection: 'column' }
    });

    let dictationWidget = null;
    if (typeof DictationWidget !== 'undefined') {
      dictationWidget = new DictationWidget({
        placeholder: '🎙️ Speak to dictate directives, or type here freely...',
        compact: true
      });
      dictationMount.appendChild(dictationWidget.getElement());
    } else {
      const fallbackTa = makeElement('textarea', {
        placeholder: 'Type directive for this block...',
        style: {
          width: '100%', flex: 1, minHeight: '110px', background: '#070a13', color: '#f8fafc',
          border: '1px solid #1e293b', borderRadius: '6px', padding: '8px', fontSize: '12px'
        }
      });
      dictationMount.appendChild(fallbackTa);
      dictationWidget = {
        getText: () => fallbackTa.value,
        setText: (v) => { fallbackTa.value = v; },
        focus: () => fallbackTa.focus(),
        destroy: () => {}
      };
    }

    notePanel.appendChild(tagRow);
    notePanel.appendChild(dictationMount);

    // Footer Save Action
    const noteFooter = makeElement('div', {
      style: { display: 'flex', justifyContent: 'flex-end', gap: '6px', paddingTop: '4px' }
    }, [
      makeElement('button', {
        className: 'dr-nav-btn primary',
        style: { padding: '5px 16px', fontSize: '11px', fontWeight: 'bold' },
        onclick: async () => {
          const txt = dictationWidget.getText().trim();
          if (!txt) return;

          await CommentsItemNotes.addNote(pageId, blockId, txt, {
            dossierId,
            author: 'Author',
            xpath: locator.xpath,
            isUniversalElement: !locator.isOfficial
          });

          CommentsItemNotes.playHapticSound('snap');
          dictationWidget.setText('');
          await renderNotes();
          if (onUpdated) onUpdated();
        }
      }, '💾 Commit Directive')
    ]);
    notePanel.appendChild(noteFooter);
    wrap.appendChild(notePanel);

    // --- PANEL 2: CONVERSATION DISCUSSION THREAD ---
    const threadPanel = makeElement('div', {
      style: { display: activeTab === 'thread' ? 'flex' : 'none', flexDirection: 'column', gap: '6px', flex: 1, minHeight: '300px' }
    });
    wrap.appendChild(threadPanel);

    let isThreadLoaded = false;
    function loadThread() {
      if (isThreadLoaded) return;
      isThreadLoaded = true;
      threadPanel.innerHTML = '';

      const threadAnchorId = `thread_${dossierId}_${pageId}_${blockId}`.replace(/[^a-zA-Z0-9_-]/g, '_');
      if (typeof Comments !== 'undefined') {
        const app = new Comments();
        app.init(threadPanel, {
          threadId: threadAnchorId,
          showTitle: false,
          elementAnchor: `${dossierId}:${pageId}:${blockId}`
        });
      }
    }

    if (activeTab === 'thread') {
      loadThread();
    }

    function switchTab(t) {
      activeTab = t;
      tabNoteBtn.classList.toggle('active', t === 'note');
      tabThreadBtn.classList.toggle('active', t === 'thread');
      notePanel.style.display = t === 'note' ? 'flex' : 'none';
      threadPanel.style.display = t === 'thread' ? 'flex' : 'none';
      if (t === 'thread') loadThread();
    }

    let posX = Math.max(16, (window.innerWidth - 500) / 2);
    let posY = 75;
    if (targetEl) {
      const r = targetEl.getBoundingClientRect();
      if (r.right + 510 < window.innerWidth) {
        posX = r.right + 14;
        posY = Math.max(60, r.top);
      } else if (r.left > 510) {
        posX = r.left - 506;
        posY = Math.max(60, r.top);
      }
    }

    let clearRays = null;

    const dlg = UITools.makeDialog({
      title: `In-Situ: <${locator.isOfficial ? blockId : locator.key}>`,
      size: [500, 420],
      position: [posX, posY],
      contentElement: wrap,
      appendTo: document.body,
      onClose: () => {
        if (clearRays) clearRays();
        if (dictationWidget && typeof dictationWidget.destroy === 'function') {
          dictationWidget.destroy();
        }
        if (targetEl) targetEl.classList.remove('comments-active-note-target');
      }
    });

    if (dlg && dlg.element && targetEl) {
      const aardvarkInst = globalThis.commentsApp?.aardvark || globalThis._cadPlanInstance?.aardvark;
      if (aardvarkInst && typeof aardvarkInst._drawOuterCornerConnectors === 'function') {
        clearRays = aardvarkInst._drawOuterCornerConnectors(targetEl, dlg.element);
      }
    }

    setTimeout(() => dictationWidget.focus(), 60);
    return dlg;
  }
  static playHapticSound(type = 'click') {
    try {
      if (typeof window === 'undefined') return;
      if (localStorage.getItem('cp_sound_enabled') === 'false') return;

      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;

      if (!this._audioCtx) {
        this._audioCtx = new AudioCtx();
      }
      if (this._audioCtx.state === 'suspended') {
        this._audioCtx.resume();
      }

      const ctx = this._audioCtx;
      const now = ctx.currentTime;

      if (type === 'snap' || type === 'click') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(110, now + 0.04);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.045);
      }
    } catch (e) {}
  }

  static generateElementLocator(element) {
    if (!element || !(element instanceof Element)) {
      return { key: 'unknown', xpath: '', cssPath: '', textSnippet: '', isOfficial: false };
    }

    const explicitId = element.getAttribute('data-block') ||
                       element.getAttribute('data-block-id') ||
                       element.getAttribute('data-id') ||
                       (element.id && !element.id.startsWith('uw') && !element.id.startsWith('comp-') ? element.id : null);

    const getXPath = (el) => {
      if (!el || el.nodeType !== Node.ELEMENT_NODE) return '';
      if (el === document.body) return '/html/body';
      let index = 1;
      let sibling = el.previousElementSibling;
      while (sibling) {
        if (sibling.tagName === el.tagName) index++;
        sibling = sibling.previousElementSibling;
      }
      return `${getXPath(el.parentElement)}/${el.tagName.toLowerCase()}[${index}]`;
    };

    const xpath = getXPath(element);
    let hash = 0;
    for (let i = 0; i < xpath.length; i++) {
      hash = ((hash << 5) - hash) + xpath.charCodeAt(i);
      hash |= 0;
    }
    const cleanHash = Math.abs(hash).toString(36);

    const key = explicitId ? explicitId : `elem_${element.tagName.toLowerCase()}_${cleanHash}`;

    return {
      key,
      isOfficial: Boolean(explicitId),
      xpath,
      tagName: element.tagName.toLowerCase()
    };
  }

  static dispatchToOutbox(title, payloadText, options = {}) {
    const text = payloadText || '';
    const bundleTitle = title || 'Comments Living Directives';

    if (typeof globalThis.OutboxQueue !== 'undefined' && typeof globalThis.OutboxQueue.addBundle === 'function') {
      globalThis.OutboxQueue.addBundle(bundleTitle, text, { priority: 'high', ...options });
      return { success: true, channel: 'in-memory-outbox' };
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text);
      return { success: true, channel: 'clipboard-fallback' };
    }

    return { success: false, channel: 'none' };
  }
}

globalThis.CommentsItemNotes = CommentsItemNotes;
globalThis.CadPlanItemNotes = CommentsItemNotes;
if (typeof module !== 'undefined' && module.exports) module.exports = CommentsItemNotes;