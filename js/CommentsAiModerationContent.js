class CommentsAiModerationContent {

  static getMeta() {
      return {
        kicker: 'Intelligent Community Governance & Exploration',
        title: '6. AI Moderation & The Prominence Spectrum',
        subtitle: 'Human moderator visibility dials today, an exploratory AI coaching roadmap tomorrow, and a spectrum of comment prominence inspired by Google PageRank.'
      };
    }

  static manifest() {
      return [
        {
          section: 'coaching_simulator_section',
          partLabel: 'Chapter 6 • Interactive Laboratory',
          title: 'Live Private Feedback & AI Coaching Simulator (UI Preview)',
          blocks: [
            { id: 'comp_ai_feedback_demo', type: 'component', component: 'CommentsAiDictationSimulatorComponent' }
          ]
        },
        {
          section: 'beyond_binary_bans',
          partLabel: 'Chapter 6 • The Philosophy',
          title: 'A Visual Spectrum of Prominence: Moving Beyond Binary Bans',
          blocks: [
            { id: 'p_mod_philosophy_1', type: 'p' },
            { id: 'p_mod_philosophy_2', type: 'p' },
            { id: 'sidebar_nuance_matrix', type: 'sidebar', kicker: 'Prominence Tiers', title: 'The Visual Prominence Spectrum' }
          ]
        },
        {
          section: 'human_today_ai_future',
          partLabel: 'Chapter 6 • Dual Architecture',
          title: 'Moderator Controls Now, Speculative AI Exploration Ahead',
          blocks: [
            { id: 'p_private_channel_1', type: 'p' },
            { id: 'p_private_channel_2', type: 'p' },
            { id: 'sidebar_private_feedback_schema', type: 'sidebar', kicker: 'System Status', title: 'Functional Today vs. Planned AI Roadmap' }
          ]
        },
        {
          section: 'ai_coach_loop',
          partLabel: 'Chapter 6 • The Developer Invitation',
          title: 'Building Out the UI First: An Invitation to Contributors',
          blocks: [
            { id: 'p_ai_coach_1', type: 'p' },
            { id: 'p_ai_coach_2', type: 'p' },
            { id: 'sidebar_coaching_prompt_cycle', type: 'sidebar', kicker: 'Roadmap Loop', title: 'The Human Moderator ↔ AI Supervisor Feedback Loop' }
          ]
        }
      ];
    }

  static p_mod_philosophy_1() {
      return [
        "Traditional online moderation is broken because it relies on blunt, binary instruments: you either let a comment stand, or you delete it and ban the user. This creates toxic dynamics where moderators act like heavy-handed censors, while trolls simply create fresh accounts to evade bans.",
        "Our system replaces binary bans with an **Adjustable Prominence Spectrum**. Instead of yes-or-no deletion, every comment has a prominence dial. Comments can be full-scale, slightly subdued, compacted, or collapsed entirely into a placeholder notice ('8 comments with lower prominence collapsed here'). Readers looking for high-quality discussion see a curated dozen of the best entries leading them into the conversation, while noise is gracefully dampened."
      ];
    }

  static p_mod_philosophy_2() {
      return [
        "Prominence is modulated by several continuous factors:",
        "• **Author Standing & Probation:** First-time arrivals or unverified contributors cannot flood a community; their comments begin at low prominence until they receive a validating nod from a reputable peer.\n" +
        "• **Moderator Adjustment:** Human moderators have direct prominence sliders in the UI right now to dial a comment's visibility up or down without harsh censorship.\n" +
        "• **PageRank-Style Reputation:** Feedback from trusted veterans elevates a comment significantly, while votes from unvetted accounts or suspected 'link farms' are filtered out.\n" +
        "• **AI Coaching (Planned Roadmap):** In the future, background AI evaluation can assist moderators by spotting bad faith or abusive patterns and recommending prominence adjustments automatically."
      ];
    }

  static sidebar_nuance_matrix() {
      return [
        "The Visual Prominence Spectrum:\n" +
        "• High Prominence (Hero): Full font size, crisp typography, default expanded replies. Reserved for high-value insights.\n" +
        "• Standard Prominence: Normal comment view, accessible to all regular readers.\n" +
        "• Diminished Prominence: Subdued font, reduced opacity, replies collapsed by default. Applied to probationary arrivals or unconstructive tone.\n" +
        "• Compact Collapsed Line: Folded into a single-line summary with click-to-expand option.\n" +
        "• Zero Prominence: Filtered out completely (spam/bots via Cloudflare Turnstile)."
      ];
    }

  static p_private_channel_1() {
      return [
        "It is important to clearly distinguish between **what works today** and **our future AI roadmap**.",
        "Today, the prominence system is fully operable via human moderator controls. Any moderator or site owner can open a comment's feedback panel, slide its prominence from 100% down to 20%, and immediately see the visual representation adjust. The client handles the styling and layout gracefully right now."
      ];
    }

  static p_private_channel_2() {
      return [
        "Meanwhile, the **automated AI pipeline is a planned, speculative architecture**. We do not yet know the exact LLM agent design that will govern long-term automated scoring, nor do we mandate that every deployment run an expensive AI inference server.",
        "Instead, we treat the AI system in this specification as a forward-looking design blueprint. We deliberately build out the full user interface—the microphone voice dictation, the private whisper channel, and the feedback review modals—so that the UI is complete, operable, and ready to be connected whenever the backend AI pipeline is finalized."
      ];
    }

  static sidebar_private_feedback_schema() {
      return [
        "Current Implementation vs. Speculative AI Roadmap:\n" +
        "• Implemented & Functional Now:\n" +
        "  - Human moderator prominence sliders.\n" +
        "  - Multi-tier visual comment dampening.\n" +
        "  - Complete UI dialogs, voice dictation widget, and private feedback forms.\n" +
        "• Speculative Planned Roadmap:\n" +
        "  - Automated LLM-based sentiment & tone evaluation.\n" +
        "  - Dynamic PageRank matrix calculation across federated reputation pools.\n" +
        "  - Automated private coaching whispers dispatched to commenters."
      ];
    }

  static p_ai_coach_1() {
      return [
        "Building out the complete user interface before the AI backend is fully cemented is an intentional architectural strategy. It serves as an **open invitation to developers, researchers, and community managers**.",
        "When developers see a functional, well-crafted UI with voice dictation, private whisper channels, and prominence toggles, they immediately grasp the vision: *'I could plug in an Anthropic or OpenAI API endpoint right here, run a background cron job on Supabase Edge Functions, and calculate PageRank reputation weights.'*"
      ];
    }

  static p_ai_coach_2() {
      return [
        "By delivering a practical, production-ready comment widget for today while laying down the speculative UI tracks for tomorrow's AI, this project avoids the trap of vaporware: it is immediately useful as a static commenting engine, while providing the conceptual launching pad for the next decade of intelligent community discourse."
      ];
    }

  static sidebar_coaching_prompt_cycle() {
      return [
        "The Developer Exploration Cycle:\n" +
        "1. Usable Utility Today: Human moderators use prominence sliders to curate discussion.\n" +
        "2. Live UI Sandboxes: Developers test dictation and private whisper feedback in-situ.\n" +
        "3. Open Specification: Community contributes algorithms for weighted PageRank reputation.\n" +
        "4. Modular Integration: Site owners flip a switch to enable automated AI coaching when ready."
      ];
    }
}

globalThis.CommentsAiModerationContent = CommentsAiModerationContent;
if (typeof module !== 'undefined' && module.exports) module.exports = CommentsAiModerationContent;