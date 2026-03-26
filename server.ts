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
    { id: "ORD-123", status: "Shipped", deliveryDate: "2026-03-28" },
    { id: "ORD-456", status: "Out for Delivery", deliveryDate: "2026-03-26" },
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
  const sessions: Record<string, { step?: string; data?: any }> = {};

  // --- API Routes ---
  
  app.post("/api/webhook", async (req, res) => {
    const { message, sender, botResponse: initialBotResponse } = req.body;
    const sessionId = sender;
    
    // 1. Automation Middleware: Logging & Pre-processing
    analyticsEvents.push({ type: 'message_received', timestamp: new Date(), sender });

    // 2. NLP Layer: Use the response processed by the frontend
    const botResponse = initialBotResponse || { intent: "GENERAL", reply: "I'm processing your request...", suggestedActions: [] };

    // 3. Order Tracking & Delivery Status Track
    if (botResponse.intent === "TRACKING" || botResponse.intent === "DELIVERY_STATUS") {
      const orderIdMatch = message.match(/ORD-\d+/i);
      if (orderIdMatch) {
        const orderId = orderIdMatch[0].toUpperCase();
        const order = orders.find(o => o.id === orderId);
        if (order) {
          if (botResponse.intent === "DELIVERY_STATUS") {
            botResponse.reply = `🚚 *Delivery Status for ${order.id}*\n\nStatus: *${order.status}*\nExpected: ${order.deliveryDate}\n\nWe'll notify you when it's out for delivery!`;
          } else {
            botResponse.reply = `✅ *Order Found*\n\nID: *${order.id}*\nStatus: *${order.status}*\nDelivery: ${order.deliveryDate}\n\nNeed anything else?`;
          }
          botResponse.suggestedActions = ["Track Another", "Main Menu"];
          delete sessions[sessionId];
        } else {
          botResponse.reply = `❌ I couldn't find order *${orderId}*. Please check the number or contact support.`;
          botResponse.suggestedActions = ["Try Again", "Talk to Agent"];
        }
      } else {
        botResponse.reply = `I'd be happy to help with your ${botResponse.intent === "DELIVERY_STATUS" ? "delivery status" : "order tracking"}! Please provide your Order ID (e.g., ORD-123). 📦`;
        botResponse.suggestedActions = ["ORD-123 (Demo)", "ORD-456 (Demo)", "Cancel"];
        sessions[sessionId] = { step: 'AWAITING_ORDER_ID' };
      }
    }

    // 4. Product Updates Track
    if (botResponse.intent === "PRODUCT_UPDATE") {
      botResponse.reply = "🔔 *Product Updates*\n\nStay tuned for our latest arrivals! Here are some upcoming releases:\n\n• *TechNova Pro Max* (Coming April 2026)\n• *EcoStyle Solar Watch* (Pre-order now!)\n• *PureSound Noise Cancel 2* (Restocking soon!)\n\nWould you like to be notified about any of these?";
      botResponse.suggestedActions = ["Notify Me", "Pre-order Solar", "Browse Current"];
    }

    // 4. Sales Track: Lead Qualification & CRM Integration
    if (botResponse.intent === "SALES" || botResponse.intent === "CATALOG") {
      let reply = "";
      let actions = botResponse.suggestedActions || [];

      // Handle specific product detail request
      if (botResponse.productId) {
        const product = inventory.find(p => p.id === botResponse.productId || p.id === `PROD-${botResponse.productId}`);
        if (product) {
          reply = `✨ *Product Details: ${product.name}*\n\n` +
                  `💰 Price: *${product.price}*\n` +
                  `📦 Stock: *${product.stock} units*\n` +
                  `🏷️ Brand: ${product.brand}\n` +
                  `📂 Category: ${product.category}\n\n` +
                  `Description: High-performance ${product.category.toLowerCase()} gear designed for professionals.`;
          actions = ["Add to Cart", "Talk to Agent", "Back to Catalog"];
        }
      } 
      
      // Handle category browsing
      if (!reply && botResponse.intent === "CATALOG") {
        const categoryMatch = categories.find(c => message.toLowerCase().includes(c.toLowerCase()));
        if (categoryMatch) {
          const matches = inventory.filter(p => p.category === categoryMatch).slice(0, 5);
          reply = `📂 *${categoryMatch} Catalog*\n\n` +
                  matches.map(p => `• *${p.name}*\n  Price: ${p.price} | ID: ${p.id}`).join('\n\n');
          actions = matches.map(p => `Details ${p.id.split('-')[1]}`).concat(["Main Menu"]);
        } else {
          reply = "📂 *Product Catalog*\n\nPlease select a category to browse our 1000+ items:";
          actions = categories.concat(["Search Brand", "Main Menu"]);
        }
      }

      // Fallback to keyword search if no specific reply yet
      if (!reply) {
        const keywords = message.toLowerCase().split(' ');
        const matches = inventory.filter(p => 
          keywords.some(k => k.length > 2 && (p.name.toLowerCase().includes(k) || p.category.toLowerCase().includes(k)))
        ).slice(0, 3);

        if (matches.length > 0) {
          reply = `🛍️ *Found ${matches.length} matches for you:*\n\n` + 
            matches.map(p => `• *${p.name}*\n  Price: ${p.price} | ID: ${p.id}`).join('\n\n');
          actions = matches.map(p => `Details ${p.id.split('-')[1]}`).concat(["View More", "Main Menu"]);
        } else {
          reply = botResponse.reply || `Our inventory has 1000+ items! 🚀\n\nTry searching for brands like *TechNova* or categories like *Electronics*.`;
          actions = actions.length > 0 ? actions : ["TechNova", "Electronics", "Audio"];
        }
      }

      botResponse.reply = reply;
      botResponse.suggestedActions = actions;

      if (botResponse.crmUpdate) {
        crmLeads.push({ ...botResponse.crmUpdate, timestamp: new Date(), source: 'WhatsApp Sales' });
        botResponse.reply += "\n\n✅ *Lead Qualified*: Your details are synced with our CRM.";
      }
    }

    // 5. Chatbot Flows & Retargeting
    if (botResponse.intent === "CHATBOT_FLOW") {
      botResponse.reply = "Welcome to our Interactive Menu! 🤖\n\nHow can I assist you today?";
      botResponse.suggestedActions = ["Track Order", "Browse Catalog", "Special Offers", "Talk to Human"];
    }

    // 6. Human Handoff
    if (botResponse.intent === "HUMAN_HANDOFF") {
      botResponse.reply = "Escalating to a human agent... 🧑‍💻\n\nAn agent will be with you in less than 2 minutes. Your chat history has been shared.";
      botResponse.suggestedActions = ["End Chat", "Wait"];
    }

    // 7. Analytics Dashboard: Intent Logging
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

  app.get("/api/admin/data", (req, res) => {
    res.json({ leads: crmLeads, analytics: analyticsEvents.slice(-10) });
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
