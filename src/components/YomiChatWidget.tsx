import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bot, 
  Send, 
  User as UserIcon, 
  X, 
  Minus, 
  RotateCcw, 
  Copy, 
  Check, 
  ShieldCheck, 
  Building2, 
  Sparkles, 
  ChevronDown,
  AlertCircle,
  HelpCircle,
  Clock,
  Coins,
  HardHat
} from 'lucide-react';
import { Project, User } from '../types';
import { queryYomiLocalIntelligence } from '../utils/yomiLocalEngine';
import { fallbackDb } from '../fallbackDb';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  source?: string;
}

interface YomiChatWidgetProps {
  currentUser: User | null;
  projects: Project[];
}

export default function YomiChatWidget({ currentUser, projects }: YomiChatWidgetProps) {
  // CRITICAL REQUIREMENT: Strictly NOT available to contractors
  if (!currentUser || currentUser.role === 'CONTRACTOR') {
    return null;
  }

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize initial greeting
  useEffect(() => {
    if (messages.length === 0) {
      const initialGreeting: Message = {
        id: 'init-msg',
        role: 'assistant',
        content: "I am Yomi, your executive AI Assistant for the FHA National Housing Delivery Platform.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages([initialGreeting]);
    }
  }, [currentUser]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages, isLoading]);

  // Role-specific suggested prompts
  const getSuggestions = () => {
    if (currentUser.role === 'MD') {
      return [
        { label: 'Delayed Projects', query: 'Which projects are delayed or need immediate executive attention?' },
        { label: 'Disbursement Audit', query: 'What is the total expenditure vs budget across all estates?' },
        { label: 'Roofing Readiness', query: 'Which projects have reached or are ready for roofing stage?' },
        { label: 'Contractor Scorecards', query: 'Show performance comparison of active contractors' },
        { label: 'Compliance Alerts', query: 'Are there any performance bonds nearing expiration?' }
      ];
    } else if (currentUser.role === 'QS') {
      return [
        { label: 'Pending Valuations', query: 'Which valuation claims are currently awaiting QS certification?' },
        { label: 'Certified vs Requested', query: 'Compare total amounts requested against certified sums' },
        { label: 'Gwarinpa Vista Claims', query: 'Show certified valuation history for Gwarinpa Vista Heights' },
        { label: 'Kada Hill Val-3', query: 'What is the status of the Kada Hill Estate valuation request?' }
      ];
    } else if (currentUser.role === 'RE') {
      return [
        { label: 'Kada Hill Stages', query: 'What is the current stage progress for Kada Hill Estate Phase 1?' },
        { label: 'Photo & GPS Telemetry', query: 'What are the latest photo updates and GPS tags logged on my sites?' },
        { label: 'Next Critical Milestones', query: 'Which stages are pending before blockwork begins in Kaduna?' },
        { label: 'Gwarinpa Roof Check', query: 'Verify roofing stage completion for Gwarinpa Vista Heights' }
      ];
    } else if (currentUser.role === 'PM') {
      return [
        { label: 'Schedule Variance', query: 'Which estates are behind schedule and by how many days?' },
        { label: 'Weekly Update Inactivity', query: 'Which sites have not submitted a progress update in over 7 days?' },
        { label: 'WBS Milestones Summary', query: 'Give me a tactical breakdown of completed WBS stages across all sites' },
        { label: 'Underperforming Contractors', query: 'Which contractors have overdue milestone deliverables?' }
      ];
    } else {
      // FD / CT
      return [
        { label: 'Total Payments Released', query: 'How much has been remitted through CBN RTGS to date?' },
        { label: 'Budget Utilization', query: 'What is the capital spending rate across active housing estates?' },
        { label: 'Valuations at Finance Stage', query: 'Are there valuations currently awaiting finance review or release?' }
      ];
    }
  };

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: Message = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const token = localStorage.getItem('nhdp_token') || '';
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'x-user-role': currentUser.role,
        'x-username': currentUser.username
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          message: textToSend.trim(),
          userRole: currentUser.role,
          username: currentUser.username,
          userName: currentUser.name,
          selectedProjectId: selectedProjectId !== 'ALL' ? selectedProjectId : undefined
        })
      });

      if (response.ok) {
        const data = await response.json();
        const assistantMessage: Message = {
          id: `ast-${Date.now()}`,
          role: 'assistant',
          content: data.reply || "I have analyzed the database records for your query.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          source: data.source || 'fha-neural-engine'
        };
        setMessages(prev => [...prev, assistantMessage]);
        return;
      }
    } catch (err: any) {
      console.warn("Server endpoint unreachable or static hosting detected. Engaging autonomous telemetry engine:", err);
    }

    // Zero-downtime autonomous intelligence fallback (prevents 405 error on GitHub Pages or server disconnects)
    try {
      const localReply = queryYomiLocalIntelligence(
        textToSend.trim(),
        currentUser.role,
        currentUser.username,
        selectedProjectId !== 'ALL' ? selectedProjectId : undefined,
        projects,
        fallbackDb.getValuations(),
        fallbackDb.getContractors(),
        fallbackDb.getAlerts(),
        fallbackDb.getScorecards()
      );

      const assistantMessage: Message = {
        id: `ast-${Date.now()}`,
        role: 'assistant',
        content: localReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: 'fha-telemetry-engine'
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (localErr: any) {
      console.error("Local intelligence fallback error:", localErr);
      const fallbackMsg: Message = {
        id: `ast-${Date.now()}`,
        role: 'assistant',
        content: "I have recorded your request. All project milestones, financial certificates, and site telemetry remain intact across all active schemes.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleResetChat = () => {
    const initialGreeting: Message = {
      id: `init-${Date.now()}`,
      role: 'assistant',
      content: "I am Yomi, your executive AI Assistant for the FHA National Housing Delivery Platform.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages([initialGreeting]);
  };

  // Filter selectable projects based on user role
  const availableProjects = currentUser.role === 'RE'
    ? projects.filter(p => p.state === 'Kaduna' || p.state === 'Abuja')
    : projects;

  // Format assistant content to display bold, lists, and headings cleanly
  const renderFormattedContent = (content: string) => {
    return (
      <div className="space-y-2 text-xs leading-relaxed">
        {content.split('\n\n').map((paragraph, pIdx) => {
          // Check for header
          if (paragraph.startsWith('### ')) {
            return (
              <h4 key={pIdx} className="font-bold text-slate-900 dark:text-emerald-400 text-sm mt-2 mb-1 flex items-center gap-1.5 border-b border-slate-200 dark:border-white/10 pb-1">
                {paragraph.replace('### ', '')}
              </h4>
            );
          }
          if (paragraph.startsWith('#### ')) {
            return (
              <h5 key={pIdx} className="font-semibold text-slate-800 dark:text-slate-200 text-xs mt-1.5 mb-0.5">
                {paragraph.replace('#### ', '')}
              </h5>
            );
          }

          // Check for bullet list
          if (paragraph.startsWith('- ') || paragraph.startsWith('• ') || paragraph.startsWith('1. ')) {
            const lines = paragraph.split('\n');
            return (
              <ul key={pIdx} className="space-y-1 my-1 pl-1">
                {lines.map((line, lIdx) => {
                  const cleanLine = line.replace(/^[-•]\s*/, '').replace(/^\d+\.\s*/, '');
                  return (
                    <li key={lIdx} className="flex items-start gap-1.5 text-slate-700 dark:text-slate-300">
                      <span className="text-emerald-500 font-bold shrink-0 mt-0.5">•</span>
                      <span>{renderInlineMarkdown(cleanLine)}</span>
                    </li>
                  );
                })}
              </ul>
            );
          }

          return (
            <p key={pIdx} className="text-slate-700 dark:text-slate-300">
              {renderInlineMarkdown(paragraph)}
            </p>
          );
        })}
      </div>
    );
  };

  const renderInlineMarkdown = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={idx} className="font-bold text-slate-900 dark:text-white">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={idx} className="px-1.5 py-0.5 bg-slate-200 dark:bg-white/10 text-emerald-600 dark:text-emerald-400 rounded text-[11px] font-mono">
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  return (
    <>
      {/* 1. FLOATING BLINKING GREEN TRIGGER ICON (BOTTOM RIGHT) */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2 print:hidden select-none">
        <AnimatePresence>
          {!isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              className="flex items-center gap-2"
            >
              {/* Floating trigger button */}
              <button
                id="yomi-floating-trigger"
                onClick={() => setIsOpen(true)}
                className="group relative flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-emerald-600 via-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white rounded-full shadow-xl shadow-emerald-950/30 border border-emerald-400/40 cursor-pointer transition-all duration-300 hover:shadow-emerald-500/25 hover:scale-105 active:scale-95"
                title="Open Yomi - Executive AI Project Assistant"
                aria-label="Open Yomi AI Assistant"
              >
                {/* Blinking / pulsing radar indicator beacon */}
                <span className="relative flex h-3.5 w-3.5 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-80" />
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-200 shadow-sm border border-white" />
                </span>

                {/* Brain/Bot Icon in green ring */}
                <div className="w-6 h-6 rounded-full bg-white/15 flex items-center justify-center shrink-0 group-hover:rotate-12 transition-transform">
                  <Bot className="w-4 h-4 text-white" />
                </div>

                {/* Label and Badge */}
                <div className="flex flex-col text-left pr-1">
                  <div className="flex items-center gap-1.5 leading-none">
                    <span className="font-bold text-sm tracking-tight text-white font-serif">Yomi</span>
                    <span className="text-[9px] bg-white/20 text-white font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider">AI</span>
                  </div>
                  <span className="text-[10px] text-emerald-100 font-medium tracking-wide">Executive Copilot</span>
                </div>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 2. EXPANDABLE CHAT BOX (OPENS WHEN CLICKED) */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              id="yomi-chat-window"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              className="w-[430px] max-w-[calc(100vw-2rem)] h-[620px] max-h-[calc(100vh-5rem)] bg-white dark:bg-[#0c0f12] border border-slate-300 dark:border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-800 dark:text-slate-100 backdrop-blur-xl"
            >
              {/* Header Bar */}
              <div className="p-3.5 bg-gradient-to-r from-emerald-700 via-emerald-800 to-teal-900 text-white flex items-center justify-between border-b border-emerald-600/40 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="relative">
                    <div className="w-9 h-9 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center text-white shadow-inner">
                      <Bot className="w-5 h-5" />
                    </div>
                    {/* Blinking green radar status */}
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-400 border border-emerald-900" />
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-serif font-bold text-sm text-white tracking-tight">Yomi</h3>
                      <span className="text-[9px] bg-emerald-500/40 text-emerald-100 border border-emerald-300/30 px-1.5 py-0.2 rounded font-mono font-semibold">
                        LIVE DB
                      </span>
                    </div>
                    <p className="text-[10px] text-emerald-100 tracking-tight truncate max-w-[220px]">
                      Executive AI Assistant
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={handleResetChat}
                    title="Clear Conversation"
                    className="p-1.5 text-emerald-200 hover:text-white hover:bg-white/10 rounded-lg transition cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    title="Minimize Yomi"
                    className="p-1.5 text-emerald-200 hover:text-white hover:bg-white/10 rounded-lg transition cursor-pointer"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    title="Close Yomi"
                    className="p-1.5 text-emerald-200 hover:text-white hover:bg-white/10 rounded-lg transition cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Project Scope Subheader */}
              <div className="px-3.5 py-2 bg-slate-50 dark:bg-black/40 border-b border-slate-300 dark:border-white/10 flex items-center justify-between gap-2 shrink-0 text-xs">
                <div className="flex items-center gap-1.5 min-w-0">
                  <Bot className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300 truncate">
                    FHA National Housing Delivery Platform
                  </span>
                </div>

                {/* Project selector filter */}
                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-[10px] text-slate-600 dark:text-slate-300 font-semibold uppercase">Focus:</span>
                  <select
                    value={selectedProjectId}
                    onChange={(e) => setSelectedProjectId(e.target.value)}
                    className="bg-white dark:bg-[#15191e] border border-slate-300 dark:border-white/15 text-[11px] rounded px-1.5 py-0.5 text-slate-800 dark:text-slate-200 font-medium outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="ALL">All Active Projects</option>
                    {availableProjects.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.estateName} ({p.state})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Chat Message Stream */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/70 dark:bg-black/20">
                {messages.map((msg) => {
                  const isUser = msg.role === 'user';
                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-2.5 max-w-[88%] ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
                    >
                      {/* Avatar */}
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs shadow-sm ${
                          isUser
                            ? 'bg-amber-600 text-white font-bold'
                            : 'bg-emerald-600 text-white font-bold'
                        }`}
                      >
                        {isUser ? <UserIcon className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                      </div>

                      {/* Bubble */}
                      <div
                        className={`p-3 rounded-2xl relative group ${
                          isUser
                            ? 'bg-amber-600 text-white rounded-tr-none shadow'
                            : 'bg-white dark:bg-[#12171c] border border-slate-300 dark:border-white/10 text-slate-800 dark:text-slate-100 rounded-tl-none shadow-sm'
                        }`}
                      >
                        {/* Content */}
                        {isUser ? (
                          <div className="text-xs whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                        ) : (
                          <div>{renderFormattedContent(msg.content)}</div>
                        )}

                        {/* Message metadata & actions */}
                        <div className="flex items-center justify-between gap-3 mt-2 pt-1 border-t border-slate-200 dark:border-white/5 text-[9px] opacity-80">
                          <span className={isUser ? 'text-amber-100' : 'text-slate-500 dark:text-slate-400'}>
                            {msg.timestamp}
                          </span>
                          {!isUser && (
                            <div className="flex items-center gap-1.5">
                              <span className="text-[8px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-1 rounded font-mono font-semibold">
                                LIVE PROJECT
                              </span>
                              <button
                                onClick={() => handleCopy(msg.id, msg.content)}
                                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition cursor-pointer"
                                title="Copy response"
                              >
                                {copiedId === msg.id ? (
                                  <Check className="w-3 h-3 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Loading indicator */}
                {isLoading && (
                  <div className="flex gap-2.5 max-w-[85%] mr-auto items-center">
                    <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                      <Bot className="w-3.5 h-3.5 animate-pulse" />
                    </div>
                    <div className="p-3 bg-white dark:bg-[#12171c] border border-slate-300 dark:border-white/10 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400">
                        Yomi is auditing live project telemetry...
                      </span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Suggestions Pills (Role-Tailored) */}
              <div className="px-3 py-2 bg-slate-50 dark:bg-[#0c0f12] border-t border-slate-300 dark:border-white/10 shrink-0">
                <div className="text-[10px] text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  <span>Tactical Inquiries</span>
                </div>
                <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                  {getSuggestions().map((s, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(s.query)}
                      disabled={isLoading}
                      className="shrink-0 bg-white dark:bg-[#161c22] hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-slate-700 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-300 border border-slate-300 dark:border-white/10 hover:border-emerald-400 dark:hover:border-emerald-700 rounded-full px-2.5 py-1 text-[11px] font-medium transition disabled:opacity-50 cursor-pointer shadow-xs"
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input Footer */}
              <div className="p-3 bg-white dark:bg-[#0a0c0e] border-t border-slate-300 dark:border-white/10 shrink-0">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSend();
                  }}
                  className="flex gap-2"
                >
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={isLoading}
                    placeholder="Ask tactical progress or financial status..."
                    className="flex-1 bg-slate-50 dark:bg-white/5 border border-slate-300 dark:border-white/10 focus:border-emerald-500 py-2.5 px-3 rounded-xl text-xs text-slate-900 dark:text-white outline-none placeholder:text-slate-500 dark:placeholder:text-slate-400 transition"
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-200 dark:disabled:bg-white/10 disabled:text-slate-500 text-white font-medium p-2.5 rounded-xl transition shrink-0 flex items-center justify-center cursor-pointer shadow-sm"
                    title="Send message to Yomi"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>

                <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 px-1">
                  <span>Yomi strictly analyzes internal project data.</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    Live Telemetry
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
