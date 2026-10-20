class MockServerAPI {
  constructor() {
    this.db = { users: [], threads: { main: [] } }; // Changed comments to threads map
    this.currentUser = null;

    this.serverUserManager = {
      usersByNormalizedName: new Map(),
      usersById: new Map(),
      _normalizeName: (name) =>
        (name || '')
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, ''),
      getOrCreateUser: (displayName) => {
        if (!displayName || !displayName.trim()) {
          throw new Error('Invalid username. Name cannot be empty.');
        }
        const normalized = this.serverUserManager._normalizeName(displayName);
        const existingUsers =
          this.serverUserManager.usersByNormalizedName.get(normalized) || [];

        const existingUser = existingUsers.find(
          (u) => u.displayName === displayName
        );

        if (existingUser) {
          if (normalized === 'rob' && !existingUser.avatarUrl) {
            existingUser.avatarUrl =
              'https://recursi.dev/userThumbnails/rob1.png';
            existingUser.avatarUrlL =
              'https://recursi.dev/userThumbnails/rob1_L.png';
          }
          return existingUser;
        }

        const suffix = existingUsers.length + 1;
        const id = `${normalized}${suffix}`;
        const newUser = {
          id,
          displayName,
          normalizedName: normalized,
          suffix,
        };

        if (normalized === 'rob') {
          newUser.avatarUrl = 'https://recursi.dev/userThumbnails/rob1.png';
          newUser.avatarUrlL = 'https://recursi.dev/userThumbnails/rob1_L.png';
        }

        existingUsers.push(newUser);
        this.serverUserManager.usersByNormalizedName.set(
          normalized,
          existingUsers
        );
        this.serverUserManager.usersById.set(id, newUser);
        this.db.users.push(newUser);
        return newUser;
      },
      reset: () => {
        this.serverUserManager.usersByNormalizedName.clear();
        this.serverUserManager.usersById.clear();
      },
    };

    this.initialized = this._seedInitialData();
  }

  _simulateNetworkDelay(resolveValue, delay = 300) {
    return new Promise((resolve) => {
      setTimeout(() => resolve(resolveValue), Math.random() * delay + 50);
    });
  }

  async _seedInitialData() {
    this.db = { users: [], threads: { main: [] } };
    this.currentUser = null;

    // 1. Synchronize seed users from CommunityOracle
    if (typeof CommunityOracle !== 'undefined') {
      const profiles = CommunityOracle.getAllProfiles();
      this.db.users = profiles.map(p => ({
        id: p.id,
        displayName: p.name,
        normalizedName: p.name.toLowerCase().replace(/[^a-z0-9]/g, ''),
        suffix: p.tag,
        reputation: p.reputation,
        badges: p.badges || []
      }));
    } else {
      this.db.users = [
        { id: 'u_rob', displayName: 'Rob Brown', suffix: 1001, reputation: 0.98, badges: ['Architect', 'Verified'] },
        { id: 'u_sarah', displayName: 'Sarah', suffix: 1002, reputation: 0.88, badges: ['Top Reviewer'] },
        { id: 'u_dave1', displayName: 'Dave', suffix: 1042, reputation: 0.72, badges: ['Contributor'] },
        { id: 'u_dave2', displayName: 'Dave', suffix: 1005, reputation: 0.65, badges: ['Active'] },
        { id: 'u_alex', displayName: 'Alex', suffix: 1088, reputation: 0.45, badges: ['Probationary'] }
      ];
    }

    // 2. Seed threads with authentic community author IDs and PageRank prominence
    const now = Date.now();
    this.db.threads['main'] = [
      {
        id: 'c_seed_1',
        userId: 'u_rob',
        text: 'Welcome to the unified Comments system. Identity and web-of-trust reputation are now governed directly by CommunityOracle.',
        timestamp: new Date(now - 7200000).toISOString(),
        prominence: 98,
        score: 28,
        children: [
          {
            id: 'c_seed_2',
            userId: 'u_sarah',
            text: 'Notice that upvotes are weighted by reputation weight. A vote from an Architect carries more prominence than unverified accounts.',
            timestamp: new Date(now - 5400000).toISOString(),
            prominence: 88,
            score: 14,
            children: []
          },
          {
            id: 'c_seed_3',
            userId: 'u_dave1',
            text: 'And our discriminator tags (#1042 vs #1005) prevent identity collision when multiple Daves participate.',
            timestamp: new Date(now - 3600000).toISOString(),
            prominence: 72,
            score: 8,
            children: [
              {
                id: 'c_seed_4',
                userId: 'u_dave2',
                text: 'Exactly! Dave #1005 replying right here to Dave #1042.',
                timestamp: new Date(now - 1800000).toISOString(),
                prominence: 65,
                score: 5,
                children: []
              }
            ]
          }
        ]
      },
      {
        id: 'c_seed_5',
        userId: 'u_alex',
        text: 'Probationary comments start slightly subdued until reviewed or affirmed by reputable peers.',
        timestamp: new Date(now - 900000).toISOString(),
        prominence: 45,
        score: 1,
        children: []
      }
    ];

    // Set default active session to Rob Brown
    this.currentUser = this.db.users[0];
    console.log(`[MockServerAPI] Initialized with Community identities & ${this.db.threads['main'].length} root threads.`);
  }
  async getThreadData(threadId = 'main') {
    await this.initialized;

    // Auto-initialize thread if it doesn't exist in mock
    if (!this.db.threads[threadId]) {
      this.db.threads[threadId] = [];
    }

    const data = {
      success: true,
      users: JSON.parse(JSON.stringify(this.db.users)),
      comments: JSON.parse(JSON.stringify(this.db.threads[threadId])),
    };
    return this._simulateNetworkDelay(data);
  }

  async getOrCreateUser(displayName) {
    await this.initialized;
    try {
      const user = this.serverUserManager.getOrCreateUser(displayName);
      this.currentUser = user; // Set the 'session' user
      return this._simulateNetworkDelay({
        success: true,
        user: JSON.parse(JSON.stringify(user)),
      });
    } catch (error) {
      return this._simulateNetworkDelay({
        success: false,
        error: error.message,
      });
    }
  }

  async postComment({ parentId, userId, text, threadId = 'main' }) {
    await this.initialized;
    if (!userId || !text) {
      return this._simulateNetworkDelay({
        success: false,
        error: 'User and text are required.',
      });
    }

    if (!this.db.threads[threadId]) {
      this.db.threads[threadId] = [];
    }

    const newComment = {
      id: `comment-${Date.now()}-${Math.random()}`,
      userId: userId,
      text: text,
      timestamp: new Date().toISOString(),
      children: [],
    };

    if (parentId) {
      const findParent = (nodes) => {
        for (const node of nodes) {
          if (node.id === parentId) return node;
          const found = findParent(node.children || []);
          if (found) return found;
        }
        return null;
      };
      // Search in the specific thread
      const parent = findParent(this.db.threads[threadId]);
      if (parent) {
        parent.children.push(newComment);
      } else {
        return this._simulateNetworkDelay({
          success: false,
          error: 'Parent comment not found.',
        });
      }
    } else {
      this.db.threads[threadId].push(newComment);
    }
    return this._simulateNetworkDelay({
      success: true,
      comment: JSON.parse(JSON.stringify(newComment)),
    });
  }

  async rebuildAndSeed() {
    this.initialized = this._seedInitialData();
    await this.initialized;
    return this._simulateNetworkDelay({ success: true });
  }

  async getCurrentUser() {
    await this.initialized;
    // Simulate checking for a session cookie and returning the user if found.
    return this._simulateNetworkDelay({
      success: true,
      user: this.currentUser,
    });
  }

  async updateUserDisplayName(displayName) {
    await this.initialized;
    if (!this.currentUser) {
      return this._simulateNetworkDelay({
        success: false,
        error: 'Not logged in.',
      });
    }

    // This logic mirrors what the server should do
    const newNormalized = displayName
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();

    if (newNormalized !== this.currentUser.normalizedName) {
      return this._simulateNetworkDelay({
        success: false,
        error: `Cannot change base name from "${this.currentUser.normalizedName}" to "${newNormalized}".`,
      });
    }

    // Find the user in the "database" and update them
    const userInDb = this.db.users.find((u) => u.id === this.currentUser.id);
    if (userInDb) {
      userInDb.displayName = displayName;
    }

    // Update the "session" user
    this.currentUser.displayName = displayName;

    return this._simulateNetworkDelay({
      success: true,
      user: JSON.parse(JSON.stringify(this.currentUser)),
    });
  }

  async _parseSampleComments(text) {
    const posts = [];
    // Split by the separator and filter out empty strings that result from splits at the start/end of the file.
    const blocks = text
      .split(
        '======================================================================'
      )
      .filter((b) => b.trim());

    for (const block of blocks) {
      const lines = block.trim().split('\n');
      const post = {};
      const contentLines = [];
      let inContent = false;

      for (const line of lines) {
        if (
          line.startsWith(
            '----------------------------------------------------------------------'
          )
        ) {
          inContent = true;
          continue;
        }

        if (inContent) {
          contentLines.push(line);
        } else {
          const [key, ...valueParts] = line.split(':');
          const value = valueParts.join(':').trim();
          if (key === 'POST ID') post.id = value;
          else if (key === 'USER') post.user = value;
          else if (key === 'DATE')
            post.timestamp = new Date(value).toISOString();
          else if (key === 'REPLY TO')
            post.parentId = value === 'none' ? null : value;
        }
      }
      post.text = contentLines.join('\n').trim();
      posts.push(post);
    }
    return posts;
  }

  async adminSeedComment(data) {
    console.warn(
      '[MockServerAPI] adminSeedComment called on Mock API. This should only happen on Live.'
    );
    return this.postComment(data);
  }

  async registerUser(email, password, displayName) {
    await this.initialized;
    return this.getOrCreateUser(displayName); // Simulate registration with existing mock logic
  }

  async loginUser(email, password) {
    await this.initialized;
    if (this.db.users.length > 0) {
      this.currentUser = this.db.users[0]; // Simulate login as first available mock user
      return this._simulateNetworkDelay({
        success: true,
        user: this.currentUser,
      });
    }
    return this._simulateNetworkDelay({
      success: false,
      error: 'No users found in mock database.',
    });
  }

  async submitRating(payload) {
    return this._simulateNetworkDelay({ success: true }); // Fake success for mock mode
  }

  async setPassword(email, password) {
    await this.initialized;
    if (!this.currentUser) {
      return this._simulateNetworkDelay({
        success: false,
        error: 'Not logged in.',
      });
    }
    // In mock mode, just store email on the current user
    this.currentUser.email = email;
    return this._simulateNetworkDelay({
      success: true,
      user: JSON.parse(JSON.stringify(this.currentUser)),
    });
  }

}



// Clean globalThis export for Luno environment
globalThis.MockServerAPI = MockServerAPI;
if (typeof module !== 'undefined' && module.exports) module.exports = MockServerAPI;
