class CommentsAuthIdentityContent {
  static getMeta() {
    return {
      kicker: 'Identity & Frictionless Onboarding',
      title: '2. Identity: Anonymous-First & Discriminators',
      subtitle: 'Progressive profiling: commenting immediately without signup, seamless account claiming, and the Discord-style "Name #1042" discriminator system.'
    };
  }

  static manifest() {
      return [
        {
          section: 'anonymous_onboarding',
          partLabel: 'Chapter 2 • Onboarding',
          title: 'Frictionless Onboarding: Anonymous-First, Claim Later',
          blocks: [
            { id: 'p_anon_1', type: 'p' },
            { id: 'p_anon_2', type: 'p' },
            { id: 'sidebar_anon_lifecycle', type: 'sidebar', kicker: 'Session Flow', title: 'The Anonymous-to-Permanent Account Promotion' }
          ]
        },
        {
          section: 'live_identity_thread',
          partLabel: 'Chapter 2 • Working Thread',
          title: 'Live Thread: Testing Authors & Discriminators',
          blocks: [
            { id: 'comp_identity_thread_demo', type: 'component', component: 'CommentsInteractiveComponent', options: { threadId: 'design_critique', title: 'Design Feedback Thread' } }
          ]
        },
        {
          section: 'discriminator_system',
          partLabel: 'Chapter 2 • Discriminators',
          title: 'The "Dave #1042" Smart Discriminator System',
          blocks: [
            { id: 'p_discrim_1', type: 'p' },
            { id: 'p_discrim_2', type: 'p' },
            { id: 'sidebar_smart_display', type: 'sidebar', kicker: 'Display Algorithm', title: 'Smart Name Rendering: Muted vs. Highlighted Tags' }
          ]
        },
        {
          section: 'community_standalone_relation',
          partLabel: 'Chapter 2 • System Decoupling',
          title: 'Community as an Independent Document & Voting Ledger',
          blocks: [
            { id: 'p_community_doc_1', type: 'p' },
            { id: 'p_community_doc_2', type: 'p' },
            { id: 'sidebar_community_oracle_spec', type: 'sidebar', kicker: 'Oracle Architecture', title: 'CommunityOracle Contract for Comments & Voting' }
          ]
        },
        {
          section: 'name_renderer_upgrade',
          partLabel: 'Chapter 2 • Component Integration',
          title: 'NameRenderer: Author Avatars & Disambiguation',
          blocks: [
            { id: 'p_renderer_1', type: 'p' },
            { id: 'sidebar_name_renderer_spec', type: 'sidebar', kicker: 'Component Spec', title: 'NameRenderer Display Contract' }
          ]
        }
      ];
    }
  static p_anon_1() {
    return [
      "The single biggest killer of online discussion is the mandatory signup wall. Forcing a visitor to create an account, verify an email, and remember a password just to leave a quick question or thought causes over 80% of users to bounce.",
      "Our system adopts **Progressive Profiling & Anonymous-First Sessions**. When a visitor arrives at any of your pages, the client automatically requests a silent anonymous session. They are immediately assigned a unique persistent identifier stored in local cookies or storage. They can type a comment, submit it, and upvote immediately with zero registration friction."
    ];
  }

  static p_anon_2() {
    return [
      "Crucially, **the user does not lose their comment history if they register later**. Because modern cloud backends (like Supabase `signInAnonymously` and `updateUser`) preserve the underlying `user_id` when upgrading from anonymous to permanent credentials, the user can click 'Claim Account' days later, supply an email and password, and instantly inherit all their past comments, replies, and vote tallies without any database migration queries."
    ];
  }

  static sidebar_anon_lifecycle() {
    return [
      "Anonymous Session Lifecycle:\n" +
      "1. First Visit: Frontend initiates silent session (UUID: `u_8f2a...`).\n" +
      "2. Frictionless Comment: User posts under preferred display name (e.g. 'Dave'). Comment recorded with `author_id: u_8f2a...`.\n" +
      "3. Return Visits: Browser retains session token; user continues posting under the same identity.\n" +
      "4. Account Claiming: User enters email + password. Session updates in-place: `author_id` remains `u_8f2a...` with zero orphan records!"
    ];
  }

  static p_discrim_1() {
    return [
      "Traditional website registration forces users into agonizing username collisions: 'That username is taken, try Dave_88192'. This feels impersonal and robotic. Following the proven model popularized by Discord and Battle.net, we decouple the public display name from identity uniqueness using **Discriminator Tags**.",
      "Anyone can call themselves 'Dave'. When a user chooses 'Dave', the backend checks the highest discriminator tag currently assigned to that name (or generates a random 4-digit integer). The first user becomes `Dave #1001`, the next becomes `Dave #1002`, and so forth. Users always get their real name."
    ];
  }

  static p_discrim_2() {
    return [
      "The real elegance is in the **Smart Display Logic**. If a comment thread only contains one 'Dave', showing `#1001` everywhere adds visual clutter. Our rendering engine inspects all active participants on the page: if a display name is unique to the page, the numerical tag is displayed in a subtle, muted style (opacity 0.25).",
      "However, if two different people named 'Dave' participate in the same discussion (`Dave #1001` and `Dave #1004`), the system detects the collision in real time and highlights their tags in distinct colors. Readers never get confused, while solo names stay clean and unburdened."
    ];
  }

  static sidebar_smart_display() {
    return [
      "Smart Discriminator Display Logic:\n" +
      "• Step 1: Collect all `display_name` strings in the active thread.\n" +
      "• Step 2: Build a frequency map of names.\n" +
      "• Step 3 (No Conflict): Count is 1 ➔ Render `<span class='author'>Dave</span><span class='tag muted'>#1001</span>`.\n" +
      "• Step 4 (Collision Detected): Count > 1 ➔ Render `<span class='author'>Dave</span><span class='tag highlighted'>#1001</span>` with high-contrast accent color."
    ];
  }

  static p_renderer_1() {
    return [
      "In the copied legacy files, `js/comments/NameRenderer.js` was already responsible for drawing author badges and avatars. We upgrade `NameRenderer.js` to natively handle discriminator tags and conflict detection.",
      "By feeding the page's participant map into `NameRenderer.render(authorObj, hasConflict)`, the UI automatically applies the proper typography and badges without requiring changes to the comment tree components."
    ];
  }

  static sidebar_name_renderer_spec() {
    return [
      "Upgraded NameRenderer Contract:\n" +
      "```javascript\n" +
      "class NameRenderer {\n" +
      "  static render(author, options = {}) {\n" +
      "    const name = author.display_name || 'Anonymous';\n" +
      "    const tag = author.tag ? `#${author.tag}` : '';\n" +
      "    const isConflict = options.hasConflict || false;\n" +
      "    return `<span class='author-name'>${name}</span>` +\n" +
      "           `<span class='author-tag ${isConflict ? 'tag-conflict' : 'tag-muted'}'>${tag}</span>`;\n" +
      "  }\n" +
      "}\n" +
      "```\n" +
      "• Zero visual noise when usernames are unique.\n" +
      "• Instant disambiguation when collisions occur."
    ];
  }

  static p_community_doc_1() {
      return [
        "A core architectural requirement of this project is that **the Community part lives as a document and system of its own**. It is not an ad-hoc table inside the comments database.",
        "The `Community` application (`Community/src/CommunityApp.js` and `Community/src/CommunityOracle.js`) serves as the central identity, badge, and web-of-trust oracle. It tracks user credibility, authored proposals, and historical contributions independently of any single discussion thread."
      ];
    }

  static p_community_doc_2() {
      return [
        "This separation of concerns is vital because **identity also powers our upcoming voting systems** (Ranked Choice, Condorcet, Instant Runoff, and Minimax). When a user votes on a policy or rates a comment's prominence, the comments engine does not invent a local score—it queries `CommunityOracle.getReputationWeight(userId)`.",
        "By keeping `Community` independent, reputation travels across all applications: the same verified identity, tag, and reputation score govern blog comments, documentation annotations, and civic voting ballots alike."
      ];
    }

  static sidebar_community_oracle_spec() {
      return [
        "CommunityOracle Shared Architecture:\n" +
        "• Decoupled Ledger: Operates in `Community/src/CommunityOracle.js` and `Library/CommunityOracle.js`.\n" +
        "• Web-of-Trust Vectors: Computes numeric reputation weights (0.0 to 1.0) based on peer nods.\n" +
        "• Multi-App Integration:\n" +
        "  - In Comments: Scales upvote prominence and suppresses probationary spam.\n" +
        "  - In Voting: Weights pairwise Condorcet ballots and Instant Runoff transfers.\n" +
        "• Portable Identity: A user's earned standing is preserved universally."
      ];
    }
}

globalThis.CommentsAuthIdentityContent = CommentsAuthIdentityContent;
if (typeof module !== 'undefined' && module.exports) module.exports = CommentsAuthIdentityContent;