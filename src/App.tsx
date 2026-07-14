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

import { supabase } from './supabaseClient';

// Inside your App function:
console.log("Supabase connected:", supabase ? "Yes" : "No");

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
  
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutProduct, setCheckoutProduct] = useState<Product | null>(null);
  const [checkoutStep, setCheckoutStep] = useState<"review" | "details" | "payment" | "securing" | "success">("review");
  const [verificationLogs, setVerificationLogs] = useState<string[]>([]);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  
  const [deliveryName, setDeliveryName] = useState("");
  const [deliveryPhone, setDeliveryPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"telebirr" | "cbe">("telebirr");
  const [uploadedReceipt, setUploadedReceipt] = useState<File | null>(null);
  const [uploadedReceiptName, setUploadedReceiptName] = useState<string>("");

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

    useEffect(() => {
  console.log("Testing Supabase connection...");
  supabase.from('orders').select('*').limit(1).then(({ data, error }) => {
    if (error) {
      console.error("Connection failed:", error.message);
    } else {
      console.log("Connection successful! Database is reachable.");
    }
  });
}, []);

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
    setUploadedReceipt(null);
    setUploadedReceiptName("");
    setVerificationError(null);
    setIsCheckoutOpen(true);
  };

  const startSecuringProcess = async () => {
    setVerificationError(null);
    setCheckoutStep("securing");
    setVerificationLogs(["INITIALIZING ORDER TRANSACTION PACKET...", "MAPPING DELIVERY COURIER ADDRESS..."]);

    setTimeout(() => {
      setVerificationLogs(prev => [
        ...prev,
        `ROUTING ADDIS DELIVERY SECTOR: [${deliveryAddress}]`,
        `RECORDING CLIENT METADATA: [Name: ${deliveryName}]`,
        `VERIFYING UPLOADED LOG: [${uploadedReceiptName || "None"}]`,
        `CREATING VAULT INVENTORY RESERVATION STAMP...`,
        "ORDER LOGGING PIPELINE GRANTED. DISPATCH PROTOCOL WAITING ON VERIFICATION."
      ]);

      setTimeout(() => {
        setCheckoutStep("success");
        if (checkoutProduct) {
          triggerAssistantDropStyling(checkoutProduct);
        }
      }, 1500);
    }, 1500);
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
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#111111_1px,transparent_1px),linear-gradient(to_bottom,#111111_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none opacity-20 z-0" />

      <aside className="hidden md:flex w-32 border-r border-white/10 flex-col justify-between items-center py-12 shrink-0 z-10 select-none">
        <div className="text-[10px] tracking-[0.4em] uppercase opacity-40 rotate-180 [writing-mode:vertical-rl] font-mono font-medium">
          EST. MMXXVI &mdash; ADDIS ABABA
        </div>
        <div className="h-px w-12 bg-white/20"></div>
        <div className="text-[10px] tracking-[0.4em] uppercase opacity-40 [writing-mode:vertical-rl] font-mono font-medium">
          CURATED FOR THE ELITE
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-full overflow-y-auto relative z-10">
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

          <nav className="flex gap-8 border-b border-white/5 pb-6">
            <button 
              onClick={() => setActiveSection("women")} 
              className={`group relative text-sm uppercase tracking-[0.2em] font-bold transition-all duration-500 cursor-pointer ${activeSection === "women" ? "opacity-100" : "opacity-40 hover:opacity-100"}`}>
              Women's Vault
              <span className={`absolute -bottom-6.5 left-0 h-[3px] bg-white transition-all duration-500 ${activeSection === "women" ? "w-full" : "w-0"}`}></span>
            </button>
            <button 
              onClick={() => setActiveSection("men")} 
              className={`group relative text-sm uppercase tracking-[0.2em] font-bold transition-all duration-500 cursor-pointer ${activeSection === "men" ? "opacity-100" : "opacity-40 hover:opacity-100"}`}>
              Men's Vault
              <span className={`absolute -bottom-6.5 left-0 h-[3px] bg-white transition-all duration-500 ${activeSection === "men" ? "w-full" : "w-0"}`}></span>
            </button>
          </nav>
        </header>

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
                  <div 
                    onClick={() => setSelectedProduct(product)}
                    className="aspect-[3/4] bg-neutral-900 overflow-hidden relative border border-white/5 cursor-pointer rounded-sm"
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10"></div>
                    <div className="absolute top-4 left-4 z-20">
                      <span className="text-[9px] font-mono font-extrabold uppercase tracking-widest bg-white text-black px-3 py-1">
                        {product.tag}
                      </span>
                    </div>
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

                    <div className="absolute bottom-8 left-8 z-20 pr-8">
                      <h3 className="text-2xl font-bold uppercase tracking-tight text-white line-clamp-1 group-hover:text-[#f3ff00] transition-colors font-display">
                        {product.name}
                      </h3>
                      <p className="font-mono text-white/60 mt-1">{product.price.toLocaleString()} ETB</p>
                    </div>
                  </div>

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

        <footer className="h-20 border-t border-white/10 px-6 md:px-16 flex items-center justify-between mt-auto shrink-0 select-none">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>
              <span className="text-[10px] uppercase tracking-widest font-bold font-mono">Live Inventory Syncing</span>
            </div>
          </div>
        </footer>
      </main>

      <div className="fixed bottom-6 right-6 z-40">
        <button 
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="relative bg-white text-black p-4 rounded-full border border-white shadow-2xl transition-all duration-300 flex items-center gap-2 group cursor-pointer"
        >
          {isChatOpen ? <X className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
          <span className="text-xs font-mono font-black uppercase tracking-wider pr-1 hidden md:inline">Vibe Assistant</span>
        </button>
      </div>

      <AnimatePresence>
        {isChatOpen && (
          <motion.div 
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-[#080808]/95 border-l border-[#1a1a1a] shadow-2xl z-50 flex flex-col backdrop-blur-lg"
          >
            <div className="p-6 border-b border-[#1a1a1a] flex justify-between items-center bg-black/60">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full border border-[#00f3ff] bg-[#00f3ff]/10 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-[#00f3ff]" />
                </div>
                <div>
                  <h3 className="text-sm font-mono font-extrabold uppercase tracking-wider text-white">Vibe Assistant</h3>
                  <p className="text-[10px] font-mono text-[#00f3ff]">GEMINI SEARCH GROUNDING ON</p>
                </div>
              </div>
              <button onClick={() => setIsChatOpen(false)} className="text-gray-400 hover:text-white cursor-pointer"><X className="w-5 h-5" /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
              {messages.map((m) => (
                <div key={m.id} className={`flex flex-col gap-1.5 max-w-[85%] ${m.role === "user" ? "self-end items-end" : "self-start items-start"}`}>
                  <div className="text-[9px] font-mono text-gray-500 uppercase tracking-widest">{m.role === "user" ? "Client Core" : "Vault Concierge"}</div>
                  <div className={`p-4 rounded-2xl text-xs font-mono leading-relaxed border ${m.role === "user" ? "bg-white text-black border-white" : "bg-[#0f0f0f] text-gray-200 border-[#1c1c1c] whitespace-pre-wrap"}`}>
                    {m.content}
                    {m.sources && m.sources.map((src, sIdx) => (
                      <a key={sIdx} href={src.url} target="_blank" rel="noopener noreferrer" className="text-[10px] font-mono text-[#00f3ff] hover:underline flex items-center gap-1 mt-2">
                        <ExternalLink className="w-2.5 h-2.5" /> <span>{src.title}</span>
                      </a>
                    ))}
                  </div>
                </div>
              ))}
              {isChatTyping && (
                <div className="flex flex-col gap-1.5 self-start items-start">
                  <div className="p-4 bg-[#0f0f0f] border border-[#1c1c1c] rounded-2xl flex items-center gap-2 text-xs font-mono">
                    <Loader2 className="w-4 h-4 text-[#00f3ff] animate-spin" />
                    <span>Formulating fit layers...</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="p-6 border-t border-[#1a1a1a] bg-black/60 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <input 
                  type="text" 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="Query styling algorithm..."
                  className="flex-1 bg-[#101010] border border-[#222] text-xs font-mono text-white rounded-lg px-4 py-3.5 focus:border-[#00f3ff] focus:outline-none"
                />
                <button onClick={() => handleSendMessage()} className="bg-white text-black p-3.5 rounded-lg hover:bg-[#00f3ff] cursor-pointer"><Send className="w-4 h-4" /></button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-6 backdrop-blur-md">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-[#0a0a0a] border border-[#222] rounded-2xl max-w-4xl w-full p-8 relative flex flex-col md:flex-row gap-8">
              <button onClick={() => setSelectedProduct(null)} className="absolute top-4 right-4 text-gray-400 hover:text-white cursor-pointer"><X className="w-5 h-5" /></button>
              <div className="w-full md:w-1/2 rounded-xl overflow-hidden border border-[#1a1a1a]">
                <img src={selectedProduct.image} alt={selectedProduct.name} referrerPolicy="no-referrer" className="w-full h-auto" />
              </div>
              <div className="w-full md:w-1/2 flex flex-col justify-between">
                <div className="flex flex-col gap-4">
                  <h2 className="text-3xl font-display font-black text-white uppercase">{selectedProduct.name}</h2>
                  <div className="text-2xl font-mono font-bold text-[#a8ffb2]">{selectedProduct.price.toLocaleString()} ETB</div>
                  <p className="text-sm text-gray-300 font-mono leading-relaxed">{selectedProduct.desc}</p>
                </div>
                <button onClick={() => { const p = selectedProduct; setSelectedProduct(null); handleClaim(p); }} className="w-full bg-white text-black py-4 rounded-xl font-mono font-bold text-xs uppercase mt-6 cursor-pointer">
                  Initiate Vault Retrieval
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
  {isCheckoutOpen && checkoutProduct && (
    <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 backdrop-blur-md">
      <motion.div 
        key="checkout-modal"
        initial={{ opacity: 0, scale: 0.95 }} 
        animate={{ opacity: 1, scale: 1 }} 
        exit={{ opacity: 0, scale: 0.95 }} 
        className="bg-[#050505] border border-[#1c1c1c] rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl relative"
      >
        {checkoutStep !== "securing" && (
          <button onClick={() => setIsCheckoutOpen(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white p-2 cursor-pointer z-10"><X className="w-5 h-5" /></button>
        )}

        <div className="bg-[#0a0a0a] border-b border-[#151515] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-white">
            <Lock className="w-3.5 h-3.5 text-[#a8ffb2]" /> <span>Secure Claim Ledger</span>
          </div>
          <div className="text-[10px] font-mono text-gray-500 uppercase">Step: <span className="text-[#00f3ff] font-bold">{checkoutStep.toUpperCase()}</span></div>
        </div>

        <div className="px-6 pb-6 pt-2 max-h-[80vh] overflow-y-auto">
          {checkoutStep === "review" && (
            <div className="p-2 flex flex-col gap-6">
              <div className="flex items-center gap-4 bg-[#0e0e0e] border border-[#1a1a1a] p-4 rounded-xl">
                <img src={checkoutProduct.image} alt={checkoutProduct.name} className="w-16 h-20 object-cover border border-[#222] rounded-md shrink-0" />
                <div>
                  <span className="text-[9px] font-mono text-gray-500 block uppercase">{checkoutProduct.serial}</span>
                  <h4 className="text-sm font-bold uppercase text-white mt-0.5">{checkoutProduct.name}</h4>
                  <span className="text-xs font-mono text-[#a8ffb2] font-semibold mt-1 block">{checkoutProduct.price.toLocaleString()} ETB</span>
                </div>
              </div>
              <button onClick={() => setCheckoutStep("details")} className="w-full bg-white text-black py-4 rounded-xl font-mono font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer">
                <span>Coordinate Logistics</span> <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {checkoutStep === "details" && (
            <div className="flex flex-col gap-5 pt-4 text-left">
              <div className="text-center">
                <h3 className="text-lg font-mono font-black uppercase tracking-wider text-white">Free Addis Delivery</h3>
                <p className="text-xs font-mono text-gray-400 mt-1">Submit your courier coordinates below.</p>
              </div>

              <div className="space-y-4 font-mono text-xs">
                <div>
                  <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#00f3ff]" /> Full Name
                  </label>
                  <input 
                    type="text" 
                    value={deliveryName}
                    onChange={(e) => setDeliveryName(e.target.value)}
                    placeholder="e.g. Dawit Alula" 
                    className="w-full bg-[#101010] border border-[#222] rounded-lg p-3 text-white focus:border-[#00f3ff] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#00f3ff]" /> Phone Number
                  </label>
                  <input 
                    type="text" 
                    value={deliveryPhone}
                    onChange={(e) => setDeliveryPhone(e.target.value)}
                    placeholder="e.g. +251 912 345 678" 
                    className="w-full bg-[#101010] border border-[#222] rounded-lg p-3 text-white focus:border-[#00f3ff] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#00f3ff]" /> Delivery Address
                  </label>
                  <textarea 
                    rows={2}
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="e.g. Bole, behind Edna Mall, Apt 4B" 
                    className="w-full bg-[#101010] border border-[#222] rounded-lg p-3 text-white focus:border-[#00f3ff] focus:outline-none resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-2.5 mt-2">
                <button 
                  onClick={() => setCheckoutStep("review")}
                  className="w-1/3 bg-transparent border border-[#222] text-gray-400 py-4 rounded-xl font-mono text-xs uppercase hover:text-white cursor-pointer"
                >
                  Back
                </button>
                <button 
                  onClick={() => {
                    if (deliveryName.trim() && deliveryPhone.trim() && deliveryAddress.trim()) {
                      setCheckoutStep("payment");
                    } else {
                      alert("Please fill in all courier coordinates.");
                    }
                  }}
                  className="w-2/3 bg-white text-black py-4 rounded-xl font-mono font-bold text-xs uppercase tracking-widest hover:bg-[#00f3ff] cursor-pointer"
                >
                  Submit Coordinates
                </button>
              </div>
            </div>
          )}

          {checkoutStep === "payment" && (
            <div className="flex flex-col gap-4 pt-4 text-left">
              <div className="text-center">
                <h3 className="text-lg font-mono font-black uppercase tracking-wider text-white">Select Payment Channel</h3>
                <p className="text-xs font-mono text-gray-400 mt-1">
                  Send <span className="text-[#a8ffb2] font-bold">{checkoutProduct.price.toLocaleString()} ETB</span> then upload your payment record.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-1">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("telebirr")}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all cursor-pointer ${
                    paymentMethod === "telebirr" ? "bg-[#111] border-[#00f3ff]" : "bg-black border-[#222]"
                  }`}
                >
                  <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/1/10/Telebirr_Logo.png" 
                    alt="Telebirr" 
                    className="h-7 object-contain mb-1.5 filter brightness-110"
                    onError={(e) => { (e.target as HTMLImageElement).src = "https://www.ethiotelecom.et/wp-content/uploads/2021/04/telebirr-white.png"; }}
                  />
                  <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-gray-300">Telebirr</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("cbe")}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all cursor-pointer ${
                    paymentMethod === "cbe" ? "bg-[#111] border-[#00f3ff]" : "bg-black border-[#222]"
                  }`}
                >
                  <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Commercial_Bank_of_Ethiopia_logo.svg/1024px-Commercial_Bank_of_Ethiopia_logo.svg.png" 
                    alt="CBE Birr" 
                    className="h-7 object-contain mb-1.5 filter brightness-110"
                    onError={(e) => { (e.target as HTMLImageElement).src = "https://combanketh.et/images/logo.png"; }}
                  />
                  <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-gray-300">CBE BIRR</span>
                </button>
              </div>

              <div className="bg-[#101010] border border-[#1e1e1e] p-4 rounded-xl font-mono text-xs text-gray-300 space-y-2.5">
                {paymentMethod === "telebirr" ? (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Channel:</span>
                      <span className="text-[#00f3ff] font-bold">TELEBIRR</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Account number:</span>
                      <span className="text-white font-black select-all">0983351611</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Account Name:</span>
                      <span className="text-white font-black select-all">Eyoel</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Bank:</span>
                      <span className="text-[#00f3ff] font-bold">Commercial Bank of Ethiopia</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Account Number:</span>
                      <span className="text-white font-black select-all">1000721425014</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Account Name:</span>
                      <span className="text-white font-black select-all">Eyoel Hailu Tefera</span>
                    </div>
                  </>
                )}
              </div>

              <div>
                <label className="block font-mono text-[10px] text-gray-400 uppercase tracking-wider mb-2">
                  Upload Transaction Screenshot
                </label>
                <label className="border border-dashed border-[#333] hover:border-[#00f3ff] bg-[#0c0c0c] rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all">
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleSimulateFileChange}
                  />
                  {uploadedReceiptName ? (
                    <>
                      <FileCheck className="w-8 h-8 text-[#a8ffb2]" />
                      <span className="font-mono text-xs text-[#a8ffb2] font-bold max-w-xs truncate">{uploadedReceiptName}</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-8 h-8 text-[#00f3ff]" />
                      <span className="font-mono text-xs text-white">Tap to upload file receipt</span>
                    </>
                  )}
                </label>
              </div>

              <div className="flex gap-2.5 mt-2">
                <button 
                  onClick={() => setCheckoutStep("details")}
                  className="w-1/3 bg-transparent border border-[#222] text-gray-400 py-4 rounded-xl font-mono text-xs uppercase hover:text-white cursor-pointer"
                >
                  Back
                </button>
                <button 
                  onClick={() => {
                    if (uploadedReceiptName) {
                      startSecuringProcess();
                    } else {
                      alert("Please upload your snapshot transaction receipt.");
                    }
                  }}
                  className="w-2/3 bg-white text-black py-4 rounded-xl font-mono font-bold text-xs uppercase tracking-widest hover:bg-[#a8ffb2] cursor-pointer"
                >
                  Submit Receipt
                </button>
              </div>
            </div>
          )}

          {checkoutStep === "securing" && (
            <div className="py-8 flex flex-col items-center justify-center gap-6">
              <Loader2 className="w-10 h-10 text-[#00f3ff] animate-spin" />
              <div className="text-center">
                <h3 className="text-md font-mono font-black uppercase tracking-wider text-white">SECURE COURIER DISPATCH</h3>
                <p className="text-xs font-mono text-gray-500 mt-1">Initializing secure order log...</p>
              </div>

              <div className="w-full bg-black border border-[#1a1a1a] rounded-lg p-4 font-mono text-[10px] leading-relaxed text-gray-400 h-40 overflow-y-auto text-left space-y-1">
                {verificationLogs.map((log, idx) => (
                  <div key={idx} className={idx === verificationLogs.length - 1 ? "text-[#00f3ff] font-bold" : ""}>
                    &gt; {log}
                  </div>
                ))}
              </div>
            </div>
          )}

          {checkoutStep === "success" && (
            <div className="py-8 flex flex-col items-center justify-center gap-6 text-center">
              <div className="w-16 h-16 rounded-full bg-[#a8ffb2]/10 border border-[#a8ffb2] flex items-center justify-center text-[#a8ffb2]">
                <Check className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-mono font-black uppercase tracking-wider text-white">FIT SECURED</h3>
                <p className="text-xs font-mono text-[#a8ffb2] mt-1 font-bold">DISPATCH QUEUED SUCCESSFULLY</p>
              </div>
              <p className="text-xs font-mono text-gray-400 leading-relaxed max-w-sm">
                We will personally verify your payment and get back to you shortly. Our dispatch team will reach out at <strong className="text-white">{deliveryPhone}</strong> once your order is processed for courier routing!
              </p>
              <div className="flex gap-4 w-full max-w-xs mt-2">
                <button 
                  onClick={() => { setIsCheckoutOpen(false); setIsChatOpen(true); }}
                  className="flex-1 bg-white text-black py-3 rounded-lg font-mono font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  Style Outfit <Sparkles className="w-3.5 h-3.5" />
                </button>
                <button 
                  onClick={() => setIsCheckoutOpen(false)}
                  className="flex-1 bg-transparent border border-[#222] text-white py-3 rounded-lg font-mono font-bold text-[10px] uppercase tracking-wider hover:border-white transition-all cursor-pointer"
                >
                  Close Portal
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )}
</AnimatePresence>
    </div>
  );
}
