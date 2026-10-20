class CommentsAiDictationSimulatorComponent {
  /**
   * Automated, scripted simulator demonstrating the private voice dictation feedback workflow.
   * Simulates typing in real-time with glowing connectors and AI community coaching advice.
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
        makeElement('span', { style: { fontSize: '15px' } }, '🎙️'),
        makeElement('strong', { style: { fontSize: '13px', color: '#00f2fe', fontFamily: 'monospace' } }, 'Scripted AI Dictation & Feedback Simulator'),
        makeElement('span', { id: 'dict-sim-badge', style: { fontSize: '10px', background: 'rgba(0, 242, 254, 0.15)', color: '#00f2fe', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold' } }, 'Ready')
      ]),
      makeElement('div', { style: { display: 'flex', gap: '6px' } }, [
        makeElement('button', {
          className: 'dr-nav-btn primary',
          id: 'btn-run-dict-sim',
          style: { padding: '3px 12px', fontSize: '10.5px' },
          onclick: () => runScriptedSimulation()
        }, '▶ Play Scripted Simulation'),
        makeElement('button', {
          className: 'dr-nav-btn',
          style: { padding: '3px 8px', fontSize: '10px', color: '#ef4444' },
          onclick: () => resetSimulation()
        }, '↺ Reset')
      ])
    ]);
    wrap.appendChild(topBar);

    // Simulation Stage
    const stage = makeElement('div', {
      style: {
        padding: '24px',
        background: '#070a13',
        minHeight: '340px',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }
    });

    // 1. Target Comment Card
    const targetComment = makeElement('div', {
      id: 'dict-sim-target-comment',
      style: {
        background: '#0d1117',
        border: '1.5px solid #232d3f',
        borderRadius: '8px',
        padding: '14px',
        maxWidth: '560px',
        position: 'relative',
        boxShadow: '0 4px 16px rgba(0,0,0,0.5)'
      }
    }, [
      makeElement('div', { style: { display: 'flex', justifyContent: 'space-between', marginBottom: '6px' } }, [
        makeElement('div', { style: { display: 'flex', alignItems: 'center', gap: '6px' } }, [
          makeElement('strong', { style: { color: '#f8fafc', fontSize: '12px' } }, 'Alex'),
          makeElement('span', { style: { color: '#00f2fe', fontSize: '10px', fontFamily: 'monospace' } }, '#1088'),
          makeElement('span', { style: { color: '#64748b', fontSize: '10px' } }, '• 25m ago')
        ]),
        makeElement('span', { style: { color: '#10b981', fontSize: '11px', fontWeight: 'bold' } }, '▲ 19')
      ]),
      makeElement('div', {
        style: { fontSize: '12.5px', color: '#cbd5e1', lineHeight: '1.5' }
      }, '"Anyone who thinks this database architecture works at scale has clearly never worked on a real production system. Read a book."')
    ]);
    stage.appendChild(targetComment);

    // 2. SVG Connector Layer
    const svgLayer = makeElement('svg:svg', {
      id: 'dict-sim-svg-connector',
      style: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        display: 'none',
        zIndex: 10
      }
    });
    const connectorPath = makeElement('svg:path', {
      d: 'M 0 0',
      fill: 'none',
      stroke: '#00ff66',
      'stroke-width': '2.5',
      filter: 'drop-shadow(0 0 6px #00ff66)'
    });
    svgLayer.appendChild(connectorPath);
    stage.appendChild(svgLayer);

    // 3. Floating Dictation Popup
    const dictationPopup = makeElement('div', {
      id: 'dict-sim-popup',
      style: {
        background: '#000000',
        border: '2.5px solid #00ff66',
        borderRadius: '8px',
        padding: '12px 16px',
        maxWidth: '460px',
        color: '#ffffff',
        fontFamily: 'var(--dr-font-sans)',
        fontSize: '12px',
        lineHeight: '1.5',
        boxShadow: '0 8px 30px rgba(0, 255, 102, 0.35)',
        display: 'none',
        zIndex: 20,
        position: 'relative'
      }
    });
    stage.appendChild(dictationPopup);

    // 4. AI Coach Output Panel
    const aiCoachOutput = makeElement('div', {
      id: 'dict-sim-coach-output',
      style: {
        background: 'rgba(192, 132, 252, 0.08)',
        border: '1.5px solid rgba(192, 132, 252, 0.35)',
        borderRadius: '8px',
        padding: '14px',
        display: 'none',
        flexDirection: 'column',
        gap: '8px',
        maxWidth: '560px'
      }
    });
    stage.appendChild(aiCoachOutput);

    wrap.appendChild(stage);
    container.appendChild(wrap);

    let simTimer = null;

    function resetSimulation() {
      if (simTimer) clearTimeout(simTimer);
      svgLayer.style.display = 'none';
      dictationPopup.style.display = 'none';
      dictationPopup.innerHTML = '';
      aiCoachOutput.style.display = 'none';
      document.getElementById('dict-sim-badge').textContent = 'Ready';
      document.getElementById('dict-sim-badge').style.color = '#00f2fe';
    }

    function runScriptedSimulation() {
      resetSimulation();

      const badge = document.getElementById('dict-sim-badge');
      badge.textContent = '● Listening (Microphone Active)...';
      badge.style.color = '#00ff66';

      // 1. Show popup and draw connector to comment
      dictationPopup.style.display = 'block';
      dictationPopup.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
          <strong style="color:#00ff66;font-family:monospace;font-size:11px;">🎙️ Private Whisper to AI Community Coach:</strong>
          <span class="cp-audio-wave"><span></span><span></span><span></span><span></span></span>
        </div>
        <div id="dict-sim-text-stream" style="min-height:24px;color:#f8fafc;"></div>
      `;

      svgLayer.style.display = 'block';
      const cRect = targetComment.getBoundingClientRect();
      const sRect = stage.getBoundingClientRect();

      const startX = cRect.right - sRect.left - 40;
      const startY = cRect.bottom - sRect.top;
      const endX = startX + 30;
      const endY = startY + 50;

      connectorPath.setAttribute('d', `M ${startX} ${startY} C ${startX} ${startY + 30}, ${endX} ${endY - 20}, ${endX} ${endY}`);

      // 2. Type out words progressively
      const script = "Alex knows what they are talking about regarding scaling, but their harsh tone is unnecessarily shutting down debate.";
      const words = script.split(" ");
      let wordIdx = 0;
      const textStream = document.getElementById('dict-sim-text-stream');

      function typeNextWord() {
        if (wordIdx < words.length) {
          textStream.textContent = words.slice(0, wordIdx + 1).join(" ") + " ▍";
          wordIdx++;
          simTimer = setTimeout(typeNextWord, 180);
        } else {
          textStream.textContent = script;
          badge.textContent = '⚡ Transcribed • Processing with AI...';
          badge.style.color = '#c084fc';
          simTimer = setTimeout(renderCoachResponse, 800);
        }
      }

      simTimer = setTimeout(typeNextWord, 400);
    }

    function renderCoachResponse() {
      const badge = document.getElementById('dict-sim-badge');
      badge.textContent = '✓ Private Coaching Dispatched';
      badge.style.color = '#c084fc';

      aiCoachOutput.style.display = 'flex';
      aiCoachOutput.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <strong style="color:#c084fc;font-family:monospace;font-size:11.5px;">🤖 AI Community Coach Assessment (Private):</strong>
          <span style="font-size:9.5px;background:rgba(192,132,252,0.2);color:#c084fc;padding:2px 8px;border-radius:10px;font-weight:bold;">Calibrated</span>
        </div>
        <div style="font-size:11.5px;color:#cbd5e1;line-height:1.45;">
          • <strong>Author Profile:</strong> Alex #1088 (High Technical Credibility, Recurrent Abrasive Phrasing)<br>
          • <strong>Moderator Action:</strong> No public ban or deletion. Private coaching dispatched to author box on next visit.
        </div>
        <div style="background:#070a13;border:1px solid rgba(192,132,252,0.3);border-radius:6px;padding:10px;margin-top:4px;">
          <strong style="color:#00f2fe;font-size:10px;text-transform:uppercase;font-family:monospace;display:block;margin-bottom:3px;">Delivered Privately to Alex's Post Box:</strong>
          <span style="color:#f8fafc;font-size:12px;font-style:italic;">
            "Hey Alex, your technical insight on transaction scale is spot on, but leading with 'read a book' makes people defensive. Frame it constructively so your knowledge gets heard."
          </span>
        </div>
      `;
    }
  }
}

globalThis.CommentsAiDictationSimulatorComponent = CommentsAiDictationSimulatorComponent;
if (typeof module !== 'undefined' && module.exports) module.exports = CommentsAiDictationSimulatorComponent;