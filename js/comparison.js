/**
 * LuxeMart Product Comparison Engine & Modal UI
 */

const ComparisonManager = {
  /**
   * Toggle product in comparison list (Limit 2 - 4)
   */
  toggleCompare(productId) {
    const list = AppState.comparisonList;
    const index = list.indexOf(productId);

    if (index > -1) {
      list.splice(index, 1);
      UIRenderer.showToast("Removed product from comparison list", "info");
    } else {
      if (list.length >= 4) {
        UIRenderer.showToast("Maximum 4 products can be compared at once!", "warning");
        return;
      }
      list.push(productId);
      const prod = PRODUCTS.find(p => p.id === productId);
      UIRenderer.showToast(`Added ${prod ? prod.name : 'product'} to comparison list`, "success");
    }

    AppState.saveState();
    this.updateComparisonUI();
  },

  /**
   * Update floating bottom bar and compare buttons in DOM
   */
  updateComparisonUI() {
    // 1. Update buttons in storefront and chat
    document.querySelectorAll('.compare-btn').forEach(btn => {
      const card = btn.closest('[data-product-id]');
      if (card) {
        const id = card.getAttribute('data-product-id');
        const isCompared = AppState.comparisonList.includes(id);
        if (isCompared) {
          btn.classList.add('active');
          btn.innerHTML = `<i class="fa-solid fa-check"></i> Compared`;
        } else {
          btn.classList.remove('active');
          btn.innerHTML = `<i class="fa-solid fa-code-compare"></i> Compare`;
        }
      }
    });

    // 2. Update floating bar
    const floatBar = document.getElementById('comparison-floating-bar');
    const badge = document.getElementById('compare-count-badge');
    const thumbsContainer = document.getElementById('compare-thumbs');

    if (!floatBar) return;

    if (AppState.comparisonList.length > 0) {
      floatBar.classList.add('active');
      if (badge) badge.textContent = AppState.comparisonList.length;

      if (thumbsContainer) {
        thumbsContainer.innerHTML = AppState.comparisonList.map(id => {
          const p = PRODUCTS.find(prod => prod.id === id);
          if (!p) return '';
          return `
            <div class="compare-thumb" title="${p.name}">
              <img src="${p.images[0]}" alt="${p.name}">
              <button class="thumb-remove-btn" onclick="ComparisonManager.toggleCompare('${p.id}')">×</button>
            </div>
          `;
        }).join('');
      }
    } else {
      floatBar.classList.remove('active');
    }
  },

  /**
   * Open Comparison Matrix Modal
   */
  openComparisonModal(explicitProductIds = null) {
    const targetIds = explicitProductIds || AppState.comparisonList;

    if (!targetIds || targetIds.length < 2) {
      UIRenderer.showToast("Please select at least 2 products to compare!", "warning");
      return;
    }

    const modal = document.getElementById('comparison-modal');
    const content = document.getElementById('comparison-modal-body');
    if (!modal || !content) return;

    const products = targetIds.map(id => PRODUCTS.find(p => p.id === id)).filter(Boolean);

    // Calculate Best Overall & Best Value
    let bestOverallId = null;
    let bestValueId = null;

    let maxRating = -1;
    let bestRatio = -1;

    products.forEach(p => {
      if (p.rating > maxRating) {
        maxRating = p.rating;
        bestOverallId = p.id;
      }
      const ratio = p.rating / p.price;
      if (ratio > bestRatio) {
        bestRatio = ratio;
        bestValueId = p.id;
      }
    });

    // Collect all spec keys
    const specKeysSet = new Set();
    products.forEach(p => {
      Object.keys(p.specs).forEach(k => specKeysSet.add(k));
    });
    const specKeys = Array.from(specKeysSet);

    // Build Header Row
    let headerHTML = `<th>Features & Specs</th>`;
    products.forEach(p => {
      let badgeHTML = '';
      if (p.id === bestOverallId) badgeHTML += `<span class="matrix-badge badge-overall"><i class="fa-solid fa-crown"></i> Best Overall</span>`;
      if (p.id === bestValueId) badgeHTML += `<span class="matrix-badge badge-value"><i class="fa-solid fa-piggy-bank"></i> Best Value</span>`;

      headerHTML += `
        <th class="matrix-product-col">
          <div class="matrix-product-card">
            ${badgeHTML}
            <img src="${p.images[0]}" alt="${p.name}" class="matrix-img">
            <h4 class="matrix-title">${p.name}</h4>
            <div class="matrix-price">${UIRenderer.formatPrice(p.price, p.priceINR)}</div>
            <button class="btn btn-sm btn-primary mt-2" onclick="CartManager.addToCart('${p.id}')">
              <i class="fa-solid fa-cart-plus"></i> Add to Cart
            </button>
          </div>
        </th>
      `;
    });

    // Helper row generator with diff highlighting
    const buildRow = (label, getValueFn) => {
      const values = products.map(getValueFn);
      const isDiff = new Set(values).size > 1;

      let rowHTML = `<tr class="${isDiff ? 'diff-row' : ''}"><td><strong>${label}</strong></td>`;
      values.forEach(val => {
        rowHTML += `<td>${val}</td>`;
      });
      rowHTML += `</tr>`;
      return rowHTML;
    };

    // Rows
    let bodyHTML = '';
    bodyHTML += buildRow("Price", p => UIRenderer.formatPrice(p.price, p.priceINR));
    bodyHTML += buildRow("Rating", p => `★ ${p.rating} (${p.reviewCount} reviews)`);
    bodyHTML += buildRow("Brand", p => p.brand);
    bodyHTML += buildRow("Stock Status", p => p.inStock ? `<span class="text-success">In Stock (${p.stock})</span>` : `<span class="text-warning">Backorder</span>`);
    bodyHTML += buildRow("Shipping Time", p => p.shippingTime);
    bodyHTML += buildRow("Return Policy", p => p.returnPolicy);
    bodyHTML += buildRow("Warranty", p => p.warranty);

    // Specs rows
    specKeys.forEach(key => {
      bodyHTML += buildRow(key, p => p.specs[key] || 'N/A');
    });

    content.innerHTML = `
      <div class="comparison-table-wrapper">
        <table class="comparison-table">
          <thead><tr>${headerHTML}</tr></thead>
          <tbody>${bodyHTML}</tbody>
        </table>
      </div>
    `;

    modal.classList.add('active');
  },

  closeComparisonModal() {
    const modal = document.getElementById('comparison-modal');
    if (modal) modal.classList.remove('active');
  }
};
