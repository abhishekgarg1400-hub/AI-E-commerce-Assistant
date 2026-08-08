/**
 * LuxeMart UI Component Renderer (Order Card Component Inline Layout Fix)
 */

const UIRenderer = {
  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let iconClass = 'fa-circle-info';
    if (type === 'success') iconClass = 'fa-circle-check';
    if (type === 'warning') iconClass = 'fa-triangle-exclamation';
    if (type === 'error') iconClass = 'fa-circle-xmark';

    toast.innerHTML = `<i class="fa-solid ${iconClass}"></i> <span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  },

  formatPrice(amountUSD, amountINR) {
    const isINR = AppState ? AppState.currency === 'INR' : true;
    if (isINR) {
      const val = amountINR || Math.round(amountUSD * 82);
      return `₹${val.toLocaleString('en-IN')}`;
    }
    return `$${amountUSD.toFixed(2)}`;
  },

  openSpinWinModal() {
    const modal = document.getElementById('spin-win-modal');
    if (modal) modal.classList.add('active');
  },

  renderCatalogCard(product) {
    const isCompared = AppState.comparisonList.includes(product.id);
    const isWishlisted = AppState.wishlist.includes(product.id);

    const discountRibbon = product.discountPercent ? `<span class="discount-ribbon">-${product.discountPercent}% OFF</span>` : '';
    const badgesHTML = product.badges.map(b => `<span class="badge ${b.includes('Flash') ? 'badge-flash' : (b.includes('OFF') ? 'badge-discount' : 'badge-popular')}">${b}</span>`).join('');
    
    const viewerCount = Math.floor(12 + (product.rating * 4));
    const urgencyHTML = `<div class="urgency-badge"><i class="fa-solid fa-fire text-warning"></i> ${viewerCount} sold in last 24h</div>`;
    const sizesHTML = product.sizes ? `<div class="card-sizes-pills">${product.sizes.slice(0, 4).map(s => `<span class="size-chip">${s}</span>`).join('')}</div>` : '';

    const displayPrice = this.formatPrice(product.price, product.priceINR);
    const origPrice = product.originalPrice ? this.formatPrice(product.originalPrice, product.priceINR ? Math.round(product.priceINR * 1.4) : null) : '';

    return `
      <div class="product-card" data-product-id="${product.id}">
        <div class="card-image-container">
          <img src="${product.images[0]}" alt="${product.name}" class="product-img" loading="lazy">
          ${discountRibbon}
          <div class="card-badges">${badgesHTML}</div>
          <button class="wishlist-btn ${isWishlisted ? 'active' : ''}" onclick="AppState.toggleWishlist('${product.id}')" title="Save to Wishlist">
            <i class="fa-${isWishlisted ? 'solid' : 'regular'} fa-heart"></i>
          </button>
          <button class="quick-view-btn" onclick="UIRenderer.openProductModal('${product.id}')">
            <i class="fa-solid fa-eye"></i> Quick View
          </button>
        </div>
        <div class="card-body">
          <div class="card-category">${product.category.toUpperCase()} • ${product.brand}</div>
          <h3 class="card-title" onclick="UIRenderer.openProductModal('${product.id}')">${product.name}</h3>
          
          ${sizesHTML}

          <div class="card-rating">
            <span class="stars">${'★'.repeat(Math.floor(product.rating))}${'☆'.repeat(5 - Math.floor(product.rating))}</span>
            <span class="rating-val">${product.rating}</span>
            <span class="review-cnt">(${product.reviewCount})</span>
          </div>

          ${urgencyHTML}

          <div class="card-price-row">
            <div class="price-container">
              <span class="current-price">${displayPrice}</span>
              ${origPrice ? `<span class="original-price">${origPrice}</span>` : ''}
            </div>
            <span class="stock-tag ${product.inStock ? 'in-stock' : 'out-stock'}">
              <i class="fa-solid fa-truck-fast"></i> Free Delivery
            </span>
          </div>

          <div class="card-actions">
            <button class="btn btn-primary add-cart-btn" onclick="CartManager.addToCart('${product.id}')">
              <i class="fa-solid fa-cart-plus"></i> Buy Now
            </button>
            <button class="btn btn-outline compare-btn ${isCompared ? 'active' : ''}" onclick="ComparisonManager.toggleCompare('${product.id}')">
              <i class="fa-solid ${isCompared ? 'fa-check' : 'fa-code-compare'}"></i> ${isCompared ? 'Compared' : 'Compare'}
            </button>
          </div>
        </div>
      </div>
    `;
  },

  renderChatMessage(messageObj) {
    const chatContainer = document.getElementById('chat-messages');
    if (!chatContainer) return;

    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-bubble-wrapper ${messageObj.sender}`;

    const avatarHTML = messageObj.sender === 'ai' 
      ? `<div class="chat-avatar ai-avatar"><i class="fa-solid fa-robot"></i></div>`
      : `<div class="chat-avatar user-avatar"><i class="fa-solid fa-user"></i></div>`;

    let contentHTML = '';

    if (messageObj.sender === 'user') {
      contentHTML = `<div class="chat-bubble user-bubble">${this.escapeHTML(messageObj.text)}</div>`;
    } else {
      let bodyHTML = '';

      if (messageObj.type === 'recommendation' && messageObj.products) {
        bodyHTML = `<div class="ai-intro">${this.formatMarkdown(messageObj.text)}</div>`;
        
        if (messageObj.totalMatches && messageObj.totalMatches > 3) {
          bodyHTML += `<div class="chat-catalog-sync-banner">
            <button class="btn btn-accent btn-sm w-100" onclick="AppState.closeAIAssistantDrawer(); UIRenderer.showToast('Displaying all ${messageObj.totalMatches} choices in storefront catalog grid!', 'success');">
              <i class="fa-solid fa-grid-2"></i> View All ${messageObj.totalMatches} Choices in Store Catalog
            </button>
          </div>`;
        }

        bodyHTML += `<div class="recommendations-container">`;
        messageObj.products.forEach(prod => {
          const whyItFits = aiEngine.generateWhyItFits(prod, messageObj.intent);
          bodyHTML += this.renderRecommendationCard(prod, whyItFits);
        });
        bodyHTML += `</div>`;

        bodyHTML += `<div class="ai-refine-pills">
          <span class="refine-tag" onclick="AppState.sendQuickQuery('Show protein under 1500')">💪 Protein under ₹1500</span>
          <span class="refine-tag" onclick="AppState.sendQuickQuery('Show shoes under 1000')">👟 Shoes under ₹1000</span>
          <span class="refine-tag" onclick="AppState.sendQuickQuery('Show brass diya')">🛕 Puja Essentials</span>
        </div>`;
      } else if (messageObj.type === 'size_advisor_trigger') {
        bodyHTML = `<div class="ai-intro">${this.formatMarkdown(messageObj.text)}</div>`;
        bodyHTML += `<div class="chat-action-banner">
          <button class="btn btn-accent btn-sm" onclick="UIRenderer.openSizeAdvisorModal()">
            <i class="fa-solid fa-ruler-combined"></i> Open AI Size & Fit Advisor
          </button>
        </div>`;
      } else if (messageObj.type === 'policy' && messageObj.policy) {
        bodyHTML = `<div class="ai-intro">${this.formatMarkdown(messageObj.text)}</div>`;
        bodyHTML += this.renderPolicyCard(messageObj.policy);
      } else if (messageObj.type === 'order_status' && messageObj.order) {
        bodyHTML = `<div class="ai-intro">${this.formatMarkdown(messageObj.text)}</div>`;
        bodyHTML += this.renderOrderCard(messageObj.order);
      } else if (messageObj.type === 'comparison_trigger' && messageObj.products) {
        bodyHTML = `<div class="ai-intro">${this.formatMarkdown(messageObj.text)}</div>`;
        bodyHTML += `<div class="chat-action-banner">
          <button class="btn btn-accent btn-sm" onclick="ComparisonManager.openComparisonModal([${messageObj.products.map(p => `'${p.id}'`).join(',')}])">
            <i class="fa-solid fa-table-columns"></i> Launch Comparison Matrix
          </button>
        </div>`;
      } else {
        bodyHTML = `<div class="ai-text-content">${this.formatMarkdown(messageObj.text)}</div>`;
      }

      contentHTML = `<div class="chat-bubble ai-bubble">${bodyHTML}</div>`;
    }

    messageDiv.innerHTML = `${avatarHTML}${contentHTML}`;
    chatContainer.appendChild(messageDiv);
    
    this.scrollToBottom(chatContainer);
  },

  scrollToBottom(container) {
    if (!container) return;
    container.scrollTop = container.scrollHeight;
    setTimeout(() => { container.scrollTop = container.scrollHeight; }, 100);
    setTimeout(() => { container.scrollTop = container.scrollHeight; }, 350);
  },

  renderRecommendationCard(product, whyItFits) {
    const isCompared = AppState.comparisonList.includes(product.id);
    const keySpecsList = Object.entries(product.specs).slice(0, 3).map(([k, v]) => `<li><strong>${k}:</strong> ${v}</li>`).join('');
    const priceStr = this.formatPrice(product.price, product.priceINR);

    return `
      <div class="chat-product-card">
        <div class="chat-card-header">
          <img src="${product.images[0]}" alt="${product.name}" class="chat-card-thumb" onload="UIRenderer.scrollToBottom(document.getElementById('chat-messages'))">
          <div class="chat-card-info">
            <h4 class="chat-card-title" onclick="UIRenderer.openProductModal('${product.id}')">${product.name}</h4>
            <div class="chat-card-meta">
              <span class="chat-card-price">${priceStr}</span>
              <span class="chat-card-rating">★ ${product.rating}</span>
              <span class="chat-card-delivery"><i class="fa-solid fa-truck"></i> ${product.shippingTime}</span>
            </div>
          </div>
        </div>
        <div class="chat-card-body">
          <ul class="chat-specs-list">${keySpecsList}</ul>
          <div class="why-fits-box">
            <i class="fa-solid fa-wand-magic-sparkles"></i> <strong>Why it fits you:</strong> ${whyItFits}
          </div>
        </div>
        <div class="chat-card-footer">
          <button class="btn btn-xs btn-primary" onclick="CartManager.addToCart('${product.id}')">
            <i class="fa-solid fa-cart-plus"></i> Buy Now
          </button>
          <button class="btn btn-xs btn-outline ${isCompared ? 'active' : ''}" onclick="ComparisonManager.toggleCompare('${product.id}')">
            <i class="fa-solid fa-code-compare"></i> ${isCompared ? 'Compared' : 'Compare'}
          </button>
          <button class="btn btn-xs btn-ghost" onclick="UIRenderer.openProductModal('${product.id}')">
            Details <i class="fa-solid fa-arrow-right"></i>
          </button>
        </div>
      </div>
    `;
  },

  renderPolicyCard(policy) {
    const listHTML = policy.details.map(d => `<li><i class="fa-solid fa-check text-accent"></i> ${d}</li>`).join('');
    return `
      <div class="chat-policy-box">
        <div class="policy-header">
          <i class="fa-solid ${policy.icon} policy-icon"></i>
          <strong>${policy.title}</strong>
        </div>
        <p class="policy-summary">${policy.summary}</p>
        <ul class="policy-list">${listHTML}</ul>
      </div>
    `;
  },

  /**
   * Robust Card-Based Horizontal Order Status Tracker (Fixed Layout)
   */
  renderOrderCard(order) {
    const steps = ["Confirmed", "Packed", "Shipped", "Out for Delivery", "Delivered"];
    const currentStep = order.timelineStep || 1;

    const timelineStepsHTML = steps.map((s, idx) => {
      const stepNum = idx + 1;
      const isDone = stepNum <= currentStep;
      const isCurrent = stepNum === currentStep;
      
      const bgColor = isDone ? 'linear-gradient(135deg, #10b981, #059669)' : (isCurrent ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : 'rgba(255,255,255,0.08)');
      const borderColor = isDone ? '#10b981' : (isCurrent ? '#6366f1' : 'rgba(255,255,255,0.2)');
      const icon = isDone ? '✓' : stepNum;
      const textColor = (isDone || isCurrent) ? '#ffffff' : '#94a3b8';

      return `
        <div style="display:flex !important; flex-direction:column !important; align-items:center !important; flex:1 !important; position:relative !important; z-index:2 !important; text-align:center !important;">
          <div style="width:28px !important; height:28px !important; border-radius:50% !important; background:${bgColor} !important; border:2px solid ${borderColor} !important; color:#fff !important; display:flex !important; align-items:center !important; justify-content:center !important; font-size:0.75rem !important; font-weight:800 !important; box-shadow:${isDone ? '0 0 10px rgba(16,185,129,0.5)' : 'none'} !important;">
            ${icon}
          </div>
          <span style="font-size:0.65rem !important; color:${textColor} !important; font-weight:600 !important; margin-top:4px !important; line-height:1.1 !important; display:block !important;">${s}</span>
        </div>
      `;
    }).join('');

    return `
      <div style="background:rgba(11,15,25,0.92) !important; border:1px solid rgba(99,102,241,0.35) !important; border-radius:14px !important; padding:1.2rem !important; margin-top:0.8rem !important; box-shadow:0 8px 25px rgba(0,0,0,0.5) !important;">
        <div style="display:flex !important; justify-content:space-between !important; align-items:center !important; border-bottom:1px solid rgba(255,255,255,0.1) !important; padding-bottom:0.6rem !important; margin-bottom:1rem !important;">
          <div>
            <span style="background:rgba(16,185,129,0.2) !important; color:#10b981 !important; border:1px solid rgba(16,185,129,0.4) !important; padding:3px 8px !important; border-radius:6px !important; font-weight:800 !important; font-size:0.8rem !important;">#${order.id}</span>
            <span style="background:rgba(99,102,241,0.2) !important; color:#818cf8 !important; padding:3px 8px !important; border-radius:6px !important; font-weight:700 !important; font-size:0.75rem !important; margin-left:6px !important;">${order.status}</span>
          </div>
          <span style="font-size:0.75rem !important; color:#94a3b8 !important;"><i class="fa-regular fa-calendar"></i> ${order.date}</span>
        </div>

        <div style="display:flex !important; flex-direction:row !important; justify-content:space-between !important; align-items:flex-start !important; position:relative !important; margin:1.2rem 0 !important; padding:0 4px !important;">
          <div style="position:absolute !important; top:13px !important; left:15px !important; right:15px !important; height:3px !important; background:rgba(255,255,255,0.1) !important; z-index:1 !important;"></div>
          ${timelineStepsHTML}
        </div>

        <div style="display:grid !important; grid-template-columns:1fr 1fr !important; gap:0.6rem !important; background:rgba(0,0,0,0.35) !important; padding:0.85rem !important; border-radius:10px !important; font-size:0.78rem !important; border:1px solid rgba(255,255,255,0.06) !important; margin-top:1rem !important;">
          <div><span style="color:#94a3b8;">Expected Delivery:</span> <br><strong style="color:#10b981;">${order.expectedDelivery}</strong></div>
          <div><span style="color:#94a3b8;">Carrier:</span> <br><strong style="color:#fff;">${order.carrier}</strong></div>
          <div><span style="color:#94a3b8;">Tracking Number:</span> <br><code style="background:rgba(255,255,255,0.1); padding:2px 6px; border-radius:4px; color:#818cf8;">${order.trackingNumber}</code></div>
          <div><span style="color:#94a3b8;">Shipping Address:</span> <br><span style="color:#cbd5e1; font-size:0.75rem;">${order.shippingAddress}</span></div>
        </div>
      </div>
    `;
  },

  openProductModal(productId) {
    const product = PRODUCTS.find(p => p.id === productId);
    if (!product) return;

    const modal = document.getElementById('product-modal');
    const content = document.getElementById('product-modal-body');
    if (!modal || !content) return;

    const isCompared = AppState.comparisonList.includes(product.id);
    const specsTable = Object.entries(product.specs).map(([k, v]) => `<tr><td><strong>${k}</strong></td><td>${v}</td></tr>`).join('');
    const priceDisplay = this.formatPrice(product.price, product.priceINR);
    const origPriceDisplay = product.originalPrice ? this.formatPrice(product.originalPrice, product.priceINR ? Math.round(product.priceINR * 1.4) : null) : '';

    const sizesSelectorHTML = product.sizes ? `
      <div class="modal-sizes-group mt-3">
        <label><strong>Select Size:</strong></label>
        <div class="modal-sizes-chips">
          ${product.sizes.map((s, i) => `<span class="modal-size-chip ${i===0?'active':''}" onclick="document.querySelectorAll('.modal-size-chip').forEach(c=>c.classList.remove('active')); this.classList.add('active');">${s}</span>`).join('')}
        </div>
      </div>
    ` : '';

    const flavorsSelectorHTML = product.flavors ? `
      <div class="modal-sizes-group mt-3">
        <label><strong>Select Flavor:</strong></label>
        <div class="modal-sizes-chips">
          ${product.flavors.map((f, i) => `<span class="modal-size-chip ${i===0?'active':''}" onclick="this.parentElement.querySelectorAll('.modal-size-chip').forEach(c=>c.classList.remove('active')); this.classList.add('active');">${f}</span>`).join('')}
        </div>
      </div>
    ` : '';

    content.innerHTML = `
      <div class="product-modal-grid">
        <div class="modal-gallery">
          <img src="${product.images[0]}" alt="${product.name}" class="modal-main-img" id="modal-main-image">
        </div>

        <div class="modal-info">
          <div class="modal-category">${product.category.toUpperCase()} • ${product.brand}</div>
          <h2 class="modal-title">${product.name}</h2>
          
          <div class="modal-rating-row">
            <span class="stars">${'★'.repeat(Math.floor(product.rating))}${'☆'.repeat(5 - Math.floor(product.rating))}</span>
            <span class="rating-val">${product.rating}</span>
            <span>(${product.reviewCount} verified buyer reviews)</span>
          </div>

          <div class="modal-price-row">
            <span class="modal-price">${priceDisplay}</span>
            ${origPriceDisplay ? `<span class="modal-orig-price">${origPriceDisplay}</span>` : ''}
            <span class="modal-stock-badge ${product.inStock ? 'in-stock' : 'out-stock'}">
              ${product.inStock ? `In Stock (${product.stock} units)` : 'Backorder Available'}
            </span>
          </div>

          <p class="modal-desc">${product.description}</p>

          ${sizesSelectorHTML}
          ${flavorsSelectorHTML}

          <div class="modal-specs-container mt-3">
            <h4>Technical Specifications & Material</h4>
            <table class="specs-table">${specsTable}</table>
          </div>

          <div class="modal-actions-row">
            <button class="btn btn-lg btn-primary" onclick="CartManager.addToCart('${product.id}'); UIRenderer.closeProductModal();">
              <i class="fa-solid fa-cart-plus"></i> Buy Now
            </button>
            <button class="btn btn-lg btn-outline ${isCompared ? 'active' : ''}" onclick="ComparisonManager.toggleCompare('${product.id}')">
              <i class="fa-solid fa-code-compare"></i> ${isCompared ? 'Remove Compare' : 'Add to Compare'}
            </button>
          </div>
        </div>
      </div>
    `;

    modal.classList.add('active');
  },

  closeProductModal() {
    const modal = document.getElementById('product-modal');
    if (modal) modal.classList.remove('active');
  },

  openApiKeyModal() {
    const modal = document.getElementById('api-key-modal');
    const input = document.getElementById('gemini-key-input');
    if (input && window.AppState) input.value = window.AppState.apiKey || '';
    if (modal) modal.classList.add('active');
  },

  openSizeAdvisorModal() {
    const modal = document.getElementById('size-advisor-modal');
    if (modal) modal.classList.add('active');
  },

  closeSizeAdvisorModal() {
    const modal = document.getElementById('size-advisor-modal');
    if (modal) modal.classList.remove('active');
  },

  escapeHTML(str) {
    return str.replace(/[&<>'"]/g, tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag));
  },

  formatMarkdown(text) {
    if (!text) return '';
    let formatted = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n- (.*?)/g, '<li>$1</li>');
    return `<p>${formatted}</p>`;
  }
};
