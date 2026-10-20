class Comments {
  constructor() {
    this.container = null;
    this.commentView = null;
    this.userManager = new UserManager();
    this.styles = new CommentStyles();

    this.serverAPI = new MockServerAPI();
    this.apiMode = 'mock';

    this.currentUser = null;
    this.appContainer = null;
    this.isDebugMode = false;
    this.globalSortOrder = 'newest';
    this.topLevelPostBoxContainer = null;
    this.userAccountDialog = new UserAccountDialog(this);
    this.activeReplyController = null;
    this.threadId = 'main';
    this.toolbar = new CommentToolbar(this);
  }

  static async run(env) {
    const instance = new Comments();
    return await instance.run(env);
  }

  async run(env) {
    if (!env || !env.container) {
      throw new Error('[Comments] run() requires an environment with a valid container.');
    }

    this.env = env;
    this.rootElement = env.container;
    this.rootElement.innerHTML = '';
    this.rootElement.style.overflowY = 'auto';
    this.rootElement.style.minHeight = '100vh';
    this.rootElement.style.boxSizing = 'border-box';

    // 1. Sync Community identities from CommunityOracle
    if (typeof CommunityOracle !== 'undefined' && typeof CommunityOracle.loadProfiles === 'function') {
      CommunityOracle.loadProfiles();
    }

    // 2. If DocumentReader is present in library, render the living specification with embedded threads
    if (typeof DocumentReader !== 'undefined') {
      const pages = [
        { id: 'overview', title: '0. Architecture & Modern Horizon', docClass: () => globalThis.CommentsOverviewContent },
        { id: 'styling', title: '1. Styling, Theming & Micro-Threads', docClass: () => globalThis.CommentsStylingContent },
        { id: 'identity', title: '2. Identity: Anonymous-First & Discriminators', docClass: () => globalThis.CommentsAuthIdentityContent },
        { id: 'threading', title: '3. Trees, Prominence & Weighted Reputation', docClass: () => globalThis.CommentsThreadingContent },
        { id: 'api_contract', title: '4. Supabase & Serverless API Contract', docClass: () => globalThis.CommentsApiContractContent },
        { id: 'dom_anchoring', title: '5. Universal DOM Anchoring & Aardvark', docClass: () => globalThis.CommentsDomAnchorContent },
        { id: 'ai_moderation', title: '6. AI Moderation & Prominence Spectrum', docClass: () => globalThis.CommentsAiModerationContent },
        { id: 'federation', title: '7. Federation, Shared Reputation & Scale', docClass: () => globalThis.CommentsFederationContent },
        { id: 'deployment_kit', title: '8. Drop-In Deployment Kit & Prompt Generator', docClass: () => globalThis.CommentsDeploymentKitContent }
      ];

      this.reader = new DocumentReader({
        container: this.rootElement,
        brandTitle: 'Comments System & Community Oracle',
        brandIcon: '💬',
        dossierId: 'Comments',
        pages: pages
      });
      await this.reader.init();

      if (typeof SidePanel !== 'undefined') {
        this.sidePanel = new SidePanel('left', 340, null);
        this._buildSidePanelNavigation(pages);
        this.sidePanel.open();
      }

      if (typeof CommentsAardvark !== 'undefined') {
        this.aardvark = new CommentsAardvark({ container: this.rootElement, dossierId: 'Comments' });
        this.aardvark.init();
      }
    } else {
      // 3. Fallback: Initialize directly as full-page comment widget
      await this.init(this.rootElement);
      if (typeof TestHarness !== 'undefined') {
        const harness = new TestHarness(this);
        harness.init();
        window.harness = harness;
      }
    }

    window.commentsApp = this;
    return this;
  }

  _buildSidePanelNavigation(pages) {
    if (!this.sidePanel) return;

    this.sidePanel.header.innerHTML = '';
    const headerTitle = makeElement('div', {
      style: {
        fontFamily: 'monospace',
        fontSize: '11px',
        fontWeight: 'bold',
        color: '#00f2fe',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        flex: 1
      }
    }, [
      makeElement('span', {}, '💬'),
      makeElement('span', {}, 'Comments System & Spec')
    ]);

    const closeBtn = makeElement('button', {
      className: 'dr-nav-btn',
      style: { padding: '2px 8px', fontSize: '10px' },
      onclick: () => this.sidePanel.close()
    }, '✕');

    this.sidePanel.header.append(headerTitle, closeBtn);

    const container = this.sidePanel.contentContainer;
    container.innerHTML = '';
    container.style.cssText = 'flex: 1; overflow-y: auto; padding: 12px; display: flex; flex-direction: column; gap: 8px;';

    // 1. Community User Identity Status Pill
    const profilesCount = typeof CommunityOracle !== 'undefined' ? CommunityOracle.getAllProfiles().length : 5;
    const communityBox = makeElement('div', {
      style: {
        background: 'rgba(0, 242, 254, 0.08)',
        border: '1px solid rgba(0, 242, 254, 0.25)',
        borderRadius: '8px',
        padding: '8px 10px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '11px',
        fontFamily: 'monospace'
      }
    }, [
      makeElement('div', {}, [
        makeElement('strong', { style: { color: '#00f2fe', display: 'block' } }, '🌐 Community Oracle'),
        makeElement('span', { style: { color: '#94a3b8', fontSize: '10px' } }, `${profilesCount} Profiles Active`)
      ]),
      makeElement('button', {
        className: 'dr-nav-btn',
        style: { fontSize: '10px', padding: '3px 8px', color: '#10b981' },
        onclick: () => this.showAuthDialog()
      }, 'Switch Identity')
    ]);
    container.appendChild(communityBox);

    // 2. Chapters List
    const chaptersWrap = makeElement('div', { style: { display: 'flex', flexDirection: 'column', gap: '6px' } });

    pages.forEach((page) => {
      const isCur = page.id === (this.activePageId || 'overview');
      const card = makeElement('div', {
        className: `cp-chapter-card ${isCur ? 'active' : ''}`,
        style: {
          padding: '8px 10px',
          border: '1px solid #1e293b',
          borderRadius: '6px',
          background: isCur ? 'rgba(0, 242, 254, 0.08)' : 'rgba(255, 255, 255, 0.02)',
          cursor: 'pointer'
        },
        onclick: () => this.selectChapter(page.id)
      }, [
        makeElement('strong', {
          style: {
            fontSize: '11px',
            color: isCur ? '#00f2fe' : '#f8fafc',
            display: 'block'
          }
        }, page.title)
      ]);
      chaptersWrap.appendChild(card);
    });
    container.appendChild(chaptersWrap);

    // 3. Living Spec Tools
    const toolsBox = makeElement('div', {
      style: {
        marginTop: 'auto',
        paddingTop: '10px',
        borderTop: '1px solid #1e293b',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '6px'
      }
    }, [
      makeElement('button', {
        className: 'dr-nav-btn',
        style: { color: '#00f2fe', fontSize: '10px', padding: '6px' },
        onclick: () => {
          if (typeof CommentsItemNotes !== 'undefined') CommentsItemNotes.openPromptBuilderDialog(this.reader);
        }
      }, '⚡ Living Spec Prompt'),
      makeElement('button', {
        className: 'dr-nav-btn',
        style: { color: '#38bdf8', fontSize: '10px', padding: '6px' },
        onclick: () => this.selectChapter('deployment_kit')
      }, '📦 1-Click Drop-in')
    ]);
    container.appendChild(toolsBox);
  }

  selectChapter(pageId) {
    this.activePageId = pageId;
    if (this.reader && typeof this.reader.switchPage === 'function') {
      this.reader.switchPage(pageId);
    }
    if (this.sidePanel) {
      this.sidePanel.contentContainer.querySelectorAll('.cp-chapter-card').forEach(c => {
        c.classList.remove('active');
      });
    }
    if (this.rootElement) {
      this.rootElement.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  destroy() {
    if (this.aardvark) {
      this.aardvark.destroy();
      this.aardvark = null;
    }
    if (this.sidePanel) {
      this.sidePanel.destroy();
      this.sidePanel = null;
    }
    if (this.reader && typeof this.reader.destroy === 'function') {
      this.reader.destroy();
      this.reader = null;
    }
    this.rootElement = null;
  }

  createPostBox(parentId, onPostCallback, onCancelCallback) {
    const form = makeElement('form', { className: 'comment-post-box' });

    if (this.currentUser) {
      const header = makeElement('div', { className: 'post-box-header' });
      form.appendChild(header);
      this._updatePostBoxHeader(header);

      const commentInput = makeElement('textarea', {
        placeholder: 'Write a comment...',
        required: true,
        className: 'comment-input'
      });

      const buttonContainer = makeElement('div', { className: 'post-box-actions' });
      const postButton = makeElement('button', { type: 'submit', className: 'post-button' }, 'Post');
      buttonContainer.appendChild(postButton);

      if (onCancelCallback) {
        const cancelButton = makeElement('button', {
          type: 'button',
          className: 'cancel-button',
          onclick: onCancelCallback
        }, 'Cancel');
        buttonContainer.appendChild(cancelButton);
      }

      form.append(commentInput, buttonContainer);

      form.onsubmit = async (e) => {
        e.preventDefault();
        postButton.disabled = true;
        postButton.textContent = 'Posting...';

        const postResult = await this.serverAPI.postComment({
          parentId: parentId,
          userId: this.currentUser.id,
          text: commentInput.value,
          threadId: this.threadId
        });

        if (postResult.success) {
          if (onPostCallback) onPostCallback();
          this.commentView.addComment(postResult.comment, parentId);
        } else {
          alert(`Error posting comment: ${postResult.error}`);
        }

        postButton.disabled = false;
        postButton.textContent = 'Post';
      };
    } else {
      const nameRow = makeElement('div', {
        className: 'post-box-header',
        style: { marginBottom: '8px' }
      });
      const nameInput = makeElement('input', {
        type: 'text',
        className: 'username-input',
        placeholder: 'Choose display name (at least 2 letters)...',
        required: true,
        style: { flexGrow: '1' }
      });
      nameRow.appendChild(nameInput);
      form.appendChild(nameRow);

      const commentInput = makeElement('textarea', {
        placeholder: 'Write a comment...',
        required: true,
        className: 'comment-input'
      });

      const buttonContainer = makeElement('div', { className: 'post-box-actions' });
      const postButton = makeElement('button', { type: 'submit', className: 'post-button' }, 'Post');
      buttonContainer.appendChild(postButton);

      if (onCancelCallback) {
        const cancelButton = makeElement('button', {
          type: 'button',
          className: 'cancel-button',
          onclick: onCancelCallback
        }, 'Cancel');
        buttonContainer.appendChild(cancelButton);
      }

      form.append(commentInput, buttonContainer);

      form.onsubmit = async (e) => {
        e.preventDefault();
        const displayName = nameInput.value.trim();
        if (!displayName || displayName.length < 2) {
          alert('Please enter a display name with at least 2 letters.');
          return;
        }

        postButton.disabled = true;
        postButton.textContent = 'Posting...';

        const userResult = await this.serverAPI.getOrCreateUser(displayName);
        if (!userResult.success) {
          alert(`Error creating user: ${userResult.error}`);
          postButton.disabled = false;
          postButton.textContent = 'Post';
          return;
        }

        this.userManager.addUser(userResult.user);
        this.setCurrentUser(userResult.user);

        const postResult = await this.serverAPI.postComment({
          parentId: parentId,
          userId: this.currentUser.id,
          text: commentInput.value,
          threadId: this.threadId
        });

        if (postResult.success) {
          if (onPostCallback) onPostCallback();
          this.commentView.addComment(postResult.comment, parentId);
        } else {
          alert(`Error posting comment: ${postResult.error}`);
        }

        postButton.disabled = false;
        postButton.textContent = 'Post';
      };
    }

    return form;
  }

  setCurrentUser(user) {
    const oldUser = this.currentUser;
    this.currentUser = user;

    if (this.onUserChange) {
      this.onUserChange(user);
    }
    if (this.toolbar) {
      this.toolbar.updateUser();
    }

    if (user && oldUser && oldUser.id === user.id && oldUser.displayName !== user.displayName) {
      this.userManager.addUser(user);
      this._updateAllUserDisplays(user.id, user.displayName);
    } else if (user && !oldUser) {
      this.userManager.addUser(user);
    } else if (!user) {
      this.closeAllPopups();
    }

    if (this.topLevelPostBoxContainer) {
      const postBox = this.topLevelPostBoxContainer.querySelector('.comment-post-box');
      if (postBox) {
        const header = postBox.querySelector('.post-box-header');
        if (header) {
          if (this.currentUser) this._updatePostBoxHeader(header);
          else this._showTopLevelPostBox();
        }
      }
    }
  }

  toggleDebugMode(e) {
    const button = e.currentTarget;
    this.isDebugMode = !this.isDebugMode;
    this.appContainer.classList.toggle('debug-mode-active', this.isDebugMode);
    button.classList.toggle('active', this.isDebugMode);
    this.commentView.refreshLayout();
  }

  toggleGlobalSortOrder(e) {
    const button = e.currentTarget;
    this.globalSortOrder = this.globalSortOrder === 'newest' ? 'oldest' : 'newest';
    button.textContent = `Sort by: ${this.globalSortOrder === 'newest' ? 'Newest' : 'Oldest'}`;
    this.commentView.refreshLayout();
  }

  _showTopLevelPostButton() {
    this.topLevelPostBoxContainer.innerHTML = '';
    const postCommentButton = makeElement('button', {
      className: 'post-comment-button',
      onclick: () => this._showTopLevelPostBox()
    }, 'Post a new comment');
    this.topLevelPostBoxContainer.appendChild(postCommentButton);
  }

  _showTopLevelPostBox() {
    const controller = {
      isTopLevel: true,
      close: () => this._showTopLevelPostButton()
    };
    this.setActiveReplyController(controller);
    this.topLevelPostBoxContainer.innerHTML = '';

    const postBox = this.createPostBox(null, () => controller.close(), () => controller.close());
    this.topLevelPostBoxContainer.appendChild(postBox);

    const focusEl = postBox.querySelector('.username-input') || postBox.querySelector('.comment-input');
    if (focusEl) focusEl.focus();
  }

  async loadInitialData() {
    try {
      const userSession = await this.serverAPI.getCurrentUser();
      if (userSession && userSession.success && userSession.user) {
        this.userManager.addUser(userSession.user);
        this.setCurrentUser(userSession.user);
      } else if (!this.currentUser) {
        this.setCurrentUser(null);
      }
    } catch (e) {}

    const data = await this.serverAPI.getThreadData(this.threadId);
    if (data && data.success) {
      this.userManager.loadUsers(data.users);
      if (this.currentUser) {
        this.userManager.addUser(this.currentUser);
      }
      this.commentView.setData(data.comments);
    } else {
      this.commentView.clear();
    }
  }

  _updatePostBoxHeader(headerElement) {
    headerElement.innerHTML = '';
    if (!this.currentUser) return;

    const tag = this.currentUser.suffix || 1001;
    let displayText = `Posting as: <span class="rendered-name">${NameRenderer.render(this.currentUser.displayName)}</span> <span class="user-name-suffix" style="opacity:0.6;font-size:10px;font-family:monospace;">#${tag}</span>`;

    const textEl = makeElement('span', {});
    textEl.innerHTML = displayText;

    const accountButton = makeElement('button', {
      className: 'account-button',
      type: 'button',
      onclick: () => this.userAccountDialog.show()
    }, 'Account');

    headerElement.append(textEl, accountButton);
  }

  _updateAllUserDisplays(userId, newDisplayName) {
    const mainHeader = this.topLevelPostBoxContainer.querySelector('.post-box-header');
    if (mainHeader && this.currentUser && this.currentUser.id === userId) {
      this._updatePostBoxHeader(mainHeader);
    }

    this.commentView.nodesMap.forEach((node) => {
      if (node.userId === userId && node.domElement && !node.isDeleted) {
        const nameSpan = node.domElement.querySelector('.user-name');
        if (nameSpan) {
          nameSpan.innerHTML = NameRenderer.render(newDisplayName);
        }
      }
    });
  }

  closeAllPopups() {
    this.commentView.closeAllPopups();
    if (this.userAccountDialog && this.userAccountDialog.dialog) {
      this.userAccountDialog.dialog.close();
      this.userAccountDialog.dialog = null;
    }
  }

  setActiveReplyController(controller) {
    if (this.activeReplyController && this.activeReplyController !== controller) {
      this.activeReplyController.close();
    }
    this.activeReplyController = controller;
  }

  applyTheme(themeSettings) {
    if (!themeSettings) return;
    const geometryUpdates = this.styles.updateTheme(themeSettings);
    if (this.commentView && Object.keys(geometryUpdates).length > 0) {
      let needsRefresh = false;
      for (const [key, value] of Object.entries(geometryUpdates)) {
        if (this.commentView.options[key] !== value) {
          this.commentView.options[key] = value;
          needsRefresh = true;
        }
      }
      if (needsRefresh) this.commentView.refreshLayout();
    }
  }

  async init(targetElement, options = {}) {
    this.container = targetElement;
    this.threadId = options.threadId || 'main';
    this.onUserChange = options.onUserChange || null;

    if (options.apiMode === 'live') {
      this.apiMode = 'live';
      this.serverAPI = new ServerAPI();
    } else {
      this.apiMode = 'mock';
      this.serverAPI = new MockServerAPI();
    }

    this.container.classList.add('comments-active');
    this.styles.applyAllStyles();

    const defaults = CommentStyles.defaultSettings;
    const viewOptions = { ...defaults, ...options };
    viewOptions.app = this;

    this.appContainer = makeElement('div', { className: 'comments-app-container' });

    if (options.showTitle !== false) {
      const title = makeElement('h1', { className: 'app-title' }, 'Comments & Community Thread');
      this.appContainer.appendChild(title);
    }

    const toolbarEl = this.toolbar.render();
    this.appContainer.appendChild(toolbarEl);

    this.topLevelPostBoxContainer = makeElement('div', { className: 'top-level-post-container' });
    this._showTopLevelPostButton();

    const commentViewContainer = makeElement('div', { className: 'comment-view-container' });
    this.appContainer.append(this.topLevelPostBoxContainer, commentViewContainer);
    this.container.appendChild(this.appContainer);

    this.commentView = new CommentThreadView(commentViewContainer, viewOptions);
    this.commentView.setApp(this);

    await this.loadInitialData();
  }

  showAuthDialog() {
    if (typeof CommunityOracle !== 'undefined') {
      const content = makeElement('div', { style: { display: 'flex', flexDirection: 'column', gap: '10px' } });
      const grid = makeElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' } });

      CommunityOracle.getAllProfiles().forEach(p => {
        const b = makeElement('button', {
          className: 'dr-nav-btn',
          style: { padding: '6px 8px', textAlign: 'left', display: 'flex', flexDirection: 'column' },
          onclick: () => {
            const userObj = {
              id: p.id,
              displayName: p.name,
              normalizedName: p.name.toLowerCase().replace(/[^a-z0-9]/g, ''),
              suffix: p.tag,
              reputation: p.reputation,
              badges: p.badges || []
            };
            this.userManager.addUser(userObj);
            this.setCurrentUser(userObj);
            dlg.close();
          }
        }, [
          makeElement('strong', { style: { color: '#00f2fe', fontSize: '11.5px' } }, `${p.name} #${p.tag}`),
          makeElement('span', { style: { color: '#10b981', fontSize: '9.5px', fontFamily: 'monospace' } }, `${Math.round(p.reputation * 100)}% Rep`)
        ]);
        grid.appendChild(b);
      });

      content.append(
        makeElement('p', { style: { fontSize: '11px', color: '#94a3b8' } }, 'Select a verified identity from CommunityOracle:'),
        grid
      );

      const dlg = new DialogBoxExtended({
        title: 'Sign In via Community Identity',
        content,
        buttons: [{ label: 'Cancel', isCloseButton: true }]
      });
    }
  }
}

globalThis.Comments = Comments;
globalThis.CommentsApp = Comments;
if (typeof module !== 'undefined' && module.exports) module.exports = Comments;