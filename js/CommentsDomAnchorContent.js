class CommentsDomAnchorContent {
  static getMeta() {
    return {
      kicker: 'In-Situ Spatial Feedback',
      title: '5. Universal DOM Anchoring & Aardvark',
      subtitle: 'Attaching comments to any DOM node: Aardvark traversal (Wider/Narrower), 32-bit invariant XPath hashing, floating gutter pills, and non-crossing boundary lines.'
    };
  }

  static manifest() {
      return [
        {
          section: 'addressing_overview',
          partLabel: 'Chapter 5 • Core Invariants',
          title: 'Beyond Page-Level Dumps: In-Situ Element Attachment',
          blocks: [
            { id: 'p_anchor_1', type: 'p' },
            { id: 'p_anchor_2', type: 'p' },
            { id: 'sidebar_locator_hierarchy', type: 'sidebar', kicker: 'Locator Resolution', title: 'The 4-Tier Resilient Locator Hierarchy' }
          ]
        },
        {
          section: 'live_insitu_thread',
          partLabel: 'Chapter 5 • Element-Attached Thread',
          title: 'Live Thread: Paragraph-Anchored Conversation',
          blocks: [
            { id: 'comp_insitu_thread_demo', type: 'component', component: 'CommentsInteractiveComponent', options: { threadId: 'quick_feedback', title: 'Attached Feedback Thread' } }
          ]
        },
        {
          section: 'aardvark_spatial',
          partLabel: 'Chapter 5 • Spatial Inspection',
          title: 'Aardvark Inspection: W (Wider) & N (Narrower)',
          blocks: [
            { id: 'p_aardvark_traversal_1', type: 'p' },
            { id: 'p_aardvark_traversal_2', type: 'p' },
            { id: 'sidebar_aardvark_shortcuts', type: 'sidebar', kicker: 'Keyboard Ergonomics', title: 'Single-Stroke Inspection Hotkeys' }
          ]
        },
        {
          section: 'visual_affordances',
          partLabel: 'Chapter 5 • Visual Affordances',
          title: 'Cyber-Cyan Outlines, Boundary Tethers & Navigation Docks',
          blocks: [
            { id: 'p_visual_cues_1', type: 'p' },
            { id: 'p_visual_cues_2', type: 'p' },
            { id: 'sidebar_tether_math', type: 'sidebar', kicker: 'Geometric Solver', title: '16-Pair Non-Crossing External Tangent Math' }
          ]
        }
      ];
    }
  static p_anchor_1() {
    return [
      "In standard web commenting (Disqus, WordPress, or generic blog plugins), all discussion is exiled to a graveyard at the bottom of the page. Readers must scroll back and forth to remember what section of text or diagram was being critiqued. This completely destroys context.",
      "Our system introduces **Universal In-Situ DOM Anchoring**. Comments do not belong to the page as an undifferentiated blob; they attach directly to the exact target element: a specific paragraph, a table cell, a code snippet, an SVG path, or an interactive canvas."
    ];
  }

  static p_anchor_2() {
      return [
        "The critical engineering challenge is **locator resilience across document revisions**. If an author edits a paragraph or adds a new heading, naive line-number or index-based locators break instantly.",
        "We solve this with our **4-Tier Resilient Locator Hierarchy** implemented in `CommentsDataRegistry.js` and `CommentsItemNotes.js`. The engine first searches for explicit semantic identifiers (`data-block`, `data-block-id`, `data-id`). If none exists, it evaluates persistent DOM IDs. If the target is an arbitrary text span or unlabelled container, it computes an invariant full XPath from `body`, hashing the string into a compact 32-bit alphanumeric token (`elem_p_a3b9f`)."
      ];
    }
  static sidebar_locator_hierarchy() {
    return [
      "The 4-Tier Resilient Locator Contract:\n" +
      "• Tier 1: Explicit `data-block` or `data-block-id` attribute (survives DOM refactors).\n" +
      "• Tier 2: Semantic element ID (filtering out transient widget prefixes like `uw_`).\n" +
      "• Tier 3: Invariant XPath Expression with 32-bit Bitwise Hash (`hash = ((hash << 5) - hash) + charCode`).\n" +
      "• Tier 4: Nearest semantic container traversal with text-snippet heuristic fallback."
    ];
  }

  static p_aardvark_traversal_1() {
      return [
        "To let users select any element without clicking miniature buttons or struggling with hit targets, we integrate **Aardvark** (`CommentsAardvark.js`).",
        "Activating Aardvark (via the header button or `Ctrl+Shift+A`) enters spatial inspection mode: a high-contrast cyber-cyan outline and `<tag>` label hover smoothly over elements as the mouse glides across the document. To select an entire section or parent container, the user simply taps **`W` (Wider)**. To drill back down into an individual sentence or badge, they tap **`N` (Narrower)**."
      ];
    }
  static p_aardvark_traversal_2() {
    return [
      "Once the desired element is highlighted, pressing **`C`** or **`M`** immediately locks the selection and opens the comment dialog. Selection locking ensures that the hover frame freezes in place, dialog controls receive exclusive focus, and background mouse motion no longer moves the target.",
      "Furthermore, right-clicking any element summons a contextual radial menu providing instant element breadcrumbs, note counts, in-situ paragraph editing (`E`), and selector copying (`T`)."
    ];
  }

  static sidebar_aardvark_shortcuts() {
    return [
      "Aardvark Keyboard Command Vocabulary:\n" +
      "• `W`: Traverse to Parent Node (Wider container).\n" +
      "• `N`: Traverse down history stack to Child Node (Narrower).\n" +
      "• `C` / `M` / `A`: Lock element & open Comment/Directive Dialog.\n" +
      "• `E`: Open In-Situ Paragraph Text Editor.\n" +
      "• `T`: Copy CSS/XPath patch template to clipboard.\n" +
      "• `Escape`: Unlock selection or exit inspection mode."
    ];
  }

  static p_visual_cues_1() {
    return [
      "Comments must not remain invisible until hovered. When an element possesses active comments or directives, it receives a **persistent cyber-cyan left border (`#00f2fe`) and a subtle ambient glow**. Hovering over the element reveals a floating glass pill with direct note counts and action buttons.",
      "If a dialog is opened to inspect or reply to a thread, the system connects the target DOM element to the dialog window using **Non-Crossing Outer Boundary Tethers**."
    ];
  }

  static p_visual_cues_2() {
    return [
      "Rather than drawing a crude straight line that cuts across other content, `_drawOuterCornerConnectors` executes an analytic 16-pair external common tangent solver between the element's bounding rectangle and the dialog's bounding rectangle. It finds the two external tangent lines that bound both boxes, rendering them as clean dashed cyan rays on a background SVG layer with zero obstruction of text.",
      "Finally, readers can tour all active comments sequentially using the **Hardware Bottom Dynamic Island Dock**: tapping `[` or `]` jumps smoothly from comment to comment across the entire document, expanding chapters and scrolling the viewport automatically."
    ];
  }

  static sidebar_tether_math() {
    return [
      "External Common Tangent Solver (Non-Crossing Rays):\n" +
      "• Evaluates all 16 candidate vertex pairs $(V_{A,i}, V_{B,j})$ between Rect A and Rect B.\n" +
      "• Cross-product orientation test: $\\text{cross}(p_1, p_2, p) = (x_2 - x_1)(y - y_1) - (y_2 - y_1)(x - x_1)$.\n" +
      "• A line is an external common tangent if and only if all vertices of both rectangles lie on the same side of the line $(\\text{sign} \\ge 0)$.\n" +
      "• Result: Exactly 2 boundary lines that frame the connection cleanly without intersecting the window body."
    ];
  }
}

globalThis.CommentsDomAnchorContent = CommentsDomAnchorContent;
if (typeof module !== 'undefined' && module.exports) module.exports = CommentsDomAnchorContent;