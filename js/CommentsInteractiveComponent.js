class CommentsInteractiveComponent {

  static render(container, options = {}) {
      container.innerHTML = '';
      const threadId = options.threadId || 'main';

      const card = makeElement('div', {
        className: 'comments-thread-card-wrapper',
        style: {
          background: '#0d1117',
          border: '1.5px solid #232d3f',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 12px 36px rgba(0,0,0,0.6)',
          display: 'flex',
          flexDirection: 'column',
          margin: '16px 0'
        }
      });

      const header = makeElement('div', {
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
      }, [
        makeElement('div', { style: { display: 'flex', alignItems: 'center', gap: '8px' } }, [
          makeElement('span', { style: { fontSize: '15px' } }, '💬'),
          makeElement('strong', { style: { fontSize: '12px', color: '#00f2fe', fontFamily: 'monospace' } }, options.title || 'Live Interactive Discussion Thread'),
          makeElement('span', { style: { fontSize: '10px', color: '#64748b', fontFamily: 'monospace' } }, `[thread: ${threadId}]`)
        ]),
        makeElement('div', { style: { display: 'flex', gap: '6px', alignItems: 'center' } }, [
          makeElement('button', {
            className: 'dr-nav-btn',
            style: { padding: '3px 8px', fontSize: '10px', color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.4)' },
            title: 'Switch user identity in CommunityOracle',
            onclick: () => {
              if (window.commentsApp && typeof window.commentsApp.showAuthDialog === 'function') {
                window.commentsApp.showAuthDialog();
              }
            }
          }, '👤 Switch Identity'),
          makeElement('button', {
            className: 'dr-nav-btn',
            style: { padding: '3px 8px', fontSize: '10px' },
            onclick: () => bootThread()
          }, '↻ Reset')
        ])
      ]);
      card.appendChild(header);

      // Callout hint explaining user actions:
      const hintBar = makeElement('div', {
        style: {
          padding: '6px 14px',
          background: '#090d16',
          borderBottom: '1px solid #161e2b',
          fontSize: '11px',
          color: '#94a3b8',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '6px'
        }
      }, [
        makeElement('span', {}, '💡 Click "Reply" to branch • Click "Rate / Prominence" to adjust reputation weight • Tap triangle to fold'),
        makeElement('span', { style: { color: '#00f2fe', fontFamily: 'monospace' } }, 'PageRank Prominence Engine Active')
      ]);
      card.appendChild(hintBar);

      const threadContainer = makeElement('div', {
        id: `thread-mount-${threadId}-${Math.random().toString(36).substr(2, 5)}`,
        style: {
          padding: '16px',
          minHeight: '320px',
          background: '#070a13',
          overflowY: 'visible',
          position: 'relative'
        }
      });
      card.appendChild(threadContainer);
      container.appendChild(card);

      function bootThread() {
        threadContainer.innerHTML = '';
        if (typeof Comments !== 'undefined') {
          const app = new Comments();
          app.init(threadContainer, { threadId: threadId, showTitle: false });
        } else {
          setTimeout(bootThread, 60);
        }
      }

      setTimeout(bootThread, 30);
    }
}

globalThis.CommentsInteractiveComponent = CommentsInteractiveComponent;
if (typeof module !== 'undefined' && module.exports) module.exports = CommentsInteractiveComponent;