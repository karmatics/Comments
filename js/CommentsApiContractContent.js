class CommentsApiContractContent {
  static getMeta() {
    return {
      kicker: 'Cloud Infrastructure & Database Contract',
      title: '4. Supabase & Serverless API Contract',
      subtitle: 'PostgreSQL relational schema, row-level security (RLS), Cloudflare Turnstile bot shield, and cross-domain CORS from GitHub Pages.'
    };
  }

  static manifest() {
      return [
        {
          section: 'supabase_quickstart',
          partLabel: 'Chapter 4 • Cloud Setup',
          title: '3-Minute Free Database Setup (Supabase PostgreSQL + RLS)',
          blocks: [
            { id: 'p_supabase_steps_1', type: 'p' },
            { id: 'p_supabase_steps_2', type: 'p' },
            { id: 'sidebar_sql_definition', type: 'sidebar', kicker: 'Copy & Paste DDL', title: 'Complete PostgreSQL Database Schema with RLS' }
          ]
        },
        {
          section: 'bot_defense',
          partLabel: 'Chapter 4 • Security',
          title: 'Invisible Bot Defense: Turnstile, Honeypots & Rate Limiting',
          blocks: [
            { id: 'p_bot_1', type: 'p' },
            { id: 'p_bot_2', type: 'p' },
            { id: 'sidebar_bot_defense_matrix', type: 'sidebar', kicker: 'Spam Defense', title: 'Multi-Tier Anti-Bot Architecture' }
          ]
        },
        {
          section: 'cors_github_pages',
          partLabel: 'Chapter 4 • Cross-Origin',
          title: 'Cross-Domain Calling from GitHub Pages',
          blocks: [
            { id: 'p_cors_1', type: 'p' },
            { id: 'sidebar_cors_configuration', type: 'sidebar', kicker: 'CORS Headers', title: 'Universal Cross-Domain Authorization' }
          ]
        }
      ];
    }
  static p_schema_1() {
    return [
      "Instead of writing and maintaining a custom Node.js server with manual connection pooling, we model our comments backend directly on PostgreSQL using Supabase or serverless SQLite using Cloudflare D1. This architecture is free for up to 50,000 monthly active users and easily handles millions of comment records.",
      "The relational database schema is structured around three core tables: `profiles` (managing display names and #tags), `comments` (managing the comment tree and text body), and `votes` (tracking upvotes)."
    ];
  }

  static p_schema_2() {
    return [
      "Security is enforced at the database layer using **Row-Level Security (RLS)**. Even though your frontend JavaScript communicates directly with the database API over public HTTPS, clients can never corrupt other users' comments. RLS policies allow anyone to read comments, require authenticated sessions (including anonymous sessions) to insert comments, and restrict updates or deletions strictly to the comment author."
    ];
  }

  static sidebar_sql_definition() {
    return [
      "Complete PostgreSQL DDL:\n" +
      "```sql\n" +
      "-- 1. User Profiles & Discriminator Tags\n" +
      "CREATE TABLE profiles (\n" +
      "  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,\n" +
      "  display_name TEXT NOT NULL DEFAULT 'Anonymous',\n" +
      "  tag INT NOT NULL DEFAULT 1001,\n" +
      "  is_claimed BOOLEAN DEFAULT FALSE,\n" +
      "  created_at TIMESTAMPTZ DEFAULT NOW()\n" +
      ");\n\n" +
      "-- 2. Comment Nodes & Hierarchy\n" +
      "CREATE TABLE comments (\n" +
      "  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n" +
      "  page_id TEXT NOT NULL, -- e.g. 'blog-intro' or 'docs/accudraw'\n" +
      "  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,\n" +
      "  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,\n" +
      "  element_anchor TEXT, -- XPath hash or semantic data-block ID\n" +
      "  body TEXT NOT NULL,\n" +
      "  score INT DEFAULT 0,\n" +
      "  is_deleted BOOLEAN DEFAULT FALSE,\n" +
      "  created_at TIMESTAMPTZ DEFAULT NOW(),\n" +
      "  updated_at TIMESTAMPTZ DEFAULT NOW()\n" +
      ");\n\n" +
      "-- 3. Upvotes & Ratings\n" +
      "CREATE TABLE votes (\n" +
      "  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,\n" +
      "  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,\n" +
      "  value SMALLINT CHECK (value IN (-1, 1)),\n" +
      "  PRIMARY KEY (comment_id, user_id)\n" +
      ");\n" +
      "```"
    ];
  }

  static p_bot_1() {
    return [
      "A common trap in web development is assuming that complex JavaScript will stop spam bots. Modern spam bots don't interact with your UI like a human—they open their browser dev tools once, find your endpoint (`POST /api/comments`), and script headless HTTP requests directly against it.",
      "Because our system allows frictionless commenting without mandatory email verification, we employ an **invisible, multi-tier defense shield** that filters automated spam without frustrating legitimate visitors."
    ];
  }

  static p_bot_2() {
    return [
      "Our defense stack combines three zero-friction layers:",
      "1. **Cloudflare Turnstile**: Free, silent browser sanity verification that runs in under 200ms without solving picture puzzles.\n" +
      "2. **Honeypot Traps**: Invisible form inputs (`<input name='website_url' tabindex='-1' style='display:none'>`) that bots automatically fill out, triggering immediate silent drops.\n" +
      "3. **Timing & Velocity Gates**: Rejects comments posted under 1.5 seconds from page load, and rate-limits IP addresses to 3 comments per minute."
    ];
  }

  static sidebar_bot_defense_matrix() {
    return [
      "Spam Defense Matrix:\n" +
      "• Turnstile Token: Verified silently on comment submission.\n" +
      "• Honeypot Field: Instant discard if filled.\n" +
      "• Time Threshold: Rejects robotic instantaneous submissions.\n" +
      "• Result: Clean comment threads without captcha annoyance for humans."
    ];
  }

  static p_cors_1() {
    return [
      "Because your frontend pages live on GitHub Pages (e.g. `yourname.github.io` or your custom domain `example.com`), all requests to the backend are **cross-origin**.",
      "The backend endpoint explicitly allows your domains via `Access-Control-Allow-Origin`. The client uses `@supabase/supabase-js` or lightweight standard `fetch` with preflight `OPTIONS` handling, enabling seamless commenting across any number of static sites or documentation chapters."
    ];
  }

  static sidebar_cors_configuration() {
    return [
      "Cross-Domain CORS Contract:\n" +
      "• Allowed Origins: `https://yourname.github.io`, `https://yourdomain.com`, `http://localhost:*`.\n" +
      "• Headers: `Content-Type`, `Authorization`, `apikey`.\n" +
      "• Methods: `GET`, `POST`, `PATCH`, `DELETE`, `OPTIONS`."
    ];
  }

  static p_supabase_steps_1() {
      return [
        "Setting up your live cloud database requires **zero server configuration, zero terminal commands, and zero monthly fees**. We use Supabase (hosted PostgreSQL) as the persistent backend.",
        "**How to configure your live database in under 3 minutes:**\n" +
        "1. Go to **supabase.com** and click 'Start your project' (sign in with your GitHub account) [1].\n" +
        "2. Click 'New Project', name it `community-db`, choose a secure password, and select your nearest region [1].\n" +
        "3. Once created, click the **SQL Editor** tab (the `>_` terminal icon) on the left sidebar [1].\n" +
        "4. Click **New Query**, paste the complete SQL script in the box below, and click **Run** [1]."
      ];
    }

  static p_supabase_steps_2() {
      return [
        "5. Finally, click **Project Settings** (gear icon) ➔ **API** [1].\n" +
        "   • Copy your **Project URL** (e.g. `https://xyzcompany.supabase.co`) [1].\n" +
        "   • Copy your **anon public key** (starts with `eyJ...`) [1].\n" +
        "6. Paste those two strings into your application config or the toolbar settings dialog.",
        "That's it! Your static GitHub Pages sites across any domain can now write and read comments, manage discriminator tags, and sync user reputation with sub-50ms latency globally [1, 3]."
      ];
    }
}

globalThis.CommentsApiContractContent = CommentsApiContractContent;
if (typeof module !== 'undefined' && module.exports) module.exports = CommentsApiContractContent;