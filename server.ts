import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- Mock Database / State ---
  const orders = [
    { 
      id: "ORD-123", 
      status: "Shipped", 
      deliveryDate: "2026-03-28",
      items: [
        { name: "TechNova Pro Max", quantity: 1 },
        { name: "PureSound Noise Cancel 2", quantity: 2 }
      ],
      updates: [
        { date: "2026-03-25", status: "Order Processed", location: "Warehouse A" },
        { date: "2026-03-26", status: "Shipped", location: "Transit Hub" }
      ]
    },
    { 
      id: "ORD-456", 
      status: "Out for Delivery", 
      deliveryDate: "2026-03-26",
      items: [
        { name: "EcoStyle Solar Watch", quantity: 1 }
      ],
      updates: [
        { date: "2026-03-24", status: "Order Processed", location: "Warehouse B" },
        { date: "2026-03-25", status: "Shipped", location: "Regional Center" },
        { date: "2026-03-26", status: "Out for Delivery", location: "Your City" }
      ]
    },
  ];

  // Generate 1000 products for testing
  const brands = ["TechNova", "EcoStyle", "LuxeGear", "SwiftRun", "PureSound"];
  const categories = ["Electronics", "Apparel", "Home", "Sports", "Audio"];
  const inventory = Array.from({ length: 1000 }).map((_, i) => {
    const brand = brands[i % brands.length];
    const category = categories[i % categories.length];
    return {
      id: `PROD-${1000 + i}`,
      name: `${brand} ${category} Model ${String.fromCharCode(65 + (i % 26))}${i}`,
      price: `$${(Math.random() * 500 + 50).toFixed(2)}`,
      stock: Math.floor(Math.random() * 100),
      category,
      brand
    };
  });

  const crmLeads: any[] = [];
  const analyticsEvents: any[] = [];
  const sessions: Record<string, { step?: string; data?: any; lastProductId?: string }> = {};

  // --- API Routes ---
  
  app.post("/api/webhook", async (req, res) => {
    const { message, sender, botResponse: initialBotResponse } = req.body;
    const sessionId = sender;
    
    // 1. Automation Middleware: Logging & Pre-processing
    analyticsEvents.push({ type: 'message_received', timestamp: new Date(), sender });

    // 2. NLP Layer: Use the response processed by the frontend
    const botResponse = initialBotResponse || { intent: "GENERAL", reply: "I'm processing your request...", suggestedActions: [] };

    // 2.5 GLOBAL OVERRIDES (Add to Cart, View Cart, Checkout, Catalog)
    const lowerMsg = message.toLowerCase();
    const isAddToCart = lowerMsg.includes("add to cart") || lowerMsg.includes("buy");
    const isViewCart = lowerMsg.includes("view cart");
    const isCheckout = lowerMsg.includes("checkout") || lowerMsg.includes("pay");
    const isCatalog = lowerMsg.includes("catalog") || lowerMsg.includes("browse") || categories.some(c => lowerMsg.includes(c.toLowerCase()));

    if (isAddToCart) {
      const idMatch = message.match(/PROD-(\d+)/i) || message.match(/(?:buy|add).*?(\d+)/i);
      let productId = idMatch ? `PROD-${idMatch[1]}` : sessions[sessionId]?.lastProductId;

      if (productId) {
        const product = inventory.find(p => p.id === productId);
        if (product) {
          botResponse.intent = "SALES";
          botResponse.cartUpdate = { product, quantity: 1 };
          botResponse.reply = `🛒 *Added to Cart!*\n\n*${product.name}* has been added to your cart. 🛍️\n\nWould you like to view your cart or continue shopping?`;
          botResponse.suggestedActions = ["View Cart", "Checkout", "Continue Shopping"];
          sessions[sessionId] = { ...sessions[sessionId], lastProductId: product.id };
          return res.json(botResponse);
        }
      }
      
      if (!idMatch && !sessions[sessionId]?.lastProductId) {
        botResponse.reply = "Which product would you like to add to your cart? Please browse the catalog first. 📂";
        botResponse.suggestedActions = ["Browse Catalog", "Main Menu"];
        return res.json(botResponse);
      }
    } else if (isViewCart) {
      const cart = req.body.cart || [];
      botResponse.intent = "SALES";
      
      if (cart.length === 0) {
        botResponse.reply = "🛒 *Your Cart is Empty*\n\nBrowse our catalog to find amazing products! 🛍️";
        botResponse.suggestedActions = ["Browse Catalog", "Main Menu"];
      } else {
        let cartSummary = "🛒 *Your Shopping Cart*\n\n";
        let total = 0;
        cart.forEach((item: any) => {
          const price = parseFloat(item.product.price.replace('$', ''));
          const subtotal = price * item.quantity;
          total += subtotal;
          cartSummary += `• *${item.product.name}*\n  Qty: ${item.quantity} × ${item.product.price}\n  Subtotal: *$${subtotal.toFixed(2)}*\n\n`;
        });
        cartSummary += `━━━━━━━━━━━━━━\n*Cart Total: $${total.toFixed(2)}* 💰`;
        botResponse.reply = cartSummary;
        botResponse.suggestedActions = ["Checkout", "Continue Shopping", "Main Menu"];
      }
      return res.json(botResponse);
    } else if (isCheckout) {
      botResponse.intent = "SALES";
      botResponse.reply = "🚀 *Ready to Checkout?*\n\nPlease confirm your order details above. Once confirmed, we'll prepare your items for delivery! 📦";
      botResponse.suggestedActions = ["Confirm Checkout", "View Cart", "Main Menu"];
      return res.json(botResponse);
    } else if (lowerMsg === "main menu" || lowerMsg === "hi" || lowerMsg === "hello") {
      botResponse.intent = "GENERAL";
      botResponse.reply = "👋 *Welcome to our Automated Shopping Assistant!*\n\nI can help you browse products, add them to your cart, and track your deliveries directly here on WhatsApp.\n\nWhat would you like to do?";
      botResponse.suggestedActions = ["Browse Catalog", "Track Order", "View Cart", "Product Updates"];
      return res.json(botResponse);
    }

    // 3. Order Tracking & Delivery Status Track
    if (botResponse.intent === "TRACKING" || botResponse.intent === "DELIVERY_STATUS") {
      const orderIdMatch = message.match(/ORD-\d+/i);
      if (orderIdMatch) {
        const orderId = orderIdMatch[0].toUpperCase();
        const order = orders.find(o => o.id === orderId);
        if (order) {
          const updatesText = order.updates.map(u => `• *${u.date}*: ${u.status} (${u.location})`).join('\n');
          const itemsText = (order as any).items.map((i: any) => `• ${i.name} (x${i.quantity})`).join('\n');
          
          if (botResponse.intent === "DELIVERY_STATUS") {
            botResponse.reply = `🚚 *Delivery Status for ${order.id}*\n\n` +
                                `Current Status: *${order.status}*\n` +
                                `Expected Delivery: *${order.deliveryDate}*\n\n` +
                                `*Items in Order:*\n${itemsText}\n\n` +
                                `*Recent Updates:*\n${updatesText}\n\n` +
                                `We'll notify you when it's out for delivery!`;
          } else {
            botResponse.reply = `✅ *Order Found*\n\n` +
                                `ID: *${order.id}*\n` +
                                `Status: *${order.status}*\n` +
                                `Delivery: *${order.deliveryDate}*\n\n` +
                                `*Items in Order:*\n${itemsText}\n\n` +
                                `*Tracking History:*\n${updatesText}\n\n` +
                                `Need anything else?`;
          }
          botResponse.suggestedActions = ["Track Another", "Main Menu"];
          delete sessions[sessionId];
        } else {
          botResponse.reply = `❌ I couldn't find order *${orderId}*. Please check the number or contact support.`;
          botResponse.suggestedActions = ["Try Again", "Talk to Agent", "Main Menu"];
        }
        return res.json(botResponse);
      } else {
        botResponse.reply = `I'd be happy to help with your ${botResponse.intent === "DELIVERY_STATUS" ? "delivery status" : "order tracking"}! Please provide your Order ID (e.g., ORD-123). 📦`;
        botResponse.suggestedActions = ["ORD-123", "ORD-456", "Main Menu"];
        sessions[sessionId] = { step: 'AWAITING_ORDER_ID' };
        return res.json(botResponse);
      }
    }

    // 4. Product Updates Track
    if (botResponse.intent === "PRODUCT_UPDATE") {
      botResponse.reply = "🔔 *Product Updates*\n\nStay tuned for our latest arrivals! Here are some upcoming releases:\n\n• *TechNova Pro Max* (Coming April 2026)\n• *EcoStyle Solar Watch* (Pre-order now!)\n• *PureSound Noise Cancel 2* (Restocking soon!)\n\nWould you like to be notified about any of these?";
      botResponse.suggestedActions = ["Notify Me", "Pre-order Solar", "Main Menu"];
      return res.json(botResponse);
    }

    // 5. Sales & Catalog Track
    if (botResponse.intent === "SALES" || botResponse.intent === "CATALOG" || isCatalog || lowerMsg.includes("details")) {
      let reply = "";
      let actions = [];

      // Handle specific product detail request
      const idMatch = message.match(/PROD-(\d+)/i) || message.match(/(?:details|add).*?(\d+)/i) || (botResponse.productId ? { 1: botResponse.productId.replace('PROD-', '') } : null);
      if (idMatch) {
        const product = inventory.find(p => p.id === `PROD-${idMatch[1]}`);
        if (product) {
          sessions[sessionId] = { ...sessions[sessionId], lastProductId: product.id };
          reply = `✨ *Product Details: ${product.name}*\n\n` +
                  `💰 Price: *${product.price}*\n` +
                  `📦 Stock: *${product.stock} units*\n` +
                  `🏷️ Brand: ${product.brand}\n` +
                  `📂 Category: ${product.category}\n\n` +
                  `Description: High-performance ${product.category.toLowerCase()} gear designed for professionals.`;
          actions = [`Add to Cart ${idMatch[1]}`, "Talk to Agent", "Browse Catalog", "Main Menu"];
          botResponse.reply = reply;
          botResponse.suggestedActions = actions;
          return res.json(botResponse);
        }
      } 
      
      // Handle category browsing
      const categoryMatch = categories.find(c => lowerMsg.includes(c.toLowerCase()));
      if (categoryMatch) {
        const matches = inventory.filter(p => p.category === categoryMatch).slice(0, 5);
        reply = `📂 *${categoryMatch} Catalog*\n\n` +
                matches.map(p => `• *${p.name}*\n  Price: ${p.price} | ID: ${p.id}`).join('\n\n') +
                `\n\nSelect a product to see **Details** or **Add to Cart** directly! 🛍️`;
        actions = [];
        matches.forEach(p => {
          const shortId = p.id.split('-')[1];
          actions.push(`Details ${shortId}`);
          actions.push(`Add to Cart ${shortId}`);
        });
        actions.push("Main Menu");
        botResponse.reply = reply;
        botResponse.suggestedActions = actions;
        return res.json(botResponse);
      }

      // Default Catalog Menu
      if (botResponse.intent === "CATALOG" || isCatalog) {
        botResponse.reply = "📂 *Product Catalog*\n\nPlease select a category to browse our 1000+ items:";
        botResponse.suggestedActions = categories.concat(["Search Brand", "Main Menu"]);
        return res.json(botResponse);
      }
    }

    // 6. Chatbot Flows & Retargeting
    if (botResponse.intent === "CHATBOT_FLOW") {
      botResponse.reply = "Welcome to our Interactive Menu! 🤖\n\nHow can I assist you today?";
      botResponse.suggestedActions = ["Track Order", "Browse Catalog", "Special Offers", "Talk to Human", "Main Menu"];
    }

    // 6. Human Handoff
    if (botResponse.intent === "HUMAN_HANDOFF") {
      botResponse.reply = "Escalating to a human agent... 🧑‍💻\n\nAn agent will be with you in less than 2 minutes. Your chat history has been shared.";
      botResponse.suggestedActions = ["End Chat", "Wait"];
    }

    // 7. CRM Integration
    if (botResponse.crmUpdate) {
      crmLeads.push({ ...botResponse.crmUpdate, timestamp: new Date(), source: 'WhatsApp Sales' });
      botResponse.reply += "\n\n✅ *Lead Qualified*: Your details are synced with our CRM.";
    }

    // 8. Analytics Dashboard: Intent Logging
    analyticsEvents.push({ 
      type: 'intent_detected', 
      intent: botResponse.intent, 
      timestamp: new Date(),
      confidence: botResponse.confidence || 1.0
    });

    res.json(botResponse);
  });

  app.get("/api/admin/data", (req, res) => {
    res.json({ 
      leads: crmLeads, 
      analytics: analyticsEvents.slice(-20),
      inventoryCount: inventory.length,
      activeSessions: Object.keys(sessions).length
    });
  });

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
