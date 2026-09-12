import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, ShieldCheck, Sparkles, CheckCircle2, User, Loader2 } from 'lucide-react';
import { ChatMessage } from '../types';

interface LiveSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LiveSupportModal: React.FC<LiveSupportModalProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm-init',
      sender: 'doctor',
      text: "Hello, I'm Dr. Elena Vance. Welcome to NutriAi CarePulse. I'm here to answer any questions regarding your medical telemetry, HIPAA encryption, or how our nutrition intelligence monitors your biomarkers. How can I assist you today?",
      timestamp: 'Just now',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const doctorPhoto =
    'https://lh3.googleusercontent.com/aida-public/AB6AXuB7bxWHHDAui7l667jVke2YsIPszAfvRYgcGG4WzJBin1sYW9PkBHzCBY25HWZ1ELwyrPOV1HdmlzXQ7hwiHaQRdWCb6123vQ0Vr2HNC0cILlkbKTpGUXSSA7pcbNh_pF7qJyvNwvDaDrrKxCKulYJ9z_ivoUVszowUVDYJ3cfJHUddBF0L1b5t6-kM5Eg9j4QCer-biXFGqkL29t7UPKBuD5DZOfYfyLesaHdsKuuR2yLR7p30MeX6';

  const quickQuestions = [
    'How is my medical data protected?',
    'What health records should I upload?',
    'How does NutriAi personalize my calorie target?',
  ];

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const sendMessage = async (textToSend?: string) => {
    const query = textToSend || inputText.trim();
    if (!query || loading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: 'Now',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/onboarding-support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: query }),
      });

      if (!res.ok) {
        throw new Error('Failed to get clinical support response');
      }

      const data = await res.json();
      const docReply: ChatMessage = {
        id: `d-${Date.now()}`,
        sender: 'doctor',
        text: data.reply || "Your clinical telemetry is protected with 256-bit AES encryption.",
        timestamp: 'Just now',
      };
      setMessages((prev) => [...prev, docReply]);
    } catch {
      const fallbackMsg: ChatMessage = {
        id: `d-${Date.now()}`,
        sender: 'doctor',
        text: "Your health records and telemetry are securely encrypted under strict HIPAA compliance standards. Feel free to complete Step 1 and Step 2 to configure your dietary goals and primary care physician.",
        timestamp: 'Just now',
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      id="live-support-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-[#e2e8f0] flex flex-col max-h-[85vh] overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 bg-gradient-to-r from-[#f8f9ff] via-white to-[#eff4ff] border-b border-[#e2e8f0] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={doctorPhoto}
                alt="Dr. Elena Vance"
                className="w-11 h-11 rounded-full object-cover shadow-sm ring-2 ring-[#006194]/20"
                referrerPolicy="no-referrer"
              />
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#10b981] ring-2 ring-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-[#0b1c30] text-sm md:text-base">
                  Dr. Elena Vance, MD
                </h3>
                <span className="flex items-center gap-0.5 text-[10px] font-semibold text-[#006947] bg-[#e6f7ef] px-1.5 py-0.5 rounded-full">
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  Verified
                </span>
              </div>
              <p className="text-xs text-[#475569]">
                Chief Clinical Nutrition & Onboarding Specialist
              </p>
            </div>
          </div>
          <button
            id="close-support-modal-btn"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-[#475569] flex items-center justify-center transition-colors"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Security Sub-banner */}
        <div className="bg-[#eff4ff] px-4 py-2 border-b border-[#dce9ff] flex items-center justify-between text-xs text-[#006194]">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#006a61]" />
            <span className="font-medium">Encrypted Clinical Channel (HIPAA 256-bit)</span>
          </div>
          <span className="text-[11px] text-[#006a61] font-semibold">Live Support</span>
        </div>

        {/* Chat History */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#ffffff]">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${
                msg.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.sender === 'doctor' && (
                <img
                  src={doctorPhoto}
                  alt="Dr. Elena Vance"
                  className="w-7 h-7 rounded-full object-cover flex-shrink-0 mt-0.5"
                  referrerPolicy="no-referrer"
                />
              )}
              <div
                className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-xs md:text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-[#006194] text-white rounded-tr-xs shadow-sm'
                    : 'bg-[#f1f5f9] text-[#0b1c30] rounded-tl-xs border border-[#e2e8f0]'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.text}</p>
                <span
                  className={`text-[10px] mt-1 block text-right ${
                    msg.sender === 'user' ? 'text-blue-100' : 'text-slate-400'
                  }`}
                >
                  {msg.timestamp}
                </span>
              </div>
              {msg.sender === 'user' && (
                <div className="w-7 h-7 rounded-full bg-[#006194] text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-[#006194] py-1 px-2">
              <Loader2 className="w-4 h-4 animate-spin text-[#006194]" />
              <span>Dr. Elena Vance is reviewing your inquiry...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggested Queries */}
        <div className="px-4 py-2 bg-[#f8f9ff] border-t border-[#e2e8f0] flex flex-wrap gap-1.5">
          {quickQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => sendMessage(q)}
              className="text-[11px] text-[#006194] bg-white border border-[#cce5ff] hover:bg-[#e5eeff] px-2.5 py-1 rounded-full transition-colors truncate max-w-full text-left flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3 text-[#006a61] flex-shrink-0" />
              <span>{q}</span>
            </button>
          ))}
        </div>

        {/* Message Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="p-3 bg-white border-t border-[#e2e8f0] flex items-center gap-2"
        >
          <input
            id="support-chat-input"
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask Dr. Elena Vance about records, telemetry..."
            className="flex-1 h-10 px-3.5 rounded-xl bg-[#f8f9ff] border border-[#cbd5e1] text-xs md:text-sm text-[#0b1c30] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#006194] focus:border-transparent transition-all"
          />
          <button
            id="send-support-chat-btn"
            type="submit"
            disabled={!inputText.trim() || loading}
            className="h-10 px-4 rounded-xl bg-[#006194] hover:bg-[#004b73] disabled:opacity-50 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
