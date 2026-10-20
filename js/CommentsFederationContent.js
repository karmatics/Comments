class CommentsFederationContent {
  static getMeta() {
    return {
      kicker: 'Decentralized Architecture & Network Effects',
      title: '7. Federation, Shared Reputation & The Network Effect',
      subtitle: 'Forkable standalone instances on GitHub Pages, federated cross-domain identity pools, and scaling to millions without centralized lock-in.'
    };
  }

  static manifest() {
    return [
      {
        section: 'forkable_standalone',
        partLabel: 'Chapter 7 • Decentralization',
        title: 'Frictionless Forkability: Anyone Can Run Their Own',
        blocks: [
          { id: 'p_forkable_1', type: 'p' },
          { id: 'p_forkable_2', type: 'p' },
          { id: 'sidebar_fork_blueprint', type: 'sidebar', kicker: 'Deployment Blueprint', title: 'The 1-Click GitHub Pages Forking Workflow' }
        ]
      },
      {
        section: 'shared_reputation_pool',
        partLabel: 'Chapter 7 • Network Effects',
        title: 'The Shared Identity Pool: Merging for Network Effects',
        blocks: [
          { id: 'p_fed_reputation_1', type: 'p' },
          { id: 'p_fed_reputation_2', type: 'p' },
          { id: 'sidebar_federated_auth', type: 'sidebar', kicker: 'Federation Protocol', title: 'Cross-Domain Cryptographic Identity Tokens' }
        ]
      },
      {
        section: 'scale_and_resilience',
        partLabel: 'Chapter 7 • Long-Term Resilience',
        title: 'Anti-Fragile Scaling: Free Start to Enterprise Scale',
        blocks: [
          { id: 'p_scale_1', type: 'p' },
          { id: 'p_scale_2', type: 'p' },
          { id: 'sidebar_scaling_economics', type: 'sidebar', kicker: 'Cost Analysis', title: 'Zero-Dollar Baseline to Viral Surge Economics' }
        ]
      }
    ];
  }

  static p_forkable_1() {
    return [
      "A fatal mistake of modern platform startups is forcing users to adopt their centralized walled garden from day one. When you are an independent creator or developer, demanding that people trust your central server is a barrier to adoption.",
      "Our system is designed for **Frictionless Forkability**. Anyone can fork the repository to their own GitHub account, enable GitHub Pages, plug in their own free Supabase or Cloudflare D1 database credentials, and host a 100% independent comment system with zero external dependencies and zero cost [1]."
    ];
  }

  static p_forkable_2() {
    return [
      "Because the client is entirely static HTML, CSS, and vanilla ES6 JavaScript, there are no build steps, no webpack configurations, and no local Node.js servers to keep running. Creators retain absolute ownership over their data, their domains, and their community styling."
    ];
  }

  static sidebar_fork_blueprint() {
    return [
      "The 1-Click Fork Blueprint:\n" +
      "1. Fork: Tap 'Fork' on GitHub.\n" +
      "2. Enable Pages: Point GitHub Pages to `main` branch or custom domain [1].\n" +
      "3. Config: Set your Supabase URL & anon key in `config.js` [1].\n" +
      "4. Launch: Instant live commenting across all your sites with zero server maintenance [1]."
    ];
  }

  static p_fed_reputation_1() {
    return [
      "At the same time, we solve the **Cold-Start Problem**. If every small blog maintains an isolated user database, users must re-authenticate everywhere, and bad actors can troll one site without consequences on another.",
      "We bridge this gap through a **Federated Identity & Shared Reputation Pool**. Independent instances can opt-in to a shared identity registry. If a user builds a high reputation for constructive discourse on Site A (e.g. verified contributions, helpful private coaching scores), Site B can query that trust score on their very first visit."
    ];
  }

  static p_fed_reputation_2() {
    return [
      "This unlocks massive network effects: creators get an independent comment system on their own domain, while users get a universal identity that carries their earned credibility everywhere they participate. And because identity is anchored cryptographically (via public/private keypairs or verifiable JWTs), no single party can revoke a user's earned reputation."
    ];
  }

  static sidebar_federated_auth() {
    return [
      "Federated Identity & Reputation Architecture:\n" +
      "• Cryptographic Identity: Users hold an ed25519 keypair; signatures verify authorship across domains.\n" +
      "• Opt-in Reputation Oracle: Sites query cross-domain trust scores (`GET /api/reputation?user_id=...`).\n" +
      "• Local Sovereignty: Individual site owners retain final moderation authority over their local threads.\n" +
      "• Portable History: A user's comment portfolio travels with them across the open web."
    ];
  }

  static p_scale_1() {
    return [
      "What happens if this system goes viral? In the old DreamHost PHP days, a sudden surge in traffic crashed the Apache server and triggered overage fees. In our architecture, the entire stack is **serverless and edge-distributed** [1].",
      "GitHub Pages serves static assets through Fastly CDN [2]; Cloudflare Turnstile screens bots across hundreds of edge data centers; and Supabase or Cloudflare D1 handles SQL queries with automatic connection pooling [1]."
    ];
  }

  static p_scale_2() {
    return [
      "You can go from five visitors a day to five hundred thousand visitors overnight without panicking. The free tier comfortably handles up to 50,000 monthly active users [1]. If traffic explodes beyond that, upgrading is a single click that costs a fraction of old dedicated server hardware, with zero downtime and zero database restructuring."
    ];
  }

  static sidebar_scaling_economics() {
    return [
      "Cost & Scale Comparison:\n" +
      "• Old Way (DreamHost PHP):\n" +
      "  - $20/month base cost, slow shared Apache server, crashes under traffic spikes.\n" +
      "• New Way (GitHub Pages + Cloudflare + Supabase):\n" +
      "  - $0/month for up to 50,000 active users and 500MB data (millions of comments) [1].\n" +
      "  - Sub-50ms response times globally from edge CDNs [1, 3].\n" +
      "  - Seamless upgrade to $25/month handles millions of pageviews automatically [1]."
    ];
  }
}

globalThis.CommentsFederationContent = CommentsFederationContent;
if (typeof module !== 'undefined' && module.exports) module.exports = CommentsFederationContent;