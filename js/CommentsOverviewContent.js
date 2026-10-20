class CommentsOverviewContent {
  static getMeta() {
    return {
      kicker: 'The Universal Comment System',
      title: '0. Architecture & Modern Horizon',
      subtitle: 'A modern, internet-connected commenting engine: frictionless anonymous onboarding, Discord-style discriminator naming, recursive threading, in-situ element anchoring, and AI community coaching.'
    };
  }

  static manifest() {
    return [
      {
        section: 'vision_core',
        partLabel: 'Chapter 0 • System Blueprint',
        title: 'The Modern Decentralized Commenting Engine',
        blocks: [
          { id: 'p_overview_1', type: 'p' },
          { id: 'p_overview_2', type: 'p' },
          { id: 'sidebar_core_pillars', type: 'sidebar', kicker: 'System Pillars', title: 'The 6 Non-Negotiable Invariants' }
        ]
      },
      {
        section: 'decoupled_edge',
        partLabel: 'Chapter 0 • Infrastructure',
        title: 'Zero Local Server Overhead: Cloud-Native & Static',
        blocks: [
          { id: 'p_edge_1', type: 'p' },
          { id: 'p_edge_2', type: 'p' },
          { id: 'sidebar_edge_specs', type: 'sidebar', kicker: 'Deployment Stack', title: 'GitHub Pages + Cloudflare Turnstile + Supabase' }
        ]
      }
    ];
  }

  static p_overview_1() {
    return [
      "Online commenting systems are universally disliked. They fall into two failed extremes: either bloated third-party widgets (Disqus, Facebook Comments) that track visitors and dump unformatted text at the bottom of the page, or bare-bones forms that require manual accounts and devolve into spam.",
      "We are building a **Universal, Open-Source Commenting Engine** designed for creators, bloggers, and documentation sites. It runs directly from static GitHub Pages or custom domains, attaches comments in-situ to specific sentences or diagrams, and connects to an internet-wide database with zero monthly hosting fees [1]."
    ];
  }

  static p_overview_2() {
      return [
        "This living specification serves two missions:",
        "1. **Drop-in Forkability & Immediate Utility:** Anyone can fork this repository to GitHub Pages, insert their database credentials, and immediately host their own styled comment system with zero server management [1]. Moderators receive intuitive controls to dial comment visibility up or down on the fly.\n" +
        "2. **Prominence Spectrum & The Speculative AI Horizon:** Rather than reducing user engagement to crude upvote counters, our rating architecture is modeled on a **spectrum of prominence** akin to Google PageRank. We build out UI surfaces for AI community coaching and reputation weighting in advance—allowing developers to explore and build out smart moderation logic while site owners retain full manual control today."
      ];
    }

  static sidebar_core_pillars() {
      return [
        "The 6 Core Invariants:\n" +
        "• 1. Anonymous-First Sessions: Comment immediately without signup; claim accounts later with zero lost history.\n" +
        "• 2. Discriminator Naming: Discord-style 'Dave #1042' tags that stay muted unless multiple Daves are in the thread.\n" +
        "• 3. Prominence Spectrum: Comments adjust visually (size, opacity, collapse) based on moderator review and PageRank reputation.\n" +
        "• 4. Universal In-Situ Anchoring: Aardvark element selection with resilient 32-bit XPath hashing.\n" +
        "• 5. Speculative AI Coaching: UI affordances for private AI coaching, built to inspire developer contributions.\n" +
        "• 6. Zero-Dollar Cloud Stack: Runs on GitHub Pages + Cloudflare Turnstile + Supabase free tier [1]."
      ];
    }
  static p_edge_1() {
    return [
      "A primary architectural rule is that **this project does not require a local Node.js server or custom backend container**. The client is 100% pure vanilla JavaScript, HTML, and CSS that compiles to static assets.",
      "All persistent operations (storing comments, reading threads, toggling upvotes) communicate across the open internet to a serverless backend. This means your comment system works everywhere: on personal portfolio pages, static documentation, documentation readers, or native apps."
    ];
  }

  static p_edge_2() {
    return [
      "Because the frontend is static and the backend is serverless, you never worry about traffic spikes [1]. If a post goes viral on Hacker News or Reddit, edge CDNs cache the static shell, Cloudflare Turnstile screens automated bots silently, and Supabase manages database connection pooling without server crashes [1, 3]."
    ];
  }

  static sidebar_edge_specs() {
    return [
      "Zero-Overhead Stack Breakdown:\n" +
      "• Frontend Hosting: GitHub Pages with custom domain and automatic SSL ($0) [1].\n" +
      "• Bot Defense: Cloudflare Turnstile (silent token check, replaces captchas) ($0).\n" +
      "• Database & Auth: Supabase (PostgreSQL with Row-Level Security, anonymous sessions) ($0 up to 50k MAU) [1].\n" +
      "• Total Starting Cost: $0/month [1]."
    ];
  }
}

globalThis.CommentsOverviewContent = CommentsOverviewContent;
if (typeof module !== 'undefined' && module.exports) module.exports = CommentsOverviewContent;