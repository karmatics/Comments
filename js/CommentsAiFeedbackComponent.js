class CommentsAiFeedbackComponent {
  /**
   * Interactive Sandbox for Chapter 6: Nuanced AI Moderation & Private Feedback.
   * Demonstrates attaching private voice/text notes to comments that are only visible
   * to the author and the AI moderator, allowing the AI to learn context and provide gentle coaching.
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

    // 1. Header Toolbar
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
    }, [
      makeElement('div', { style: { display: 'flex', alignItems: 'center', gap: '8px' } }, [
        makeElement('span', { style: { fontSize: '15px' } }, '🤖'),
        makeElement('strong', { style: { fontSize: '13px', color: '#00f2fe', fontFamily: 'monospace' } }, 'Private Feedback & AI Community Coach Simulator'),
        makeElement('span', { style: { fontSize: '10px', background: 'rgba(192, 132, 252, 0.18)', color: '#c084fc', border: '1px solid rgba(192, 132, 252, 0.4)', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold' } }, 'Private Channel')
      ]),
      makeElement('span', { style: { fontSize: '11px', color: '#94a3b8', fontFamily: 'monospace' } }, 'Hidden from public • Visible only to author & AI')
    ]);
    wrap.appendChild(topBar);

    // 2. Stage Grid: Left = Public Comment; Right = Private AI Feedback Ledger
    const stage = makeElement('div', {
      style: {
        display: 'grid',
        gridTemplateColumns: 'minmax(300px, 1.2fr) minmax(280px, 1fr)',
        gap: '1px',
        background: '#1e293b'
      }
    });

    // Left Column: Public Comment Card
    const leftCol = makeElement('div', {
      style: { background: '#070a13', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }
    });

    leftCol.appendChild(makeElement('div', {
      style: { fontSize: '10.5px', color: '#64748b', textTransform: 'uppercase', fontWeight: 'bold', fontFamily: 'monospace' }
    }, 'Public Discussion Thread'));

    const commentCard = makeElement('div', {
      style: {
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid #232d3f',
        borderRadius: '8px',
        padding: '14px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }
    }, [
      makeElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } }, [
        makeElement('div', { style: { display: 'flex', alignItems: 'center', gap: '6px' } }, [
          makeElement('strong', { style: { color: '#f8fafc', fontSize: '12px' } }, 'Alex'),
          makeElement('span', { style: { color: '#00f2fe', fontSize: '10px', fontFamily: 'monospace' } }, '#1088'),
          makeElement('span', { style: { color: '#64748b', fontSize: '10px' } }, '• 20m ago')
        ]),
        makeElement('span', { style: { color: '#10b981', fontSize: '11px', fontWeight: 'bold' } }, '▲ 8')
      ]),
      makeElement('div', {
        style: { fontSize: '12.5px', color: '#cbd5e1', lineHeight: '1.5' }
      }, '"Anyone who thinks this database architecture works at scale has clearly never worked on a real production system. Read a book."'),
      makeElement('div', {
        style: { display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }
      }, [
        makeElement('button', {
          className: 'dr-nav-btn',
          id: 'btn-open-private-feedback',
          style: { padding: '3px 10px', fontSize: '10.5px', color: '#c084fc', borderColor: 'rgba(192, 132, 252, 0.4)' },
          onclick: () => toggleFeedbackBox()
        }, '💬 Private Feedback to AI')
      ])
    ]);
    leftCol.appendChild(commentCard);

    // Private Input Box
    const feedbackBox = makeElement('div', {
      id: 'private-feedback-input-box',
      style: {
        background: 'rgba(192, 132, 252, 0.06)',
        border: '1px solid rgba(192, 132, 252, 0.35)',
        borderRadius: '8px',
        padding: '12px',
        display: 'none',
        flexDirection: 'column',
        gap: '8px'
      }
    }, [
      makeElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } }, [
        makeElement('strong', { style: { color: '#c084fc', fontSize: '11px', fontFamily: 'monospace' } }, 'Attach Private Community Feedback:'),
        makeElement('span', { style: { color: '#94a3b8', fontSize: '10px' } }, 'Invisible to public')
      ]),
      makeElement('textarea', {
        id: 'private-feedback-textarea',
        placeholder: 'e.g. "Alex is technically knowledgeable about SQL, but their aggressive tone is alienating new contributors."',
        style: {
          width: '100%', minHeight: '65px', background: '#090d16', color: '#f8fafc',
          border: '1px solid #232d3f', borderRadius: '6px', padding: '8px',
          fontFamily: 'var(--dr-font-sans)', fontSize: '12px', outline: 'none', resize: 'vertical'
        }
      }),
      makeElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } }, [
        makeElement('div', { style: { display: 'flex', gap: '4px' } }, [
          makeElement('button', {
            className: 'cp-tag-chip',
            onclick: () => setPresetFeedback('smart_but_mean')
          }, '💡 Smart but harsh'),
          makeElement('button', {
            className: 'cp-tag-chip',
            onclick: () => setPresetFeedback('friendly_misinformed')
          }, '🌱 Nice but incorrect'),
          makeElement('button', {
            className: 'cp-tag-chip',
            onclick: () => setPresetFeedback('cynical_troll')
          }, '⚠️ Performative troll')
        ]),
        makeElement('button', {
          className: 'dr-nav-btn primary',
          style: { padding: '4px 12px', fontSize: '10.5px', background: '#8257e5', borderColor: '#8257e5' },
          onclick: () => submitFeedback()
        }, 'Submit to AI')
      ])
    ]);
    leftCol.appendChild(feedbackBox);
    stage.appendChild(leftCol);

    // Right Column: AI Moderator Synthesis & Private Coaching Output
    const rightCol = makeElement('div', {
      style: { background: '#0a0e1a', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }
    });

    rightCol.appendChild(makeElement('div', {
      style: { fontSize: '10.5px', color: '#c084fc', textTransform: 'uppercase', fontWeight: 'bold', fontFamily: 'monospace' }
    }, 'AI Moderator Context & Gentle Coaching'));

    const coachingCard = makeElement('div', {
      id: 'ai-coaching-output',
      style: {
        background: '#070a13',
        border: '1px solid rgba(192, 132, 252, 0.2)',
        borderRadius: '8px',
        padding: '12px',
        fontSize: '11.5px',
        color: '#cbd5e1',
        lineHeight: '1.5'
      }
    }, [
      makeElement('strong', { style: { color: '#00f2fe', display: 'block', marginBottom: '4px' } }, 'System Evaluation:'),
      'No private flags logged on this comment yet. Click "Private Feedback to AI" on the left to test attaching a dictated or typed note.'
    ]);
    rightCol.appendChild(coachingCard);
    stage.appendChild(rightCol);

    wrap.appendChild(stage);
    container.appendChild(wrap);

    function toggleFeedbackBox() {
      feedbackBox.style.display = feedbackBox.style.display === 'flex' ? 'none' : 'flex';
      if (feedbackBox.style.display === 'flex') {
        const ta = document.getElementById('private-feedback-textarea');
        if (ta) ta.focus();
      }
    }

    function setPresetFeedback(type) {
      const ta = document.getElementById('private-feedback-textarea');
      if (!ta) return;
      if (type === 'smart_but_mean') {
        ta.value = 'Alex knows what they are talking about regarding scaling, but they are being unnecessarily harsh and condescending to beginners.';
      } else if (type === 'friendly_misinformed') {
        ta.value = 'This user is trying their best and has a warm tone, but their understanding of transactions is incorrect.';
      } else {
        ta.value = 'This is performative cynicism without contributing any substantive arguments.';
      }
    }

    function submitFeedback() {
      const ta = document.getElementById('private-feedback-textarea');
      const text = ta ? ta.value.trim() : '';
      if (!text) return;

      feedbackBox.style.display = 'none';

      coachingCard.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
          <strong style="color:#00f2fe;font-family:monospace;">AI Community Coach Assessment</strong>
          <span style="font-size:9.5px;background:rgba(0,242,254,0.18);color:#00f2fe;padding:1px 6px;border-radius:10px;">Calibrated</span>
        </div>
        <div style="font-size:11px;color:#94a3b8;margin-bottom:8px;border-left:2px solid #8257e5;padding-left:8px;">
          <em>Private feedback incorporated:</em> "${text}"
        </div>
        <div style="color:#f8fafc;font-weight:bold;margin-bottom:4px;">Author Context Profile:</div>
        <div style="font-size:11.5px;color:#cbd5e1;margin-bottom:8px;">
          • <strong>Technical Accuracy:</strong> High (88th percentile)<br>
          • <strong>Tone Balance:</strong> Abrasive / Dismissive (Flagged for reminder)
        </div>
        <div style="background:rgba(192,132,252,0.1);border:1px solid rgba(192,132,252,0.3);border-radius:6px;padding:8px 10px;">
          <strong style="color:#c084fc;font-size:10.5px;font-family:monospace;display:block;margin-bottom:2px;">Private Coaching Prompt Dispatched to Alex:</strong>
          <span style="font-size:11px;color:#e2e8f0;font-style:italic;">
            "Hey Alex, your insight on transaction volume is valuable, but leading with dismissive language makes people defensive. Frame the advice constructively so your knowledge gets heard."
          </span>
        </div>
      `;
    }
  }
}

globalThis.CommentsAiFeedbackComponent = CommentsAiFeedbackComponent;
if (typeof module !== 'undefined' && module.exports) module.exports = CommentsAiFeedbackComponent;