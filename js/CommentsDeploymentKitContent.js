class CommentsDeploymentKitContent {
  static getMeta() {
    return {
      kicker: '1-Click Export & Site Drop-In',
      title: '8. Drop-In Deployment Kit & Prompt Generator',
      subtitle: 'Paste into any website or LLM: complete standalone frontend code, Supabase PostgreSQL schema, and pre-packaged configuration prompts.'
    };
  }

  static manifest() {
    return [
      {
        section: 'prompt_generator_section',
        partLabel: 'Chapter 8 • 1-Click Kit',
        title: 'The Master Deployment Prompt & Code Generator',
        blocks: [
          { id: 'comp_prompt_generator', type: 'component', component: 'CommentsPromptGeneratorComponent' }
        ]
      },
      {
        section: 'site_integration',
        partLabel: 'Chapter 8 • Integration',
        title: '3-Minute Site Drop-In: Zero Server Overhead',
        blocks: [
          { id: 'p_deploy_1', type: 'p' },
          { id: 'p_deploy_2', type: 'p' },
          { id: 'sidebar_integration_steps', type: 'sidebar', kicker: 'Quick Start', title: '3-Step Setup for Any GitHub Pages Site' }
        ]
      }
    ];
  }

  static p_deploy_1() {
      return [
        "The primary deliverable of this entire specification is that **anyone can paste it into an LLM or drop it into their own website and have it immediately work**.",
        "You do not have to write server code, manage database connection pools, or configure Node.js runtimes. The generator above produces a complete, self-contained payload containing the SQL schema, security policies, and HTML embed code.",
        "An LLM agent reading this specification can immediately generate the full client embed, set up the Supabase or Cloudflare D1 database, configure the `CommunityOracle` identity mappings, and mount the comments widget anywhere across the web."
      ];
    }
  static p_deploy_2() {
    return [
      "Because the client is modular and handles optimistic UI updates, your comments load instantaneously. Readers can reply, vote, collapse threads, and attach feedback with full fidelity across any domain."
    ];
  }

  static sidebar_integration_steps() {
    return [
      "3-Step Integration Flow:\n" +
      "1. Run SQL: Paste the generated DDL into your free Supabase SQL editor [1].\n" +
      "2. Embed HTML: Drop `<div id='comments-container'></div>` into your page template.\n" +
      "3. Configure URL: Supply your Supabase project URL and anon public key [1].\n" +
      "• Instant live commenting with zero server maintenance [1]."
    ];
  }
}

globalThis.CommentsDeploymentKitContent = CommentsDeploymentKitContent;
if (typeof module !== 'undefined' && module.exports) module.exports = CommentsDeploymentKitContent;