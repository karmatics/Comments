class CommentsNotesManager {
  /**
   * Manages global author/inventor notes using Library/DictationWidget.
   * Notes are saved to localStorage and can be bundled into prompts or exported.
   */
  static STORAGE_KEY = 'comments_author_notes';

  static getNotes() {
    return localStorage.getItem(this.STORAGE_KEY) || '';
  }

  static saveNotes(text) {
    localStorage.setItem(this.STORAGE_KEY, text || '');
  }

  static openDialog() {
    const hostContainer = document.body;

    const wrap = makeElement('div', {
      style: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: '460px',
        gap: '8px',
        color: '#e2e8f0',
        fontFamily: 'var(--dr-font-sans)'
      }
    });

    const header = makeElement('div', {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '6px 4px',
        borderBottom: '1px solid #232d3f',
        fontSize: '11px',
        color: '#94a3b8'
      }
    }, [
      makeElement('span', {}, '🎙️ Voice Dictation & Working Notes (Comments System)'),
      makeElement('span', { id: 'comments-notes-char-count' }, `${this.getNotes().length} chars`)
    ]);
    wrap.appendChild(header);

    const widgetMount = makeElement('div', {
      style: { flex: '1', minHeight: '340px', display: 'flex', flexDirection: 'column' }
    });
    wrap.appendChild(widgetMount);

    let widget = null;
    if (typeof DictationWidget !== 'undefined') {
      widget = new DictationWidget({
        placeholder: '🎙️ Speak to dictate working notes, or type here freely...'
      });
      widgetMount.appendChild(widget.getElement());

      const saved = this.getNotes();
      if (saved) {
        widget.setText(saved);
      }

      widget.subscribe((text) => {
        this.saveNotes(text);
        const countEl = document.getElementById('comments-notes-char-count');
        if (countEl) countEl.textContent = `${text.length} chars`;
      });
    }

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
    }, [
      makeElement('button', {
        className: 'dr-nav-btn',
        onclick: () => {
          const text = this.getNotes();
          const blob = new Blob([text], { type: 'text/markdown' });
          const url = URL.createObjectURL(blob);
          const a = makeElement('a', { href: url, download: `Comments_AuthorNotes_${Date.now()}.md` });
          a.click();
          URL.revokeObjectURL(url);
        }
      }, '💾 Download .md'),

      makeElement('div', { style: { display: 'flex', gap: '6px', flexWrap: 'wrap' } }, [
        makeElement('button', {
          className: 'dr-nav-btn',
          onclick: (e) => {
            const btn = e.currentTarget;
            navigator.clipboard.writeText(this.getNotes()).then(() => {
              const orig = btn.textContent;
              btn.textContent = '✓ Copied!';
              setTimeout(() => { btn.textContent = orig; }, 1800);
            });
          }
        }, '📋 Copy'),

        makeElement('button', {
          className: 'dr-nav-btn primary',
          onclick: () => {
            dlg.close();
          }
        }, 'Done')
      ])
    ]);
    wrap.appendChild(footer);

    const dlg = UITools.makeDialog({
      title: '📝 Comments System Author Notes & Voice Dictation',
      size: [580, 560],
      position: [Math.max(20, (window.innerWidth - 580) / 2), 60],
      contentElement: wrap,
      appendTo: hostContainer,
      onClose: () => {
        if (widget && typeof widget.destroy === 'function') {
          widget.destroy();
        }
      }
    });

    return dlg;
  }
}

globalThis.CommentsNotesManager = CommentsNotesManager;
globalThis.CadPlanNotesManager = CommentsNotesManager;
if (typeof module !== 'undefined' && module.exports) module.exports = CommentsNotesManager;