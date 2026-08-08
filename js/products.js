/**
 * LuxeMart AI - Massive Amazon & Meesho Scale Product Catalog (with Budget Supplements under ₹1500)
 */

const SHOE_ITEMS = [
  {
    id: "sh-01", name: "Velocity Knit Running Sneakers", category: "fashion", subCategory: "shoes",
    price: 74.99, priceINR: 999, originalPrice: 99.99, discountPercent: 25, rating: 4.8, reviewCount: 530, stock: 50, inStock: true, brand: "Velocity",
    tags: ["shoes", "sneakers", "running", "gym", "breathable", "sports", "footwear"],
    sizes: ["7", "8", "9", "10", "11"], colors: ["Red Nitro", "Stealth Grey"],
    images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80"],
    specs: { "Upper": "3D Flyknit Mesh", "Midsole": "CloudFoam" }, shippingTime: "1-3 Days", returnPolicy: "30-Day Size Exchange", warranty: "90-Day Guarantee", badges: ["🔥 Best Seller", "25% OFF"], description: "Responsive running sneakers built with flyknit mesh matrix."
  },
  {
    id: "sh-02", name: "UrbanFlex High-Top Canvas Streetwear Sneakers", category: "fashion", subCategory: "shoes",
    price: 49.99, priceINR: 799, originalPrice: 69.99, discountPercent: 28, rating: 4.7, reviewCount: 310, stock: 45, inStock: true, brand: "UrbanFlex",
    tags: ["shoes", "sneakers", "high-top", "canvas", "streetwear", "casual"],
    sizes: ["7", "8", "9", "10"], colors: ["Chalk White", "All Black"],
    images: ["https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=600&auto=format&fit=crop&q=80"],
    specs: { "Material": "12oz Canvas", "Sole": "Vulcanized Rubber" }, shippingTime: "1-2 Days", returnPolicy: "30-Day Easy Exchange", warranty: "Sole Guarantee", badges: ["Trending", "28% OFF"], description: "Classic high-top canvas streetwear sneakers."
  },
  {
    id: "sh-03", name: "AuraPro Slip-On Ultra-Light Walking Shoes", category: "fashion", subCategory: "shoes",
    price: 39.99, priceINR: 599, originalPrice: 59.99, discountPercent: 33, rating: 4.9, reviewCount: 420, stock: 80, inStock: true, brand: "AuraStudio",
    tags: ["shoes", "sneakers", "slip-on", "walking", "lightweight", "comfort"],
    sizes: ["6", "7", "8", "9", "10", "11"], colors: ["Charcoal Grey", "Navy"],
    images: ["https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=600&auto=format&fit=crop&q=80"],
    specs: { "Weight": "180g", "Insole": "Memory Foam" }, shippingTime: "1-2 Days", returnPolicy: "30-Day Free Exchange", warranty: "Comfort Guarantee", badges: ["Ultra Comfort", "33% OFF"], description: "Featherlight slip-on walking shoes featuring memory foam orthotic soles."
  },
  {
    id: "sh-04", name: "LuxeLeather Casual Low-Top Dress Sneakers", category: "fashion", subCategory: "shoes",
    price: 89.99, priceINR: 1299, originalPrice: 119.99, discountPercent: 25, rating: 4.8, reviewCount: 190, stock: 30, inStock: true, brand: "LuxeTailor",
    tags: ["shoes", "sneakers", "leather", "dress-sneaker", "formal", "office"],
    sizes: ["8", "9", "10", "11"], colors: ["White Italian Leather", "Tan Brown"],
    images: ["https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&auto=format&fit=crop&q=80"],
    specs: { "Material": "Full-Grain Leather", "Lining": "Soft Leather" }, shippingTime: "1-2 Days", returnPolicy: "30-Day Return", warranty: "1-Year Warranty", badges: ["Luxury Pick", "Office Style"], description: "Handcrafted calfskin leather dress sneakers for modern business casual."
  },
  {
    id: "sh-05", name: "AirFlex Cushioned Trail Jogging Shoes", category: "fashion", subCategory: "shoes",
    price: 54.99, priceINR: 899, originalPrice: 79.99, discountPercent: 31, rating: 4.7, reviewCount: 280, stock: 65, inStock: true, brand: "Velocity",
    tags: ["shoes", "sneakers", "jogging", "trail", "running", "sports"],
    sizes: ["7", "8", "9", "10", "11"], colors: ["Trail Black", "Forest Green"],
    images: ["https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&auto=format&fit=crop&q=80"],
    specs: { "Outsole": "Deep Lug Trail", "Midsole": "Air-Cushion" }, shippingTime: "1-2 Days", returnPolicy: "30-Day Exchange", warranty: "Trail Guarantee", badges: ["Trail Ready", "31% OFF"], description: "Deep-lug cushioned trail jogging shoes engineered for rough terrain."
  }
];

const FITNESS_ITEMS = [
  {
    id: "ft-06", name: "NitroCharge 100% Pure Whey Protein Trial Pack (300g)", category: "fitness", subCategory: "supplements",
    price: 14.99, priceINR: 799, originalPrice: 22.99, discountPercent: 35, rating: 4.9, reviewCount: 610, stock: 100, inStock: true, brand: "NutriPro",
    tags: ["fitness", "protein", "whey", "supplements", "gym", "workout", "muscle"],
    flavors: ["Swiss Chocolate", "Vanilla Softserve"],
    images: ["https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=600&auto=format&fit=crop&q=80"],
    specs: { "Protein Per Serving": "25g Pure Whey", "Servings": "10 Servings", "BCAAs": "5.5g" },
    shippingTime: "1-2 Days", returnPolicy: "30-Day Sealed Return", warranty: "Authenticity QR", badges: ["🔥 Under ₹1000", "35% OFF"],
    description: "Compact 100% Pure Whey Protein trial pack loaded with 25g protein per scoop for instant post-workout recovery."
  },
  {
    id: "ft-03", name: "NitroCharge Micronized Creatine Monohydrate (250g)", category: "fitness", subCategory: "supplements",
    price: 19.99, priceINR: 999, originalPrice: 29.99, discountPercent: 33, rating: 4.9, reviewCount: 920, stock: 150, inStock: true, brand: "NutriPro",
    tags: ["fitness", "protein", "creatine", "strength", "power", "gym", "supplements"],
    images: ["https://images.unsplash.com/photo-1546483875-ad9014c88eba?w=600&auto=format&fit=crop&q=80"],
    specs: { "Purity": "99.9% 200 Mesh Micronized", "Servings": "83 Servings" },
    shippingTime: "1-2 Days", returnPolicy: "30-Day Return", warranty: "Lab Tested Purity", badges: ["Strength King", "Under ₹1000"],
    description: "Ultra-pure 200 mesh micronized creatine monohydrate to boost muscle strength, power, and cellular volume."
  },
  {
    id: "ft-04", name: "AnabolicBCAA 2:1:1 Intra-Workout Muscle Fuel (400g)", category: "fitness", subCategory: "supplements",
    price: 24.99, priceINR: 1299, originalPrice: 34.99, discountPercent: 28, rating: 4.7, reviewCount: 310, stock: 90, inStock: true, brand: "NutriPro",
    tags: ["fitness", "protein", "bcaa", "intra-workout", "hydration", "electrolytes", "gym", "supplements"],
    flavors: ["Blue Raspberry", "Watermelon Chill"],
    images: ["https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80"],
    specs: { "Ratio": "2:1:1 Leucine Blend", "Electrolytes": "Key Hydration Matrix" },
    shippingTime: "1-2 Days", returnPolicy: "30-Day Return", warranty: "Zero Banned Substances", badges: ["Hydration Pick", "28% OFF"],
    description: "Instantized 2:1:1 BCAAs with key electrolytes to accelerate muscle repair and prevent fatigue."
  },
  {
    id: "ft-07", name: "FitFuel High-Protein Peanut Butter Crunchy (1kg)", category: "fitness", subCategory: "supplements",
    price: 9.99, priceINR: 599, originalPrice: 14.99, discountPercent: 33, rating: 4.9, reviewCount: 780, stock: 110, inStock: true, brand: "NutriPro",
    tags: ["fitness", "protein", "peanut-butter", "gym", "snack", "supplements"],
    images: ["https://images.unsplash.com/photo-1588615419955-5608fa996980?w=600&auto=format&fit=crop&q=80"],
    specs: { "Protein": "30g Protein per 100g", "Ingredients": "100% Roasted Peanuts, Zero Palm Oil" },
    shippingTime: "1-2 Days", returnPolicy: "30-Day Return", warranty: "100% Organic", badges: ["Healthy Snack", "33% OFF"],
    description: "Delicious high-protein roasted peanut butter with zero palm oil and zero added trans-fats."
  },
  {
    id: "ft-05", name: "NutriPro Daily Sport Multivitamin & Zinc (60 Gummies)", category: "fitness", subCategory: "supplements",
    price: 8.99, priceINR: 499, originalPrice: 12.99, discountPercent: 38, rating: 4.8, reviewCount: 540, stock: 130, inStock: true, brand: "NutriPro",
    tags: ["fitness", "multivitamin", "zinc", "health", "immunity", "supplements"],
    images: ["https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=600&auto=format&fit=crop&q=80"],
    specs: { "Vitamins": "24 Essential Micro-Nutrients", "Count": "60 Gummies" },
    shippingTime: "1-2 Days", returnPolicy: "30-Day Return", warranty: "FSSAI Approved", badges: ["Immunity Boost", "Under ₹500"],
    description: "Chewable sport multivitamin gummies packed with Zinc, Vitamin D3, B12, and antioxidants."
  },
  {
    id: "ft-01", name: "NutriPro 100% Raw Whey Protein Isolate (1kg / 2.2lbs)", category: "fitness", subCategory: "supplements",
    price: 49.99, priceINR: 2499, originalPrice: 69.99, discountPercent: 30, rating: 4.9, reviewCount: 840, stock: 120, inStock: true, brand: "NutriPro",
    tags: ["fitness", "protein", "whey", "isolate", "gym", "workout", "muscle", "supplements"],
    flavors: ["Rich Chocolate Fudge", "Vanilla Bean"],
    images: ["https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=600&auto=format&fit=crop&q=80"],
    specs: { "Protein Per Serving": "27g Pure Isolate", "BCAAs": "6.5g" },
    shippingTime: "1-2 Days", returnPolicy: "30-Day Sealed Return", warranty: "Authenticity QR Guarantee", badges: ["🔥 Top Gym Pick", "30% OFF"],
    description: "Ultra-filtered 100% Whey Protein Isolate with fast absorption for maximum muscle recovery."
  }
];

const APPAREL_ITEMS = [
  {
    id: "ts-01", name: "AuraStudio Heavyweight Streetwear Boxy Tee", category: "apparel", subCategory: "shirts",
    price: 29.99, priceINR: 499, originalPrice: 49.99, discountPercent: 40, rating: 4.9, reviewCount: 620, stock: 85, inStock: true, brand: "AuraStudio",
    tags: ["tshirt", "t-shirt", "tee", "streetwear", "heavyweight", "boxy", "cotton", "casual", "flash"],
    sizes: ["S", "M", "L", "XL", "XXL"], colors: ["Chalk White", "Charcoal"],
    images: ["https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80"],
    specs: { "Material": "280 GSM 100% Heavy Cotton" }, shippingTime: "1-2 Days", returnPolicy: "30-Day Return", warranty: "No-Shrink", badges: ["🔥 Flash Deal", "40% OFF"], description: "Premium 280 GSM heavyweight cotton streetwear tee."
  },
  {
    id: "ts-02", name: "Vintage Acid-Wash Graphic Rock Tee", category: "apparel", subCategory: "shirts",
    price: 24.99, priceINR: 399, originalPrice: 39.99, discountPercent: 37, rating: 4.8, reviewCount: 412, stock: 60, inStock: true, brand: "UrbanEdge",
    tags: ["tshirt", "t-shirt", "tee", "graphic", "vintage", "acid-wash", "retro"],
    sizes: ["S", "M", "L", "XL"], colors: ["Washed Black"],
    images: ["https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&auto=format&fit=crop&q=80"],
    specs: { "Material": "100% Washed Cotton" }, shippingTime: "1-2 Days", returnPolicy: "30-Day Return", warranty: "Color Fastness", badges: ["Trending", "37% OFF"], description: "Authentic acid-washed retro graphic t-shirt."
  },
  {
    id: "ts-03", name: "Performance Dry-Fit Athletic Training Tee", category: "apparel", subCategory: "shirts",
    price: 19.99, priceINR: 299, originalPrice: 29.99, discountPercent: 33, rating: 4.7, reviewCount: 380, stock: 120, inStock: true, brand: "Velocity",
    tags: ["tshirt", "t-shirt", "tee", "gym", "sports", "running", "dry-fit"],
    sizes: ["S", "M", "L", "XL", "XXL"], colors: ["Electric Blue"],
    images: ["https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=600&auto=format&fit=crop&q=80"],
    specs: { "Material": "Micro-Mesh Moisture Wicking" }, shippingTime: "1-2 Days", returnPolicy: "30-Day Return", warranty: "90-Day Guarantee", badges: ["Best Seller", "33% OFF"], description: "Ultra-breathable dry-fit sport t-shirt."
  },
  {
    id: "ts-04", name: "Classic Pique Cotton Slim Polo Shirt", category: "apparel", subCategory: "shirts",
    price: 34.99, priceINR: 599, originalPrice: 49.99, discountPercent: 30, rating: 4.9, reviewCount: 290, stock: 40, inStock: true, brand: "LuxeTailor",
    tags: ["tshirt", "t-shirt", "tee", "polo", "formal", "office"],
    sizes: ["S", "M", "L", "XL"], colors: ["Navy Blue"],
    images: ["https://images.unsplash.com/photo-1625910513413-7fc20e362145?w=600&auto=format&fit=crop&q=80"],
    specs: { "Material": "100% Pique Cotton" }, shippingTime: "1-2 Days", returnPolicy: "30-Day Return", warranty: "Stitching Guarantee", badges: ["Office Choice", "30% OFF"], description: "Refined honeycomb pique cotton polo shirt."
  },
  {
    id: "ap-06", name: "Royal Handcrafted Pure Cotton Chikan Kurta", category: "apparel", subCategory: "ethnics",
    price: 39.99, priceINR: 699, originalPrice: 59.99, discountPercent: 35, rating: 4.9, reviewCount: 340, stock: 50, inStock: true, brand: "LuxeTailor",
    tags: ["clothes", "kurta", "ethnic", "traditional", "puja", "festival"],
    sizes: ["M", "L", "XL", "XXL"], colors: ["Royal White"],
    images: ["https://images.unsplash.com/photo-1609357605129-26f69add5d6e?w=600&auto=format&fit=crop&q=80"],
    specs: { "Fabric": "100% Pure Cotton" }, shippingTime: "1-2 Days", returnPolicy: "30-Day Exchange", warranty: "Color Fastness", badges: ["Festive Special", "35% OFF"], description: "Traditional Lucknowi Chikankari pure cotton kurta."
  }
];

const PUJA_ITEMS = [
  {
    id: "pj-01", name: "Handcrafted Solid Pure Brass Diya Oil Lamp (Set of 2)", category: "puja", subCategory: "puja-items",
    price: 14.99, priceINR: 699, originalPrice: 22.99, discountPercent: 35, rating: 4.9, reviewCount: 560, stock: 80, inStock: true, brand: "DivineVedas",
    tags: ["puja", "pooja", "religious", "diya", "brass", "temple", "oil-lamp"],
    images: ["https://images.unsplash.com/photo-1605648916361-9bc12ad6a569?w=600&auto=format&fit=crop&q=80"],
    specs: { "Material": "Solid Pure Brass" }, shippingTime: "1-2 Days", returnPolicy: "30-Day Return", warranty: "Pure Brass Guarantee", badges: ["🛕 Puja Essential", "35% OFF"], description: "Traditional heavy pure brass diya oil lamps."
  },
  {
    id: "pj-02", name: "Panchdhatu Royal Brass Pooja Thali Set (8 Pieces)", category: "puja", subCategory: "puja-items",
    price: 34.99, priceINR: 1999, originalPrice: 49.99, discountPercent: 30, rating: 4.9, reviewCount: 420, stock: 40, inStock: true, brand: "DivineVedas",
    tags: ["puja", "pooja", "thali", "religious", "brass", "festival"],
    images: ["https://images.unsplash.com/photo-1634712282287-14ed57b9cc89?w=600&auto=format&fit=crop&q=80"],
    specs: { "Includes": "8 Pieces Brass Set" }, shippingTime: "1-2 Days", returnPolicy: "30-Day Return", warranty: "Artisan Guarantee", badges: ["Grand Set", "30% OFF"], description: "Complete 8-piece royal brass Pooja Thali set."
  },
  {
    id: "pj-03", name: "Natural Mysore Sandalwood Incense Agarbatti (Pack of 3)", category: "puja", subCategory: "incense",
    price: 7.99, priceINR: 299, originalPrice: 11.99, discountPercent: 33, rating: 4.8, reviewCount: 890, stock: 200, inStock: true, brand: "DivineVedas",
    tags: ["puja", "agarbatti", "incense", "sandalwood", "chandan", "religious"],
    images: ["https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600&auto=format&fit=crop&q=80"],
    specs: { "Sticks": "300 Charcoal-Free Sticks" }, shippingTime: "1-2 Days", returnPolicy: "30-Day Return", warranty: "100% Charcoal-Free", badges: ["Best Aroma", "33% OFF"], description: "Pure charcoal-free natural Mysore Chandan agarbatti."
  },
  {
    id: "pj-05", name: "Handcrafted Brass Lord Ganesha Idol (6 Inches)", category: "puja", subCategory: "idols",
    price: 29.99, priceINR: 1499, originalPrice: 42.99, discountPercent: 30, rating: 5.0, reviewCount: 270, stock: 35, inStock: true, brand: "DivineVedas",
    tags: ["puja", "ganesha", "idol", "statue", "brass", "religious"],
    images: ["https://images.unsplash.com/photo-1567591414440-2b1b514e82df?w=600&auto=format&fit=crop&q=80"],
    specs: { "Material": "Solid Brass", "Height": "6 Inches" }, shippingTime: "1-2 Days", returnPolicy: "30-Day Return", warranty: "Blessing Guarantee", badges: ["Auspicious Idol", "5.0 ★"], description: "Handcrafted solid brass Lord Ganesha idol for auspicious mandirs."
  }
];

const ELECTRONICS_ITEMS = [
  {
    id: "prod-103", name: "Zenith Stealth 15 Ultra Gaming Laptop", category: "electronics", subCategory: "laptops",
    price: 1199.99, priceINR: 89999, originalPrice: 1399.99, discountPercent: 14, rating: 4.9, reviewCount: 112, stock: 8, inStock: true, brand: "Zenith Tech",
    tags: ["gaming", "laptop", "programming", "rtx"],
    images: ["https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600&auto=format&fit=crop&q=80"],
    specs: { "Processor": "i7 13700H", "GPU": "RTX 4060 8GB" }, shippingTime: "Next-Day Air", returnPolicy: "14-Day Return", warranty: "2-Year Warranty", badges: ["🔥 Flash Sale"], description: "High-power gaming workstation."
  },
  {
    id: "prod-105", name: "Chronos Titanium Smartwatch X", category: "electronics", subCategory: "smartwatches",
    price: 199.99, priceINR: 12999, originalPrice: 249.99, discountPercent: 20, rating: 4.7, reviewCount: 156, stock: 19, inStock: true, brand: "Chronos",
    tags: ["fitness", "smartwatch", "gps"],
    images: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80"],
    specs: { "Display": "1.43\" AMOLED" }, shippingTime: "1-2 Days", returnPolicy: "30-Day Return", warranty: "1-Year Warranty", badges: ["20% OFF"], description: "Aviation titanium smartwatch."
  }
];

const BEAUTY_ITEMS = [
  {
    id: "bt-01", name: "GlowGoddess 20% Vitamin C + Hyaluronic Serum", category: "beauty", subCategory: "skincare",
    price: 8.99, priceINR: 499, originalPrice: 14.99, discountPercent: 40, rating: 4.9, reviewCount: 750, stock: 100, inStock: true, brand: "GlowGoddess",
    tags: ["beauty", "skincare", "serum", "vitamin-c"],
    images: ["https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&auto=format&fit=crop&q=80"],
    specs: { "Volume": "30ml" }, shippingTime: "1-2 Days", returnPolicy: "30-Day Return", warranty: "Derm Tested", badges: ["40% OFF"], description: "Brightening antioxidant Vitamin C serum."
  },
  {
    id: "bt-05", name: "SunGuard SPF 50 PA++++ Invisible Water Gel Sunscreen", category: "beauty", subCategory: "skincare",
    price: 7.99, priceINR: 449, originalPrice: 12.99, discountPercent: 38, rating: 4.9, reviewCount: 680, stock: 110, inStock: true, brand: "SunGuard",
    tags: ["beauty", "sunscreen", "spf50", "skincare"],
    images: ["https://images.unsplash.com/photo-1567928257065-c14977977503?w=600&auto=format&fit=crop&q=80"],
    specs: { "SPF": "SPF 50 PA++++" }, shippingTime: "1-2 Days", returnPolicy: "30-Day Return", warranty: "Dermatologist Approved", badges: ["Essential", "38% OFF"], description: "Lightweight water gel sunscreen."
  }
];

const PRODUCTS = [...SHOE_ITEMS, ...APPAREL_ITEMS, ...FITNESS_ITEMS, ...PUJA_ITEMS, ...ELECTRONICS_ITEMS, ...BEAUTY_ITEMS];

const STORE_POLICIES = {
  shipping: {
    title: "Shipping & Delivery Policy", icon: "fa-truck-fast", summary: "Free standard shipping on orders over ₹500 across India. Express 1-2 day delivery available at checkout.", details: ["Standard Shipping: 2-4 business days (FREE over ₹500).", "Express Next-Day Air: Guaranteed 1 business day."]
  },
  returns: {
    title: "30-Day Returns & Easy Size Exchanges", icon: "fa-rotate-left", summary: "Return any item in original condition within 30 days for a full refund or instant size exchange.", details: ["Prepaid Return Label: Download free prepaid return shipping labels via your portal.", "Instant Size Exchange: Swap sizes for shoes, hoodies, shirts, jeans & kurtas with zero fee."]
  },
  warranty: {
    title: "Manufacturer Warranty & Protection", icon: "fa-shield-halved", summary: "All electronics include 1 to 2-year full coverage warranty; apparel, shoes, fitness supplements & brass items include 100% purity & stitching guarantee.", details: ["Standard Warranty: Covers hardware defects, battery degradation >20%, and footwear/tailoring/supplement purity."]
  },
  payment: {
    title: "Secure Payment Methods", icon: "fa-credit-card", summary: "We support Credit/Debit cards, Apple Pay, Google Pay, PayPal, UPI, and Cash on Delivery (COD).", details: ["256-Bit SSL military-grade encryption.", "Cash on Delivery: Available across India with zero extra fee."]
  }
};
