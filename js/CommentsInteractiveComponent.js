class CommentsInteractiveComponent {
  /**
   * Embeds an authentic, interactive Comment thread inside documentation chapters.
   * Can be invoked from any chapter with a specific threadId.
   */
  static render(container, options = {}) {
    container.innerHTML = '';
    const threadId = options.threadId || 'main_thread';

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
        margin: '20px 0'
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
        makeElement('strong', { style: { fontSize: '12px', color: '#00f2fe', fontFamily: 'monospace' } }, options.title || 'Discussion Thread'),
        makeElement('span', { style: { fontSize: '10px', color: '#64748b', fontFamily: 'monospace' } }, `[${threadId}]`)
      ]),
      makeElement('button', {
        className: 'dr-nav-btn',
        style: { padding: '2px 8px', fontSize: '10px' },
        onclick: () => bootThread()
      }, '↻ Refresh')
    ]);
    card.appendChild(header);

    const threadContainer = makeElement('div', {
      id: `thread-mount-${threadId}`,
      style: {
        padding: '16px',
        minHeight: '280px',
        background: '#070a13',
        overflowY: 'auto'
      }
    });
    card.appendChild(threadContainer);
    container.appendChild(card);

    function bootThread() {
      if (typeof Comments !== 'undefined') {
        const app = new Comments();
        app.init(threadContainer, { threadId: threadId });
      } else {
        setTimeout(bootThread, 80);
      }
    }

    setTimeout(bootThread, 50);
  }
}

globalThis.CommentsInteractiveComponent = CommentsInteractiveComponent;
if (typeof module !== 'undefined' && module.exports) module.exports = CommentsInteractiveComponent;