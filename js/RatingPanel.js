class RatingPanel {
  constructor(anchorElement, commentNode) {
    this.anchorElement = anchorElement;
    this.commentNode = commentNode;
    this.element = null;
    this.feedbackTextarea = null;
    this.sliderValues = { Insightful: 50, Diplomatic: 50, 'Well-written': 50 };
    this._boundHandleClickOutside = this._handleClickOutside.bind(this);
    this._createDom();
    this.show();
  }

  _createDom() {
    this.element = makeElement('div', { className: 'rating-panel' });

    const slidersContainer = makeElement('div', { className: 'sliders-container' });
    slidersContainer.appendChild(this._createSlider('Insightful', '#3498db'));
    slidersContainer.appendChild(this._createSlider('Diplomatic', '#2ecc71'));
    slidersContainer.appendChild(this._createSlider('Well-written', '#e67e22'));

    // Prominence Calibration (PageRank / Community Weight dial)
    const prominenceHeader = makeElement(
      'div',
      { className: 'feedback-header', style: { color: '#00f2fe', marginTop: '4px' } },
      'Prominence Dial (Weighted by Reputation)'
    );

    const prominenceRow = makeElement('div', {
      className: 'rating-slider-container',
      style: { marginTop: '4px' }
    });
    const promLabel = makeElement('span', { className: 'rating-slider-label', style: { color: '#00f2fe', fontWeight: 'bold' } }, `${this.commentNode.prominence}%`);
    const promInput = makeElement('input', {
      type: 'range',
      min: '0',
      max: '100',
      value: String(this.commentNode.prominence),
      className: 'compact-slider',
      style: { width: '100%', accentColor: '#00f2fe' },
      oninput: (e) => {
        const val = parseInt(e.target.value, 10);
        promLabel.textContent = `${val}%`;
        this.commentNode.setProminence(val);
      }
    });
    prominenceRow.append(promLabel, promInput);

    const feedbackHeader = makeElement(
      'div',
      { className: 'feedback-header' },
      'Private Feedback (AI / Community Coach)'
    );

    this.feedbackTextarea = makeElement('textarea', {
      className: 'rating-feedback-textarea',
      placeholder: 'Send private feedback to author & community moderator...'
    });

    this.feedbackTextarea.onfocus = () => this.element.classList.add('is-expanded');
    this.feedbackTextarea.onblur = () => this.element.classList.remove('is-expanded');

    const submitBtn = makeElement(
      'button',
      {
        className: 'post-button',
        style: { marginTop: '10px', alignSelf: 'flex-end' },
        onclick: () => this.submitRating()
      },
      'Submit Rating & Feedback'
    );

    this.element.append(
      slidersContainer,
      prominenceHeader,
      prominenceRow,
      feedbackHeader,
      this.feedbackTextarea,
      submitBtn
    );
  }

  _createSlider(label, color) {
    const container = makeElement('div', { className: 'rating-slider-container' });
    const labelEl = makeElement('span', { className: 'rating-slider-label' }, label);

    const svg = makeElement('svg:svg', {
      className: 'rating-slider-svg',
      width: '100',
      height: '20'
    });
    const track = makeElement('svg:line', {
      x1: 10, y1: 10, x2: 90, y2: 10, 'stroke-width': 4, stroke: 'var(--bg-tertiary)', 'stroke-linecap': 'round'
    });
    const trackFill = makeElement('svg:line', {
      x1: 10, y1: 10, x2: 50, y2: 10, 'stroke-width': 4, stroke: color, 'stroke-linecap': 'round'
    });
    const thumb = makeElement('svg:circle', {
      cx: 50, cy: 10, r: 7, fill: '#efefef', stroke: '#ccc', 'stroke-width': 1
    });

    svg.append(track, trackFill, thumb);

    let isDragging = false;
    const handleMove = (e) => {
      if (!isDragging) return;
      const svgRect = svg.getBoundingClientRect();
      let newX = e.clientX - svgRect.left;
      newX = Math.max(10, Math.min(90, newX));
      thumb.setAttribute('cx', newX);
      trackFill.setAttribute('x2', newX);
      this.sliderValues[label] = Math.round(((newX - 10) / 80) * 100);
    };

    const handleEnd = () => {
      isDragging = false;
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
    };

    svg.onmousedown = (e) => {
      e.preventDefault();
      isDragging = true;
      handleMove(e);
      window.addEventListener('mousemove', handleMove);
      window.addEventListener('mouseup', handleEnd);
    };

    container.append(labelEl, svg);
    return container;
  }

  show() {
    document.body.appendChild(this.element);
    this._positionPanel();
    setTimeout(() => {
      this.element.classList.add('is-visible');
      document.addEventListener('mousedown', this._boundHandleClickOutside, true);
    }, 10);
  }

  hide() {
    document.removeEventListener('mousedown', this._boundHandleClickOutside, true);
    if (this.element) {
      this.element.classList.remove('is-visible');
      this.element.addEventListener('transitionend', () => {
        this.element?.remove();
        this.element = null;
      }, { once: true });
    }
  }

  _positionPanel() {
    const rect = this.anchorElement.getBoundingClientRect();
    this.element.style.top = `${rect.bottom + window.scrollY + 5}px`;
    this.element.style.left = `${rect.left + window.scrollX}px`;
  }

  _handleClickOutside(event) {
    if (this.element && !this.element.contains(event.target)) {
      this.hide();
      if (this.anchorElement.closePanelCallback) {
        this.anchorElement.closePanelCallback();
      }
    }
  }

  async submitRating() {
    const app = this.commentNode.view.options.app;
    if (!app.currentUser) {
      alert('Please select an active identity from the toolbar before voting.');
      return;
    }

    let voterReputation = 0.50;
    if (typeof CommunityOracle !== 'undefined') {
      voterReputation = CommunityOracle.getReputationWeight(app.currentUser.id);
    }

    const payload = {
      commentId: this.commentNode.id,
      userId: app.currentUser.id,
      sliders: this.sliderValues,
      voterReputation: voterReputation,
      feedback: this.feedbackTextarea ? this.feedbackTextarea.value : ''
    };

    const result = await app.serverAPI.submitRating(payload);
    if (result.success) {
      const insightDelta = ((this.sliderValues['Insightful'] || 50) - 50) * 0.4 * voterReputation;
      const newProminence = Math.max(10, Math.min(100, Math.round(this.commentNode.prominence + insightDelta)));
      this.commentNode.setProminence(newProminence);

      alert(`Rating submitted! Scaled by ${app.currentUser.displayName}'s reputation (${Math.round(voterReputation * 100)}% weight). Prominence updated to ${newProminence}%.`);
      this.hide();
    } else {
      alert('Error submitting rating: ' + (result.error || 'Failed'));
    }
  }
}

globalThis.RatingPanel = RatingPanel;
if (typeof module !== 'undefined' && module.exports) module.exports = RatingPanel;