class CloudDatabaseDialog {
  /**
   * UI Manager for configuring live cloud PostgreSQL / Supabase credentials
   * directly from the browser without code modification.
   */
  static open(serverApiInstance, onConnectedCallback = null) {
    const api = serverApiInstance || (window.commentsApp ? window.commentsApp.serverAPI : new ServerAPI());

    const savedUrl = typeof localStorage !== 'undefined' ? localStorage.getItem('comments_supabase_url') || '' : '';
    const savedKey = typeof localStorage !== 'undefined' ? localStorage.getItem('comments_supabase_key') || '' : '';

    const content = makeElement('div', {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        color: '#f8fafc',
        fontFamily: 'var(--dr-font-sans, system-ui, sans-serif)',
        fontSize: '12px'
      }
    });

    // Header Callout
    content.appendChild(makeElement('div', {
      style: {
        background: 'rgba(0, 242, 254, 0.08)',
        border: '1px solid rgba(0, 242, 254, 0.3)',
        borderRadius: '8px',
        padding: '10px 12px',
        lineHeight: '1.45',
        fontSize: '11.5px',
        color: '#cbd5e1'
      }
    }, [
      makeElement('strong', { style: { color: '#00f2fe', display: 'block', marginBottom: '3px' } }, '⚡ Free Cloud PostgreSQL / Supabase Backend'),
      'Connects your comment threads, user profiles, and voting records to a free, internet-wide database that operates from GitHub Pages with zero server maintenance [1].'
    ]));

    // Project URL
    const urlInput = makeElement('input', {
      type: 'text',
      value: savedUrl,
      placeholder: 'https://xyzcompany.supabase.co',
      style: {
        width: '100%',
        padding: '8px 10px',
        background: '#070a13',
        color: '#00f2fe',
        border: '1px solid #232d3f',
        borderRadius: '6px',
        fontFamily: 'monospace',
        fontSize: '12px',
        outline: 'none',
        boxSizing: 'border-box'
      }
    });

    content.appendChild(makeElement('div', {}, [
      makeElement('label', { style: { display: 'block', marginBottom: '4px', color: '#94a3b8', fontWeight: 'bold' } }, '1. Supabase Project URL:'),
      urlInput
    ]));

    // Anon Public Key
    const keyInput = makeElement('input', {
      type: 'password',
      value: savedKey,
      placeholder: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      style: {
        width: '100%',
        padding: '8px 10px',
        background: '#070a13',
        color: '#7ee787',
        border: '1px solid #232d3f',
        borderRadius: '6px',
        fontFamily: 'monospace',
        fontSize: '11px',
        outline: 'none',
        boxSizing: 'border-box'
      }
    });

    content.appendChild(makeElement('div', {}, [
      makeElement('label', { style: { display: 'block', marginBottom: '4px', color: '#94a3b8', fontWeight: 'bold' } }, '2. Project API Anon Key (Public):'),
      keyInput
    ]));

    // Live Ping / Status Box
    const statusBox = makeElement('div', {
      id: 'cloud-db-ping-status',
      style: {
        padding: '8px 10px',
        background: '#070a13',
        border: '1px solid #1e293b',
        borderRadius: '6px',
        fontSize: '11px',
        fontFamily: 'monospace',
        color: savedUrl && savedKey ? '#10b981' : '#f59e0b',
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
      }
    }, savedUrl && savedKey ? '● Cloud credentials present in browser storage.' : '○ In-Memory Mock Mode Active (Zero configuration needed for local demo).');
    content.appendChild(statusBox);

    // Footer actions
    const footer = makeElement('div', {
      style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', flexWrap: 'wrap', gap: '8px' }
    });

    const leftActions = makeElement('div', { style: { display: 'flex', gap: '6px' } }, [
      makeElement('button', {
        className: 'dr-nav-btn',
        style: { fontSize: '11px', padding: '5px 10px', color: '#38bdf8' },
        onclick: async () => {
          const u = urlInput.value.trim().replace(/\/+$/, '');
          const k = keyInput.value.trim();
          if (!u || !k) {
            statusBox.textContent = '❌ Please enter both Project URL and Anon Key.';
            statusBox.style.color = '#ff7b72';
            return;
          }
          statusBox.textContent = '⚡ Pinging Supabase endpoint...';
          statusBox.style.color = '#00f2fe';

          try {
            const probe = await fetch(`${u}/rest/v1/`, {
              headers: { 'apikey': k, 'Authorization': `Bearer ${k}` }
            });
            if (probe.ok) {
              statusBox.textContent = '✅ Connection Verified! Supabase REST API online and responsive.';
              statusBox.style.color = '#10b981';
            } else {
              statusBox.textContent = `❌ Connected but received HTTP ${probe.status}. Check API anon key.`;
              statusBox.style.color = '#ff7b72';
            }
          } catch (e) {
            statusBox.textContent = `❌ Connection failed: ${e.message}`;
            statusBox.style.color = '#ff7b72';
          }
        }
      }, '🔍 Test Connection'),

      makeElement('button', {
        className: 'dr-nav-btn',
        style: { fontSize: '11px', padding: '5px 8px', color: '#ff7b72' },
        onclick: () => {
          if (confirm('Clear saved cloud database credentials and revert to local mock?')) {
            localStorage.removeItem('comments_supabase_url');
            localStorage.removeItem('comments_supabase_key');
            urlInput.value = '';
            keyInput.value = '';
            statusBox.textContent = '○ Reverted to local MockServerAPI mode.';
            statusBox.style.color = '#94a3b8';
            if (onConnectedCallback) onConnectedCallback(null);
          }
        }
      }, 'Revert to Mock')
    ]);

    const rightActions = makeElement('div', { style: { display: 'flex', gap: '6px' } }, [
      makeElement('button', {
        className: 'dr-nav-btn',
        onclick: () => dlg.close()
      }, 'Cancel'),

      makeElement('button', {
        className: 'dr-nav-btn primary',
        style: { fontWeight: 'bold' },
        onclick: () => {
          const u = urlInput.value.trim().replace(/\/+$/, '');
          const k = keyInput.value.trim();

          if (u && k) {
            api.setBaseUrl(u, k);
            if (onConnectedCallback) onConnectedCallback({ url: u, key: k });
            alert('✓ Live Supabase credentials saved! All comments and identities will now persist to your cloud database.');
          }
          dlg.close();
        }
      }, '💾 Save & Connect')
    ]);

    footer.appendChild(leftActions);
    footer.appendChild(rightActions);
    content.appendChild(footer);

    const dlg = UITools.makeDialog({
      title: '⚡ Cloud Database Connection (Supabase / PostgreSQL)',
      size: [560, 440],
      position: [Math.max(20, (window.innerWidth - 560) / 2), 70],
      contentElement: content,
      appendTo: document.body
    });

    return dlg;
  }
}

globalThis.CloudDatabaseDialog = CloudDatabaseDialog;
if (typeof module !== 'undefined' && module.exports) module.exports = CloudDatabaseDialog;