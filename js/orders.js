/**
 * LuxeMart AI - Order Database & Status Tracking Module (Robust Normalization Fix)
 */

const INITIAL_ORDERS = [
  {
    id: "ORD-8821",
    date: "2026-08-05",
    customerName: "Alex Rivera",
    items: [
      { productId: "prod-101", productName: "AuraPro ANC Wireless Headphones", price: 129.99, quantity: 1 }
    ],
    total: 129.99,
    status: "Shipped",
    timelineStep: 3, // 1: Confirmed, 2: Packed, 3: Shipped, 4: Out for Delivery, 5: Delivered
    expectedDelivery: "Tomorrow by 5:00 PM",
    carrier: "FedEx Express",
    trackingNumber: "FX-9982341029",
    shippingAddress: "742 Evergreen Terrace, Springfield, OR 97477"
  },
  {
    id: "ORD-9430",
    date: "2026-08-06",
    customerName: "Priya Sharma",
    items: [
      { productId: "prod-104", productName: "Novabook Slim Air 14 (M2)", price: 899.99, quantity: 1 }
    ],
    total: 899.99,
    status: "Packed",
    timelineStep: 2,
    expectedDelivery: "Aug 9, 2026",
    carrier: "UPS Ground",
    trackingNumber: "1Z9999999999999999",
    shippingAddress: "123 Innovation Way, Tech Park, Austin, TX 78701"
  }
];

class OrderManager {
  constructor() {
    this.orders = this.loadOrders();
  }

  loadOrders() {
    const saved = localStorage.getItem("luxemart_orders");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error("Failed to parse orders from localStorage", e);
      }
    }
    return INITIAL_ORDERS;
  }

  saveOrders() {
    localStorage.setItem("luxemart_orders", JSON.stringify(this.orders));
  }

  findOrder(orderId) {
    if (!orderId) return null;
    this.orders = this.loadOrders(); // Always refresh from localStorage
    const cleanSearch = String(orderId).toUpperCase().replace(/[^A-Z0-9]/g, '');
    
    return this.orders.find(o => {
      const cleanDbId = String(o.id).toUpperCase().replace(/[^A-Z0-9]/g, '');
      return cleanDbId === cleanSearch || cleanDbId.includes(cleanSearch) || cleanSearch.includes(cleanDbId);
    });
  }

  createOrder(orderData) {
    const newId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const fullOrder = {
      id: newId,
      date: new Date().toISOString().split('T')[0],
      customerName: orderData.name,
      shippingAddress: `${orderData.address}, ${orderData.city}, ${orderData.pincode}`,
      items: orderData.items,
      total: orderData.total,
      status: "Confirmed",
      timelineStep: 1,
      expectedDelivery: "Tomorrow by 5:00 PM",
      carrier: "Express Logistics",
      trackingNumber: `LM-${Math.floor(10000000 + Math.random() * 90000000)}`,
      paymentMethod: orderData.paymentMethod
    };

    this.orders = this.loadOrders();
    this.orders.unshift(fullOrder);
    this.saveOrders();
    return fullOrder;
  }
}

const orderStore = new OrderManager();
