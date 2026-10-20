class CommentsPromptGeneratorComponent {
  /**
   * 1-Click Drop-in Deployment Kit & Master Prompt Generator.
   * Generates a complete standalone code bundle (HTML/CSS/JS + Supabase Schema)
   * that users can copy and paste into an LLM or drop into any website.
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

    const header = makeElement('div', {
      style: {
        padding: '12px 18px',
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
        makeElement('span', { style: { fontSize: '16px' } }, '📦'),
        makeElement('strong', { style: { fontSize: '13px', color: '#00f2fe', fontFamily: 'monospace' } }, 'Drop-In Deployment Kit & Prompt Generator'),
        makeElement('span', { style: { fontSize: '10px', background: 'rgba(0, 242, 254, 0.15)', color: '#00f2fe', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold' } }, '1-Click Export')
      ]),
      makeElement('div', { style: { display: 'flex', gap: '6px' } }, [
        makeElement('button', {
          className: 'dr-nav-btn primary',
          id: 'btn-copy-deployment-bundle',
          style: { padding: '4px 14px', fontSize: '11px', fontWeight: 'bold' },
          onclick: () => copyBundle()
        }, '📋 Copy Master Deployment Prompt')
      ])
    ]);
    wrap.appendChild(header);

    const body = makeElement('div', {
      style: { padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', background: '#070a13' }
    });

    body.appendChild(makeElement('div', {
      style: { fontSize: '11.5px', color: '#cbd5e1', lineHeight: '1.5' }
    }, 'Select your desired deployment options below. The generator constructs a complete prompt payload containing the full database schema, frontend code, and setup instructions to paste into Claude, ChatGPT, or your own site:'));

    const optionsRow = makeElement('div', {
      style: { display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', background: '#0d1117', padding: '10px 14px', borderRadius: '8px', border: '1px solid #1e293b' }
    });

    const themeSelect = makeElement('select', {
      id: 'gen-theme-select',
      style: { background: '#070a13', color: '#00f2fe', border: '1px solid #232d3f', borderRadius: '4px', padding: '4px 8px', fontSize: '11px', fontFamily: 'monospace' },
      onchange: () => updatePayload()
    }, [
      makeElement('option', { value: 'obsidian', selected: true }, 'Theme: Dark Obsidian'),
      makeElement('option', { value: 'light' }, 'Theme: Clean Light'),
      makeElement('option', { value: 'cyber' }, 'Theme: Cyber Cyan')
    ]);

    const backendSelect = makeElement('select', {
      id: 'gen-backend-select',
      style: { background: '#070a13', color: '#00f2fe', border: '1px solid #232d3f', borderRadius: '4px', padding: '4px 8px', fontSize: '11px', fontFamily: 'monospace' },
      onchange: () => updatePayload()
    }, [
      makeElement('option', { value: 'supabase', selected: true }, 'Backend: Supabase (Postgres RLS)'),
      makeElement('option', { value: 'cloudflare' }, 'Backend: Cloudflare D1 / Worker')
    ]);

    optionsRow.append(
      makeElement('span', { style: { fontSize: '11px', color: '#94a3b8', fontWeight: 'bold' } }, 'Options:'),
      themeSelect,
      backendSelect
    );
    body.appendChild(optionsRow);

    const textarea = makeElement('textarea', {
      id: 'deployment-bundle-textarea',
      style: {
        width: '100%',
        minHeight: '260px',
        background: '#04060a',
        color: '#7ee787',
        border: '1px solid #1e293b',
        borderRadius: '8px',
        padding: '12px',
        fontFamily: 'var(--dr-font-mono, monospace)',
        fontSize: '11px',
        lineHeight: '1.45',
        resize: 'vertical',
        outline: 'none',
        whiteSpace: 'pre'
      },
      readOnly: true,
      spellcheck: false
    });
    body.appendChild(textarea);

    wrap.appendChild(body);
    container.appendChild(wrap);

    function generatePayload() {
      const theme = themeSelect.value;
      const backend = backendSelect.value;

      return `# 📦 COMPLETE DROP-IN COMMENTING SYSTEM PROMPT & CODE SPECIFICATION
Target Environment: Static Web / GitHub Pages with Cross-Domain Database Backend
Backend Stack: ${backend === 'supabase' ? 'Supabase (PostgreSQL with Row-Level Security)' : 'Cloudflare D1 & Worker'}
Styling Theme: ${theme}

---

## 1. BACKEND DATABASE SETUP (Run in SQL Editor)
\`\`\`sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. User Profiles & Discriminator Tags
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL DEFAULT 'Anonymous',
  tag INT NOT NULL DEFAULT 1001,
  is_claimed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Hierarchical Comments Tree
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id TEXT NOT NULL,
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  element_anchor TEXT,
  body TEXT NOT NULL,
  score INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Idempotent Upvotes
CREATE TABLE votes (
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  value SMALLINT CHECK (value IN (-1, 1)),
  PRIMARY KEY (comment_id, user_id)
);

-- Enable Row-Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read comments" ON comments FOR SELECT USING (true);
CREATE POLICY "Authenticated insert comments" ON comments FOR INSERT WITH CHECK (auth.uid() = author_id);
\`\`\`

---

## 2. CLIENT-SIDE DROP-IN EMBED (Paste into any HTML page)
\`\`\`html
<div id="comments-container"></div>

<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></` + `script>
<script>
  // Initialize Supabase Client
  const SUPABASE_URL = "YOUR_SUPABASE_URL";
  const SUPABASE_KEY = "YOUR_SUPABASE_ANON_KEY";
  const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

  // Mount Comments Engine
  document.addEventListener("DOMContentLoaded", async () => {
    // 1. Silent Anonymous Session
    let { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      const { data } = await supabase.auth.signInAnonymously();
      session = data.session;
    }

    // 2. Load thread for current page
    const pageId = window.location.pathname || "default";
    const { data: comments } = await supabase
      .from("comments")
      .select("*, profiles(*)")
      .eq("page_id", pageId)
      .order("created_at", { ascending: true });

    console.log("Loaded comments:", comments);
  });
</` + `script>
\`\`\`
`;
    }

    function updatePayload() {
      textarea.value = generatePayload();
    }

    function copyBundle() {
      navigator.clipboard.writeText(textarea.value).then(() => {
        const btn = document.getElementById('btn-copy-deployment-bundle');
        if (btn) {
          const orig = btn.textContent;
          btn.textContent = '✓ Copied Full Deployment Bundle!';
          setTimeout(() => { btn.textContent = orig; }, 2200);
        }
      });
    }

    updatePayload();
  }
}

globalThis.CommentsPromptGeneratorComponent = CommentsPromptGeneratorComponent;
if (typeof module !== 'undefined' && module.exports) module.exports = CommentsPromptGeneratorComponent;