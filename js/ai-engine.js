/**
 * LuxeMart AI Engine - Strict Slot Ranking & Voice Text-to-Speech (TTS) Engine
 */

class AIEngine {
  constructor() {
    this.catalog = PRODUCTS;
    this.policies = STORE_POLICIES;
    this.voiceMuted = false;
  }

  async processMessage(userPrompt) {
    const prompt = userPrompt.trim();

    if (window.AppState && window.AppState.apiKey) {
      try {
        const llmResponse = await this.callGeminiAPI(prompt, window.AppState.apiKey);
        if (llmResponse) {
          this.speakVoice(llmResponse.text);
          return llmResponse;
        }
      } catch (err) {
        console.warn("Gemini API call failed, falling back to offline NLP engine", err);
      }
    }

    const response = this.processOfflineNLP(prompt);
    if (response && response.text) {
      this.speakVoice(response.text);
    }
    return response;
  }

  async callGeminiAPI(userPrompt, apiKey) {
    const catalogSummary = this.catalog.map(p => ({
      id: p.id,
      name: p.name,
      category: p.category,
      subCategory: p.subCategory,
      priceINR: p.priceINR || Math.round(p.price * 82),
      priceUSD: p.price,
      rating: p.rating,
      brand: p.brand,
      description: p.description
    }));

    const systemInstruction = `You are LuxeMart AI, an expert e-commerce shopping assistant.
Available Store Catalog: ${JSON.stringify(catalogSummary)}

Help the customer find the best products, check store policy, or answer product questions.
If recommending products from catalog, be concise, enthusiastic, and provide clear prices in ₹ (Rupees) or $.`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const payload = {
      contents: [
        {
          role: "user",
          parts: [{ text: `${systemInstruction}\n\nUser Question: ${userPrompt}` }]
        }
      ]
    };

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      throw new Error(`Gemini API HTTP Error: ${res.status}`);
    }

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    
    // Check if offline NLP finds interactive widgets (recommendations, order tracking, policies)
    const offlineMatch = this.processOfflineNLP(userPrompt);
    if (offlineMatch && (offlineMatch.type === 'recommendation' || offlineMatch.type === 'order_status' || offlineMatch.type === 'policy')) {
      if (text) offlineMatch.text = text;
      return offlineMatch;
    }

    return {
      type: 'text',
      text: text || "I'm here to help! Ask me anything about LuxeMart products, shipping, returns, or sizes."
    };
  }

  speakVoice(text) {
    if (this.voiceMuted || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel(); // Stop current speech
      const cleanText = text.replace(/[*_#`]/g, '').replace(/https?:\/\/\S+/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText.slice(0, 180)); // Speak intro phrase
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("Speech Synthesis error", e);
    }
  }

  processOfflineNLP(prompt) {
    const lower = prompt.toLowerCase();

    // 1. Order Status Check
    const hasTrackKeyword = lower.includes("track") || lower.includes("order") || lower.includes("status") || lower.includes("where is");
    const orderNumMatch = lower.match(/(?:#|ord[-_\s]?)?(\d{4,6})/i) || lower.match(/ord[-_\s]?\d{4,6}/i);

    if (hasTrackKeyword || orderNumMatch) {
      let searchId = null;
      if (orderNumMatch) {
        searchId = orderNumMatch[0];
      }

      const foundOrder = searchId ? orderStore.findOrder(searchId) : (orderStore.orders.length > 0 ? orderStore.orders[0] : null);

      if (foundOrder) {
        return {
          type: 'order_status',
          order: foundOrder,
          text: `Here is the live status & timeline for order **#${foundOrder.id}**:`
        };
      } else {
        if (orderStore.orders.length > 0) {
          const latest = orderStore.orders[0];
          return {
            type: 'order_status',
            order: latest,
            text: `I couldn't find order "${prompt}". Here is your most recent placed order **#${latest.id}**:`
          };
        }
        return {
          type: 'text',
          text: `I couldn't find an order matching **${prompt}**. Please check your Order ID in your confirmation or place a new test order.`
        };
      }
    }

    // 2. Size Advisor Query
    if (lower.includes("size") || lower.includes("fit advisor") || lower.includes("what size should i get") || lower.includes("measurement")) {
      return {
        type: 'size_advisor_trigger',
        text: `To give you the exact fit recommendation (S, M, L, XL or Shoe Sizes 7-11), launch our interactive **AI Size & Fit Advisor**!`
      };
    }

    // 3. Policy Queries
    if (lower.includes("return") || lower.includes("refund") || lower.includes("exchange")) {
      return { type: 'policy', policy: this.policies.returns, text: `Here is our **30-Day Returns & Easy Size Exchange Policy**:` };
    }
    if (lower.includes("shipping") || lower.includes("delivery")) {
      return { type: 'policy', policy: this.policies.shipping, text: `Here is our **Shipping & Delivery Policy**:` };
    }
    if (lower.includes("warranty") || lower.includes("guarantee")) {
      return { type: 'policy', policy: this.policies.warranty, text: `Here is our **Warranty Protection Policy**:` };
    }

    // 4. Comparison Query
    if (lower.includes("compare") || lower.includes("vs")) {
      let candidates = [];
      if (lower.includes("shoe") || lower.includes("sneaker") || lower.includes("footwear")) {
        candidates = this.catalog.filter(p => p.subCategory === "shoes");
      } else if (lower.includes("protein") || lower.includes("whey")) {
        candidates = this.catalog.filter(p => p.category === "fitness");
      } else if (lower.includes("hoodie") || lower.includes("shirt") || lower.includes("tshirt")) {
        candidates = this.catalog.filter(p => p.category === "apparel");
      } else {
        candidates = this.catalog.slice(0, 3);
      }

      return {
        type: 'comparison_trigger',
        products: candidates,
        text: `I've prepared a side-by-side comparison matrix for your query. Click below to view specifications and value scores!`
      };
    }

    // 5. Extract Slots: Budget, Category, SubCategory, Features, Brand
    const intent = this.extractIntent(lower);

    if (intent.isUnderspecified) {
      return {
        type: 'clarification',
        text: `I'd love to help you find the best pick! Could you specify your preferred **category** (e.g. Protein, Shoes, T-Shirts) and **budget range**?`
      };
    }

    const scoredProducts = this.rankProducts(intent);

    if (scoredProducts.length === 0) {
      const fallbackPicks = [...this.catalog].sort((a, b) => b.rating - a.rating).slice(0, 3);
      return {
        type: 'recommendation',
        products: fallbackPicks,
        totalMatches: fallbackPicks.length,
        text: `I couldn't find an exact match under your specific filter constraints, but here are our top-rated closest alternatives in stock:`
      };
    }

    // Sync Storefront Catalog View
    if (window.AppState) {
      if (intent.category) window.AppState.filters.category = intent.category;
      if (intent.subCategory === 'shoes') {
        window.AppState.filters.category = 'fashion';
        window.AppState.filters.search = 'shoes';
      } else if (intent.tags.length > 0) {
        window.AppState.filters.search = intent.tags[0];
      }
      window.AppState.renderCatalog();
    }

    const topPicks = scoredProducts.slice(0, 3);
    const totalMatchesCount = scoredProducts.length;
    const reasoningText = this.buildRecommendationIntro(intent, topPicks.length, totalMatchesCount);

    return {
      type: 'recommendation',
      products: topPicks,
      totalMatches: totalMatchesCount,
      text: reasoningText,
      intent: intent
    };
  }

  extractIntent(lower) {
    const intent = {
      category: null,
      subCategory: null,
      maxBudget: null,
      tags: [],
      isHinglish: false,
      isINR: false,
      isUnderspecified: false
    };

    if (/batado|sasta|mehenga|accha|achha|jo|chahiye|dikhao|joota|jootey|kapde|pooja/.test(lower)) {
      intent.isHinglish = true;
    }

    if (/rs|inr|₹|rupees/.test(lower)) {
      intent.isINR = true;
    }

    const budgetMatch = lower.match(/(?:under|below|less than|within|max|budget|rs|inr|\$|₹)?\s*[\$₹]?\s*(\d{2,6})\s*(?:usd|rs|inr|\$|₹|rupees)?/i);
    if (budgetMatch) {
      const val = parseFloat(budgetMatch[1]);
      if (val > 10 && val < 500000) intent.maxBudget = val;
    }

    // STRICT FITNESS & PROTEIN SUPPLEMENTS MATCHER
    if (/protein|protien|whey|creatine|bcaa|isolate|mass gainer|supplements|gym nutrition|multivitamin|peanut butter/.test(lower)) {
      intent.category = "fitness";
      intent.tags.push("protein", "supplements", "fitness");
    }
    // STRICT RELIGIOUS & PUJA ESSENTIALS MATCHER
    else if (/puja|pooja|religious|diya|incense|agarbatti|thali|ganesha|idol|kalash|temple|mandir|chandan/.test(lower)) {
      intent.category = "puja";
      intent.tags.push("puja", "pooja", "brass", "religious");
    }
    // STRICT SHOES MATCHER
    else if (/shoe|shoes|sneaker|sneakers|footwear|foot wear|joota|jootey|running shoes|jogging shoes|boots/.test(lower)) {
      intent.category = "fashion";
      intent.subCategory = "shoes";
      intent.tags.push("shoes", "sneakers", "running", "footwear");
    } 
    // STRICT APPAREL MATCHER
    else if (/clothes|apparel|hoodie|jeans|denim|blazer|suit|shirt|t-shirt|tee|tshiert|tshirt|kurta|dress|jacket/.test(lower)) {
      intent.category = "apparel";
    } 
    // TECH MATCHER
    else if (/laptop|macbook|computer|notebook|workstation/.test(lower)) {
      intent.category = "electronics";
      intent.subCategory = "laptops";
    } else if (/smartwatch|watch|fitness band|tracker/.test(lower)) {
      intent.category = "electronics";
      intent.subCategory = "smartwatches";
    }

    if (/gym|sports|running|workout/.test(lower)) intent.tags.push("gym", "sports", "running");
    if (/casual|streetwear/.test(lower)) intent.tags.push("casual", "streetwear");

    if (lower.trim().split(/\s+/).length <= 2 && !intent.maxBudget && intent.tags.length === 0) {
      intent.isUnderspecified = true;
    }

    return intent;
  }

  rankProducts(intent) {
    let pool = this.catalog.filter(p => p.inStock);

    const scored = pool.map(p => {
      let score = 0;

      // STRICT Category Enforcement (Prevents shoes showing up for protein!)
      if (intent.category) {
        if (p.category === intent.category) {
          score += 80;
        } else {
          score -= 500; // Massive penalty: Never show shoes or clothes for protein queries!
        }
      }

      // SubCategory Matching
      if (intent.subCategory) {
        if (p.subCategory === intent.subCategory || p.tags.includes(intent.subCategory)) {
          score += 60;
        } else {
          score -= 300;
        }
      }

      // Tag matching
      intent.tags.forEach(t => {
        if (p.tags.includes(t) || (p.subCategory && p.subCategory.includes(t))) score += 20;
      });

      // Budget scoring
      if (intent.maxBudget) {
        const isINRQuery = intent.isINR || intent.maxBudget > 200 || (window.AppState && window.AppState.currency === 'INR');
        const itemPrice = isINRQuery ? (p.priceINR || Math.round(p.price * 82)) : p.price;

        if (itemPrice <= intent.maxBudget) {
          score += 40;
        } else {
          score -= 150;
        }
      }

      score += p.rating * 5;
      return { product: p, score };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored.filter(s => s.score > 0).map(s => s.product);
  }

  buildRecommendationIntro(intent, highlightCount, totalMatches) {
    const isINRQuery = intent.isINR || (intent.maxBudget && intent.maxBudget > 200) || (window.AppState && window.AppState.currency === 'INR');
    const currencySym = isINRQuery ? '₹' : '$';

    if (intent.category === 'fitness') {
      return `Found **${totalMatches} Protein & Fitness Supplements** under ${currencySym}${intent.maxBudget || 1500}! Top picks for your workout:`;
    }

    if (intent.category === 'puja') {
      return `Found **${totalMatches} Divine Puja & Religious Items**! Top hand-crafted recommendations for your mandir:`;
    }

    if (intent.subCategory === 'shoes') {
      return `Found **${totalMatches} Sneakers & Shoes** under ${currencySym}${intent.maxBudget || 1500}! Here are top picks for you:`;
    }

    if (intent.isHinglish) {
      return `Aapke query ke liye total **${totalMatches} choices** mil gaye hain! Top ${highlightCount} recommendations niche hain:`;
    }
    if (intent.maxBudget) {
      return `Found **${totalMatches} matching choices** under ${currencySym}${intent.maxBudget}! Here are top recommendations:`;
    }
    return `Found **${totalMatches} matching choices** for your request! Here are top recommendations:`;
  }

  generateWhyItFits(product, intent) {
    if (product.category === 'fitness') {
      return `Lab-tested formula with ${product.specs["Protein Per Serving"] || "25g protein"} per serving and ${product.returnPolicy}.`;
    }
    if (product.category === 'puja') {
      return `Crafted from 100% ${product.specs["Material"] || "pure brass"} by Indian artisans for sacred rituals.`;
    }
    if (product.subCategory === 'shoes') {
      return `High-performance ${product.specs["Midsole"] || "cushioned sole"} with ${product.returnPolicy} for free size exchanges.`;
    }
    return `Rated ${product.rating}★ by ${product.reviewCount} verified shoppers with ${product.warranty}.`;
  }
}

const aiEngine = new AIEngine();
