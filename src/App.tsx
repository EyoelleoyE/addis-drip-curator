import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ShoppingBag, 
  Sparkles, 
  Cpu, 
  ChevronRight, 
  Clock, 
  ArrowRight, 
  Lock, 
  MessageSquare, 
  Send, 
  X, 
  Check, 
  Loader2, 
  ShieldCheck, 
  TrendingUp,
  Sliders,
  ExternalLink,
  MapPin,
  Phone,
  User,
  UploadCloud,
  FileCheck
} from "lucide-react";

// Product interface matching the elite items
interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  desc: string;
  tag: string;
  stock: number;
  serial: string;
}

const PRODUCTS: { women: Product[]; men: Product[] } = {
  women: [
    {
      id: "contour-top",
      name: "Aesthetic Ribbed Contour Top",
      price: 1450,
      image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop", 
      desc: "Surgical body-contouring rib structure with signature raw double-stitch micro hems. Engineered to hold the perfect modern streetwear silhouette.",
      tag: "TRENDING DROP",
      stock: 4,
      serial: "VV-R1-CONTOUR"
    },
    {
      id: "cyber-pants",
      name: "Cyber Distressed Utility Pants",
      price: 2600,
      image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=600&auto=format&fit=crop",
      desc: "Asymmetric slate grey heavy denim overlayed with multi-point hanging compression straps, industrial-grade brutalist hardware, and raw distressing.",
      tag: "LIMITED SECURED",
      stock: 2,
      serial: "VV-C5-UTILITY"
    }
  ],
  men: [
    {
      id: "cargo-hoodie",
      name: "Addis Oversized Cargo Hoodie",
      price: 2200,
      image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=600&auto=format&fit=crop",
      desc: "Distressed 450GSM loopback ultra-heavy cotton. Exaggerated drop-shoulder armor sleeves and high-volume pocket detailing, constructed for Addis nights.",
      tag: "MUST-COP DROP",
      stock: 3,
      serial: "VV-H3-OVERSIZED"
    },
    {
      id: "leather-bomber",
      name: "Retro Leather Bomber Jacket",
      price: 4500,
      image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=600&auto=format&fit=crop",
      desc: "Individually buffed distressed full-grain luxury leather. Featuring oversized boxy proportions, dropped shoulder seams, and custom oxidized steel zip hardware.",
      tag: "VAULT EXCLUSIVE",
      stock: 1,
      serial: "VV-B9-BOMBER"
    }
  ]
};

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: Array<{ title: string; url: string }>;
}

export default function App() {
  const [activeSection, setActiveSection] = useState<"women" | "men">("women");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // Checkout modal state
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutProduct, setCheckoutProduct] = useState<Product | null>(null);
  // steps: "review" -> "details" -> "payment" -> "securing" -> "success"
  const [checkoutStep, setCheckoutStep] = useState<"review" | "details" | "payment" | "securing" | "success">("review");
  const [verificationLogs, setVerificationLogs] = useState<string[]>([]);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  
  // Payment Form States
  const [deliveryName, setDeliveryName] = useState("");
  const [deliveryPhone, setDeliveryPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"telebirr" | "cbe">("telebirr");
  const [transactionReference, setTransactionReference] = useState("");
  const [uploadedReceipt, setUploadedReceipt] = useState<File | null>(null);
  const [uploadedReceiptName, setUploadedReceiptName] = useState<string>("");

  // Chat/Vibe Assistant state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "✦ VIBE VAULT SECURED CONNECTED ✦\n\nWelcome, curator. I am your VIBE ASSISTANT—your direct streetwear link to elite Addis curations and styling. Looking to secure a particular drop, analyze local streetwear trends, or pair a complete vault fit? Ask away."
    }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isChatTyping, setIsChatTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Dynamic Addis Ababa Local Clock (EAT)
  const [addisTime, setAddisTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
      const addisOffset = 3;
      const addisDate = new Date(utc + (3600000 * addisOffset));
      
      const hours = addisDate.getHours().toString().padStart(2, "0");
      const minutes = addisDate.getMinutes().toString().padStart(2, "0");
      const seconds = addisDate.getSeconds().toString().padStart(2, "0");
      
      setAddisTime(`${hours}:${minutes}:${seconds} ADDIS ABABA (EAT)`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Expose filterSection and initiatePurchase globally for framework testing
  useEffect(() => {
    (window as any).filterSection = (gender: "women" | "men") => {
      setActiveSection(gender);
    };
    (window as any).initiatePurchase = (itemName: string, price: number) => {
      let matchedProd = PRODUCTS.women.find(p => p.name === itemName) || 
                        PRODUCTS.men.find(p => p.name === itemName);
      
      if (!matchedProd) {
        matchedProd = {
          id: "custom-item",
          name: itemName,
          price: price,
          image: "https://picsum.photos/seed/streetwear/600/800",
          desc: "Highly exclusive custom streetwear item, sourced directly for Addis Ababa's elite community.",
          tag: "SPECIAL SECURED",
          stock: 1,
          serial: "VV-CUSTOM-FIT"
        };
      }
      
      handleClaim(matchedProd);
    };

    return () => {
      delete (window as any).filterSection;
      delete (window as any).initiatePurchase;
    };
  }, []);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isChatTyping]);

  const handleClaim = (product: Product) => {
    setCheckoutProduct(product);
    setCheckoutStep("review");
    setDeliveryName("");
    setDeliveryPhone("");
    setDeliveryAddress("");
    setTransactionReference("");
    setUploadedReceipt(null);
    setUploadedReceiptName("");
    setVerificationError(null);
    setIsCheckoutOpen(true);
  };

  const handleReceiptVerificationSubmit = async () => {
    if (!transactionReference.trim()) {
      setVerificationError("Reference Number/ID string is required for automated confirmation mapping.");
      return;
    }

    setVerificationError(null);
    setCheckoutStep("securing");
    setVerificationLogs(["INITIALIZING EXCLUSIVE VAULT SECURE...", "CONNECTING EXTRACTION LEDGER ENGINE..."]);

    try {
      // Direct integration to automated background verify endpoint
      const response = await fetch("/api/verify-receipt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bank: paymentMethod,
          reference: transactionReference.trim(),
          expectedAmount: checkoutProduct?.price
        })
      });

      const result = await response.json();

      if (result.status === "SUCCESS") {
        setVerificationLogs(prev => [
          ...prev,
          `PARSING SOURCE BLOCKSTREAM: SECURED DATA MATCHED`,
          `RECORDING DELIVERY METADATA: [Name: ${deliveryName}]`,
          `ROUTING ADDIS DELIVERY SECTOR: [${deliveryAddress}]`,
          `VERIFIED PAYER ENTITY: ${result.payer}`,
          `CONFIRMED TRANSACTION AMOUNT: ${result.amount} ETB`,
          "VAULT CERTIFICATE GEN-3 SIGNED SUCCESSFULLY",
          "AUTHENTICATION GRANTED. DISPATCH PROTOCOL ARMED."
        ]);

        setTimeout(() => {
          setCheckoutStep("success");
          if (checkoutProduct) {
            triggerAssistantDropStyling(checkoutProduct);
          }
        }, 1500);

      } else {
        // Handle explicit parsing or matching exceptions triggered by server scripts
        setCheckoutStep("payment");
        setVerificationError(result.error || "Receipt extraction failed. Secure terminal validation rejected.");
      }
    } catch (err) {
      setCheckoutStep("payment");
      setVerificationError("Network infrastructure mapping error. Failed to reach verification terminal.");
    }
  };

  const triggerAssistantDropStyling = (product: Product) => {
    setIsChatTyping(true);

    const introMsg: ChatMessage = {
      id: `system-prompt-${Date.now()}`,
      role: "user",
      content: `I just secured the [${product.name}] for ${product.price} ETB! Here are my shipping coordinates in Addis: ${deliveryAddress}. Let's get styling ideas while my delivery is on route!`
    };

    setMessages(prev => [...prev, introMsg]);

    setTimeout(async () => {
      try {
        const response = await fetch("/api/vibe-assistant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [
              ...messages.map(m => ({ role: m.role, content: m.content })),
              { role: "user", content: `I just secured the ${product.name} for ${product.price} ETB from the Vibe Vault! Suggest a complete premium streetwear outfit pairing around this specific item, highlighting styling advice, Addis local high-fashion trend alignment, shoes, accessories, and cargo pants matching. Keep it styled like an elite designer.` }
            ],
            currentItem: { name: product.name, price: product.price }
          })
        });

        const data = await response.json();
        setIsChatTyping(false);

        if (data.error) {
          setMessages(prev => [...prev, {
            id: `err-${Date.now()}`,
            role: "assistant",
            content: `✦ CONNECTION ERROR ✦\n\nI couldn't reach the main frame server. But here is premium style advice: Style your newly locked [${product.name}] with oversized heavy-cargo utility denim and minimalist brutalist sneakers. Keep the vibe dark, exclusive, and wait for our Bole courier dispatch confirmation phone call.`
          }]);
        } else {
          setMessages(prev => [...prev, {
            id: `reply-${Date.now()}`,
            role: "assistant",
            content: data.text,
            sources: data.sources
          }]);
        }
      } catch (err) {
        setIsChatTyping(false);
        setMessages(prev => [...prev, {
          id: `err-catch-${Date.now()}`,
          role: "assistant",
          content: `✦ SECURE SYSTEM DOWN ✦\n\nstyling connection offline. We recommend pairing [${product.name}] with layered utility straps, high-top premium boots, and structured modern outerwear to preserve your local high-fashion status in Addis.`
        }]);
      }
    }, 1500);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || chatInput;
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: query
    };

    setMessages(prev => [...prev, userMsg]);
    setChatInput("");
    setIsChatTyping(true);

    try {
      const chatHistory = [...messages, userMsg].map(m => ({
        role: m.role,
        content: m.content
      }));

      const response = await fetch("/api/vibe-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: chatHistory,
          currentItem: selectedProduct ? { name: selectedProduct.name, price: selectedProduct.price } : undefined
        })
      });

      const data = await response.json();
      setIsChatTyping(false);

      if (data.error) {
        setMessages(prev => [...prev, {
          id: `err-${Date.now()}`,
          role: "assistant",
          content: `✦ SECURE VAULT DISPATCH OFFLINE ✦\n\nUnable to access real-time Search Grounding. Styling guidance: Dark techwear, heavy combat boots, and layered cyber-brutalist items remain the absolute standard for Addis status.`
        }]);
      } else {
        setMessages(prev => [...prev, {
          id: `reply-${Date.now()}`,
          role: "assistant",
          content: data.text,
          sources: data.sources
        }]);
      }
    } catch (err) {
      setIsChatTyping(false);
      setMessages(prev => [...prev, {
        id: `err-${Date.now()}`,
        role: "assistant",
        content: `✦ OFFLINE DEVIANCE detected ✦\n\nEnsure server.ts is active on port 3000. Stylist recommended fallback: Layer your silhouettes with structural asymmetry and deep technical cargos.`
      }]);
    }
  };

  const handleSimulateFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedReceipt(e.target.files[0]);
      setUploadedReceiptName(e.target.files[0].name);
    }
  };

  const currentProducts = activeSection === "women" ? PRODUCTS.women : PRODUCTS.men;

  return (
    <div className="h-screen w-full bg-[#000000] text-white flex overflow-hidden font-sans selection:bg-white selection:text-black relative">
      
      {/* Decorative Grid Mesh Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#111111_1px,transparent_1px),linear-gradient(to_bottom,#111111_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none opacity-20 z-0" />

      {/* LEFT BRUTALIST RAIL */}
      <aside className="hidden md:flex w-32 border-r border-white/10 flex-col justify-between items-center py-12 shrink-0 z-10 select-none">
        <div className="text-[10px] tracking-[0.4em] uppercase opacity-40 rotate-180 [writing-mode:vertical-rl] font-mono font-medium">
          EST. MMXXVI &mdash; ADDIS ABABA
        </div>
        <div className="h-px w-12 bg-white/20"></div>
        <div className="text-[10px] tracking-[0.4em] uppercase opacity-40 [writing-mode:vertical-rl] font-mono font-medium">
          CURATED FOR THE ELITE
        </div>
      </aside>

      {/* MAIN SCROLL CONTAINER */}
      <main className="flex-1 flex flex-col h-full overflow-y-auto relative z-10">
        
        {/* HEADER SECTION */}
        <header className="pt-12 px-6 md:px-16 flex flex-col gap-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end w-full gap-4">
            <div>
              <div className="flex items-center gap-2 text-[10px] font-mono text-[#888] uppercase tracking-[0.3em] mb-2">
                <Cpu className="w-3.5 h-3.5 text-[#00f3ff] animate-pulse" />
                <span>Bole Flagship Online Terminal</span>
              </div>
              <h1 className="text-6xl md:text-8xl font-black tracking-[-0.04em] leading-none m-0 font-display uppercase">
                VIBE VAULT
              </h1>
            </div>
            <div className="text-left md:text-right font-mono">
              <span className="block text-[10px] tracking-[0.3em] uppercase opacity-40 font-bold mb-1 font-mono">Vault Status</span>
              <span className="block text-sm text-[#a8ffb2] font-bold tracking-wide font-mono">ENCRYPTED_ACCESS_GRANTED</span>
              <span className="block text-[10px] text-gray-500 mt-1 font-mono">{addisTime || "EAT+03:00"}</span>
            </div>
          </div>

          {/* NAV BAR */}
          <nav className="flex gap-8 border-b border-white/5 pb-6">
            <button 
              id="btn-women" 
              onClick={() => setActiveSection("women")} 
              className={`group relative text-sm uppercase tracking-[0.2em] font-bold transition-all duration-500 cursor-pointer ${activeSection === "women" ? "opacity-100" : "opacity-40 hover:opacity-100"}`}>
              Women's Vault
              <span id="line-women" className={`absolute -bottom-6.5 left-0 h-[3px] bg-white transition-all duration-500 ${activeSection === "women" ? "w-full" : "w-0"}`}></span>
            </button>
            <button 
              id="btn-men" 
              onClick={() => setActiveSection("men")} 
              className={`group relative text-sm uppercase tracking-[0.2em] font-bold transition-all duration-500 cursor-pointer ${activeSection === "men" ? "opacity-100" : "opacity-40 hover:opacity-100"}`}>
              Men's Vault
              <span id="line-men" className={`absolute -bottom-6.5 left-0 h-[3px] bg-white transition-all duration-500 ${activeSection === "men" ? "w-full" : "w-0"}`}></span>
            </button>
          </nav>
        </header>

        {/* PRODUCT GRID CONTAINER */}
        <div className="flex-1 p-6 md:p-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl">
            <AnimatePresence mode="wait">
              {currentProducts.map((product, idx) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="group relative flex flex-col"
                >
                  {/* Image Frame */}
                  <div 
                    onClick={() => setSelectedProduct(product)}
                    className="aspect-[3/4] bg-neutral-900 overflow-hidden relative border border-white/5 cursor-pointer rounded-sm"
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10"></div>
                    
                    {/* Status Ribbon */}
                    <div className="absolute top-4 left-4 z-20">
                      <span className="text-[9px] font-mono font-extrabold uppercase tracking-widest bg-white text-black px-3 py-1">
                        {product.tag}
                      </span>
                    </div>

                    {/* Serial Sticker Tag */}
                    <div className="absolute top-4 right-4 z-20">
                      <span className="text-[9px] font-mono font-bold text-white/60 bg-black/80 border border-white/10 px-2.5 py-1">
                        {product.serial}
                      </span>
                    </div>

                    <motion.img 
                      src={product.image} 
                      alt={product.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full bg-cover bg-center transition-transform duration-700 object-cover group-hover:scale-110"
                    />

                    {/* Absolute Bottom Product Info overlay */}
                    <div className="absolute bottom-8 left-8 z-20 pr-8">
                      <h3 className="text-2xl font-bold uppercase tracking-tight text-white line-clamp-1 group-hover:text-[#f3ff00] transition-colors font-display">
                        {product.name}
                      </h3>
                      <p className="font-mono text-white/60 mt-1">{product.price.toLocaleString()} ETB</p>
                      <p className="text-[10px] font-mono text-white/40 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        ALLOCATION LEFT: {product.stock} ITEMS
                      </p>
                    </div>
                  </div>

                  {/* Dedicated Action Layout */}
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    <button 
                      onClick={() => {
                        setIsChatOpen(true);
                        triggerAssistantDropStyling(product);
                      }}
                      className="bg-transparent border border-white/20 text-white py-4 uppercase font-bold text-[10px] tracking-[0.15em] hover:border-[#f3ff00] hover:text-[#f3ff00] transition-all duration-300 cursor-pointer"
                    >
                      Style Fit
                    </button>
                    <button 
                      onClick={() => handleClaim(product)}
                      className="bg-white text-black py-4 uppercase font-black text-[10px] tracking-[0.15em] hover:bg-[#f3ff00] hover:text-black transition-all duration-300 cursor-pointer"
                    >
                      Claim Look
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* FOOTER STATUS */}
        <footer className="h-20 border-t border-white/10 px-6 md:px-16 flex items-center justify-between mt-auto shrink-0 select-none">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>
              <span className="text-[10px] uppercase tracking-widest font-bold font-mono">Live Inventory Syncing</span>
            </div>
            <div className="hidden md:block h-4 w-px bg-white/10"></div>
            <span className="hidden md:inline text-[10px] uppercase tracking-widest font-bold opacity-30 font-mono">9 Items Sold Today</span>
          </div>
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-xs font-mono opacity-50 hover:opacity-100 hover:border-white cursor-pointer transition-all">IG</div>
            <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-xs font-mono opacity-50 hover:opacity-100 hover:border-white cursor-pointer transition-all">TT</div>
          </div>
        </footer>

      </main>

      {/* Floating Vibe Assistant Toggle Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button 
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="relative bg-white text-black p-4 rounded-full border border-white shadow-[0_4px_24px_rgba(255,255,255,0.2)] hover:bg-black hover:text-white hover:border-[#00f3ff] hover:shadow-[0_0_20px_rgba(0,243,255,0.4)] transition-all duration-300 flex items-center gap-2 group cursor-pointer"
        >
          {isChatOpen ? <X className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
          <span className="text-xs font-mono font-black uppercase tracking-wider pr-1 hidden md:inline">Vibe Assistant</span>
          <span className="absolute -top-1 -left-1 w-3 h-3 bg-[#00f3ff] border-2 border-black rounded-full animate-ping" />
        </button>
      </div>

      {/* Slide-out Vibe Assistant Panel */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div 
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-[#080808]/95 border-l border-[#1a1a1a] shadow-[[-10px_0_40px_rgba(0,0,0,0.8)]] z-50 flex flex-col backdrop-blur-lg"
          >
            {/* Chat Header */}
            <div className="p-6 border-b border-[#1a1a1a] flex justify-between items-center bg-black/60">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-8 h-8 rounded-full border border-[#00f3ff] bg-[#00f3ff]/10 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-[#00f3ff]" />
                  </div>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#a8ffb2] border border-black rounded-full" />
                </div>
                <div>
                  <h3 className="text-sm font-mono font-extrabold uppercase tracking-wider flex items-center gap-1.5 text-white">
                    Vibe Assistant
                  </h3>
                  <p className="text-[10px] font-mono text-[#00f3ff] tracking-wide">GEMINI SEARCH GROUNDING ON</p>
                </div>
              </div>
              <button 
                onClick={() => setIsChatOpen(false)}
                className="text-gray-400 hover:text-white p-1 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
              {messages.map((m) => (
                <div 
                  key={m.id} 
                  className={`flex flex-col gap-1.5 max-w-[85%] ${m.role === "user" ? "self-end items-end" : "self-start items-start"}`}
                >
                  <div className={`text-[9px] font-mono text-gray-500 uppercase tracking-widest`}>
                    {m.role === "user" ? "Client Core" : "Vault Concierge"}
                  </div>
                  <div 
                    className={`p-4 rounded-2xl text-xs font-mono leading-relaxed border ${
                      m.role === "user" 
                        ? "bg-white text-black border-white shadow-[0_2px_12px_rgba(255,255,255,0.1)]" 
                        : "bg-[#0f0f0f] text-gray-200 border-[#1c1c1c] whitespace-pre-wrap"
                    }`}
                  >
                    {m.content}
                    
                    {/* Render search sources if available */}
                    {m.sources && m.sources.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-[#1a1a1a] flex flex-col gap-1">
                        <div className="text-[9px] font-mono text-[#888] uppercase tracking-wider flex items-center gap-1">
                          <Cpu className="w-2.5 h-2.5 text-[#00f3ff]" />
                          <span>Google Search Grounding sources:</span>
                        </div>
                        {m.sources.map((src, sIdx) => (
                          <a 
                            key={sIdx}
                            href={src.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] font-mono text-[#00f3ff] hover:underline flex items-center gap-1.5 truncate"
                          >
                            <ExternalLink className="w-2.5 h-2.5 flex-shrink-0" />
                            <span className="truncate">{src.title}</span>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isChatTyping && (
                <div className="flex flex-col gap-1.5 self-start items-start max-w-[80%]">
                  <span className="text-[9px] font-mono text-[#00f3ff] uppercase tracking-widest">Generating fit algorithm...</span>
                  <div className="p-4 bg-[#0f0f0f] border border-[#1c1c1c] rounded-2xl flex items-center gap-2">
                    <Loader2 className="w-4 h-4 text-[#00f3ff] animate-spin" />
                    <span className="text-xs font-mono text-gray-400">Syncing Addis high-fashion metadata...</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Chat Input Bar */}
            <div className="p-6 border-t border-[#1a1a1a] bg-black/60 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <input 
                  type="text" 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="Query styling algorithm..."
                  className="flex-1 bg-[#101010] border border-[#222] text-xs font-mono text-white placeholder-gray-600 rounded-lg px-4 py-3.5 focus:border-[#00f3ff] focus:outline-none transition-all"
                />
                <button 
                  onClick={() => handleSendMessage()}
                  className="bg-white text-black p-3.5 rounded-lg hover:bg-[#00f3ff] hover:shadow-[0_0_12px_rgba(0,243,255,0.4)] transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <div className="text-[9px] font-mono text-gray-600 text-center uppercase tracking-widest leading-relaxed">
                Vault assistant queries utilize high-thinking search networks.
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Product Inspector Detail Overlay Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-6 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0a0a0a] border border-[#222] rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative flex flex-col md:flex-row gap-8 p-8"
            >
              <button 
                onClick={() => setSelectedProduct(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white bg-black/60 p-2 rounded-full border border-[#1a1a1a] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-full md:w-1/2 rounded-xl overflow-hidden border border-[#1a1a1a]">
                <img 
                  src={selectedProduct.image} 
                  alt={selectedProduct.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-auto object-cover"
                />
              </div>

              <div className="w-full md:w-1/2 flex flex-col justify-between py-2">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono font-bold tracking-widest bg-white text-black px-2.5 py-1 rounded-full uppercase">
                      {selectedProduct.tag}
                    </span>
                    <span className="text-[10px] font-mono text-[#888]">
                      SERIAL: {selectedProduct.serial}
                    </span>
                  </div>

                  <h2 className="text-3xl font-display font-black text-white uppercase tracking-wide">
                    {selectedProduct.name}
                  </h2>

                  <div className="text-2xl font-mono font-bold text-[#a8ffb2]">
                    {selectedProduct.price.toLocaleString()} ETB
                  </div>

                  <p className="text-sm text-gray-300 font-mono leading-relaxed pt-2 border-t border-[#151515]">
                    {selectedProduct.desc}
                  </p>

                  <div className="flex flex-col gap-2 mt-2 bg-[#121212] border border-[#1a1a1a] p-4 rounded-xl font-mono text-xs text-gray-400">
                    <div className="flex justify-between">
                      <span>Exclusivity Score:</span>
                      <span className="text-[#00f3ff] font-bold">9.8/10</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Warehouse Location:</span>
                      <span className="text-white">Bole Zone B</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Courier Dispatch:</span>
                      <span className="text-white">Secure Bike Express</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3 mt-6">
                  <button 
                    onClick={() => {
                      const p = selectedProduct;
                      setSelectedProduct(null);
                      handleClaim(p);
                    }}
                    className="w-full bg-white text-black py-4 rounded-xl font-mono font-bold text-xs uppercase tracking-widest hover:bg-[#00f3ff] hover:shadow-[0_0_20px_rgba(0,243,255,0.3)] transition-all duration-300 cursor-pointer"
                  >
                    Initiate Vault Retrieval
                  </button>
                  <button 
                    onClick={() => {
                      const p = selectedProduct;
                      setSelectedProduct(null);
                      setIsChatOpen(true);
                      triggerAssistantDropStyling(p);
                    }}
                    className="w-full bg-transparent border border-white/20 text-white py-3 rounded-xl font-mono text-xs uppercase tracking-wider hover:border-white transition-colors cursor-pointer"
                  >
                    Discuss Silhouette Vibe
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* COMPACT CHECKOUT MODAL STREAMFLOW */}
      <AnimatePresence>
        {isCheckoutOpen && checkoutProduct && (
          <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#050505] border border-[#1c1c1c] rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl relative"
            >
              {/* Close Button */}
              {checkoutStep !== "securing" && (
                <button 
                  onClick={() => setIsCheckoutOpen(false)}
                  className="absolute top-4 right-4 text-gray-500 hover:text-white p-2 rounded-full cursor-pointer z-10"
                >
                  <X className="w-5 h-5" />
                </button>
              )}

              {/* Progress Indicator Head */}
              <div className="bg-[#0a0a0a] border-b border-[#151515] px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-white">
                  <Lock className="w-3.5 h-3.5 text-[#a8ffb2]" />
                  <span>Secure Claim Ledger</span>
                </div>
                <div className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">
                  Step: <span className="text-[#00f3ff] font-bold">{checkoutStep.toUpperCase()}</span>
                </div>
              </div>

              {/* STEP 1: REVIEW LOOK */}
              {checkoutStep === "review" && (
                <div className="p-6 flex flex-col gap-6">
                  <div className="flex items-center gap-4 bg-[#0e0e0e] border border-[#1a1a1a] p-4 rounded-xl">
                    <img 
                      src={checkoutProduct.image} 
                      alt={checkoutProduct.name} 
                      className="w-16 h-20 object-cover border border-[#222] rounded-md shrink-0"
                    />
                    <div>
                      <span className="text-[9px] font-mono text-gray-500 block uppercase tracking-wider">{checkoutProduct.serial}</span>
                      <h4 className="text-sm font-bold uppercase tracking-tight text-white mt-0.5">{checkoutProduct.name}</h4>
                      <span className="text-xs font-mono text-[#a8ffb2] font-semibold mt-1 block">{checkoutProduct.price.toLocaleString()} ETB</span>
                    </div>
                  </div>

                  <div className="bg-[#121212] border border-white/5 p-4 rounded-xl text-xs font-mono text-gray-400 space-y-2">
                    <p className="m-0 leading-relaxed">
                      ✦ You are claiming a premium architectural look from the warehouse vaults. Stock allocations are held temporarily for active sessions only.
                    </p>
                  </div>

                  <button 
                    onClick={() => setCheckoutStep("details")}
                    className="w-full bg-white text-black py-4 rounded-xl font-mono font-bold text-xs uppercase tracking-widest hover:bg-[#f3ff00] transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Coordinate Logistics</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* STEP 2: SHIPPING DETAILS */}
              {checkoutStep === "details" && (
                <div className="p-6 flex flex-col gap-4">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-gray-400 mb-2">Courier Delivery Allocation Coordinates</h3>
                  
                  <div className="space-y-3">
                    <div className="relative">
                      <User className="absolute left-4 top-3.5 w-4 h-4 text-gray-600" />
                      <input 
                        type="text" 
                        value={deliveryName}
                        onChange={(e) => setDeliveryName(e.target.value)}
                        placeholder="Recipient Name"
                        className="w-full bg-[#0e0e0e] border border-[#1c1c1c] rounded-xl pl-11 pr-4 py-3.5 text-xs font-mono focus:border-white focus:outline-none text-white transition-colors"
                      />
                    </div>

                    <div className="relative">
                      <Phone className="absolute left-4 top-3.5 w-4 h-4 text-gray-600" />
                      <input 
                        type="text" 
                        value={deliveryPhone}
                        onChange={(e) => setDeliveryPhone(e.target.value)}
                        placeholder="Phone Number (+251...)"
                        className="w-full bg-[#0e0e0e] border border-[#1c1c1c] rounded-xl pl-11 pr-4 py-3.5 text-xs font-mono focus:border-white focus:outline-none text-white transition-colors"
                      />
                    </div>

                    <div className="relative">
                      <MapPin className="absolute left-4 top-3.5 w-4 h-4 text-gray-600" />
                      <input 
                        type="text" 
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        placeholder="Delivery Sector (e.g. Bole, Ayat, Old Airport)"
                        className="w-full bg-[#0e0e0e] border border-[#1c1c1c] rounded-xl pl-11 pr-4 py-3.5 text-xs font-mono focus:border-white focus:outline-none text-white transition-colors"
                      />
                    </div>
                  </div>

                  <button 
                    disabled={!deliveryName || !deliveryPhone || !deliveryAddress}
                    onClick={() => setCheckoutStep("payment")}
                    className="w-full bg-white text-black py-4 rounded-xl font-mono font-bold text-xs uppercase tracking-widest hover:bg-[#f3ff00] disabled:opacity-40 disabled:hover:bg-white transition-all mt-4 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Proceed to Verification Ledger</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* STEP 3: PAYMENT & TRANSACTION EXTRACTION INTERFACE */}
              {checkoutStep === "payment" && (
                <div className="p-6 flex flex-col gap-4">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-gray-400">Vault Settlement Interface</h3>

                  {/* Payment Gateway Toggle */}
                  <div className="grid grid-cols-2 gap-3 mb-2">
                    <button 
                      onClick={() => setPaymentMethod("telebirr")}
                      className={`py-3 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer uppercase tracking-wider ${paymentMethod === "telebirr" ? "border-[#00f3ff] bg-[#00f3ff]/5 text-white" : "border-[#1c1c1c] bg-transparent text-gray-500"}`}
                    >
                      Telebirr Vault
                    </button>
                    <button 
                      onClick={() => setPaymentMethod("cbe")}
                      className={`py-3 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer uppercase tracking-wider ${paymentMethod === "cbe" ? "border-[#00f3ff] bg-[#00f3ff]/5 text-white" : "border-[#1c1c1c] bg-transparent text-gray-500"}`}
                    >
                      CBE Birr API
                    </button>
                  </div>

                  {/* Error Notification Flash */}
                  {verificationError && (
                    <div className="bg-red-950/40 border border-red-900 text-red-400 p-3.5 rounded-xl text-xs font-mono tracking-wide leading-relaxed">
                      ✦ VERIFICATION FAILED: {verificationError}
                    </div>
                  )}

                  <div className="bg-[#0e0e0e] border border-[#1a1a1a] p-4 rounded-xl text-xs font-mono space-y-2 text-gray-400">
                    <p className="m-0 text-white font-bold uppercase tracking-wide">Manual Ledger Settlement Details:</p>
                    <p className="m-0">Merchant Identification: <span className="text-white font-bold select-all">VIBEVAULT_ADDIS</span></p>
                    <p className="m-0">Transfer Total: <span className="text-[#a8ffb2] font-black">{checkoutProduct.price.toLocaleString()} ETB</span></p>
                  </div>

                  {/* Transaction Metadata Mapping Inputs */}
                  <div className="space-y-3 mt-1">
                    <div>
                      <label className="block text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-1.5 font-bold">Transaction Reference ID String</label>
                      <input 
                        type="text"
                        value={transactionReference}
                        onChange={(e) => setTransactionReference(e.target.value)}
                        placeholder="e.g. FT2619582XQ or T7A92..."
                        className="w-full bg-[#0e0e0e] border border-[#1c1c1c] rounded-xl px-4 py-3 text-xs font-mono uppercase tracking-wide focus:border-[#00f3ff] focus:outline-none text-white transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-1.5 font-bold">Proof of Receipt Upload</label>
                      <label className="w-full h-24 border border-dashed border-[#222] bg-[#0c0c0c] hover:bg-[#111] hover:border-[#333] transition-colors rounded-xl flex flex-col items-center justify-center cursor-pointer p-4 text-center">
                        <input 
                          type="file" 
                          accept="image/*,application/pdf" 
                          onChange={handleSimulateFileChange} 
                          className="hidden" 
                        />
                        {uploadedReceipt ? (
                          <div className="flex items-center gap-2 text-xs font-mono text-[#a8ffb2]">
                            <FileCheck className="w-4 h-4 shrink-0" />
                            <span className="truncate max-w-[200px] font-bold">{uploadedReceiptName}</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-1.5 text-gray-500">
                            <UploadCloud className="w-5 h-5 text-gray-600" />
                            <span className="text-[11px] font-mono">Select receipt screenshot data stream</span>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>

                  <button 
                    onClick={handleReceiptVerificationSubmit}
                    className="w-full bg-[#a8ffb2] text-black py-4 rounded-xl font-mono font-bold text-xs uppercase tracking-widest hover:bg-[#00f3ff] transition-all mt-3 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Trigger Verification Endpoint</span>
                  </button>
                </div>
              )}

              {/* STEP 4: VERIFYING PROTOCOLS LOGSTREAM */}
              {checkoutStep === "securing" && (
                <div className="p-6 flex flex-col gap-4 bg-black">
                  <div className="flex items-center gap-3 border-b border-[#111] pb-4">
                    <Loader2 className="w-5 h-5 text-[#00f3ff] animate-spin" />
                    <span className="text-xs font-mono text-[#00f3ff] uppercase tracking-widest font-bold">Extracting Terminal Buffer...</span>
                  </div>
                  
                  <div className="h-48 bg-[#030303] border border-[#151515] p-4 rounded-xl overflow-y-auto font-mono text-[10px] text-gray-500 space-y-2 selection:bg-white/10">
                    {verificationLogs.map((log, lIdx) => (
                      <div key={lIdx} className="font-mono flex items-start gap-1">
                        <span className="text-gray-700 font-mono shrink-0">&gt;</span>
                        <span className={log.includes("SUCCESSFULLY") || log.includes("VERIFIED") ? "text-[#a8ffb2]" : log.includes("ALLOCATING") ? "text-white" : "text-gray-400"}>
                          {log}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 5: SUCCESS REDIRECT */}
              {checkoutStep === "success" && (
                <div className="p-8 flex flex-col items-center text-center gap-6">
                  <div className="w-16 h-16 rounded-full bg-[#a8ffb2]/10 border border-[#a8ffb2] flex items-center justify-center text-[#a8ffb2]">
                    <Check className="w-8 h-8" />
                  </div>

                  <div>
                    <h2 className="text-xl font-display font-black uppercase text-white tracking-wide m-0">Look Secured Successfully</h2>
                    <p className="text-[11px] font-mono text-gray-500 mt-2 leading-relaxed">
                      Your transaction data was verified via backend scripts. Serial item <span className="text-white font-bold">[{checkoutProduct.serial}]</span> has been locked under your digital fashion catalog. Our Bole boutique assistant is on standby to coordinate fast-courier dispatch.
                    </p>
                  </div>

                  <div className="w-full bg-[#101010] border border-[#1a1a1a] p-4 rounded-xl flex items-center gap-4 text-left">
                    <Sparkles className="w-5 h-5 text-[#00f3ff] animate-pulse flex-shrink-0" />
                    <div>
                      <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">Styling Connection Active</h4>
                      <p className="text-[10px] font-mono text-gray-500 leading-relaxed mt-1">
                        We have triggered Vibe Assistant to formulate a custom designer fit surrounding your new drop. Read the chat panel!
                      </p>
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                      setIsCheckoutOpen(false);
                      setIsChatOpen(true);
                    }}
                    className="w-full bg-white text-black py-4 rounded-xl font-mono font-bold text-xs uppercase tracking-widest hover:bg-[#a8ffb2] transition-colors cursor-pointer"
                  >
                    Connect with Concierge
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
