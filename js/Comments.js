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

      if (this.rootElement) {
        this.destroy();
      }

      this.env = env;
      this.rootElement = env.container;
      this.rootElement.innerHTML = '';
      this.rootElement.style.overflowY = 'auto';
      this.rootElement.style.minHeight = '100vh';
      this.rootElement.style.boxSizing = 'border-box';
      this.rootElement.style.transition = 'margin-left 0.25s cubic-bezier(0.2, 0.0, 0.2, 1), width 0.25s cubic-bezier(0.2, 0.0, 0.2, 1)';

      // Sync Community profiles
      if (typeof CommunityOracle !== 'undefined' && typeof CommunityOracle.loadProfiles === 'function') {
        CommunityOracle.loadProfiles();
      }

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

      if (typeof DocumentReader !== 'undefined') {
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

          this._safeAreaHandler = (e) => {
            const left = e.detail?.left || 0;
            if (this.rootElement) {
              this.rootElement.style.marginLeft = `${left}px`;
              this.rootElement.style.width = left > 0 ? `calc(100% - ${left}px)` : '100%';
            }
          };
          window.addEventListener('layout-safe-area-change', this._safeAreaHandler);
          this.sidePanel.open();
        }

        // Initialize Aardvark and expose globally to satisfy DocumentReader and shortcut routers
        const AardvarkCls = globalThis.CommentsAardvark || globalThis.CadPlanAardvark;
        if (AardvarkCls) {
          this.aardvark = new AardvarkCls({ container: this.rootElement, dossierId: 'Comments' });
          this.aardvark.init();
        }

        // Maintain bidirectional handles
        window.commentsApp = this;
        globalThis._cadPlanInstance = this;
      } else {
        await this.init(this.rootElement);
        if (typeof TestHarness !== 'undefined') {
          const harness = new TestHarness(this);
          harness.init();
          window.harness = harness;
        }
        window.commentsApp = this;
        globalThis._cadPlanInstance = this;
      }

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
        makeElement('span', {}, 'Comments & Community Engine')
      ]);

      const closeBtn = makeElement('button', {
        className: 'dr-nav-btn',
        style: { padding: '2px 8px', fontSize: '10px' },
        onclick: () => this.sidePanel.close()
      }, '✕');

      this.sidePanel.header.append(headerTitle, closeBtn);

      const container = this.sidePanel.contentContainer;
      container.innerHTML = '';
      container.style.cssText = 'flex: 1; overflow-y: auto; padding: 12px; display: flex; flex-direction: column; gap: 10px;';

      // 1. Community User Identity Status Pill & Switcher
      const currentProf = this.currentUser || (typeof CommunityOracle !== 'undefined' ? CommunityOracle.getProfile('u_rob') : null);

      const communityBox = makeElement('div', {
        style: {
          background: 'linear-gradient(135deg, rgba(0, 242, 254, 0.1) 0%, rgba(15, 23, 42, 0.8) 100%)',
          border: '1.5px solid rgba(0, 242, 254, 0.35)',
          borderRadius: '10px',
          padding: '10px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          fontSize: '11px',
          fontFamily: 'monospace'
        }
      }, [
        makeElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } }, [
          makeElement('strong', { style: { color: '#00f2fe', display: 'flex', alignItems: 'center', gap: '6px' } }, [
            makeElement('span', {}, '🌐'),
            'Community Identity'
          ]),
          makeElement('span', { style: { color: '#10b981', fontSize: '10px', fontWeight: 'bold' } }, `${Math.round((currentProf?.reputation || 0.98) * 100)}% Rep`)
        ]),
        makeElement('div', { style: { color: '#f8fafc', fontSize: '12px', fontWeight: 'bold' } },
          `${currentProf?.displayName || currentProf?.name || 'Rob Brown'} #${currentProf?.tag || currentProf?.suffix || 1001}`
        ),
        makeElement('div', { style: { display: 'flex', gap: '4px', flexWrap: 'wrap' } },
          (currentProf?.badges || ['Architect', 'Verified']).map(b => makeElement('span', {
            style: { background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', padding: '1px 6px', borderRadius: '4px', fontSize: '9px', fontWeight: 'bold' }
          }, b))
        ),
        makeElement('div', { style: { display: 'flex', gap: '6px', marginTop: '4px' } }, [
          makeElement('button', {
            className: 'dr-nav-btn primary',
            style: { flex: 1, padding: '4px 6px', fontSize: '10px', textAlign: 'center' },
            onclick: () => this.showAuthDialog()
          }, '👤 Switch User'),
          makeElement('button', {
            className: 'dr-nav-btn',
            style: { padding: '4px 8px', fontSize: '10px', color: '#c084fc', borderColor: 'rgba(192, 132, 252, 0.4)' },
            title: 'Direct Message / Private Whisper Channel',
            onclick: () => this.showPrivateWhisperInbox()
          }, '🤫 Whispers')
        ])
      ]);
      container.appendChild(communityBox);

      // 2. Cloud Database Connection Status Banner
      const isCloudConnected = Boolean(typeof localStorage !== 'undefined' && localStorage.getItem('comments_supabase_url'));
      const cloudStatusBanner = makeElement('div', {
        style: {
          background: isCloudConnected ? 'rgba(16, 185, 129, 0.08)' : 'rgba(245, 158, 11, 0.08)',
          border: '1px solid ' + (isCloudConnected ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'),
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
          makeElement('strong', { style: { color: isCloudConnected ? '#10b981' : '#f59e0b', display: 'block' } },
            isCloudConnected ? '⚡ Supabase Online' : '○ Local Mock API'
          ),
          makeElement('span', { style: { color: '#94a3b8', fontSize: '9.5px' } },
            isCloudConnected ? 'PostgreSQL RLS Active' : 'Free cloud setup available'
          )
        ]),
        makeElement('button', {
          className: 'dr-nav-btn',
          style: { fontSize: '10px', padding: '3px 8px', color: '#00f2fe' },
          onclick: () => {
            if (typeof CloudDatabaseDialog !== 'undefined') {
              CloudDatabaseDialog.open(this.serverAPI, () => {
                this.loadInitialData();
                this._buildSidePanelNavigation(pages);
              });
            }
          }
        }, 'Configure DB')
      ]);
      container.appendChild(cloudStatusBanner);

      // 3. Chapters Navigation
      const chaptersWrap = makeElement('div', { style: { display: 'flex', flexDirection: 'column', gap: '6px' } });

      pages.forEach((page) => {
        const isCur = page.id === (this.activePageId || 'overview');
        const card = makeElement('div', {
          className: `cp-chapter-card ${isCur ? 'active' : ''}`,
          style: {
            padding: '8px 10px',
            border: '1px solid ' + (isCur ? '#00f2fe' : '#1e293b'),
            borderRadius: '6px',
            background: isCur ? 'rgba(0, 242, 254, 0.08)' : 'rgba(255, 255, 255, 0.02)',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
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

      // 4. Living Spec Compiler & Tools
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
    if (this._safeAreaHandler) {
      window.removeEventListener('layout-safe-area-change', this._safeAreaHandler);
      this._safeAreaHandler = null;
    }
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
    if (typeof UITools !== 'undefined' && typeof UITools.setSafeArea === 'function') {
      UITools.setSafeArea({ left: 0, right: 0, top: 0, bottom: 0 });
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

  showPrivateWhisperInbox() {
      const user = this.currentUser || (typeof CommunityOracle !== 'undefined' ? CommunityOracle.getProfile('u_rob') : { name: 'Rob Brown', tag: 1001 });
      const content = makeElement('div', {
        style: {
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          color: '#f8fafc',
          fontFamily: 'var(--dr-font-sans, system-ui, sans-serif)',
          fontSize: '12px'
        }
      });

      const header = makeElement('div', {
        style: {
          padding: '10px',
          background: 'rgba(192, 132, 252, 0.1)',
          border: '1px solid rgba(192, 132, 252, 0.35)',
          borderRadius: '8px',
          lineHeight: '1.45'
        }
      }, [
        makeElement('strong', { style: { color: '#c084fc', display: 'block', marginBottom: '2px' } }, '🤫 Private Whisper & Coaching Channel'),
        'These messages are delivered privately to you from the community AI coach or peer reviewers. They never appear publicly on the thread.'
      ]);
      content.appendChild(header);

      const whisperList = makeElement('div', {
        style: { display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '320px', overflowY: 'auto' }
      });

      const mockWhispers = [
        {
          from: 'AI Community Coach',
          time: '15m ago',
          text: 'Your response on transaction throughput was highly accurate. A gentler opening sentence would help beginner contributors engage without defensiveness.',
          tag: 'Tone Calibration'
        },
        {
          from: 'Sarah #1002 (Peer Whisper)',
          time: '1h ago',
          text: 'Check your XPath query on block_3; it needs a fallback for mobile screens.',
          tag: 'Technical Direct'
        }
      ];

      mockWhispers.forEach(w => {
        whisperList.appendChild(makeElement('div', {
          style: {
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid #1e293b',
            borderLeft: '3px solid #c084fc',
            borderRadius: '6px',
            padding: '8px 10px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }
        }, [
          makeElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } }, [
            makeElement('strong', { style: { color: '#c084fc', fontSize: '11px' } }, w.from),
            makeElement('span', { style: { color: '#64748b', fontSize: '10px' } }, w.time)
          ]),
          makeElement('div', { style: { color: '#cbd5e1', lineHeight: '1.4' } }, w.text),
          makeElement('span', { style: { fontSize: '9.5px', color: '#00f2fe', fontFamily: 'monospace' } }, `[${w.tag}]`)
        ]));
      });

      content.appendChild(whisperList);

      new DialogBoxExtended({
        title: `Whisper Channel: ${user.displayName || user.name} #${user.tag || user.suffix || 1001}`,
        content,
        buttons: [{ label: 'Close', isCloseButton: true }]
      });
    }

  renderDemoBanner() {
      // Clean, non-intrusive demo banner with direct access to Cloud DB setup
      const kicker = makeElement('div', { className: 'demo-mode-banner-kicker' }, 'Cloud Database & Mock Mode');
      const message = makeElement('div', { className: 'demo-mode-banner-message' });

      const toggleTrack = makeElement(
        'span',
        { className: 'demo-mode-toggle-track' },
        makeElement('span', { className: 'demo-mode-toggle-fill' }),
        makeElement('span', { className: 'demo-mode-toggle-label demo-mode-toggle-real' }, 'Live Cloud'),
        makeElement('span', { className: 'demo-mode-toggle-label demo-mode-toggle-surreal' }, 'Mock API')
      );

      const toggle = makeElement('button', {
        type: 'button',
        className: 'demo-mode-banner-toggle',
        onclick: async () => {
          const targetMode = this.apiMode === 'mock' ? 'live' : 'mock';
          toggle.disabled = true;
          await this.switchApiMode(targetMode);
          toggle.disabled = false;
        }
      }, toggleTrack);

      const banner = makeElement('div', { className: 'demo-mode-banner' }, [
        makeElement('div', { className: 'demo-mode-banner-content' }, kicker, message),
        makeElement('div', { className: 'demo-mode-banner-side', style: { display: 'flex', gap: '8px', alignItems: 'center' } }, [
          makeElement('button', {
            className: 'dr-nav-btn',
            style: { padding: '4px 8px', fontSize: '10.5px', color: '#00f2fe' },
            onclick: () => {
              if (typeof CloudDatabaseDialog !== 'undefined') {
                CloudDatabaseDialog.open(this.serverAPI, () => {
                  this.loadInitialData();
                });
              }
            }
          }, '⚡ Config DB'),
          toggle
        ])
      ]);

      const wrapper = makeElement('div', { className: 'demo-mode-banner-wrapper' }, banner);

      this.demoBannerWrapperElement = wrapper;
      this.demoBannerElement = banner;
      this.demoBannerTextElement = message;
      this.demoBannerToggleElement = toggle;

      this._applyDemoBannerTheme();
      this.updateDemoBanner();
      return wrapper;
    }
}

globalThis.Comments = Comments;
globalThis.CommentsApp = Comments;
if (typeof module !== 'undefined' && module.exports) module.exports = Comments;