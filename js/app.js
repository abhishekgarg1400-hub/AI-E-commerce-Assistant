/**
 * LuxeMart AI - Main Application Controller & State Manager (Default Currency: Rupees ₹)
 */

class AppStore {
  constructor() {
    this.products = PRODUCTS;
    this.currency = localStorage.getItem('luxemart_currency') || 'INR'; // Default to Rupees ₹ INR
    this.sortBy = 'featured';
    this.filters = {
      category: 'all',
      maxPrice: 150000,
      search: '',
      rating: 0,
      inStockOnly: false
    };
    this.cart = [];
    this.wishlist = [];
    this.coupons = { code: null, discountPercent: 0, discountFixed: 0, freeShipping: false };
    this.comparisonList = [];
    this.apiKey = localStorage.getItem('luxemart_gemini_key') || '';
    this.isListening = false;

    this.loadState();
  }

  loadState() {
    const savedCart = localStorage.getItem('luxemart_cart');
    if (savedCart) {
      try { this.cart = JSON.parse(savedCart); } catch (e) {}
    }
    const savedCompare = localStorage.getItem('luxemart_compare');
    if (savedCompare) {
      try { this.comparisonList = JSON.parse(savedCompare); } catch (e) {}
    }
    const savedWishlist = localStorage.getItem('luxemart_wishlist');
    if (savedWishlist) {
      try { this.wishlist = JSON.parse(savedWishlist); } catch (e) {}
    }
  }

  saveState() {
    localStorage.setItem('luxemart_cart', JSON.stringify(this.cart));
    localStorage.setItem('luxemart_compare', JSON.stringify(this.comparisonList));
    localStorage.setItem('luxemart_wishlist', JSON.stringify(this.wishlist));
    localStorage.setItem('luxemart_currency', this.currency);
  }

  init() {
    this.bindEvents();
    this.initVoiceRecognition();
    this.initSaleTimer();
    this.renderCatalog();
    this.updateWishlistUI();
    CartManager.updateCartUI();
    ComparisonManager.updateComparisonUI();
    this.sendInitialWelcomeMessage();
  }

  bindEvents() {
    const searchInput = document.getElementById('catalog-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.filters.search = e.target.value.toLowerCase();
        this.renderCatalog();
      });
    }

    document.querySelectorAll('.cat-pill').forEach(pill => {
      pill.addEventListener('click', (e) => {
        document.querySelectorAll('.cat-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        this.filters.category = pill.getAttribute('data-cat');
        this.renderCatalog();
      });
    });

    const priceSlider = document.getElementById('price-range');
    const priceVal = document.getElementById('price-range-val');
    if (priceSlider) {
      priceSlider.addEventListener('input', (e) => {
        this.filters.maxPrice = parseFloat(e.target.value);
        if (priceVal) priceVal.textContent = `₹${this.filters.maxPrice.toLocaleString('en-IN')}`;
        this.renderCatalog();
      });
    }

    const sortSelect = document.getElementById('sort-by-select');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        this.sortBy = e.target.value;
        this.renderCatalog();
      });
    }

    const currencyToggleBtn = document.getElementById('currency-toggle-btn');
    if (currencyToggleBtn) {
      currencyToggleBtn.addEventListener('click', () => {
        this.currency = this.currency === 'INR' ? 'USD' : 'INR';
        this.saveState();
        currencyToggleBtn.textContent = this.currency === 'INR' ? '🇮🇳 ₹ INR' : '🇺🇸 $ USD';
        this.renderCatalog();
        CartManager.updateCartUI();
        UIRenderer.showToast(`Switched currency to ${this.currency}`, "info");
      });
      currencyToggleBtn.textContent = this.currency === 'INR' ? '🇮🇳 ₹ INR' : '🇺🇸 $ USD';
    }

    const stockChk = document.getElementById('instock-only');
    if (stockChk) {
      stockChk.addEventListener('change', (e) => {
        this.filters.inStockOnly = e.target.checked;
        this.renderCatalog();
      });
    }

    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');

    if (chatForm && chatInput) {
      chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = chatInput.value.trim();
        if (text) {
          this.handleUserSendMessage(text);
          chatInput.value = '';
        }
      });
    }
  }

  initSaleTimer() {
    let secondsLeft = 15150;
    const timerEl = document.getElementById('sale-countdown-timer');
    if (!timerEl) return;

    setInterval(() => {
      secondsLeft--;
      if (secondsLeft < 0) secondsLeft = 15150;
      const hrs = String(Math.floor(secondsLeft / 3600)).padStart(2, '0');
      const mins = String(Math.floor((secondsLeft % 3600) / 60)).padStart(2, '0');
      const secs = String(secondsLeft % 60).padStart(2, '0');
      timerEl.textContent = `${hrs}:${mins}:${secs}`;
    }, 1000);
  }

  initVoiceRecognition() {
    const micBtn = document.getElementById('voice-search-btn');
    if (!micBtn) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      micBtn.title = "Voice recognition not supported in browser";
      micBtn.style.opacity = '0.5';
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      this.isListening = true;
      micBtn.classList.add('listening');
      UIRenderer.showToast("Listening... Speak your query!", "info");
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      const chatInput = document.getElementById('chat-input');
      if (chatInput) {
        chatInput.value = transcript;
        this.handleUserSendMessage(transcript);
        chatInput.value = '';
      }
    };

    recognition.onerror = () => {
      this.isListening = false;
      micBtn.classList.remove('listening');
    };

    recognition.onend = () => {
      this.isListening = false;
      micBtn.classList.remove('listening');
    };

    micBtn.addEventListener('click', () => {
      if (this.isListening) recognition.stop();
      else recognition.start();
    });
  }

  toggleWishlist(productId) {
    const index = this.wishlist.indexOf(productId);
    if (index > -1) {
      this.wishlist.splice(index, 1);
      UIRenderer.showToast("Removed from Wishlist", "info");
    } else {
      this.wishlist.push(productId);
      const p = PRODUCTS.find(prod => prod.id === productId);
      UIRenderer.showToast(`Saved "${p ? p.name : 'item'}" to Wishlist! ❤️`, "success");
    }
    this.saveState();
    this.renderCatalog();
    this.updateWishlistUI();
  }

  updateWishlistUI() {
    const badge = document.getElementById('wishlist-badge-count');
    if (badge) {
      badge.textContent = this.wishlist.length;
      badge.style.display = this.wishlist.length > 0 ? 'inline-block' : 'none';
    }
  }

  toggleWishlistDrawer() {
    const drawer = document.getElementById('wishlist-drawer');
    const container = document.getElementById('wishlist-drawer-items');
    if (!drawer || !container) return;

    if (this.wishlist.length === 0) {
      container.innerHTML = `<div class="empty-cart-view"><i class="fa-regular fa-heart empty-cart-icon"></i><p>Your wishlist is currently empty.</p></div>`;
    } else {
      container.innerHTML = this.wishlist.map(id => {
        const p = PRODUCTS.find(prod => prod.id === id);
        if (!p) return '';
        const priceDisplay = UIRenderer.formatPrice(p.price, p.priceINR);
        return `
          <div class="cart-line-item">
            <img src="${p.images[0]}" alt="${p.name}" class="cart-item-img">
            <div class="cart-item-details">
              <h4 class="cart-item-title">${p.name}</h4>
              <div class="cart-item-price">${priceDisplay}</div>
              <button class="btn btn-xs btn-primary mt-2" onclick="CartManager.addToCart('${p.id}')">Buy Now</button>
            </div>
            <button class="cart-item-remove" onclick="AppState.toggleWishlist('${p.id}'); AppState.toggleWishlistDrawer();">×</button>
          </div>
        `;
      }).join('');
    }

    drawer.classList.toggle('active');
  }

  toggleAIAssistantDrawer() {
    const drawer = document.getElementById('ai-assistant-drawer');
    if (drawer) drawer.classList.toggle('active');
  }

  closeAIAssistantDrawer() {
    const drawer = document.getElementById('ai-assistant-drawer');
    if (drawer) drawer.classList.remove('active');
  }

  calculateFitSize(heightCm, weightKg, preference) {
    let size = "M";
    const bmi = weightKg / ((heightCm / 100) * (heightCm / 100));

    if (bmi < 20) size = preference === 'oversized' ? 'M' : 'S';
    else if (bmi >= 20 && bmi < 25) size = preference === 'slim' ? 'S' : (preference === 'oversized' ? 'L' : 'M');
    else if (bmi >= 25 && bmi < 30) size = preference === 'slim' ? 'M' : 'L';
    else size = 'XL';

    const resultBox = document.getElementById('size-advisor-result');
    if (resultBox) {
      resultBox.innerHTML = `
        <div class="size-result-card">
          <i class="fa-solid fa-square-check text-accent" style="font-size:2rem;"></i>
          <h3>Your Recommended Size: <span class="text-accent" style="font-size:1.8rem;">${size}</span></h3>
          <p class="text-muted mt-1">Calculated based on ${heightCm}cm height, ${weightKg}kg weight (${preference} fit preference).</p>
          <button class="btn btn-accent btn-sm mt-3" onclick="AppState.filterByRecommendedSize('${size}')">
            Show Clothes in Size ${size}
          </button>
        </div>
      `;
    }
  }

  filterByRecommendedSize(size) {
    UIRenderer.closeSizeAdvisorModal();
    this.filters.category = 'apparel';
    document.querySelectorAll('.cat-pill').forEach(p => p.classList.remove('active'));
    document.querySelector('.cat-pill[data-cat="apparel"]')?.classList.add('active');
    this.renderCatalog();
    this.sendQuickQuery(`Show me clothes in size ${size}`);
  }

  renderCatalog() {
    const grid = document.getElementById('catalog-grid');
    const countEl = document.getElementById('catalog-count');
    if (!grid) return;

    let filtered = PRODUCTS.filter(p => {
      if (this.filters.category !== 'all' && p.category !== this.filters.category) return false;
      const itemPrice = (this.currency === 'INR') ? (p.priceINR || Math.round(p.price * 82)) : p.price;
      if (itemPrice > this.filters.maxPrice) return false;
      if (this.filters.inStockOnly && !p.inStock) return false;
      if (this.filters.search) {
        const query = this.filters.search;
        const matchName = p.name.toLowerCase().includes(query);
        const matchBrand = p.brand.toLowerCase().includes(query);
        const matchTag = p.tags.some(t => t.toLowerCase().includes(query));
        if (!matchName && !matchBrand && !matchTag) return false;
      }
      return true;
    });

    if (this.sortBy === 'price-asc') {
      filtered.sort((a, b) => (this.currency === 'INR' ? (a.priceINR || a.price * 82) : a.price) - (this.currency === 'INR' ? (b.priceINR || b.price * 82) : b.price));
    } else if (this.sortBy === 'price-desc') {
      filtered.sort((a, b) => (this.currency === 'INR' ? (b.priceINR || b.price * 82) : b.price) - (this.currency === 'INR' ? (a.priceINR || a.price * 82) : a.price));
    } else if (this.sortBy === 'rating') {
      filtered.sort((a, b) => b.rating - a.rating);
    }

    if (countEl) countEl.textContent = `${filtered.length} Products Found`;

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div class="no-products-view">
          <i class="fa-solid fa-magnifying-glass"></i>
          <h3>No matching products found</h3>
          <p>Try broadening your search keyword or resetting filters.</p>
          <button class="btn btn-outline btn-sm mt-3" onclick="AppState.resetFilters()">Reset All Filters</button>
        </div>
      `;
    } else {
      grid.innerHTML = filtered.map(p => UIRenderer.renderCatalogCard(p)).join('');
    }
  }

  resetFilters() {
    this.filters = { category: 'all', maxPrice: 150000, search: '', rating: 0, inStockOnly: false };
    this.sortBy = 'featured';
    document.querySelectorAll('.cat-pill').forEach(p => p.classList.remove('active'));
    document.querySelector('.cat-pill[data-cat="all"]')?.classList.add('active');
    const priceSlider = document.getElementById('price-range');
    if (priceSlider) priceSlider.value = 150000;
    const priceVal = document.getElementById('price-range-val');
    if (priceVal) priceVal.textContent = '₹1,50,000';
    const searchInput = document.getElementById('catalog-search');
    if (searchInput) searchInput.value = '';
    const stockChk = document.getElementById('instock-only');
    if (stockChk) stockChk.checked = false;
    const sortSelect = document.getElementById('sort-by-select');
    if (sortSelect) sortSelect.value = 'featured';

    this.renderCatalog();
  }

  async handleUserSendMessage(userText) {
    UIRenderer.renderChatMessage({ sender: 'user', text: userText });
    this.showTypingIndicator();

    setTimeout(async () => {
      const aiResponse = await aiEngine.processMessage(userText);
      this.hideTypingIndicator();
      UIRenderer.renderChatMessage({ sender: 'ai', ...aiResponse });
    }, 600);
  }

  sendQuickQuery(queryText) {
    const drawer = document.getElementById('ai-assistant-drawer');
    if (drawer && !drawer.classList.contains('active')) {
      drawer.classList.add('active');
    }
    this.handleUserSendMessage(queryText);
  }

  showTypingIndicator() {
    const chatMessages = document.getElementById('chat-messages');
    if (!chatMessages) return;

    let indicator = document.getElementById('typing-indicator-wrapper');
    if (!indicator) {
      indicator = document.createElement('div');
      indicator.id = 'typing-indicator-wrapper';
      indicator.className = 'chat-bubble-wrapper ai';
      indicator.innerHTML = `
        <div class="chat-avatar ai-avatar"><i class="fa-solid fa-robot"></i></div>
        <div class="chat-bubble ai-bubble typing-bubble">
          <span class="dot"></span><span class="dot"></span><span class="dot"></span>
        </div>
      `;
      chatMessages.appendChild(indicator);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
  }

  hideTypingIndicator() {
    const indicator = document.getElementById('typing-indicator-wrapper');
    if (indicator) indicator.remove();
  }

  sendInitialWelcomeMessage() {
    const welcome = {
      sender: 'ai',
      type: 'text',
      text: `Namaste! 👋 I'm **LuxeMart AI**, your personal shopping assistant. I can help you find products, compare options, check store policies, and track your orders.

Try asking me questions like:
- *"Show me t-shirts under 500"* 👕
- *"Show me shoes under 1000"* 👟
- *"What size should I buy?"* 📏
- *"Show me laptops for programming under 90000"* 💻
- *"Track order #ORD-8821"* 📦`
    };
    UIRenderer.renderChatMessage(welcome);
  }

  trackOrderFromSuccess(orderId) {
    CartManager.closeSuccessModal();
    this.toggleAIAssistantDrawer();
    this.handleUserSendMessage(`Track order #${orderId}`);
  }

  togglePolicyDrawer() {
    const drawer = document.getElementById('policy-drawer');
    if (drawer) drawer.classList.toggle('active');
  }

  saveApiKey(key) {
    this.apiKey = key.trim();
    localStorage.setItem('luxemart_gemini_key', this.apiKey);
    UIRenderer.showToast(this.apiKey ? "Gemini API key saved! Live LLM mode active." : "API key removed. Switched to offline NLP mode.", "success");
    const modal = document.getElementById('api-key-modal');
    if (modal) modal.classList.remove('active');
  }
}

const AppState = new AppStore();

document.addEventListener('DOMContentLoaded', () => {
  AppState.init();
});
