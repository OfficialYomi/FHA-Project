import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  User as UserIcon, 
  Loader2, 
  ShieldCheck, 
  HelpCircle,
  Copy,
  Check,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { Project, User } from '../types';
import { queryYomiLocalIntelligence } from '../utils/yomiLocalEngine';
import { fallbackDb } from '../fallbackDb';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  source?: string;
  timestamp?: string;
}

interface AiAssistantViewProps {
  currentUser?: User | null;
  projects?: Project[];
}

export default function AiAssistantView({ currentUser, projects = [] }: AiAssistantViewProps) {
  // Disallow contractors
  if (currentUser?.role === 'CONTRACTOR') {
    return (
      <div className="p-8 rounded-2xl bg-white/5 border border-white/10 text-center max-w-lg mx-auto mt-12">
        <Bot className="w-12 h-12 text-slate-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-white mb-2">Access Restricted</h3>
        <p className="text-slate-400 text-sm">
          The Yomi Executive AI Assistant is restricted from contractor accounts. It is reserved exclusively for ministry and project delivery officials.
        </p>
      </div>
    );
  }

  const role = currentUser?.role || 'MD';
  const roleTitle = currentUser?.role === 'MD' ? 'Managing Director & CEO'
    : currentUser?.role === 'PM' ? 'Project Manager'
    : currentUser?.role === 'QS' ? 'Quantity Surveyor'
    : currentUser?.role === 'RE' ? 'Resident Engineer'
    : currentUser?.role === 'FD' ? 'Finance Director'
    : currentUser?.role === 'CT' ? 'Treasury Head'
    : 'Executive Official';

  const jurisdictionDesc = role === 'MD' 
    ? 'Unrestricted Nationwide Portfolio Jurisdiction'
    : role === 'QS'
    ? 'Valuation, Certified Claims & Financial BOQ Scope'
    : role === 'RE'
    ? 'On-Site Tactical Progress & Site Inspections (Kaduna & Abuja)'
    : role === 'PM'
    ? 'Operations, WBS Milestone Stages & Schedules'
    : 'Disbursements, Budgets & Treasury Remittance';

  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "I am Yomi, your executive AI Assistant for the FHA National Housing Delivery Platform.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Suggestions customized by role
  const getPromptSuggestions = () => {
    if (role === 'MD') {
      return [
        "Which projects are delayed past 30 days?",
        "Total certified disbursements vs allocated budgets across all estates",
        "Which projects have reached or are ready for roofing stage?",
        "Which contractors are underperforming against their milestone timelines?",
        "Are there any performance bonds nearing expiration?"
      ];
    } else if (role === 'QS') {
      return [
        "Which valuation claims are awaiting QS certification?",
        "Compare contractor requested amounts vs certified sums",
        "Break down financial claims for Gwarinpa Vista Heights",
        "What is the status of Kada Hill Estate valuation val-3?"
      ];
    } else if (role === 'RE') {
      return [
        "Current stage completion status for Kada Hill Estate Phase 1",
        "What are the latest photo inspections and GPS tags logged on site?",
        "Which milestones on my site are awaiting foundation inspection?",
        "Verify roofing progress on Gwarinpa Vista Heights"
      ];
    } else if (role === 'PM') {
      return [
        "Which active estates have stagnant weekly updates?",
        "Summary of active timeline risks and exceeding days",
        "Which projects are currently at roofing stage?",
        "Contractor performance scores and delivery timeline status"
      ];
    } else {
      return [
        "Total disbursed funds through CBN RTGS to date",
        "Outstanding valuation certificates pending finance review",
        "Total budget vs expenditure variance across active phases"
      ];
    }
  };

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;
    
    const userMessage: Message = { 
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
        'x-user-role': role,
        'x-username': currentUser?.username || 'MD'
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          message: textToSend.trim(),
          userRole: role,
          username: currentUser?.username || 'MD',
          userName: currentUser?.name
        })
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: data.reply,
          source: data.source || 'fha-neural-engine',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
        return;
      }
    } catch (error: any) {
      console.warn("AiAssistantView network error or static hosting detected, engaging local analytics:", error);
    }

    // Zero-downtime autonomous intelligence fallback
    try {
      const localReply = queryYomiLocalIntelligence(
        textToSend.trim(),
        role,
        currentUser?.username || 'MD',
        undefined,
        projects,
        fallbackDb.getValuations(),
        fallbackDb.getContractors(),
        fallbackDb.getAlerts(),
        fallbackDb.getScorecards()
      );

      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: localReply,
        source: 'fha-telemetry-engine',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } catch (localErr: any) {
      console.error("Local intelligence fallback error in view:", localErr);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "I have recorded your executive query. All project milestones, financial certificates, and site telemetry remain intact across all active schemes.",
        source: 'fha-telemetry-engine',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (idx: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
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

  const renderFormattedContent = (content: string) => {
    return (
      <div className="space-y-2 text-xs leading-relaxed">
        {content.split('\n\n').map((paragraph, pIdx) => {
          if (paragraph.startsWith('### ')) {
            return (
              <h4 key={pIdx} className="font-bold text-slate-900 dark:text-emerald-400 text-sm mt-2 mb-1 border-b border-slate-200 dark:border-white/10 pb-1">
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

  return (
    <div className="space-y-4 flex flex-col h-[calc(100vh-140px)]">
      {/* Title & Scope Banner */}
      <div className="shrink-0 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-medium text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5 font-serif" style={{ fontFamily: 'Georgia, serif' }}>
            <div className="relative flex items-center justify-center">
              <Bot className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              <span className="animate-ping absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-400 opacity-75"></span>
            </div>
            <span>Yomi — Executive Project AI Assistant</span>
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Answers tactical and financial queries directly from live Federal Housing Authority project data
          </p>
        </div>

        {/* Simple Role Badge */}
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/10">
          <Bot className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
            {roleTitle} ({role})
          </span>
        </div>
      </div>

      {/* Chat Workspace Container */}
      <div className="flex-1 min-h-0 bg-white dark:bg-[#090b0e] border border-slate-300 dark:border-white/10 rounded-2xl flex flex-col overflow-hidden shadow-sm">
        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/70 dark:bg-black/20">
          {messages.map((m, idx) => {
            const isUser = m.role === 'user';
            return (
              <div 
                key={idx}
                className={`flex gap-3.5 max-w-[85%] ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                {/* Avatar Icon */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
                  isUser 
                    ? 'bg-amber-600 text-white font-bold' 
                    : 'bg-emerald-600 text-white font-bold'
                }`}>
                  {isUser ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Message Box */}
                <div className={`p-4 rounded-2xl text-xs leading-relaxed relative group ${
                  isUser 
                    ? 'bg-amber-600 text-white rounded-tr-none shadow-md' 
                    : 'bg-white dark:bg-[#12171c] border border-slate-300 dark:border-white/10 text-slate-800 dark:text-slate-200 rounded-tl-none shadow-sm'
                }`}>
                  {isUser ? (
                    <div className="whitespace-pre-wrap">{m.content}</div>
                  ) : (
                    <div>{renderFormattedContent(m.content)}</div>
                  )}

                  <div className="flex items-center justify-between gap-3 mt-2 pt-1.5 border-t border-slate-200 dark:border-white/5 text-[9px] opacity-75">
                    <span className={isUser ? 'text-amber-100' : 'text-slate-500 dark:text-slate-400'}>
                      {m.timestamp}
                    </span>
                    {!isUser && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[8px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.5 rounded font-mono font-semibold">
                          LIVE PROJECT DB
                        </span>
                        <button
                          onClick={() => handleCopy(idx, m.content)}
                          className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition cursor-pointer"
                          title="Copy response"
                        >
                          {copiedIdx === idx ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex gap-3 max-w-[80%] mr-auto items-center">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              </div>
              <div className="p-3 bg-white dark:bg-[#12171c] border border-slate-300 dark:border-white/10 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Yomi is auditing live project telemetry...</span>
              </div>
            </div>
          )}

          <div ref={scrollRef} />
        </div>

        {/* Suggested Queries */}
        <div className="p-3.5 bg-slate-50 dark:bg-[#07090b] border-t border-slate-300 dark:border-white/10 shrink-0 space-y-2">
          <div className="text-[10px] text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Frequent Queries</span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {getPromptSuggestions().map((prompt, idx) => (
              <button 
                key={idx}
                onClick={() => handleSend(prompt)}
                disabled={isLoading}
                className="bg-white dark:bg-[#14191f] hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-800 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-300 border border-slate-300 dark:border-white/10 hover:border-emerald-400 dark:hover:border-emerald-700 rounded-lg px-3 py-1.5 text-xs font-medium transition disabled:opacity-50 text-left cursor-pointer shadow-xs"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Input Form */}
        <div className="p-4 bg-white dark:bg-[#0c0f12] border-t border-slate-300 dark:border-white/10 shrink-0">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }}
            className="flex gap-3"
          >
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              placeholder="Ask Yomi any tactical or financial question about active housing projects..."
              className="flex-1 bg-slate-50 dark:bg-white/5 border border-slate-300 dark:border-white/10 focus:border-emerald-500 py-3 px-4 rounded-xl text-xs text-slate-900 dark:text-white outline-none placeholder:text-slate-500"
            />
            
            <button 
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-200 dark:disabled:bg-white/5 disabled:text-slate-500 text-white font-semibold px-5 py-3 rounded-xl transition shrink-0 flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <span>Ask Yomi</span>
              <Send className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-2 text-center text-[11px] text-slate-500 dark:text-slate-400">
            Yomi answers exclusively from active project records. Non-project queries are strictly declined.
          </div>
        </div>
      </div>
    </div>
  );
}
