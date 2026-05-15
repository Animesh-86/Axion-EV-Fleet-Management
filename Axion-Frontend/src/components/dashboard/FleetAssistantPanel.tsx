import React, { useState, useRef, useEffect } from 'react';
import { AxionApi, AnomalyExplanation } from '../../services/api';

const BASE_URL = '';

export const FleetAssistantPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string; id: string }>>([
    {
      sender: 'ai',
      text: "👋 Welcome to **Axion GenAI Fleet Intelligence**. I am connected to live telemetry, timescaledb archives, and pgvector anomaly precedent caches. Ask me anything about fleet status or vehicle health risks!",
      id: 'welcome-msg',
    }
  ]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [selectedVehicleForExp, setSelectedVehicleForExp] = useState('');
  const [explanations, setExplanations] = useState<AnomalyExplanation[]>([]);
  const [loadingExp, setLoadingExp] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sessionIdRef = useRef(`sess-${Math.random().toString(36).substring(2, 9)}`);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  const handleSend = async (customText?: string) => {
    const promptToSend = customText || input;
    if (!promptToSend.trim() || isStreaming) return;

    const userMsgId = `msg-${Date.now()}`;
    const aiMsgId = `ai-${Date.now()}`;

    setMessages(prev => [...prev, { sender: 'user', text: promptToSend, id: userMsgId }]);
    setInput('');
    setIsStreaming(true);

    // Initialize AI response placeholder
    setMessages(prev => [...prev, { sender: 'ai', text: '', id: aiMsgId }]);

      try {
      // Rely on HttpOnly cookie for auth; include credentials so cookie is sent.
      const response = await fetch(`${BASE_URL}/api/v1/ai/chat/stream`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptToSend,
          sessionId: sessionIdRef.current,
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error('Streaming connection setup failed');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunkText = decoder.decode(value, { stream: true });
        accumulatedText += chunkText;

        setMessages(prev => 
          prev.map(m => m.id === aiMsgId ? { ...m, text: accumulatedText } : m)
        );
      }
    } catch (err: any) {
      setMessages(prev => 
        prev.map(m => m.id === aiMsgId ? { ...m, text: `⚠️ **Connection Error**: ${err.message || 'LLM API gateway offline'}` } : m)
      );
    } finally {
      setIsStreaming(false);
    }
  };

  const handleFetchExplanations = async () => {
    if (!selectedVehicleForExp.trim()) return;
    setLoadingExp(true);
    try {
      const res = await AxionApi.getExplanations(selectedVehicleForExp.trim());
      setExplanations(res);
    } catch (err) {
      console.error(err);
      setExplanations([]);
    } finally {
      setLoadingExp(false);
    }
  };

  const quickPrompts = [
    "Which vehicles are most at risk?",
    "Summarize active fleet state",
    "Check telemetry for v001",
  ];

  return (
    <>
      {/* Floating Toggle Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-5 py-3 rounded-full shadow-2xl border border-purple-400/30 transition-all hover:scale-105 group"
      >
        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-xs font-black tracking-widest uppercase">GenAI Intelligence</span>
        <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      </button>

      {/* Floating Slide-over Panel */}
      {isOpen && (
        <div className="fixed bottom-20 right-6 z-50 w-[440px] max-w-[calc(100vw-32px)] h-[600px] max-h-[calc(100vh-120px)] bg-[#0A0C10]/95 backdrop-blur-2xl border border-purple-500/20 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header Strip */}
          <div className="p-4 border-b border-white/10 bg-gradient-to-r from-purple-950/40 to-indigo-950/40 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold text-xs">
                AI
              </div>
              <div>
                <h3 className="text-xs font-black tracking-wider uppercase text-foreground">Fleet Assistant</h3>
                <p className="text-[9px] text-purple-400/80 font-mono">Spring AI • Function Calling • PgVector RAG</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-muted-foreground hover:text-foreground text-xs font-bold p-1"
            >
              ✕
            </button>
          </div>

          {/* Internal Tabs Switcher */}
          <div className="flex border-b border-white/5 shrink-0 bg-black/20 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            <div className="flex-1 text-center py-2 border-b-2 border-purple-500 text-purple-400 bg-purple-500/5">
              Live Chat stream
            </div>
            <div className="flex-1 text-center py-2 opacity-40 hover:opacity-100 cursor-not-allowed" title="Auto-Triggered on sensory breach">
              Explanations DB
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 font-sans text-xs">
            {messages.map((m) => (
              <div 
                key={m.id} 
                className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center gap-1.5 mb-1 px-1 opacity-50 text-[9px] font-mono">
                  {m.sender === 'user' ? 'OPERATOR' : 'AXION AI AGENT'}
                </div>
                <div 
                  className={`max-w-[85%] p-3 rounded-xl leading-relaxed whitespace-pre-wrap ${
                    m.sender === 'user' 
                      ? 'bg-purple-600/20 border border-purple-500/30 text-purple-100 rounded-tr-none' 
                      : 'bg-white/5 border border-white/10 text-foreground rounded-tl-none'
                  }`}
                >
                  {m.text || (isStreaming && m.sender === 'ai' ? '🟢 Thinking / Streaming tokens...' : '')}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Suggestions */}
          <div className="p-2 border-t border-white/5 bg-black/20 shrink-0 flex flex-wrap gap-1.5 justify-center">
            {quickPrompts.map((qp, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(qp)}
                disabled={isStreaming}
                className="text-[9px] bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/20 rounded-full px-2.5 py-1 transition-colors disabled:opacity-30"
              >
                ✦ {qp}
              </button>
            ))}
          </div>

          {/* Prompt Entry Box */}
          <div className="p-3 border-t border-white/10 bg-background shrink-0">
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSend(); }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isStreaming ? "Streaming completion..." : "Ask assistant..."}
                disabled={isStreaming}
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-purple-500 transition-colors"
              />
              <button
                type="submit"
                disabled={isStreaming || !input.trim()}
                className="bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white px-3 py-2 rounded-lg text-xs font-bold transition-colors shrink-0"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
