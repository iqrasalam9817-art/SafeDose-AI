import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../stores/AppContext';
import {
  MessageSquareHeart,
  Send,
  Sparkles,
  Bot,
  User,
  Volume2,
  Trash2,
  ShieldAlert,
  Loader2,
  CheckCircle2
} from 'lucide-react';

const SUGGESTED_QUESTIONS = [
  'Is it safe to take Ibuprofen with my current medications?',
  'What foods, herbs, and supplements must I strictly avoid?',
  'What should I do if I missed my morning dose of Metformin?',
  'Can I take Melatonin at night with Lisinopril and Atorvastatin?',
  'Why do I need to separate my Calcium supplement from Lisinopril?'
];

export const ChatView: React.FC = () => {
  const {
    chatMessages,
    sendChatMessage,
    clearChat,
    isChatThinking,
    profile,
    medications
  } = useApp();

  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isChatThinking]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isChatThinking) return;
    sendChatMessage(input);
    setInput('');
  };

  const handleSpeak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto h-[calc(100vh-10rem)] flex flex-col">
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-xs">
            <Sparkles className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>SafeDose AI Clinical Specialist</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono font-black">
                Online & Synced
              </span>
            </h2>
            <p className="text-xs font-medium text-slate-500">
              Aware of {profile.fullName}'s {medications.length} active prescriptions & health conditions.
            </p>
          </div>
        </div>

        <button
          onClick={clearChat}
          className="text-xs font-black uppercase tracking-tight text-slate-500 hover:text-slate-900 flex items-center gap-1.5 p-2 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
          title="Clear Conversation"
        >
          <Trash2 className="w-4 h-4" />
          <span className="hidden sm:inline">Clear Chat</span>
        </button>
      </div>

      {/* Suggested Quick Prompts */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 flex-shrink-0">
        {SUGGESTED_QUESTIONS.map((q, idx) => (
          <button
            key={idx}
            onClick={() => sendChatMessage(q)}
            className="px-3.5 py-1.5 rounded-full bg-white hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 hover:text-slate-900 whitespace-nowrap transition-all cursor-pointer shadow-2xs"
          >
            💬 {q}
          </button>
        ))}
      </div>

      {/* Message History Feed */}
      <div className="flex-1 overflow-y-auto space-y-4 p-4 rounded-3xl bg-slate-100/70 border border-slate-200 scrollbar-thin">
        {chatMessages.map(msg => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 shadow-2xs ${
                  isUser
                    ? 'bg-slate-900 text-white'
                    : 'bg-emerald-700 text-white'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[82%] rounded-3xl p-4 text-xs leading-relaxed ${
                  isUser
                    ? 'bg-slate-900 text-white rounded-tr-none font-medium shadow-xs'
                    : 'bg-white text-slate-900 border border-slate-200 rounded-tl-none space-y-2 shadow-xs'
                }`}
              >
                <div className="whitespace-pre-wrap font-medium">{msg.text}</div>

                {!isUser && (
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[10px] text-slate-400 font-bold">
                    <span className="font-mono">Grounded in FDA Drug Intelligence</span>
                    <button
                      onClick={() => handleSpeak(msg.text)}
                      className="text-slate-400 hover:text-slate-700 p-1 rounded hover:bg-slate-100 transition-colors cursor-pointer"
                      title="Read aloud"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isChatThinking && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-700 flex items-center justify-center text-white">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white border border-slate-200 p-3.5 rounded-3xl rounded-tl-none text-xs text-slate-700 font-bold flex items-center gap-2 shadow-xs">
              <Loader2 className="w-4 h-4 animate-spin text-slate-900" />
              <span>Analyzing pharmacological monographs & active prescriptions...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Box */}
      <form onSubmit={handleSubmit} className="relative flex-shrink-0">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask anything about your medications, food interactions, missed doses, side effects..."
          className="w-full pl-5 pr-14 py-4 rounded-full bg-white border border-slate-200 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 shadow-xs"
        />
        <button
          type="submit"
          disabled={!input.trim() || isChatThinking}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-900 hover:bg-black text-white flex items-center justify-center hover:scale-105 transition-all disabled:opacity-40 cursor-pointer shadow-xs"
        >
          <Send className="w-4 h-4 text-emerald-400" />
        </button>
      </form>

      {/* Medical Disclaimer */}
      <div className="text-[10px] font-bold text-slate-500 text-center flex items-center justify-center gap-1.5 flex-shrink-0">
        <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
        <span>
          SafeDose AI provides clinical educational insights. Always consult your prescribing physician or pharmacist before altering drug regimens.
        </span>
      </div>
    </div>
  );
};
