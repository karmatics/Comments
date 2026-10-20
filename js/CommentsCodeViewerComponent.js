class CommentsCodeViewerComponent {
  /**
   * Authentic Code Viewer for Chapter 1: Legacy Comments Audit.
   * Reads 100% authentic, un-altered source code directly from CommentsAuthenticCode.
   * Displays the true implementation of Comments.js, CommentNode.js, CommentThreadView.js,
   * RatingPanel.js, NameRenderer.js, ServerAPI.js, and CommentActions.php.
   */
  static render(container, options = {}) {
    container.innerHTML = '';

    const availableFiles = (typeof CommentsAuthenticCode !== 'undefined' && typeof CommentsAuthenticCode.getFileList === 'function')
      ? CommentsAuthenticCode.getFileList()
      : [
          'Comments.js',
          'CommentNode.js',
          'CommentThreadView.js',
          'CommentToolbar.js',
          'NameRenderer.js',
          'RatingPanel.js',
          'ServerAPI.js',
          'UserManager.js',
          'CommentActions.php',
          'api.php'
        ];

    let activeKey = options.activeKey || 'Comments.js';
    if (!availableFiles.includes(activeKey)) {
      activeKey = availableFiles[0] || 'Comments.js';
    }

    const rawCode = (typeof CommentsAuthenticCode !== 'undefined' && typeof CommentsAuthenticCode.get === 'function')
      ? CommentsAuthenticCode.get(activeKey)
      : '// Authentic code extraction loading...';

    const lineCount = rawCode.split('\n').length;
    const isPhp = activeKey.endsWith('.php');

    const wrap = makeElement('div', {
      style: {
        background: '#070a13',
        border: '1.5px solid #232d3f',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 16px 40px rgba(0,0,0,0.65)',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'var(--dr-font-sans, system-ui, sans-serif)'
      }
    });

    // 1. Tab Selector Bar
    const topBar = makeElement('div', {
      style: {
        padding: '10px 14px',
        background: 'rgba(15, 23, 42, 0.95)',
        borderBottom: '1px solid #232d3f',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '8px'
      }
    });

    const tabsGroup = makeElement('div', {
      style: { display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }
    });

    availableFiles.forEach(fileName => {
      const btn = makeElement('button', {
        className: `dr-tab-btn ${fileName === activeKey ? 'active' : ''}`,
        style: {
          fontSize: '10.5px',
          fontFamily: 'monospace',
          padding: '4px 10px',
          borderRadius: '6px'
        },
        onclick: () => {
          CommentsCodeViewerComponent.render(container, { activeKey: fileName });
        }
      }, fileName);
      tabsGroup.appendChild(btn);
    });

    const copyBtn = makeElement('button', {
      className: 'dr-nav-btn primary',
      style: { padding: '4px 12px', fontSize: '10.5px', fontWeight: 'bold' },
      onclick: (e) => {
        navigator.clipboard.writeText(rawCode).then(() => {
          const btn = e.currentTarget;
          btn.textContent = '✓ Copied!';
          setTimeout(() => { btn.textContent = '📋 Copy Raw File'; }, 1800);
        });
      }
    }, '📋 Copy Raw File');

    topBar.appendChild(tabsGroup);
    topBar.appendChild(copyBtn);
    wrap.appendChild(topBar);

    // 2. File Metadata Bar
    const metaBar = makeElement('div', {
      style: {
        padding: '8px 14px',
        background: '#090d16',
        borderBottom: '1px solid #161e2b',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '11px',
        fontFamily: 'monospace'
      }
    }, [
      makeElement('div', { style: { display: 'flex', alignItems: 'center', gap: '8px' } }, [
        makeElement('strong', { style: { color: '#00f2fe' } }, `📄 js/comments/${activeKey}`),
        makeElement('span', {
          style: {
            background: isPhp ? 'rgba(192, 132, 252, 0.18)' : 'rgba(56, 189, 248, 0.18)',
            color: isPhp ? '#c084fc' : '#38bdf8',
            border: `1px solid ${isPhp ? '#c084fc66' : '#38bdf866'}`,
            padding: '1px 6px',
            borderRadius: '10px',
            fontSize: '9.5px'
          }
        }, isPhp ? 'PHP Endpoint (To Retire)' : 'Authentic Client JS (To Retain)')
      ]),
      makeElement('span', { style: { color: '#64748b' } }, `${lineCount} lines • ${rawCode.length.toLocaleString()} bytes`)
    ]);
    wrap.appendChild(metaBar);

    // 3. Code Editor Mount
    const codeMount = makeElement('div', {
      style: { minHeight: '380px', width: '100%', background: '#070a13' }
    });
    wrap.appendChild(codeMount);
    container.appendChild(wrap);

    if (typeof CodeMirrorWidget !== 'undefined') {
      new CodeMirrorWidget({
        host: codeMount,
        content: rawCode,
        mode: isPhp ? 'javascript' : 'javascript',
        readOnly: true,
        wrap: false
      });
    } else {
      const pre = makeElement('pre', {
        style: {
          margin: '0',
          padding: '14px',
          color: '#7ee787',
          fontFamily: 'monospace',
          fontSize: '11.5px',
          lineHeight: '1.5',
          overflowX: 'auto',
          background: '#070a13',
          maxHeight: '480px'
        }
      }, rawCode);
      codeMount.appendChild(pre);
    }
  }
}

globalThis.CommentsCodeViewerComponent = CommentsCodeViewerComponent;
if (typeof module !== 'undefined' && module.exports) module.exports = CommentsCodeViewerComponent;