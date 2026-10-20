class CommentsStylingLabComponent {
  /**
   * Interactive Lab for Chapter 1: Theming & Micro-Threads.
   * Lets the user switch themes live and toggle between full discussion boards and micro-threads.
   */
  static render(container) {
    container.innerHTML = '';

    const wrap = makeElement('div', {
      style: {
        background: '#090d16',
        border: '1.5px solid #232d3f',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 16px 40px rgba(0,0,0,0.65)',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'var(--dr-font-sans, system-ui, sans-serif)',
        margin: '20px 0'
      }
    });

    const themes = {
      obsidian: {
        name: 'Dark Obsidian',
        bg: '#070a13',
        cardBg: '#0d1117',
        border: '#232d3f',
        text: '#f8fafc',
        accent: '#00f2fe',
        threadLine: 'rgba(0, 242, 254, 0.4)'
      },
      light: {
        name: 'Clean Light',
        bg: '#f8fafc',
        cardBg: '#ffffff',
        border: '#e2e8f0',
        text: '#0f172a',
        accent: '#0284c7',
        threadLine: 'rgba(2, 132, 199, 0.35)'
      },
      cyber: {
        name: 'Cyber Cyan',
        bg: '#050811',
        cardBg: 'rgba(15, 23, 42, 0.85)',
        border: 'rgba(0, 242, 254, 0.45)',
        text: '#e0f2fe',
        accent: '#38bdf8',
        threadLine: 'rgba(56, 189, 248, 0.6)'
      },
      paper: {
        name: 'Minimal Paper',
        bg: '#faf7f2',
        cardBg: '#f3efe7',
        border: '#e6dfd5',
        text: '#1f242e',
        accent: '#b45309',
        threadLine: 'rgba(180, 83, 9, 0.35)'
      }
    };

    let activeThemeKey = 'obsidian';
    let isCompactMicro = false;

    // Header Toolbar
    const topBar = makeElement('div', {
      style: {
        padding: '10px 16px',
        background: 'rgba(15, 23, 42, 0.95)',
        borderBottom: '1px solid #232d3f',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '8px'
      }
    });

    const themeButtons = makeElement('div', { style: { display: 'flex', gap: '6px', alignItems: 'center' } });
    themeButtons.appendChild(makeElement('span', { style: { fontSize: '10.5px', color: '#94a3b8', fontFamily: 'monospace', fontWeight: 'bold' } }, 'Theme:'));

    Object.keys(themes).forEach(k => {
      const btn = makeElement('button', {
        className: `dr-tab-btn ${k === activeThemeKey ? 'active' : ''}`,
        id: `btn-theme-${k}`,
        style: { fontSize: '10px', padding: '3px 8px' },
        onclick: () => setTheme(k)
      }, themes[k].name);
      themeButtons.appendChild(btn);
    });

    const modeButtons = makeElement('div', { style: { display: 'flex', gap: '6px', alignItems: 'center' } }, [
      makeElement('button', {
        className: 'dr-nav-btn',
        id: 'btn-toggle-micro',
        style: { padding: '3px 10px', fontSize: '10.5px', color: '#00f2fe' },
        onclick: () => toggleLayout()
      }, '↔ Toggle Micro-Thread (Compact)')
    ]);

    topBar.appendChild(themeButtons);
    topBar.appendChild(modeButtons);
    wrap.appendChild(topBar);

    // Stage Area
    const stageArea = makeElement('div', {
      id: 'styling-lab-stage',
      style: {
        padding: '24px',
        background: themes[activeThemeKey].bg,
        display: 'flex',
        justifyContent: 'center',
        transition: 'background 0.25s ease'
      }
    });

    const previewContainer = makeElement('div', {
      id: 'styling-lab-preview-box',
      style: {
        width: '100%',
        maxWidth: '680px',
        transition: 'max-width 0.25s ease'
      }
    });
    stageArea.appendChild(previewContainer);
    wrap.appendChild(stageArea);
    container.appendChild(wrap);

    function setTheme(themeKey) {
      activeThemeKey = themeKey;
      document.querySelectorAll('#styling-lab-stage button[id^="btn-theme-"]').forEach(b => b.classList.remove('active'));
      const activeBtn = document.getElementById(`btn-theme-${themeKey}`);
      if (activeBtn) activeBtn.classList.add('active');
      renderPreview();
    }

    function toggleLayout() {
      isCompactMicro = !isCompactMicro;
      previewContainer.style.maxWidth = isCompactMicro ? '360px' : '680px';
      const btn = document.getElementById('btn-toggle-micro');
      if (btn) btn.textContent = isCompactMicro ? '↔ Full Discussion Board' : '↔ Toggle Micro-Thread (Compact)';
      renderPreview();
    }

    function renderPreview() {
      const th = themes[activeThemeKey];
      stageArea.style.background = th.bg;
      previewContainer.innerHTML = '';

      const threadCard = makeElement('div', {
        style: {
          background: th.cardBg,
          border: `1.5px solid ${th.border}`,
          borderRadius: '10px',
          padding: isCompactMicro ? '10px' : '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          color: th.text
        }
      });

      // Thread Header
      const header = makeElement('div', {
        style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }
      }, [
        makeElement('div', { style: { display: 'flex', alignItems: 'center', gap: '6px' } }, [
          makeElement('span', { style: { fontSize: '13px' } }, '💬'),
          makeElement('strong', { style: { fontSize: '11.5px', color: th.accent } }, isCompactMicro ? 'Gutter Comment' : 'Section Feedback'),
          makeElement('span', { style: { fontSize: '9px', opacity: 0.6 } }, '#doc-p-42')
        ]),
        makeElement('span', { style: { fontSize: '10px', color: th.accent, fontWeight: 'bold' } }, '▲ 14')
      ]);
      threadCard.appendChild(header);

      // Comment 1
      const c1 = makeElement('div', {
        style: {
          borderLeft: `2.5px solid ${th.accent}`,
          paddingLeft: '10px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px'
        }
      }, [
        makeElement('div', { style: { display: 'flex', alignItems: 'center', gap: '6px' } }, [
          makeElement('strong', { style: { fontSize: '11px' } }, 'Sarah'),
          makeElement('span', { style: { fontSize: '9.5px', opacity: 0.6 } }, '#1002 • 12m ago')
        ]),
        makeElement('div', { style: { fontSize: isCompactMicro ? '11px' : '12px', lineHeight: '1.45' } },
          'Overriding these CSS tokens lets our comment threads match any publication aesthetic seamlessly.'
        )
      ]);
      threadCard.appendChild(c1);

      // Nested Comment 2 (Reply)
      const c2 = makeElement('div', {
        style: {
          marginLeft: isCompactMicro ? '12px' : '24px',
          borderLeft: `2px dashed ${th.threadLine}`,
          paddingLeft: '10px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px'
        }
      }, [
        makeElement('div', { style: { display: 'flex', alignItems: 'center', gap: '6px' } }, [
          makeElement('strong', { style: { fontSize: '11px' } }, 'Alex'),
          makeElement('span', { style: { fontSize: '9.5px', opacity: 0.6 } }, '#1088 • 5m ago')
        ]),
        makeElement('div', { style: { fontSize: isCompactMicro ? '11px' : '12px', lineHeight: '1.45' } },
          'And the micro-thread layout docks cleanly into page margins without pushing content!'
        )
      ]);
      threadCard.appendChild(c2);

      previewContainer.appendChild(threadCard);
    }

    renderPreview();
  }
}

globalThis.CommentsStylingLabComponent = CommentsStylingLabComponent;
if (typeof module !== 'undefined' && module.exports) module.exports = CommentsStylingLabComponent;