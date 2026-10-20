class AuthenticCommentsMount {
  /**
   * Universal mounting helper for authentic Comments instances using MockServerAPI.
   * Can be instantiated into any DOM container to mount real interactive comment threads
   * with full threading, replies, voting, folding, and user accounts.
   */
  static activeInstances = new Map();

  static mount(container, options = {}) {
    if (!container) return null;
    const threadId = options.threadId || 'main';

    // Ensure CSS is injected
    if (typeof CommentStyles !== 'undefined') {
      if (typeof CommentStyles.inject === 'function') CommentStyles.inject();
      else if (typeof CommentStyles.run === 'function') CommentStyles.run();
    }

    container.innerHTML = '';
    const hostDiv = makeElement('div', {
      className: 'comments-authentic-thread-host',
      style: {
        width: '100%',
        color: '#e2e8f0',
        fontFamily: 'var(--dr-font-sans, system-ui, sans-serif)',
        boxSizing: 'border-box'
      }
    });
    container.appendChild(hostDiv);

    try {
      const MockAPI = globalThis.MockServerAPI || (typeof window !== 'undefined' ? window.MockServerAPI : null);
      const CommentsClass = globalThis.Comments || (typeof window !== 'undefined' ? window.Comments : null);
      const ThreadView = globalThis.CommentThreadView || (typeof window !== 'undefined' ? window.CommentThreadView : null);

      if (!CommentsClass || !MockAPI) {
        hostDiv.innerHTML = '<div style="padding:14px;color:#f59e0b;font-family:monospace;font-size:11px;">Initializing Comments engine...</div>';
        return null;
      }

      // Check if MockServerAPI already has a shared instance or create one
      if (!globalThis._sharedMockServerAPI) {
        globalThis._sharedMockServerAPI = new MockAPI();
      }
      const api = globalThis._sharedMockServerAPI;

      // Seed distinct mock comments if thread is empty
      if (api.db && api.db.threads && !api.db.threads[threadId]) {
        const now = Date.now();
        if (threadId === 'design_critique') {
          api.db.threads[threadId] = [
            {
              id: 'c_dc_1',
              threadId: threadId,
              parentId: null,
              userId: 'u_rob',
              author: { name: 'Rob Brown', tag: 1001, isRegistered: true, avatarUrl: '' },
              text: 'Here is a critique on the layout. The spacing between the primary toolbar and the nested replies feels natural and readable.',
              score: 16,
              userVote: 1,
              created: now - 5400000
            },
            {
              id: 'c_dc_2',
              threadId: threadId,
              parentId: 'c_dc_1',
              userId: 'u_dave1',
              author: { name: 'Dave', tag: 1042, isRegistered: false, avatarUrl: '' },
              text: 'Agreed. Notice how my tag (#1042) is highlighted because another Dave is below.',
              score: 6,
              userVote: 0,
              created: now - 3600000
            },
            {
              id: 'c_dc_3',
              threadId: threadId,
              parentId: 'c_dc_2',
              userId: 'u_dave2',
              author: { name: 'Dave', tag: 1005, isRegistered: true, avatarUrl: '' },
              text: 'Second Dave replying in the thread! All indentation lines and folding work natively.',
              score: 4,
              userVote: 0,
              created: now - 1800000
            }
          ];
        } else if (threadId === 'quick_feedback') {
          api.db.threads[threadId] = [
            {
              id: 'c_qf_1',
              threadId: threadId,
              parentId: null,
              userId: 'u_sarah',
              author: { name: 'Sarah', tag: 1002, isRegistered: true, avatarUrl: '' },
              text: 'Testing a clean, un-nested feedback thread. Voting increments correctly.',
              score: 12,
              userVote: 1,
              created: now - 2400000
            }
          ];
        } else {
          // Default thread
          api.db.threads[threadId] = [
            {
              id: 'c_main_1',
              threadId: threadId,
              parentId: null,
              userId: 'u_rob',
              author: { name: 'Rob Brown', tag: 1001, isRegistered: true, avatarUrl: '' },
              text: 'Welcome to the comment system. You can reply, fold threads, upvote, and post new comments right here.',
              score: 29,
              userVote: 1,
              created: now - 7200000
            },
            {
              id: 'c_main_2',
              threadId: threadId,
              parentId: 'c_main_1',
              userId: 'u_dave1',
              author: { name: 'Dave', tag: 1042, isRegistered: false, avatarUrl: '' },
              text: 'Testing nested reply indentation and discriminator rendering.',
              score: 8,
              userVote: 0,
              created: now - 3600000
            }
          ];
        }
      }

      const commentsInstance = new CommentsClass();

      // Configure server API and container
      commentsInstance.serverApi = api;
      commentsInstance.api = api;
      commentsInstance.container = hostDiv;

      // Invoke authentic initialization method
      if (typeof commentsInstance.init === 'function') {
        commentsInstance.init(hostDiv, threadId);
      } else if (typeof commentsInstance.loadThread === 'function') {
        commentsInstance.loadThread(threadId);
      } else if (typeof commentsInstance.render === 'function') {
        commentsInstance.render();
      }

      AuthenticCommentsMount.activeInstances.set(hostDiv, commentsInstance);
      return commentsInstance;
    } catch (e) {
      console.error('[AuthenticCommentsMount] Mount exception:', e);
      hostDiv.innerHTML = `<div style="padding:12px;color:#ef4444;font-family:monospace;font-size:11px;">Error booting comments: ${e.message}</div>`;
      return null;
    }
  }
}

globalThis.AuthenticCommentsMount = AuthenticCommentsMount;
if (typeof module !== 'undefined' && module.exports) module.exports = AuthenticCommentsMount;