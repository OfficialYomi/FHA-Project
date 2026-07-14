import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  User, 
  Bot, 
  ArrowRight, 
  Loader2, 
  MessageSquare,
  HelpCircle
} from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AiAssistantView() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Welcome, Managing Director. I am your FHA Executive Companion. I have real-time access to our entire National Housing Programme database: current WBS milestones, contractor onboard statuses, pending valuation certificates, and exceptional risk alerts. Ask me any tactical or financial question regarding our project delivery."
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Suggestions listed in user requests
  const promptSuggestions = [
    "Which states are behind schedule?",
    "Which projects need my intervention?",
    "How much have we spent vs. budget?",
    "How many houses have reached completion nationwide?",
    "Which contractors have submitted valuation certificates?",
    "Which sites haven't been updated this week?",
    "Which contractors have exceeded their timeline?"
  ];

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim()) return;
    
    const userMessage: Message = { role: 'user', content: textToSend };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({ role: m.role, content: m.content }))
        })
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (error) {
      console.error("Gemini API communication error:", error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "I encountered a communication interruption while auditing the database. Please verify your GEMINI_API_KEY is configured in the Secrets panel and try again." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 flex flex-col h-[calc(100vh-140px)]">
      {/* Title */}
      <div className="shrink-0">
        <h2 className="text-2xl font-medium text-white tracking-tight flex items-center gap-2 font-serif" style={{ fontFamily: 'Georgia, serif' }}>
          <Sparkles className="w-5 h-5 text-amber-500" />
          <span>FHA AI Strategic Assistant</span>
        </h2>
        <p className="text-slate-400 text-sm">Query project delays, budget margins, and contractor compliance using natural language prompts</p>
      </div>

      {/* Chat workspace container */}
      <div className="flex-1 min-h-0 bg-white/5 border border-white/10 rounded-2xl flex flex-col overflow-hidden">
        
        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map((m, idx) => {
            const isUser = m.role === 'user';
            return (
              <div 
                key={idx}
                className={`flex gap-4.5 max-w-[80%] ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                {/* Icon */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${
                  isUser 
                    ? 'bg-amber-500 border-amber-600 text-black' 
                    : 'bg-[#050505] border-white/10 text-amber-500'
                }`}>
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Message Box */}
                <div className={`p-4 rounded-2xl text-xs leading-relaxed ${
                  isUser 
                    ? 'bg-amber-500/10 border border-amber-500/20 text-slate-200 rounded-tr-none' 
                    : 'bg-[#050505]/80 border border-white/5 text-slate-300 rounded-tl-none shadow-md'
                }`}>
                  <div className="whitespace-pre-wrap">{m.content}</div>
                </div>
              </div>
            );
          })}

          {/* Loading bubble */}
          {isLoading && (
            <div className="flex gap-4.5 max-w-[80%] mr-auto items-center">
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 border bg-[#050505] border-white/10 text-amber-500">
                <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
              </div>
              <div className="p-3 bg-[#050505]/80 border border-white/5 rounded-2xl rounded-tl-none flex items-center gap-2">
                <span className="text-2xs text-slate-500 font-bold uppercase tracking-widest animate-pulse">Auditing Central Database...</span>
              </div>
            </div>
          )}

          <div ref={scrollRef} />
        </div>

        {/* Suggestion Prompt Pills */}
        <div className="p-4 bg-[#050505]/40 border-t border-white/10 shrink-0 space-y-2">
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Frequent Executive Cockpit Queries</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {promptSuggestions.map((prompt, idx) => (
              <button 
                key={idx}
                onClick={() => handleSend(prompt)}
                disabled={isLoading}
                className="bg-[#050505] hover:bg-white/5 text-slate-400 hover:text-white border border-white/5 hover:border-amber-500/30 rounded-lg px-3 py-1.5 text-[10px] font-medium transition disabled:opacity-50 text-left"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Input Panel */}
        <div className="p-4 bg-[#050505] border-t border-white/10 shrink-0">
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
              placeholder="Ask about states behind schedule, valuation certificates, completed houses..."
              className="flex-1 bg-white/5 border border-white/10 focus:border-amber-500/50 py-3 px-4 rounded-xl text-xs text-white outline-none"
            />
            
            <button 
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-amber-500 hover:bg-amber-400 disabled:bg-white/5 disabled:text-slate-600 text-black font-semibold p-3 rounded-xl transition shrink-0 flex items-center justify-center"
            >
              <Send className="w-4 h-4 text-black" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
