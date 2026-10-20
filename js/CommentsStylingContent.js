class CommentsStylingContent {
  static getMeta() {
    return {
      kicker: 'Customization & Ergonomics',
      title: '1. Styling, Theming & Micro-Threads',
      subtitle: 'CSS variable tokens, instant theme switching (Dark Obsidian, Clean Light, Cyber Cyan, Minimal Paper), and compact micro-threads vs. full boards.'
    };
  }

  static manifest() {
    return [
      {
        section: 'interactive_styling_lab',
        partLabel: 'Chapter 1 • Interactive Studio',
        title: 'Live Theming & Micro-Thread Viewport',
        blocks: [
          { id: 'comp_styling_lab', type: 'component', component: 'CommentsStylingLabComponent' }
        ]
      },
      {
        section: 'theming_architecture',
        partLabel: 'Chapter 1 • CSS Variables',
        title: 'Theme Customization via CSS Tokens',
        blocks: [
          { id: 'p_style_1', type: 'p' },
          { id: 'p_style_2', type: 'p' },
          { id: 'sidebar_css_variables', type: 'sidebar', kicker: 'CSS Variables', title: 'Complete CommentStyles Token Map' }
        ]
      },
      {
        section: 'micro_threads',
        partLabel: 'Chapter 1 • Compact Layouts',
        title: 'Micro-Threads: Targeted In-Situ Commenting',
        blocks: [
          { id: 'p_micro_1', type: 'p' },
          { id: 'p_micro_2', type: 'p' },
          { id: 'sidebar_micro_usecases', type: 'sidebar', kicker: 'Layout Modes', title: 'Compact Gutter vs. Rich Discussion Board' }
        ]
      }
    ];
  }

  static p_style_1() {
    return [
      "Every website has its own visual identity. A dark technical documentation site needs high-contrast obsidian cards with neon accents; an architectural publication needs warm, serif typography; and an engineering dashboard requires compact, high-density monospace tables.",
      "In `CommentStyles.js`, our system is entirely driven by **CSS Custom Properties (Variables)**. Instead of hardcoding hex colors into UI components, all backgrounds, borders, active states, text colors, and thread lines are defined through clean variables that you can override in three lines of CSS."
    ];
  }

  static p_style_2() {
    return [
      "In the interactive laboratory above, you can toggle between four production presets:",
      "1. **Dark Obsidian:** Deep obsidian slate (`#070a13`) with electric cyan accents and glowing thread lines.\n" +
      "2. **Clean Light:** Bright paper white (`#ffffff`) with subtle gray borders and high-legibility dark typography.\n" +
      "3. **Cyber Cyan:** High-tech blue-purple gradient backgrounds with high-saturation cyan indicators.\n" +
      "4. **Minimalist Paper:** Warm bookmaker cream (`#faf7f2`) with serif fonts and subtle amber highlights."
    ];
  }

  static sidebar_css_variables() {
    return [
      "CommentStyles CSS Variable Tokens:\n" +
      "```css\n" +
      ":root {\n" +
      "  --comment-bg: #0d1117;\n" +
      "  --comment-card-bg: rgba(255, 255, 255, 0.03);\n" +
      "  --comment-border: #232d3f;\n" +
      "  --comment-text: #f8fafc;\n" +
      "  --comment-muted: #94a3b8;\n" +
      "  --comment-accent: #00f2fe;\n" +
      "  --comment-thread-line: rgba(56, 189, 248, 0.4);\n" +
      "  --comment-font: system-ui, sans-serif;\n" +
      "}\n" +
      "```\n" +
      "• Instant rebranding by overriding root variables.\n" +
      "• Dynamic dark/light mode synchronization."
    ];
  }

  static p_micro_1() {
    return [
      "Not every comment section needs to look like a full-width forum. When commenting on a documentation sentence, a code function, or an image hotspot, users need a **Micro-Thread**.",
      "A Micro-Thread is a compact, floating card containing 1 to 3 comments that docks directly beside the targeted element. It preserves the full tree hierarchy, reply form, and upvoting, but takes up minimal screen space."
    ];
  }

  static p_micro_2() {
    return [
      "When more participants join and the discussion expands, the card smoothly transitions into an expanded thread view with collapsible replies, ensuring the reader never loses their place in the primary document."
    ];
  }

  static sidebar_micro_usecases() {
    return [
      "Layout Modalities:\n" +
      "• Modality A (Micro-Thread Gutter): Compact 320px width, docked beside paragraphs, auto-closing on blur.\n" +
      "• Modality B (Embedded Discussion Board): Full-width container at section ends, showing multi-level reply trees and toolbar.\n" +
      "• Modality C (Modal Dialogue): Popped out in an in-process window for lengthy collaborative editing."
    ];
  }
}

globalThis.CommentsStylingContent = CommentsStylingContent;
if (typeof module !== 'undefined' && module.exports) module.exports = CommentsStylingContent;