/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageSquare, 
  Settings, 
  Truck, 
  Bell, 
  RotateCcw, 
  Megaphone, 
  Bot, 
  Target, 
  UserCheck, 
  Database, 
  Clock, 
  Cpu, 
  UserPlus, 
  BarChart3, 
  Layers,
  ChevronRight,
  X,
  Info,
  ExternalLink,
  Activity,
  ShoppingCart,
  RefreshCw,
  Search,
  MoreVertical,
  Maximize2,
  Minimize2,
  Plus,
  Smile,
  Send,
  Check,
  CheckCheck,
  Paperclip,
  Mic,
  Image as ImageIcon
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

// --- Types ---

type Track = 'tracking' | 'promotion' | 'sales' | 'core' | 'infrastructure' | 'all';

interface NodeData {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  track: Track;
  description: string;
  details: string[];
  tools?: string[];
}

// --- Data ---

const NODES: NodeData[] = [
  {
    id: 'gateway',
    title: 'WhatsApp Business API',
    subtitle: 'Meta-verified gateway',
    icon: <MessageSquare className="w-5 h-5" />,
    track: 'infrastructure',
    description: 'The entry point for all official WhatsApp communications. Provides secure, high-volume messaging capabilities.',
    details: [
      'Official Meta verification',
      'End-to-end encryption',
      'Template message management',
      'Session-based pricing model'
    ]
  },
  {
    id: 'middleware',
    title: 'Automation Middleware',
    subtitle: 'Node.js / Python backend + webhook',
    icon: <Settings className="w-5 h-5" />,
    track: 'core',
    description: 'The brain of the operation. Handles incoming webhooks, routes messages, and manages state across different tracks.',
    details: [
      'Webhook listener & validator',
      'Message queuing (Redis/RabbitMQ)',
      'State management (User sessions)',
      'API integration layer'
    ]
  },
  // Tracking Track
  {
    id: 'order-tracking',
    title: 'Order Tracking',
    subtitle: 'Real-time status updates',
    icon: <Truck className="w-5 h-5" />,
    track: 'tracking',
    description: 'Automatically sends updates to customers about their order progress.',
    details: [
      'Order confirmation alerts',
      'Live tracking links',
      'Estimated delivery times',
      'Multi-carrier support'
    ]
  },
  {
    id: 'delivery-alerts',
    title: 'Delivery Alerts',
    subtitle: 'Shipped / out for delivery / delivered',
    icon: <Bell className="w-5 h-5" />,
    track: 'tracking',
    description: 'Proactive notifications at critical delivery milestones.',
    details: [
      'Out-for-delivery notifications',
      'Proof of delivery (Image/OTP)',
      'Delayed shipment alerts',
      'Address verification prompts'
    ]
  },
  {
    id: 'return-flow',
    title: 'Return / Refund Flow',
    subtitle: 'Triggered by customer reply',
    icon: <RotateCcw className="w-5 h-5" />,
    track: 'tracking',
    description: 'Automated handling of post-purchase issues and returns.',
    details: [
      'Automated return requests',
      'Refund status tracking',
      'Quality check scheduling',
      'Feedback collection'
    ]
  },
  // Promotion Track
  {
    id: 'broadcast',
    title: 'Broadcast Campaigns',
    subtitle: 'Segmented bulk messaging',
    icon: <Megaphone className="w-5 h-5" />,
    track: 'promotion',
    description: 'Reach thousands of customers with personalized marketing messages.',
    details: [
      'Audience segmentation',
      'A/B testing templates',
      'Opt-in/Opt-out management',
      'Scheduling & throttling'
    ]
  },
  {
    id: 'chatbot-flows',
    title: 'Chatbot Flows',
    subtitle: 'Quick replies, buttons, menus',
    icon: <Bot className="w-5 h-5" />,
    track: 'promotion',
    description: 'Interactive guided conversations to drive engagement.',
    details: [
      'Button-based navigation',
      'Product catalogs',
      'Interactive list menus',
      'Dynamic content injection'
    ]
  },
  {
    id: 'retargeting',
    title: 'Retargeting',
    subtitle: 'Abandoned cart, re-engagement',
    icon: <Target className="w-5 h-5" />,
    track: 'promotion',
    description: 'Bring back lost customers with timely reminders.',
    details: [
      'Abandoned cart recovery',
      'Back-in-stock alerts',
      'Personalized discount codes',
      'Loyalty program updates'
    ]
  },
  // Sales Track
  {
    id: 'lead-qual',
    title: 'Lead Qualification',
    subtitle: 'Auto-qualify via Q&A bot',
    icon: <UserCheck className="w-5 h-5" />,
    track: 'sales',
    description: 'Filter and score leads before they reach your sales team.',
    details: [
      'Automated intake forms',
      'Lead scoring logic',
      'Interest-based routing',
      'Instant response times'
    ]
  },
  {
    id: 'crm-integration',
    title: 'CRM Integration',
    subtitle: 'Zoho, HubSpot, Salesforce',
    icon: <Database className="w-5 h-5" />,
    track: 'sales',
    description: 'Sync all WhatsApp conversations and lead data with your CRM.',
    details: [
      'Real-time contact syncing',
      'Activity logging',
      'Deal stage updates',
      'Custom field mapping'
    ],
    tools: ['HubSpot', 'Salesforce', 'Zoho CRM', 'Pipedrive']
  },
  {
    id: 'follow-up',
    title: 'Follow-up Sequences',
    subtitle: 'Drip messages, deal nudges',
    icon: <Clock className="w-5 h-5" />,
    track: 'sales',
    description: 'Automated multi-day follow-up paths to close more deals.',
    details: [
      'Multi-step drip campaigns',
      'Conditional follow-ups',
      'Sales rep assignment',
      'Meeting scheduling'
    ]
  },
  // Bottom Layers
  {
    id: 'nlp-layer',
    title: 'Bot Engine + NLP Layer',
    subtitle: 'Dialogflow / GPT / custom intent parser',
    icon: <Cpu className="w-5 h-5" />,
    track: 'core',
    description: 'The intelligence layer that understands natural language and intent.',
    details: [
      'Intent recognition',
      'Entity extraction',
      'Sentiment analysis',
      'Multi-language support'
    ],
    tools: ['Google Dialogflow', 'OpenAI GPT-4', 'Rasa', 'Wit.ai']
  },
  {
    id: 'human-handoff',
    title: 'Human Handoff',
    subtitle: 'Escalate complex queries to agent',
    icon: <UserPlus className="w-5 h-5" />,
    track: 'infrastructure',
    description: 'Seamlessly transition from bot to human when needed.',
    details: [
      'Agent dashboard',
      'Chat history transfer',
      'Priority routing',
      'Internal notes'
    ]
  },
  {
    id: 'analytics',
    title: 'Analytics Dashboard',
    subtitle: 'Open rate, reply rate, conversions',
    icon: <BarChart3 className="w-5 h-5" />,
    track: 'infrastructure',
    description: 'Measure the performance of your automation flows.',
    details: [
      'Message delivery reports',
      'Conversion tracking',
      'User engagement metrics',
      'Flow drop-off analysis'
    ]
  },
  {
    id: 'platform-layer',
    title: 'Platform / Tool Layer',
    subtitle: 'Twilio · Wati · AiSensy · Interakt · 360dialog',
    icon: <Layers className="w-5 h-5" />,
    track: 'infrastructure',
    description: 'The underlying communication infrastructure providers.',
    details: [
      'API connectivity',
      'Number management',
      'Compliance handling',
      'Global reach'
    ],
    tools: ['Twilio', 'Wati', 'AiSensy', 'Interakt', '360dialog']
  }
];

// --- Components ---

const TrackBadge = ({ track, active }: { track: Track; active: boolean }) => {
  const colors: Record<Track, string> = {
    tracking: 'bg-blue-600',
    promotion: 'bg-amber-700',
    sales: 'bg-red-900',
    core: 'bg-indigo-700',
    infrastructure: 'bg-emerald-900',
    all: 'bg-gray-500'
  };

  return (
    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${active ? 'opacity-100 scale-105' : 'opacity-40 grayscale'}`}>
      <div className={`w-2 h-2 rounded-full ${colors[track]}`} />
      <span className="text-gray-600">{track}</span>
    </div>
  );
};

const Node = ({ 
  data, 
  onClick, 
  isActive, 
  isHighlighted,
  isLive
}: { 
  data: NodeData; 
  onClick: () => void; 
  isActive: boolean;
  isHighlighted: boolean;
  isLive?: boolean;
}) => {
  const colors: Record<Track, string> = {
    tracking: 'bg-blue-900 border-blue-700',
    promotion: 'bg-amber-800 border-amber-600',
    sales: 'bg-red-950 border-red-800',
    core: 'bg-indigo-900 border-indigo-700',
    infrastructure: 'bg-emerald-950 border-emerald-800',
    all: 'bg-gray-800 border-gray-700'
  };

  return (
    <motion.div
      layoutId={data.id}
      onClick={onClick}
      className={`
        relative cursor-pointer p-4 rounded-xl border-2 transition-all duration-300
        ${colors[data.track]}
        ${isHighlighted || isLive ? 'opacity-100 scale-100 shadow-lg' : 'opacity-30 scale-95 grayscale blur-[1px]'}
        ${isActive ? 'ring-4 ring-white/20 scale-105' : ''}
        ${isLive ? 'ring-4 ring-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.5)]' : ''}
        w-full max-w-[280px] flex flex-col items-center text-center gap-1
      `}
      animate={isLive ? { scale: [1, 1.05, 1] } : {}}
      transition={isLive ? { repeat: Infinity, duration: 2 } : {}}
      whileHover={{ scale: isHighlighted ? 1.02 : 0.95 }}
    >
      {isLive && (
        <div className="absolute -top-2 -right-2 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500"></span>
        </div>
      )}
      <div className="p-2 bg-white/10 rounded-lg mb-1 text-white">
        {data.icon}
      </div>
      <h3 className="text-white font-bold text-sm leading-tight">{data.title}</h3>
      <p className="text-white/60 text-[10px] uppercase tracking-wide font-medium">{data.subtitle}</p>
      
      {isActive && (
        <motion.div 
          layoutId="active-indicator"
          className="absolute -bottom-2 w-4 h-4 bg-white rotate-45"
        />
      )}
    </motion.div>
  );
};

const Arrow = ({ direction = 'down', className = '' }: { direction?: 'down' | 'right' | 'left' | 'diagonal-right' | 'diagonal-left'; className?: string }) => {
  const rotations = {
    down: 'rotate-90',
    right: 'rotate-0',
    left: 'rotate-180',
    'diagonal-right': 'rotate-45',
    'diagonal-left': 'rotate-135'
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        className={`w-8 h-[1px] bg-gray-400 relative ${rotations[direction]}`}
      >
        <div className="absolute right-0 -top-[3px] w-2 h-2 border-t border-r border-gray-400 rotate-45" />
      </motion.div>
    </div>
  );
};

const ProductCard = ({ productId }: { productId: string }) => {
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${productId}`);
        const data = await res.json();
        setProduct(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

  if (loading) return (
    <div className="w-64 h-32 bg-white rounded-xl shadow-sm animate-pulse flex items-center justify-center">
      <RefreshCw className="w-5 h-5 text-gray-300 animate-spin" />
    </div>
  );

  if (!product || product.error) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-64 bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 mt-2"
    >
      <div className="h-32 bg-gray-100 flex items-center justify-center relative">
        <ImageIcon className="w-10 h-10 text-gray-300" />
        <div className="absolute top-2 right-2 px-2 py-1 bg-emerald-500 text-white text-[8px] font-black rounded uppercase">
          In Stock
        </div>
      </div>
      <div className="p-3">
        <p className="text-[8px] font-black text-emerald-600 uppercase tracking-widest mb-1">{product.brand}</p>
        <h5 className="text-xs font-bold text-gray-800 mb-1 truncate">{product.name}</h5>
        <div className="flex justify-between items-center">
          <span className="text-sm font-black text-gray-900">{product.price}</span>
          <button className="p-1.5 bg-gray-900 text-white rounded-lg hover:bg-black transition-colors">
            <ShoppingCart className="w-3 h-3" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default function App() {
  const [selectedNode, setSelectedNode] = useState<NodeData | null>(null);
  const [activeTrack, setActiveTrack] = useState<Track>('all');
  const [simulationActive, setSimulationActive] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [messages, setMessages] = useState<{ text: string; sender: 'user' | 'bot'; timestamp: Date; actions?: string[]; productId?: string }[]>([
    { 
      text: "Hi! I'm your WhatsApp Assistant. How can I help you today? 🤖\n\nYou can choose from the options below:", 
      sender: 'bot', 
      timestamp: new Date(),
      actions: ["Product Updates", "Track Order", "Delivery Status", "Browse Catalog"]
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [adminData, setAdminData] = useState<{ 
    leads: any[]; 
    analytics: any[]; 
    inventoryCount: number; 
    activeSessions: number;
    crmStatus?: string;
    ordersCount?: number;
    promotionsCount?: number;
    customersCount?: number;
    customers?: any[];
  }>({ 
    leads: [], 
    analytics: [], 
    inventoryCount: 0, 
    activeSessions: 0 
  });
  const [showAdmin, setShowAdmin] = useState(false);
  const [activeNodeIds, setActiveNodeIds] = useState<string[]>([]);
  const [currentSystemNode, setCurrentSystemNode] = useState<string | null>(null);
  const [cart, setCart] = useState<{ product: any; quantity: number }[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const highlightNodes = async (ids: string[], duration = 1000) => {
    // Sequential highlighting to simulate data flow
    for (const id of ids) {
      setCurrentSystemNode(id);
      setActiveNodeIds(prev => [...prev, id]);
      await new Promise(resolve => setTimeout(resolve, 400));
    }
    
    setTimeout(() => {
      setActiveNodeIds([]);
      setCurrentSystemNode(null);
    }, duration);
  };

  const processMessageWithAI = async (text: string, customerContext?: any[]) => {
    await highlightNodes(['gateway', 'middleware', 'nlp-layer', 'platform-layer']);
    const apiKey = (process.env.GEMINI_API_KEY as string);
    const lowerText = text.toLowerCase();
    
    // Improved product ID extraction (looking for PROD-XXXX or 4-digit numbers)
    const idMatch = text.match(/PROD-(\d{4})/i) || text.match(/\b(10\d{2})\b/);
    const productId = idMatch ? `PROD-${idMatch[1]}` : null;

    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      // Fallback logic if API key is missing
      if (lowerText.includes("track") || lowerText.includes("ord-")) return { intent: "TRACKING", reply: "Let's track your order! 📦", suggestedActions: ["ORD-123", "ORD-456", "Main Menu"] };
      if (lowerText.includes("delivery") || lowerText.includes("status")) return { intent: "DELIVERY_STATUS", reply: "Checking your delivery status... 🚚", suggestedActions: ["ORD-123", "ORD-456", "Main Menu"] };
      if (lowerText.includes("promo") || lowerText.includes("offer") || lowerText.includes("discount") || lowerText.includes("coupon")) return { intent: "PROMOTION", reply: "Checking for special offers... 🎁", suggestedActions: ["Special Offers", "Browse Catalog", "Main Menu"] };
      if (lowerText.includes("update") || lowerText.includes("new")) return { intent: "PRODUCT_UPDATE", reply: "Here are the latest product updates! 🔔", suggestedActions: ["Notify Me", "Pre-order Solar", "Main Menu"] };
      
      if (lowerText.includes("details") && productId) return { intent: "SALES", productId, reply: `Fetching details for ${productId}...`, suggestedActions: [`Add to Cart ${idMatch![1]}`, "Back to Catalog", "Main Menu"] };
      if ((lowerText.includes("add to cart") || lowerText.includes("buy")) && productId) return { intent: "SALES", productId, reply: `Adding ${productId} to cart...`, suggestedActions: ["View Cart", "Checkout", "Main Menu"] };
      
      if (lowerText.includes("catalog") || lowerText.includes("browse") || lowerText.includes("product")) return { intent: "CATALOG", reply: "Browsing our catalog... 📂", suggestedActions: ["Electronics", "Apparel", "Home", "Main Menu"] };
      if (lowerText.includes("add to cart") || lowerText.includes("buy")) return { intent: "SALES", reply: "Adding to cart...", suggestedActions: ["View Cart", "Checkout", "Main Menu"] };
      if (lowerText.includes("checkout") || lowerText.includes("pay")) return { intent: "SALES", reply: "Proceeding to checkout...", suggestedActions: ["Confirm Checkout", "View Cart", "Main Menu"] };
      
      return { 
        intent: "GENERAL", 
        reply: "👋 *Welcome to our Automated Shopping Assistant!*\n\nI can help you browse products, add them to your cart, and track your deliveries directly here on WhatsApp.\n\nWhat would you like to do?",
        suggestedActions: ["Browse Catalog", "Track Order", "View Cart", "Product Updates"]
      };
    }

    const ai = new GoogleGenAI({ apiKey });
    const model = "gemini-3-flash-preview";
    
    const systemInstruction = `
      You are a highly sophisticated WhatsApp Business Assistant for a major retail brand.
      Your goal is to guide users through the entire shopping journey: Discovery -> Selection -> Purchase -> Tracking.
      
      CORE FEATURES:
      1. TRACKING: Provide detailed order status, delivery estimates, and tracking links.
      2. PROMOTION: Offer exclusive discounts, coupon codes, and seasonal deals.
      3. SALES: Facilitate product discovery, cart management, and seamless checkout.
      4. CRM SYNC: You have access to the customer database. If the user identifies themselves or provides new info, update the CRM.
      
      CRM CONTEXT (Current Customers):
      ${JSON.stringify(customerContext || [])}
      
      Intents: TRACKING, SALES, PROMOTION, CATALOG, CHATBOT_FLOW, HUMAN_HANDOFF, PRODUCT_UPDATE, DELIVERY_STATUS, GENERAL.
      
      Rules:
      - ALWAYS be professional, helpful, and use emojis.
      - RECOGNITION: If the user's name or email matches a customer in the context, greet them personally (e.g., "Welcome back, Alex!"). Mention their loyalty tier if relevant.
      - TWO-WAY SYNC: If the user provides a new name, email, or phone, or updates their info, include a "crmUpdate" object in your response.
      - Discovery: Use CATALOG intent for browsing.
      - Selection: Use SALES intent for product details (include productId).
      - Purchase/Checkout: Use SALES intent.
      - Tracking: Use TRACKING intent.
      
      Return JSON: { "intent": "...", "reply": "...", "suggestedActions": [...], "crmUpdate": { "name": "...", "email": "...", "phone": "..." }, "productId": "..." }
    `;

    try {
      const response = await ai.models.generateContent({
        model,
        contents: text,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
        },
      });

      return JSON.parse(response.text || "{}");
    } catch (error) {
      console.error("Gemini Error:", error);
      return { intent: "GENERAL", reply: "I'm having a bit of trouble processing that. 😅", suggestedActions: ["Main Menu"] };
    }
  };

  const syncCrm = async () => {
    try {
      const res = await fetch('/api/admin/sync', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        fetchAdminData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchAdminData = async () => {
    try {
      const res = await fetch('/api/admin/data');
      const data = await res.json();
      setAdminData(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (showAdmin) {
      fetchAdminData();
      const interval = setInterval(fetchAdminData, 3000);
      return () => clearInterval(interval);
    }
  }, [showAdmin]);

  const simulateAutomatedMessage = async (type: 'broadcast' | 'retargeting' | 'alert') => {
    setIsTyping(true);
    setTimeout(async () => {
      let msg = "";
      let actions: string[] = [];
      let track: Track = 'all';

      if (type === 'broadcast') {
        msg = "📢 *FLASH SALE!* 📢\n\nGet 20% OFF on all electronics for the next 2 hours! Use code: *TECH20* at checkout. 🚀";
        actions = ["Shop Now", "View Deals", "Opt Out"];
        track = 'promotion';
      } else if (type === 'retargeting') {
        msg = "🛒 *Wait! You forgot something...*\n\nWe noticed you left some items in your cart. Complete your purchase now and get free shipping! 🚚";
        actions = ["Checkout Now", "View Cart", "Help"];
        track = 'promotion';
      } else if (type === 'alert') {
        msg = "🚚 *Delivery Update*\n\nGood news! Your order *ORD-456* is out for delivery and will reach you by 5:00 PM today. 📦";
        actions = ["Track Live", "Contact Driver", "Reschedule"];
        track = 'tracking';
      }

      setMessages(prev => [...prev, { 
        text: msg, 
        sender: 'bot', 
        timestamp: new Date(),
        actions: actions
      }]);
      setActiveTrack(track);
      
      // Highlight specific nodes for simulation
      if (type === 'broadcast') await highlightNodes(['gateway', 'middleware', 'nlp-layer', 'broadcast', 'chatbot-flows', 'platform-layer']);
      else if (type === 'retargeting') await highlightNodes(['gateway', 'middleware', 'nlp-layer', 'retargeting', 'chatbot-flows', 'platform-layer']);
      else if (type === 'alert') await highlightNodes(['gateway', 'middleware', 'nlp-layer', 'delivery-alerts', 'order-tracking', 'platform-layer']);

      setIsTyping(false);
      if (!showChat) setShowChat(true);
    }, 1500);
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    setCart([]);
    setMessages(prev => [...prev, { 
      text: "🎉 *Order Placed Successfully!*\n\nThank you for your purchase. Your order is being processed and you will receive a tracking ID shortly. 🚀", 
      sender: 'bot', 
      timestamp: new Date(),
      actions: ["Track Order", "Browse Catalog", "Main Menu"]
    }]);
    if (!showChat) setShowChat(true);
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg = text;
    setInputValue('');
    setMessages(prev => [...prev, { text: userMsg, sender: 'user', timestamp: new Date() }]);
    setIsTyping(true);

    try {
      // 1. Process with AI on Frontend
      const botResponse = await processMessageWithAI(userMsg, adminData.customers);

      // 2. Send to Backend for Business Logic
      const response = await fetch('/api/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, sender: 'User-1', botResponse, cart })
      });
      const data = await response.json();
      
      // Handle Cart Updates
      if (data.cartUpdate) {
        setCart(prev => {
          const existing = prev.find(item => item.product.id === data.cartUpdate.product.id);
          if (existing) {
            return prev.map(item => 
              item.product.id === data.cartUpdate.product.id 
                ? { ...item, quantity: item.quantity + data.cartUpdate.quantity } 
                : item
            );
          }
          return [...prev, data.cartUpdate];
        });
      }

      if (userMsg.toLowerCase() === 'checkout' || userMsg.toLowerCase() === 'confirm checkout') {
        handleCheckout();
        return;
      }
      
      setMessages(prev => [...prev, { 
        text: data.reply, 
        sender: 'bot', 
        timestamp: new Date(),
        actions: data.suggestedActions,
        productId: data.productId
      }]);
      
      // Highlight the track based on intent
      if (data.intent === 'TRACKING' || data.intent === 'DELIVERY_STATUS') {
        setActiveTrack('tracking');
        await highlightNodes(['gateway', 'middleware', 'nlp-layer', 'order-tracking', 'delivery-alerts', 'analytics', 'platform-layer']);
      } else if (data.intent === 'SALES') {
        setActiveTrack('sales');
        await highlightNodes(['gateway', 'middleware', 'nlp-layer', 'lead-qual', 'crm-integration', 'analytics', 'platform-layer']);
      } else if (data.intent === 'CATALOG' || data.intent === 'PROMOTION' || data.intent === 'PRODUCT_UPDATE') {
        setActiveTrack('promotion');
        await highlightNodes(['gateway', 'middleware', 'nlp-layer', 'chatbot-flows', 'analytics', 'platform-layer']);
      } else if (data.intent === 'HUMAN_HANDOFF') {
        setActiveTrack('infrastructure');
        await highlightNodes(['gateway', 'middleware', 'nlp-layer', 'human-handoff', 'analytics', 'platform-layer']);
      } else {
        setActiveTrack('all');
        await highlightNodes(['gateway', 'middleware', 'nlp-layer', 'analytics', 'platform-layer']);
      }

    } catch (error) {
      console.error("Chat Error:", error);
      setMessages(prev => [...prev, { text: "Sorry, I'm offline right now. 🔌", sender: 'bot', timestamp: new Date() }]);
    } finally {
      setIsTyping(false);
    }
  };

  const isHighlighted = (track: Track) => activeTrack === 'all' || activeTrack === track;

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-gray-900 font-sans selection:bg-indigo-100">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-40 border-bottom border-gray-100 px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight leading-none">WHATSAPP AUTOMATION</h1>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Architecture Explorer v1.0</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden lg:flex gap-2 mr-4 border-r border-gray-100 pr-4">
            <button 
              onClick={() => simulateAutomatedMessage('broadcast')}
              className="px-3 py-1.5 bg-amber-50 text-amber-700 text-[10px] font-black rounded-lg hover:bg-amber-100 transition-colors"
            >
              SIMULATE BROADCAST
            </button>
            <button 
              onClick={() => simulateAutomatedMessage('retargeting')}
              className="px-3 py-1.5 bg-red-50 text-red-700 text-[10px] font-black rounded-lg hover:bg-red-100 transition-colors"
            >
              SIMULATE RETARGETING
            </button>
            <button 
              onClick={() => simulateAutomatedMessage('alert')}
              className="px-3 py-1.5 bg-blue-50 text-blue-700 text-[10px] font-black rounded-lg hover:bg-blue-100 transition-colors"
            >
              SIMULATE ALERT
            </button>
          </div>

          <div className="hidden md:flex gap-4">
            {(['tracking', 'promotion', 'sales', 'core', 'infrastructure'] as Track[]).map(t => (
              <button 
                key={t}
                onClick={() => setActiveTrack(activeTrack === t ? 'all' : t)}
                className="focus:outline-none"
              >
                <TrackBadge track={t} active={activeTrack === 'all' || activeTrack === t} />
              </button>
            ))}
          </div>
          
          <button 
            onClick={() => setShowChat(!showChat)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${showChat ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
          >
            <MessageSquare className="w-4 h-4" />
            {showChat ? 'CLOSE CHAT' : 'TEST CHATBOT'}
          </button>

          <button 
            onClick={() => setShowAdmin(!showAdmin)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${showAdmin ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
          >
            <Database className="w-4 h-4" />
            {showAdmin ? 'CLOSE ADMIN' : 'INFRASTRUCTURE'}
          </button>

          <div className="relative group">
            <button className="p-2 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-all relative">
              <ShoppingCart className="w-5 h-5" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
                  {cart.reduce((acc, item) => acc + item.quantity, 0)}
                </span>
              )}
            </button>
            
            {/* Cart Dropdown (Simple) */}
            <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-100 p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
              <h4 className="text-xs font-black uppercase tracking-widest mb-3 border-b border-gray-50 pb-2">Your Cart</h4>
              {cart.length === 0 ? (
                <p className="text-[10px] text-gray-400 italic">Your cart is empty.</p>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {cart.map((item, i) => {
                    const price = parseFloat(item.product.price.replace('$', ''));
                    const subtotal = price * item.quantity;
                    return (
                      <div key={i} className="flex justify-between items-start text-[10px] border-b border-gray-50 pb-2 last:border-0">
                        <div className="flex-1 pr-2">
                          <p className="font-bold text-gray-800 truncate">{item.product.name}</p>
                          <p className="text-gray-400">
                            {item.quantity} × {item.product.price}
                            <span className="ml-2 font-bold text-indigo-600">Subtotal: ${subtotal.toFixed(2)}</span>
                          </p>
                        </div>
                        <button 
                          onClick={() => setCart(prev => prev.filter(p => p.product.id !== item.product.id))}
                          className="text-red-400 hover:text-red-600 p-1"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    );
                  })}
                  <div className="pt-2 border-t border-gray-100 space-y-1">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-gray-400 uppercase font-bold">Total Items:</span>
                      <span className="font-black">{cart.reduce((acc, item) => acc + item.quantity, 0)}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-black">
                      <span className="text-gray-800 uppercase">Cart Total:</span>
                      <span className="text-emerald-600">
                        ${cart.reduce((acc, item) => acc + (parseFloat(item.product.price.replace('$', '')) * item.quantity), 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <button 
                    onClick={handleCheckout}
                    className="w-full py-2 bg-emerald-600 text-white rounded-lg text-[10px] font-black hover:bg-emerald-700 transition-colors mt-2"
                  >
                    CHECKOUT NOW
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Canvas */}
      <main className={`pt-32 pb-20 px-4 flex flex-col items-center max-w-6xl mx-auto transition-all duration-500 ${showChat || showAdmin ? 'md:pr-[400px]' : ''}`}>
        
        {/* Layer 1: Gateway */}
        <div className="w-full flex justify-center mb-8">
          <Node 
            data={NODES.find(n => n.id === 'gateway')!} 
            onClick={() => setSelectedNode(NODES.find(n => n.id === 'gateway')!)}
            isActive={selectedNode?.id === 'gateway'}
            isHighlighted={isHighlighted('infrastructure')}
            isLive={activeNodeIds.includes('gateway')}
          />
        </div>
        <Arrow className="mb-8" />

        {/* Layer 2: Middleware */}
        <div className="w-full flex justify-center mb-12">
          <Node 
            data={NODES.find(n => n.id === 'middleware')!} 
            onClick={() => setSelectedNode(NODES.find(n => n.id === 'middleware')!)}
            isActive={selectedNode?.id === 'middleware'}
            isHighlighted={isHighlighted('core')}
            isLive={activeNodeIds.includes('middleware')}
          />
        </div>

        {/* Tracks Grid */}
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-4 mb-16 relative">
          {/* Connecting Lines from Middleware */}
          <div className="absolute -top-12 left-0 right-0 h-12 hidden md:block">
             <div className="w-full h-full flex justify-between px-[16%]">
                <div className="w-[1px] bg-gray-300 h-full origin-top rotate-[25deg]" />
                <div className="w-[1px] bg-gray-300 h-full" />
                <div className="w-[1px] bg-gray-300 h-full origin-top -rotate-[25deg]" />
             </div>
          </div>

          {/* Column 1: Tracking */}
          <div className="flex flex-col items-center gap-6">
            <span className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em] mb-2">Tracking</span>
            <Node 
              data={NODES.find(n => n.id === 'order-tracking')!} 
              onClick={() => setSelectedNode(NODES.find(n => n.id === 'order-tracking')!)}
              isActive={selectedNode?.id === 'order-tracking'}
              isHighlighted={isHighlighted('tracking')}
              isLive={activeNodeIds.includes('order-tracking')}
            />
            <Arrow />
            <Node 
              data={NODES.find(n => n.id === 'delivery-alerts')!} 
              onClick={() => setSelectedNode(NODES.find(n => n.id === 'delivery-alerts')!)}
              isActive={selectedNode?.id === 'delivery-alerts'}
              isHighlighted={isHighlighted('tracking')}
              isLive={activeNodeIds.includes('delivery-alerts')}
            />
            <Arrow />
            <Node 
              data={NODES.find(n => n.id === 'return-flow')!} 
              onClick={() => setSelectedNode(NODES.find(n => n.id === 'return-flow')!)}
              isActive={selectedNode?.id === 'return-flow'}
              isHighlighted={isHighlighted('tracking')}
              isLive={activeNodeIds.includes('return-flow')}
            />
          </div>

          {/* Column 2: Promotion */}
          <div className="flex flex-col items-center gap-6">
            <span className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em] mb-2">Promotion</span>
            <Node 
              data={NODES.find(n => n.id === 'broadcast')!} 
              onClick={() => setSelectedNode(NODES.find(n => n.id === 'broadcast')!)}
              isActive={selectedNode?.id === 'broadcast'}
              isHighlighted={isHighlighted('promotion')}
              isLive={activeNodeIds.includes('broadcast')}
            />
            <Arrow />
            <Node 
              data={NODES.find(n => n.id === 'chatbot-flows')!} 
              onClick={() => setSelectedNode(NODES.find(n => n.id === 'chatbot-flows')!)}
              isActive={selectedNode?.id === 'chatbot-flows'}
              isHighlighted={isHighlighted('promotion')}
              isLive={activeNodeIds.includes('chatbot-flows')}
            />
            <Arrow />
            <Node 
              data={NODES.find(n => n.id === 'retargeting')!} 
              onClick={() => setSelectedNode(NODES.find(n => n.id === 'retargeting')!)}
              isActive={selectedNode?.id === 'retargeting'}
              isHighlighted={isHighlighted('promotion')}
              isLive={activeNodeIds.includes('retargeting')}
            />
          </div>

          {/* Column 3: Sales */}
          <div className="flex flex-col items-center gap-6">
            <span className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em] mb-2">Sales</span>
            <Node 
              data={NODES.find(n => n.id === 'lead-qual')!} 
              onClick={() => setSelectedNode(NODES.find(n => n.id === 'lead-qual')!)}
              isActive={selectedNode?.id === 'lead-qual'}
              isHighlighted={isHighlighted('sales')}
              isLive={activeNodeIds.includes('lead-qual')}
            />
            <Arrow />
            <Node 
              data={NODES.find(n => n.id === 'crm-integration')!} 
              onClick={() => setSelectedNode(NODES.find(n => n.id === 'crm-integration')!)}
              isActive={selectedNode?.id === 'crm-integration'}
              isHighlighted={isHighlighted('sales')}
              isLive={activeNodeIds.includes('crm-integration')}
            />
            <Arrow />
            <Node 
              data={NODES.find(n => n.id === 'follow-up')!} 
              onClick={() => setSelectedNode(NODES.find(n => n.id === 'follow-up')!)}
              isActive={selectedNode?.id === 'follow-up'}
              isHighlighted={isHighlighted('sales')}
              isLive={activeNodeIds.includes('follow-up')}
            />
          </div>
        </div>

        {/* Layer 4: Bot Engine */}
        <div className="w-full flex justify-center mb-12 relative">
           {/* Connecting Lines to Bot Engine */}
           <div className="absolute -top-16 left-0 right-0 h-16 hidden md:block">
             <div className="w-full h-full flex justify-between px-[16%]">
                <div className="w-[1px] bg-gray-300 h-full origin-bottom rotate-[-25deg]" />
                <div className="w-[1px] bg-gray-300 h-full" />
                <div className="w-[1px] bg-gray-300 h-full origin-bottom rotate-[25deg]" />
             </div>
          </div>
          <Node 
            data={NODES.find(n => n.id === 'nlp-layer')!} 
            onClick={() => setSelectedNode(NODES.find(n => n.id === 'nlp-layer')!)}
            isActive={selectedNode?.id === 'nlp-layer'}
            isHighlighted={isHighlighted('core')}
            isLive={activeNodeIds.includes('nlp-layer')}
          />
        </div>

        {/* Layer 5: Handoff & Analytics */}
        <div className="w-full flex flex-col md:flex-row justify-center gap-12 mb-12 relative">
          <div className="absolute -top-12 left-0 right-0 h-12 hidden md:block">
             <div className="w-full h-full flex justify-center gap-[10%]">
                <div className="w-[1px] bg-gray-300 h-full origin-top rotate-[25deg]" />
                <div className="w-[1px] bg-gray-300 h-full origin-top -rotate-[25deg]" />
             </div>
          </div>
          <Node 
            data={NODES.find(n => n.id === 'human-handoff')!} 
            onClick={() => setSelectedNode(NODES.find(n => n.id === 'human-handoff')!)}
            isActive={selectedNode?.id === 'human-handoff'}
            isHighlighted={isHighlighted('infrastructure')}
            isLive={activeNodeIds.includes('human-handoff')}
          />
          <Node 
            data={NODES.find(n => n.id === 'analytics')!} 
            onClick={() => setSelectedNode(NODES.find(n => n.id === 'analytics')!)}
            isActive={selectedNode?.id === 'analytics'}
            isHighlighted={isHighlighted('infrastructure')}
            isLive={activeNodeIds.includes('analytics')}
          />
        </div>

        {/* Layer 6: Platform Layer */}
        <div className="w-full flex justify-center relative">
          <div className="absolute -top-12 left-0 right-0 h-12 hidden md:block">
             <div className="w-full h-full flex justify-center gap-[10%]">
                <div className="w-[1px] bg-gray-300 h-full origin-bottom rotate-[-25deg]" />
                <div className="w-[1px] bg-gray-300 h-full origin-bottom rotate-[25deg]" />
             </div>
          </div>
          <Node 
            data={NODES.find(n => n.id === 'platform-layer')!} 
            onClick={() => setSelectedNode(NODES.find(n => n.id === 'platform-layer')!)}
            isActive={selectedNode?.id === 'platform-layer'}
            isHighlighted={isHighlighted('infrastructure')}
            isLive={activeNodeIds.includes('platform-layer')}
          />
        </div>

        <p className="mt-20 text-gray-400 text-xs font-medium italic">Click any node to explore further ↗</p>
      </main>

      {/* Chat Simulator Panel */}
      <AnimatePresence>
        {showChat && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className={`fixed top-0 right-0 bottom-0 ${isMaximized ? 'w-full md:w-[800px]' : 'w-full md:w-[500px]'} bg-[#efeae2] z-[70] shadow-2xl flex flex-col overflow-hidden border-l border-gray-200 transition-all duration-500`}
          >
            {/* WhatsApp Header */}
            <div className="bg-[#075e54] p-4 flex items-center justify-between text-white shadow-md z-10">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setShowChat(false)}
                  className="p-1 hover:bg-white/10 rounded-full md:hidden"
                >
                  <ChevronRight className="w-6 h-6 rotate-180" />
                </button>
                <div className="relative">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center border-2 border-white/30">
                    <Bot className="w-7 h-7" />
                  </div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#075e54] rounded-full" />
                </div>
                <div>
                  <h3 className="font-black text-base leading-tight">Automation Assistant</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">Online & Syncing</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-4">
                {currentSystemNode && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="hidden lg:flex bg-emerald-500/20 border border-emerald-500/50 px-2 py-1 rounded items-center gap-2"
                  >
                    <Activity className="w-3 h-3 text-emerald-400 animate-pulse" />
                    <span className="text-[8px] font-black uppercase tracking-tighter text-emerald-400">
                      {NODES.find(n => n.id === currentSystemNode)?.title.split(' ')[0]} Active
                    </span>
                  </motion.div>
                )}
                <div className="flex items-center gap-1">
                  <button className="p-2 hover:bg-white/10 rounded-full transition-colors hidden sm:block">
                    <Search className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => setIsMaximized(!isMaximized)}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors hidden md:block"
                  >
                    {isMaximized ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                  </button>
                  <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => setShowChat(false)}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors ml-2"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#efeae2] relative">
              {/* WhatsApp-style Background Pattern Overlay */}
              <div className="absolute inset-0 opacity-[0.06] pointer-events-none bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat" />
              
              <div className="relative z-10 space-y-4">
                <div className="flex justify-center mb-6">
                  <span className="px-3 py-1 bg-white/50 backdrop-blur-sm text-[10px] font-bold text-gray-500 rounded-lg uppercase tracking-widest shadow-sm">
                    Today
                  </span>
                </div>

                {messages.map((msg, i) => (
                  <div key={i} className="space-y-3">
                    <div className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className="flex flex-col gap-1 max-w-[85%]">
                        <motion.div 
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          className={`p-4 rounded-2xl text-sm shadow-md relative group ${
                            msg.sender === 'user' 
                              ? 'bg-[#dcf8c6] rounded-tr-none text-gray-800' 
                              : 'bg-white rounded-tl-none text-gray-800'
                          }`}
                        >
                          {/* Message Tail */}
                          <div className={`absolute top-0 w-4 h-4 ${
                            msg.sender === 'user' 
                              ? '-right-2 bg-[#dcf8c6] [clip-path:polygon(0_0,0_100%,100%_0)]' 
                              : '-left-2 bg-white [clip-path:polygon(100%_0,100%_100%,0_0)]'
                          }`} />
                          
                          <p className="whitespace-pre-wrap leading-relaxed font-medium">{msg.text}</p>
                          <div className="flex items-center justify-end gap-1 mt-1.5">
                            <span className="text-[9px] text-gray-400 font-bold">
                              {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {msg.sender === 'user' && (
                              <div className="flex -space-x-1">
                                <CheckCheck className="w-3 h-3 text-blue-500" />
                              </div>
                            )}
                          </div>
                        </motion.div>
                        
                        {msg.productId && (
                          <ProductCard productId={msg.productId} />
                        )}
                      </div>
                    </div>
                    
                    {msg.sender === 'bot' && msg.actions && i === messages.length - 1 && (
                      <div className="flex flex-wrap gap-2 justify-start pl-2">
                        {msg.actions.map((action, j) => (
                          <motion.button
                            key={j}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: j * 0.1 }}
                            onClick={() => handleSendMessage(action)}
                            className="px-5 py-2.5 bg-white border border-emerald-100 text-emerald-700 text-xs font-black rounded-xl shadow-sm hover:bg-emerald-50 hover:scale-105 transition-all active:scale-95 flex items-center gap-2"
                          >
                            <div className="w-1 h-1 rounded-full bg-emerald-500" />
                            {action}
                          </motion.button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex flex-col items-start gap-2">
                    <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-md relative">
                      <div className={`absolute top-0 -left-2 w-4 h-4 bg-white [clip-path:polygon(100%_0,100%_100%,0_0)]`} />
                      <div className="flex gap-1.5">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                      </div>
                    </div>
                    {currentSystemNode && (
                      <span className="text-[9px] text-gray-400 font-black uppercase tracking-widest pl-1 flex items-center gap-2">
                        <Activity className="w-3 h-3 animate-pulse" />
                        Processing via {NODES.find(n => n.id === currentSystemNode)?.title}...
                      </span>
                    )}
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input Area */}
            <div className="p-4 bg-[#f0f2f5] border-t border-gray-200">
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage(inputValue);
                }} 
                className="flex items-center gap-3"
              >
                <div className="flex items-center gap-2 text-gray-500">
                  <button type="button" className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                    <Plus className="w-6 h-6" />
                  </button>
                </div>
                <div className="flex-1 relative">
                  <input 
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Type a message..."
                    className="w-full bg-white py-3 px-5 pr-12 rounded-2xl text-sm focus:outline-none shadow-sm border border-transparent focus:border-emerald-500 transition-all"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 text-gray-400">
                    <Smile className="w-5 h-5 cursor-pointer hover:text-gray-600" />
                    <Paperclip className="w-5 h-5 cursor-pointer hover:text-gray-600 hidden sm:block" />
                  </div>
                </div>
                <button 
                  type="submit"
                  disabled={!inputValue.trim() || isTyping}
                  className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all ${
                    !inputValue.trim() || isTyping 
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                      : 'bg-[#00a884] text-white hover:bg-[#008f6f] scale-110 active:scale-95'
                  }`}
                >
                  {inputValue.trim() ? <Send className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Admin / Infrastructure Panel */}
      <AnimatePresence>
        {showAdmin && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="fixed top-20 right-0 bottom-0 w-full md:w-[400px] bg-white z-30 shadow-2xl flex flex-col border-l border-gray-100"
          >
            <div className="bg-indigo-900 p-4 text-white">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Database className="w-4 h-4" /> Infrastructure & CRM
              </h3>
              <p className="text-[10px] opacity-70">Real-time Data Sync</p>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              <section className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Inventory</p>
                  <p className="text-2xl font-black text-indigo-900">{adminData.inventoryCount}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Sessions</p>
                  <p className="text-2xl font-black text-indigo-900">{adminData.activeSessions}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 col-span-2">
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">CRM Status</p>
                    <button 
                      onClick={syncCrm}
                      className="text-[9px] font-black text-indigo-600 uppercase tracking-widest hover:underline flex items-center gap-1"
                    >
                      <RefreshCw className="w-2 h-2" /> Sync Now
                    </button>
                  </div>
                  <p className="text-sm font-black text-gray-900">{adminData.crmStatus || 'Mock Mode'}</p>
                  <div className="flex flex-wrap gap-4 mt-2">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Orders: <span className="text-indigo-600">{adminData.ordersCount || 0}</span></p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Promos: <span className="text-indigo-600">{adminData.promotionsCount || 0}</span></p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Customers: <span className="text-indigo-600">{adminData.customersCount || 0}</span></p>
                  </div>
                </div>
              </section>

              {adminData.customers && adminData.customers.length > 0 && (
                <section>
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">
                    Recent Customers
                  </h4>
                  <div className="space-y-3">
                    {adminData.customers.map((customer, i) => (
                      <div key={i} className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex justify-between items-center">
                        <div>
                          <p className="text-xs font-black text-gray-900">{customer.name}</p>
                          <p className="text-[10px] text-gray-400">{customer.email}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{customer.loyaltyTier}</p>
                          <p className="text-[10px] font-bold text-gray-400">${customer.totalSpent.toFixed(2)} spent</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              <section>
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center justify-between">
                  CRM Leads <span>{adminData.leads.length}</span>
                </h4>
                <div className="space-y-3">
                  {adminData.leads.length === 0 ? (
                    <p className="text-xs text-gray-400 italic">No leads captured yet...</p>
                  ) : (
                    adminData.leads.map((lead, i) => (
                      <div key={i} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <p className="text-xs font-bold text-gray-800">{lead.name || 'Anonymous'}</p>
                        <p className="text-[10px] text-gray-500">{lead.email || 'No email'}</p>
                        <div className="mt-2 flex justify-between items-center">
                          <span className="text-[8px] px-1.5 py-0.5 bg-indigo-100 text-indigo-700 rounded uppercase font-bold">{lead.source}</span>
                          <span className="text-[8px] text-gray-400">{new Date(lead.timestamp).toLocaleTimeString()}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>

              <section>
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">
                  Live Analytics
                </h4>
                <div className="space-y-2">
                  {adminData.analytics.map((event, i) => (
                    <div key={i} className="flex items-center gap-3 text-[10px]">
                      <div className={`w-1.5 h-1.5 rounded-full ${event.type === 'intent_detected' ? 'bg-emerald-500' : 'bg-blue-500'}`} />
                      <span className="font-bold text-gray-400 w-12">{new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                      <span className="text-gray-600">
                        {event.type === 'intent_detected' ? `Intent: ${event.intent}` : `Msg from ${event.sender}`}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detail Sidebar */}
      <AnimatePresence>
        {selectedNode && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedNode(null)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-[60] overflow-y-auto"
            >
              <div className="p-8">
                <div className="flex justify-between items-start mb-8">
                  <div className="p-3 bg-gray-100 rounded-2xl">
                    {selectedNode.icon}
                  </div>
                  <button 
                    onClick={() => setSelectedNode(null)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="w-6 h-6 text-gray-400" />
                  </button>
                </div>

                <div className="mb-2">
                  <TrackBadge track={selectedNode.track} active={true} />
                </div>
                <h2 className="text-3xl font-black tracking-tight mb-2">{selectedNode.title}</h2>
                <p className="text-gray-400 font-bold uppercase tracking-widest text-xs mb-8">{selectedNode.subtitle}</p>

                <div className="space-y-8">
                  <section>
                    <h4 className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Info className="w-3 h-3" /> Overview
                    </h4>
                    <p className="text-gray-600 leading-relaxed">
                      {selectedNode.description}
                    </p>
                  </section>

                  <section>
                    <h4 className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Settings className="w-3 h-3" /> Key Capabilities
                    </h4>
                    <ul className="space-y-3">
                      {selectedNode.details.map((detail, i) => (
                        <li key={i} className="flex items-center gap-3 text-sm text-gray-700 font-medium">
                          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </section>

                  {selectedNode.tools && (
                    <section>
                      <h4 className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Layers className="w-3 h-3" /> Popular Integrations
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedNode.tools.map((tool, i) => (
                          <div key={i} className="px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-xs font-bold text-gray-600 flex items-center gap-2">
                            {tool}
                            <ExternalLink className="w-3 h-3 opacity-30" />
                          </div>
                        ))}
                      </div>
                    </section>
                  )}
                </div>

                <div className="mt-12 pt-8 border-t border-gray-100">
                  <button className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black tracking-tight hover:bg-black transition-all flex items-center justify-center gap-2 group">
                    CONFIGURE THIS MODULE
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Legend Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-gray-100 px-8 py-4 flex flex-wrap justify-center gap-8 z-10">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-600" />
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Tracking</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber-700" />
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Promotion</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-900" />
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Sales</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-indigo-700" />
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Core Engine</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-900" />
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Infrastructure</span>
        </div>
      </footer>
    </div>
  );
}
