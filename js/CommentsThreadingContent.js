class CommentsThreadingContent {

  static getMeta() {
      return {
        kicker: 'Tree Data Structures & Prominence Hierarchy',
        title: '3. Trees, Prominence & Weighted Reputation',
        subtitle: 'Recursive comment trees via CommentNode.js, collapsible thread views, and visual prominence scaling based on a Google PageRank reputation spectrum.'
      };
    }

  static manifest() {
      return [
        {
          section: 'interactive_demo_section',
          partLabel: 'Chapter 3 • Live Laboratory',
          title: 'Live Interactive Comment Thread Simulator',
          blocks: [
            { id: 'comp_comments_interactive_demo', type: 'component', component: 'CommentsInteractiveComponent' }
          ]
        },
        {
          section: 'tree_structure',
          partLabel: 'Chapter 3 • Data Model',
          title: 'Recursive Threading: CommentNode.js',
          blocks: [
            { id: 'p_tree_1', type: 'p' },
            { id: 'p_tree_2', type: 'p' },
            { id: 'sidebar_tree_structure', type: 'sidebar', kicker: 'Tree Contract', title: 'Adjacency Lists to Hierarchical Comment Trees' }
          ]
        },
        {
          section: 'prominence_mechanics',
          partLabel: 'Chapter 3 • Reputation Spectrum',
          title: 'Prominence Over Upvote Counts: The PageRank Model',
          blocks: [
            { id: 'p_voting_1', type: 'p' },
            { id: 'p_voting_2', type: 'p' },
            { id: 'sidebar_voting_rules', type: 'sidebar', kicker: 'Prominence Spectrum', title: 'Why Upvotes Are Not Equal: Defending Against Vote Farms' }
          ]
        }
      ];
    }
  static p_tree_1() {
    return [
      "Flat comment sections turn discussions into chaotic shouting matches where nobody knows who is replying to whom. In our architecture, discussion threads are modeled as **hierarchical trees** powered by `CommentNode.js`.",
      "In the database, comments are stored as an **Adjacency List**: every comment record contains an `id` and an optional `parent_id`. When loading a thread for a page, the client receives the flat array of comments and transforms them in memory into a tree graph using an $O(N)$ hash-map traversal."
    ];
  }

  static p_tree_2() {
      return [
        "In `CommentThreadView.js`, each node renders with clean visual indentation, author avatar indicators, timestamp relative readouts ('3 hours ago'), and collapsible fold toggles. If a sub-thread becomes lengthy or off-topic, users can click the thread collapse bar to minimize fifty replies into a compact single-line summary with zero DOM re-querying.",
        "Above, the interactive laboratory mounts your **authentic `Comments.js`, `CommentNode.js`, `CommentThreadView.js`, and `RatingPanel.js`** using `MockServerAPI`. Every fold toggle, reply bar, and upvote button functions with full fidelity, demonstrating the exact interaction mechanics you built."
      ];
    }
  static sidebar_tree_structure() {
    return [
      "Adjacency List Tree Builder ($O(N)$):\n" +
      "```javascript\n" +
      "function buildCommentTree(flatComments) {\n" +
      "  const map = new Map();\n" +
      "  const roots = [];\n" +
      "  flatComments.forEach(c => map.set(c.id, { ...c, children: [] }));\n" +
      "  flatComments.forEach(c => {\n" +
      "    if (c.parent_id && map.has(c.parent_id)) {\n" +
      "      map.get(c.parent_id).children.push(map.get(c.id));\n" +
      "    } else {\n" +
      "      roots.push(map.get(c.id));\n" +
      "    }\n" +
      "  });\n" +
      "  return roots;\n" +
      "}\n" +
      "```\n" +
      "• Instant recursive rendering.\n" +
      "• Preserves reply nesting without recursive SQL queries."
    ];
  }

  static p_voting_1() {
      return [
        "Traditional web forums reduce feedback to a single naive number: an upvote counter. This encourages gamification, click-farming, and brigading. On the web, **votes are not equal**.",
        "In our architecture, what commenters are competing for is not an arbitrary tally, but **Prominence**. A comment's prominence dictates how it is presented to readers: high-prominence comments are rendered in full crisp typography with expanded replies, inviting readers into high-quality discussion. In contrast, low-prominence comments shrink down, fade in opacity, and can be collapsed into compact group lines ('14 comments with low prominence collapsed here')."
      ];
    }

  static p_voting_2() { return [
      "Our rating system is inspired by **Google's PageRank algorithm**. Just as links from authoritative websites carry vastly more weight than links from spam directories, ratings from established, reputable community members dramatically influence a comment's prominence. An upvote from a well-regarded community veteran elevates a post into clear view, whereas hundreds of thumbs-up from unverified throwaway accounts or newly arrived sockpuppets are heavily discounted.",
      "This defends completely against 'vote farms' and coordinated brigading. Furthermore, brand new arrivals start in a probationary state: their comments remain unobtrusive until they receive a validating nod from a reputable contributor, protecting threads from spam floods without requiring draconian sign-up barriers."
    ] }

  static sidebar_voting_rules() {
      return [
        "The Prominence & PageRank Axioms:\n" +
        "• Currency is Prominence: The goal of discourse is being read, not accumulating vanity counts.\n" +
        "• Weighted Ratings: Upvotes are evaluated on a spectrum based on the rater's earned community credibility.\n" +
        "• Anti-Vote-Farm Defense: Sockpuppets and newly minted accounts cannot artificially elevate content.\n" +
        "• Probationary Dampening: New arrivals are muted in size until affirmed by reputable members.\n" +
        "• Visual Hierarchy: High-quality threads show ~12 prominent anchor comments, while lower-tier replies collapse gracefully."
      ];
    }
}

globalThis.CommentsThreadingContent = CommentsThreadingContent;
if (typeof module !== 'undefined' && module.exports) module.exports = CommentsThreadingContent;