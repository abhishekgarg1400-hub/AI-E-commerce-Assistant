/**
 * LuxeMart Shopping Cart, Coupon Engine & Checkout Simulator (Modal Overhaul)
 */

const CartManager = {
  addToCart(productId, quantity = 1) {
    const product = PRODUCTS.find(p => p.id === productId);
    if (!product) {
      console.error("Product not found for ID:", productId);
      UIRenderer.showToast("Failed to add product to cart", "error");
      return;
    }

    const existing = AppState.cart.find(item => item.productId === productId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      AppState.cart.push({ productId, quantity });
    }

    AppState.saveState();
    this.updateCartUI();
    this.openCartDrawer();
    UIRenderer.showToast(`Added "${product.name}" to your cart!`, "success");
  },

  removeFromCart(productId) {
    AppState.cart = AppState.cart.filter(item => item.productId !== productId);
    AppState.saveState();
    this.updateCartUI();
    UIRenderer.showToast("Item removed from cart", "info");
  },

  updateQuantity(productId, delta) {
    const item = AppState.cart.find(i => i.productId === productId);
    if (!item) return;

    item.quantity += delta;
    if (item.quantity <= 0) {
      this.removeFromCart(productId);
    } else {
      AppState.saveState();
      this.updateCartUI();
    }
  },

  applyCoupon(code) {
    const cleanCode = code.trim().toUpperCase();

    if (cleanCode === 'SAVE10') {
      AppState.coupons = { code: 'SAVE10', discountPercent: 0.10, discountFixed: 0, freeShipping: false };
      UIRenderer.showToast("Coupon SAVE10 applied! 10% discount added.", "success");
    } else if (cleanCode === 'LUXE20' || cleanCode === 'LUXE50') {
      AppState.coupons = { code: cleanCode, discountPercent: 0.20, discountFixed: 0, freeShipping: false };
      UIRenderer.showToast(`Coupon ${cleanCode} applied! Extra discount added.`, "success");
    } else if (cleanCode === 'FREESHIP') {
      AppState.coupons = { code: 'FREESHIP', discountPercent: 0, discountFixed: 0, freeShipping: true };
      UIRenderer.showToast("Coupon FREESHIP applied! Free shipping enabled.", "success");
    } else {
      UIRenderer.showToast("Invalid coupon code! Try SAVE10, LUXE50, or FREESHIP.", "error");
      return;
    }

    AppState.saveState();
    this.updateCartUI();
  },

  calculateTotals() {
    let subtotal = 0;
    let itemCount = 0;

    AppState.cart.forEach(item => {
      const product = PRODUCTS.find(p => p.id === item.productId);
      if (product) {
        const itemPrice = AppState.currency === 'INR' ? (product.priceINR || Math.round(product.price * 82)) : product.price;
        subtotal += itemPrice * item.quantity;
        itemCount += item.quantity;
      }
    });

    let discount = 0;
    if (AppState.coupons.discountPercent > 0) {
      discount = subtotal * AppState.coupons.discountPercent;
    }

    const freeShipThreshold = AppState.currency === 'INR' ? 500 : 50;
    let shipping = subtotal > freeShipThreshold || AppState.coupons.freeShipping ? 0 : (AppState.currency === 'INR' ? 49 : 9.99);
    if (subtotal === 0) shipping = 0;

    const tax = (subtotal - discount) * 0.05;
    const total = subtotal - discount + shipping + tax;

    return { subtotal, itemCount, discount, shipping, tax, total };
  },

  updateCartUI() {
    const totals = this.calculateTotals();
    const isINR = AppState.currency === 'INR';
    const sym = isINR ? '₹' : '$';

    document.querySelectorAll('.cart-badge-count').forEach(el => {
      if (el.id !== 'wishlist-badge-count') {
        el.textContent = totals.itemCount;
        el.style.display = totals.itemCount > 0 ? 'inline-block' : 'none';
      }
    });

    const drawerItemsContainer = document.getElementById('cart-drawer-items');
    const drawerFooter = document.getElementById('cart-drawer-footer');

    if (!drawerItemsContainer) return;

    if (AppState.cart.length === 0) {
      drawerItemsContainer.innerHTML = `
        <div class="empty-cart-view" style="text-align:center; padding:3rem 1rem;">
          <i class="fa-solid fa-bag-shopping empty-cart-icon" style="font-size:3rem; color:var(--text-muted); margin-bottom:1rem;"></i>
          <p style="color:var(--text-muted);">Your shopping cart is currently empty.</p>
          <button class="btn btn-primary btn-sm mt-3" onclick="CartManager.toggleCartDrawer()">Explore Catalog</button>
        </div>
      `;
      if (drawerFooter) drawerFooter.style.display = 'none';
    } else {
      let itemsHTML = '';
      AppState.cart.forEach(item => {
        const product = PRODUCTS.find(p => p.id === item.productId);
        if (!product) return;

        const priceDisplay = UIRenderer.formatPrice(product.price, product.priceINR);

        itemsHTML += `
          <div class="cart-line-item">
            <img src="${product.images[0]}" alt="${product.name}" class="cart-item-img">
            <div class="cart-item-details">
              <h4 class="cart-item-title">${product.name}</h4>
              <div class="cart-item-price">${priceDisplay}</div>
              <div class="cart-qty-controls">
                <button class="qty-btn" onclick="CartManager.updateQuantity('${product.id}', -1)">-</button>
                <span class="qty-val">${item.quantity}</span>
                <button class="qty-btn" onclick="CartManager.updateQuantity('${product.id}', 1)">+</button>
              </div>
            </div>
            <button class="cart-item-remove" onclick="CartManager.removeFromCart('${product.id}')" title="Remove item">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        `;
      });

      drawerItemsContainer.innerHTML = itemsHTML;

      if (drawerFooter) {
        drawerFooter.style.display = 'block';
        drawerFooter.innerHTML = `
          <div class="cart-coupon-box">
            <input type="text" id="coupon-input" placeholder="Coupon (e.g. LUXE50)" value="${AppState.coupons.code || ''}">
            <button class="btn btn-accent btn-sm" onclick="CartManager.applyCoupon(document.getElementById('coupon-input').value)">Apply</button>
          </div>

          <div class="cart-summary-breakdown">
            <div class="summary-row"><span>Subtotal:</span> <span>${sym}${totals.subtotal.toLocaleString('en-IN')}</span></div>
            ${totals.discount > 0 ? `<div class="summary-row text-success"><span>Discount (${AppState.coupons.code}):</span> <span>-${sym}${totals.discount.toLocaleString('en-IN')}</span></div>` : ''}
            <div class="summary-row"><span>Shipping:</span> <span>${totals.shipping === 0 ? '<strong class="text-success">FREE</strong>' : `${sym}${totals.shipping.toLocaleString('en-IN')}`}</span></div>
            <div class="summary-row"><span>GST/Tax (5%):</span> <span>${sym}${totals.tax.toLocaleString('en-IN')}</span></div>
            <div class="summary-row total-row"><span>Total:</span> <span>${sym}${totals.total.toLocaleString('en-IN')}</span></div>
          </div>

          <button class="btn btn-lg btn-primary w-100 mt-3" onclick="CartManager.openCheckoutModal()">
            Proceed to Checkout <i class="fa-solid fa-arrow-right"></i>
          </button>
        `;
      }
    }
  },

  openCartDrawer() {
    const drawer = document.getElementById('cart-drawer');
    if (drawer) drawer.classList.add('active');
  },

  toggleCartDrawer() {
    const drawer = document.getElementById('cart-drawer');
    if (drawer) drawer.classList.toggle('active');
  },

  openCheckoutModal() {
    if (AppState.cart.length === 0) {
      UIRenderer.showToast("Your cart is empty!", "warning");
      return;
    }

    const drawer = document.getElementById('cart-drawer');
    if (drawer) drawer.classList.remove('active');

    const modal = document.getElementById('checkout-modal');
    const body = document.getElementById('checkout-modal-body');
    if (!modal || !body) return;

    const totals = this.calculateTotals();
    const sym = AppState.currency === 'INR' ? '₹' : '$';

    body.innerHTML = `
      <div class="checkout-header-banner">
        <h2><i class="fa-solid fa-shield-heart text-accent"></i> Express Checkout & Shipping</h2>
        <p>Complete your delivery details to confirm your order.</p>
      </div>

      <div class="checkout-grid">
        <form class="checkout-form-container" id="checkout-shipping-form" onsubmit="CartManager.handlePlaceOrder(event)">
          <div class="checkout-section-title">
            <i class="fa-solid fa-truck-fast text-accent"></i>
            <span>1. Shipping Address</span>
          </div>

          <div class="form-group">
            <label>Full Name</label>
            <input type="text" id="chk-name" required placeholder="Abhishek Sharma" class="form-input" value="Abhishek Sharma">
          </div>

          <div class="form-group">
            <label>Street Address</label>
            <input type="text" id="chk-address" required placeholder="742 Civil Lines" class="form-input" value="742 Civil Lines">
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>City</label>
              <input type="text" id="chk-city" required placeholder="New Delhi" class="form-input" value="New Delhi">
            </div>
            <div class="form-group">
              <label>Pincode / Zip</label>
              <input type="text" id="chk-pincode" required placeholder="110001" class="form-input" value="110001">
            </div>
          </div>

          <div class="form-group">
            <label>Phone Number</label>
            <input type="tel" id="chk-phone" required placeholder="+91 98765 43210" class="form-input" value="+91 98765 43210">
          </div>

          <div class="checkout-section-title mt-4">
            <i class="fa-solid fa-wallet text-accent"></i>
            <span>2. Payment Method</span>
          </div>

          <div class="payment-cards-grid">
            <label class="payment-card-option active" onclick="document.querySelectorAll('.payment-card-option').forEach(c=>c.classList.remove('active')); this.classList.add('active');">
              <input type="radio" name="payment" value="UPI / GPay / PhonePe" checked style="display:none;">
              <div class="pay-card-icon"><i class="fa-solid fa-qrcode text-accent"></i></div>
              <div class="pay-card-info">
                <strong>UPI / GPay / PhonePe</strong>
                <span>Instant 0% Fee Payment</span>
              </div>
            </label>

            <label class="payment-card-option" onclick="document.querySelectorAll('.payment-card-option').forEach(c=>c.classList.remove('active')); this.classList.add('active');">
              <input type="radio" name="payment" value="Cash on Delivery (COD)" style="display:none;">
              <div class="pay-card-icon"><i class="fa-solid fa-money-bill-wave text-warning"></i></div>
              <div class="pay-card-info">
                <strong>Cash on Delivery (COD)</strong>
                <span>Pay cash at doorstep</span>
              </div>
            </label>

            <label class="payment-card-option" onclick="document.querySelectorAll('.payment-card-option').forEach(c=>c.classList.remove('active')); this.classList.add('active');">
              <input type="radio" name="payment" value="Credit / Debit Card" style="display:none;">
              <div class="pay-card-icon"><i class="fa-solid fa-credit-card text-primary"></i></div>
              <div class="pay-card-info">
                <strong>Credit / Debit Card</strong>
                <span>Visa, Mastercard, RuPay</span>
              </div>
            </label>
          </div>

          <button type="submit" class="btn btn-lg btn-accent w-100 mt-4 place-order-submit-btn">
            <i class="fa-solid fa-lock"></i> Place Order (${sym}${totals.total.toLocaleString('en-IN')})
          </button>
        </form>

        <div class="checkout-summary-card">
          <div class="checkout-section-title mb-3">
            <i class="fa-solid fa-receipt text-accent"></i>
            <span>Order Summary (${totals.itemCount} items)</span>
          </div>

          <div class="checkout-items-scroll">
            ${AppState.cart.map(item => {
              const p = PRODUCTS.find(prod => prod.id === item.productId);
              if (!p) return '';
              const pPrice = UIRenderer.formatPrice(p.price, p.priceINR);
              return `
                <div class="chk-item-row">
                  <img src="${p.images[0]}" alt="${p.name}">
                  <div class="chk-item-info">
                    <div class="chk-item-title">${p.name}</div>
                    <div class="chk-item-meta">Qty: ${item.quantity} × <strong class="text-accent">${pPrice}</strong></div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>

          <div class="cart-summary-breakdown mt-4">
            <div class="summary-row"><span>Items Subtotal:</span> <span>${sym}${totals.subtotal.toLocaleString('en-IN')}</span></div>
            ${totals.discount > 0 ? `<div class="summary-row text-success"><span>Discount Promo:</span> <span>-${sym}${totals.discount.toLocaleString('en-IN')}</span></div>` : ''}
            <div class="summary-row"><span>Express Delivery:</span> <span>${totals.shipping === 0 ? '<strong class="text-success">FREE</strong>' : `${sym}${totals.shipping.toLocaleString('en-IN')}`}</span></div>
            <div class="summary-row"><span>GST / Tax (5%):</span> <span>${sym}${totals.tax.toLocaleString('en-IN')}</span></div>
            <div class="summary-row total-row mt-2" style="font-size:1.15rem;">
              <span>Total Payable:</span>
              <span class="text-accent">${sym}${totals.total.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div class="checkout-guarantee-badge mt-4">
            <i class="fa-solid fa-shield-halved text-accent"></i>
            <span>30-Day Money Back Guarantee & Easy Size Exchanges</span>
          </div>
        </div>
      </div>
    `;

    modal.classList.add('active');
  },

  closeCheckoutModal() {
    const modal = document.getElementById('checkout-modal');
    if (modal) modal.classList.remove('active');
  },

  handlePlaceOrder(event) {
    event.preventDefault();

    const name = document.getElementById('chk-name').value;
    const address = document.getElementById('chk-address').value;
    const city = document.getElementById('chk-city').value;
    const pincode = document.getElementById('chk-pincode').value;
    
    const checkedPay = document.querySelector('input[name="payment"]:checked');
    const paymentMethod = checkedPay ? checkedPay.value : "UPI / GPay / PhonePe";

    const totals = this.calculateTotals();
    const orderItems = AppState.cart.map(item => {
      const p = PRODUCTS.find(prod => prod.id === item.productId);
      return {
        productId: item.productId,
        productName: p ? p.name : 'Product',
        price: p ? (AppState.currency === 'INR' ? (p.priceINR || p.price * 82) : p.price) : 0,
        quantity: item.quantity
      };
    });

    const newOrder = orderStore.createOrder({
      name,
      address,
      city,
      pincode,
      paymentMethod,
      items: orderItems,
      total: totals.total
    });

    AppState.cart = [];
    AppState.coupons = { code: null, discountPercent: 0, discountFixed: 0, freeShipping: false };
    AppState.saveState();
    this.updateCartUI();

    this.closeCheckoutModal();
    this.showOrderSuccessModal(newOrder);
  },

  showOrderSuccessModal(order) {
    const modal = document.getElementById('success-modal');
    const body = document.getElementById('success-modal-body');
    if (!modal || !body) return;

    body.innerHTML = `
      <div class="text-center p-4">
        <div class="success-icon-animated"><i class="fa-solid fa-circle-check" style="font-size:3.5rem; color:var(--accent);"></i></div>
        <h2 class="mt-3" style="font-size:1.8rem; color:#fff;">Order Placed Successfully!</h2>
        <p class="text-muted mt-1">Thank you for shopping with LuxeMart AI.</p>

        <div class="success-order-card mt-4" style="background:var(--bg-card); border:1px solid var(--glass-border); border-radius:var(--radius-lg); padding:1.5rem;">
          <div class="order-id-display" style="font-size:1.1rem; color:#fff;">Order ID: <strong class="text-accent">#${order.id}</strong></div>
          <p class="mt-2 text-muted" style="font-size:0.9rem;">Confirmation sent for <strong>${order.customerName}</strong>.</p>
          <div class="mt-2" style="font-size:0.9rem;">Expected Delivery: <strong class="text-accent">Tomorrow by 5:00 PM</strong></div>
        </div>

        <div class="mt-4 flex-center gap-3" style="display:flex; justify-content:center; gap:1rem;">
          <button class="btn btn-primary" onclick="AppState.trackOrderFromSuccess('${order.id}')">
            <i class="fa-solid fa-location-dot"></i> Track Order Status
          </button>
          <button class="btn btn-outline" onclick="CartManager.closeSuccessModal()">Continue Shopping</button>
        </div>
      </div>
    `;

    modal.classList.add('active');
  },

  closeSuccessModal() {
    const modal = document.getElementById('success-modal');
    if (modal) modal.classList.remove('active');
  }
};
