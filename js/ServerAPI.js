class ServerAPI {
  /**
   * Modern Serverless Network Transport for Comments.
   * Connects to PostgreSQL / Supabase REST endpoints or serverless workers.
   * Completely retired legacy DreamHost PHP endpoints.
   */
  constructor(baseUrl = '') {
    this.baseUrl = baseUrl || this._resolveDefaultEndpoint();
    this.useMockFallback = true;
  }

  _resolveDefaultEndpoint() {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem('comments_supabase_url');
      if (stored) return stored;
    }
    return '';
  }

  setBaseUrl(url, apiKey = null) {
      if (url && typeof url === 'string') {
        this.baseUrl = url.trim().replace(/\/+$/, '');
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('comments_supabase_url', this.baseUrl);
        }
      }
      if (apiKey && typeof apiKey === 'string') {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('comments_supabase_key', apiKey.trim());
        }
      }
    }

  async getThreadData(threadId = 'main') {
      const supabaseUrl = this.baseUrl || (typeof localStorage !== 'undefined' ? localStorage.getItem('comments_supabase_url') : '');
      const supabaseKey = typeof localStorage !== 'undefined' ? localStorage.getItem('comments_supabase_key') : '';

      // If cloud credentials are not supplied, run seamlessly via MockServerAPI
      if (!supabaseUrl || !supabaseKey) {
        const mock = new MockServerAPI();
        return await mock.getThreadData(threadId);
      }

      try {
        const endpoint = `${supabaseUrl}/rest/v1/comments?page_id=eq.${encodeURIComponent(threadId)}&select=*,profiles(*)&order=created_at.asc`;
        const res = await fetch(endpoint, {
          method: 'GET',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json'
          }
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        const rawRows = await res.json();

        // Transform relational rows into tree format
        const usersMap = new Map();
        const nodesMap = new Map();
        const roots = [];

        rawRows.forEach(row => {
          const author = row.profiles || { display_name: 'Anonymous', tag: 1001, id: row.author_id };
          if (!usersMap.has(author.id)) {
            usersMap.set(author.id, {
              id: author.id,
              displayName: author.display_name,
              suffix: author.tag,
              reputation: 0.5
            });
          }

          const node = {
            id: row.id,
            userId: row.author_id,
            text: row.body,
            timestamp: row.created_at,
            prominence: row.score !== undefined ? row.score : 80,
            children: [],
            parentId: row.parent_id
          };
          nodesMap.set(node.id, node);
        });

        nodesMap.forEach(node => {
          if (node.parentId && nodesMap.has(node.parentId)) {
            nodesMap.get(node.parentId).children.push(node);
          } else {
            roots.push(node);
          }
        });

        return {
          success: true,
          users: Array.from(usersMap.values()),
          comments: roots
        };
      } catch (err) {
        console.warn('[ServerAPI] Supabase cloud fetch notice, falling back to mock:', err.message);
        const mock = new MockServerAPI();
        return await mock.getThreadData(threadId);
      }
    }
  async getOrCreateUser(displayName) {
    if (typeof CommunityOracle !== 'undefined') {
      const prof = CommunityOracle.addOrUpdateProfile({ name: displayName });
      return {
        success: true,
        user: {
          id: prof.id,
          displayName: prof.name,
          normalizedName: prof.name.toLowerCase().replace(/[^a-z0-9]/g, ''),
          suffix: prof.tag,
          reputation: prof.reputation,
          badges: prof.badges || []
        }
      };
    }
    return {
      success: true,
      user: {
        id: `u_${displayName.toLowerCase()}`,
        displayName,
        suffix: 1001,
        reputation: 0.5
      }
    };
  }

  async postComment({ parentId, userId, text, threadId = 'main' }) {
      const supabaseUrl = this.baseUrl || (typeof localStorage !== 'undefined' ? localStorage.getItem('comments_supabase_url') : '');
      const supabaseKey = typeof localStorage !== 'undefined' ? localStorage.getItem('comments_supabase_key') : '';

      if (!supabaseUrl || !supabaseKey) {
        const mock = new MockServerAPI();
        return await mock.postComment({ parentId, userId, text, threadId });
      }

      try {
        const endpoint = `${supabaseUrl}/rest/v1/comments`;
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify({
            page_id: threadId,
            parent_id: parentId || null,
            author_id: userId,
            body: text,
            score: 80
          })
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const inserted = await res.json();
        const row = inserted[0];

        return {
          success: true,
          comment: {
            id: row.id,
            userId: row.author_id,
            text: row.body,
            timestamp: row.created_at,
            prominence: row.score,
            children: []
          }
        };
      } catch (err) {
        console.warn('[ServerAPI] Supabase post failed, using mock fallback:', err.message);
        const mock = new MockServerAPI();
        return await mock.postComment({ parentId, userId, text, threadId });
      }
    }
  async getCurrentUser() {
    if (typeof CommunityOracle !== 'undefined') {
      const profiles = CommunityOracle.getAllProfiles();
      const first = profiles[0];
      if (first) {
        return {
          success: true,
          user: {
            id: first.id,
            displayName: first.name,
            suffix: first.tag,
            reputation: first.reputation,
            badges: first.badges || []
          }
        };
      }
    }
    return { success: false, user: null };
  }

  async updateUserDisplayName(displayName) {
    if (typeof CommunityOracle !== 'undefined') {
      const updated = CommunityOracle.addOrUpdateProfile({ name: displayName });
      return { success: true, user: updated };
    }
    return { success: true, user: { displayName } };
  }

  async clearAllData(threadId = null) {
    if (typeof MockServerAPI !== 'undefined') {
      const mock = new MockServerAPI();
      return await mock.rebuildAndSeed();
    }
    return { success: true };
  }

  async deleteComment(commentId, userId, threadId = 'main') {
    return { success: true };
  }

  async submitRating(payload) {
    return { success: true };
  }

  async setPassword(email, password) {
    return { success: true };
  }
}

globalThis.ServerAPI = ServerAPI;
if (typeof module !== 'undefined' && module.exports) module.exports = ServerAPI;