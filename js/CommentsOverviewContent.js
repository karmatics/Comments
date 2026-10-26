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
          section: 'interactive_hero_thread',
          partLabel: 'Chapter 0 • Live Discussion Sandbox',
          title: 'Live Interactive Comment Thread (Connected to Community Oracle)',
          blocks: [
            { id: 'comp_hero_comments_demo', type: 'component', component: 'CommentsInteractiveComponent', options: { threadId: 'main', title: 'Community Discussion Thread' } }
          ]
        },
        {
          section: 'active_roadmap',
          partLabel: 'Chapter 0 • System Status & Roadmap',
          title: 'Active Development Directives: What Is Done & Outstanding Work',
          blocks: [
            { id: 'p_roadmap_1', type: 'p' },
            { id: 'sidebar_active_roadmap', type: 'sidebar', kicker: 'Engineering Status', title: 'Status Tracker: Complete vs. In-Flight Milestones' },
            { id: 'p_roadmap_2', type: 'p' }
          ]
        },
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
          section: 'meta_explanation',
          partLabel: 'Chapter 0 • Meta Architecture',
          title: 'Comments vs. Notes: The Dual-Layer Human & Agent Workflow',
          blocks: [
            { id: 'p_meta_concept_1', type: 'p' },
            { id: 'p_meta_concept_2', type: 'p' },
            { id: 'sidebar_meta_distinction', type: 'sidebar', kicker: 'Architecture Invariant', title: 'Conversation Comments vs. Spec Directives' }
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

  static p_roadmap_1() {
    return [
      "We are executing a strict non-redundant, modern-only architectural mandate. All legacy DreamHost PHP scripts, monolithic CAD archives, and backward-compatibility wrappers have been retired and purged.",
      "The Comments project now stands as the single, authoritative home for both the embeddable commenting engine and its living architectural specification. Rather than splitting documentation from code, opening Comments directly presents the DocumentReader living spec, complete with real interactive comment sandboxes, Community user switching, and prompt compilation tools."
    ];
  }

  static sidebar_active_roadmap() {
    return [
      "Active Engineering Status & Outstanding Milestones:\n" +
      "• ✅ Phase 1: Architectural Consolidation (COMPLETED)\n" +
      "  - Purged obsolete CommentsDocs directory and all CAD debris.\n" +
      "  - Fixed sidebar safe-area margins (no overlapping text).\n" +
      "  - CommunityOracle established as single identity & reputation oracle.\n" +
      "• 🟡 Phase 2: Serverless Network Transport (IN FLIGHT)\n" +
      "  - Retiring legacy ServerAPI PHP actions in favor of Supabase REST/RLS.\n" +
      "  - Implementing automated anonymous session token creation via Supabase Auth.\n" +
      "• 🟡 Phase 3: PageRank Prominence Matrix (IN FLIGHT)\n" +
      "  - Live UI sliders operational; wiring mathematical weighted eigenvector calculation.\n" +
      "  - Dynamic dampening of probationary accounts until validated by trusted peers.\n" +
      "• 🔵 Phase 4: 1-Tag Cross-Domain Embed Bundle (UP NEXT)\n" +
      "  - Standalone <script src='.../CommentsEmbed.js'> bundle for 1-line website drop-ins."
    ];
  }

  static p_roadmap_2() {
    return [
      "Outstanding development is focused on finalizing the serverless cloud transport (`ServerAPI.js` transitioning to the PostgreSQL contract in Chapter 4) and hardening the PageRank reputation calculations.",
      "Community identity management is completely decoupled: Comments serves as a client to `CommunityOracle`, ensuring that user profiles, badges, discriminator tags (#1001, #1042), and reputation scores travel universally across threads without redundant account databases."
    ];
  }

  static p_meta_concept_1() {
      return [
        "To build an application that an AI agent and human developer can iterate on indefinitely, we must make a foundational architectural distinction: **User Conversation Comments** are not the same thing as **Specification Notes (Directives)**.",
        "**User Conversation Comments** represent the product itself. They are the public, threaded discussion nodes (`CommentNode.js`) where readers discuss an article, ask questions, reply directly to one another, and adjust comment prominence. They are stored in the database, indexed by thread and parent IDs, and visible to the community."
      ];
    }

  static p_meta_concept_2() {
      return [
        "**Specification Notes (Directives)**, by contrast, are the meta-engineering tools used by the author and LLM to build and refine the specification. When a human reviews this living document, they can click on any paragraph, heading, canvas stage, or component and attach an **in-situ directive** via Aardvark (`CommentsAardvark.js` and `CommentsItemNotes.js`).",
        "These directives capture exact XPath locators, code contexts, and voice notes. They feed directly into Luno's Outbox (`OutboxQueue.js`), allowing an AI agent to read the human's directives in sequence, rewrite the underlying source methods, and compile surgical patches straight back into the files. Yes, it gets beautifully meta: we use in-situ note tools to collaboratively build and refine a comment system!"
      ];
    }

  static sidebar_meta_distinction() {
      return [
        "The Dual-Layer Architecture:\n" +
        "• 1. Layer 1: Conversation Comments (The Public Product):\n" +
        "  - Hierarchical trees (`CommentThreadView.js`).\n" +
        "  - Direct user-to-user replies with temporary composition boxes.\n" +
        "  - Prominence ratings weighted by `CommunityOracle` reputation.\n" +
        "  - Identity disambiguation via Discord-style `#1042` discriminator tags.\n" +
        "• 2. Layer 2: Living Spec Notes / Directives (The Builder Meta-Layer):\n" +
        "  - Pinned directly to DOM blocks, code blocks, or components via Aardvark (`C` / `M`).\n" +
        "  - Voice dictation with automated punctuation and tag chips (`💡 Idea`, `🐛 Fix`).\n" +
        "  - Compiled directly into Luno Outbox prompts for instant agent self-upgrades."
      ];
    }
}

globalThis.CommentsOverviewContent = CommentsOverviewContent;
if (typeof module !== 'undefined' && module.exports) module.exports = CommentsOverviewContent;