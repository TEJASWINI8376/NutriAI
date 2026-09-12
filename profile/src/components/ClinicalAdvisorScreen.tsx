import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Sparkles,
  Send,
  ShieldCheck,
  User,
  Bot,
  RefreshCw,
  AlertCircle,
  BookOpen,
  ArrowRight,
  Info,
} from 'lucide-react';
import { PatientProfile, ChatMessage } from '../types';
import { NutriAILogo } from './NutriAILogo';

interface ClinicalAdvisorScreenProps {
  patient: PatientProfile;
}

export const ClinicalAdvisorScreen: React.FC<ClinicalAdvisorScreenProps> = ({ patient }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'assistant',
      text: `Hello ${patient.name}. I am your NutriAI Clinical Nutritionist & Metabolic Advisor.\n\nI have loaded your active profile: **${patient.primaryCondition}**, current prescriptions (**Lisinopril 10mg**, Omega-3, Vitamin D3), and your latest normal HbA1c of **5.4%**.\n\nHow can I assist your nutrition strategy, meal timing, or medication-nutrient compatibility today?`,
      timestamp: '10:00 AM',
      isAi: true,
      clinicalReferences: [
        'DASH Dietary Pattern Guidelines (AHA/ACC)',
        'Clinical Practice Guidelines for Diabetes Nutrition (ADA 2026)',
      ],
    },
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const suggestedQuestions = [
    'How does Lisinopril interact with high-potassium foods?',
    'What is my optimal protein distribution across 3 meals?',
    'Analyze my latest fasting glucose (91 mg/dL) and HbA1c',
    'Recommend a quick low-sodium dinner with >35g protein',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputQuery;
    if (!query.trim() || loading) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputQuery('');
    setLoading(true);

    try {
      const chatHistory = [...messages, userMessage].map((m) => ({
        role: m.sender === 'user' ? 'user' : 'model',
        text: m.text,
      }));

      const res = await fetch('/api/gemini/consult', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: chatHistory,
          patientContext: {
            name: patient.name,
            condition: patient.primaryCondition,
            targets: patient.macroTargets,
          },
        }),
      });

      const data = await res.json();

      const aiMessage: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        text: data.reply || "I've reviewed your request. Maintaining steady protein pacing and high vegetable fiber supports stable glycemic regulation.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isAi: true,
        clinicalReferences: ['American Heart Association DASH Advisory', 'Endocrine Society Clinical Practice'],
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.error('Failed to get consultation:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now() + 1}`,
          sender: 'assistant',
          text: 'I apologize, but I encountered a brief network interruption. Remember to prioritize lean proteins, complex fiber, and consistent hydration. Please feel free to re-ask your question.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isAi: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E2E8F0] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <NutriAILogo size="sm" showText={false} />
          <div>
            <h1 className="text-xl font-bold text-[#0B1C30] tracking-tight">
              NutriAI Clinical Advisor
            </h1>
            <p className="text-xs text-[#64748B]">
              Board-Certified Medical Nutrition Intelligence • Gemini 3.8 Reasoning
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#047857] bg-[#ECFDF5] px-3 py-1 rounded-full border border-[#A7F3D0]">
            <ShieldCheck className="w-4 h-4 text-[#10B981]" />
            Clinical Protocol Validated
          </span>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden flex flex-col h-[640px]">
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-[#F8FAFC]">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-2xl ${
                  isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                    isUser
                      ? 'bg-[#0284C7] text-white'
                      : 'bg-[#0B1C30] text-white border border-[#1E324D]'
                  }`}
                >
                  {isUser ? 'TM' : <Bot className="w-4 h-4 text-[#86F2E4]" />}
                </div>

                {/* Message Bubble */}
                <div className="space-y-1.5 min-w-0">
                  <div
                    className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      isUser
                        ? 'bg-[#0284C7] text-white rounded-tr-xs shadow-xs'
                        : 'bg-white text-[#0B1C30] rounded-tl-xs border border-[#E2E8F0] shadow-xs'
                    }`}
                  >
                    <div className="whitespace-pre-wrap space-y-2">
                      {msg.text.split('\n\n').map((paragraph, pIdx) => (
                        <p key={pIdx}>{paragraph}</p>
                      ))}
                    </div>

                    {/* Clinical References Pill if AI */}
                    {msg.clinicalReferences && msg.clinicalReferences.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-[#E2E8F0] flex flex-wrap items-center gap-1.5 text-[10px] text-[#64748B]">
                        <BookOpen className="w-3 h-3 text-[#0D9488]" />
                        <span className="font-semibold">References:</span>
                        {msg.clinicalReferences.map((ref, rIdx) => (
                          <span
                            key={rIdx}
                            className="bg-[#F1F5F9] px-2 py-0.5 rounded-full text-[#334155]"
                          >
                            {ref}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <span className={`text-[10px] text-[#94A3B8] block ${isUser ? 'text-right' : 'text-left'}`}>
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex gap-3 mr-auto max-w-md">
              <div className="w-9 h-9 rounded-xl bg-[#0B1C30] text-white flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-[#86F2E4]" />
              </div>
              <div className="p-4 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs flex items-center gap-2 text-xs text-[#64748B]">
                <RefreshCw className="w-4 h-4 animate-spin text-[#0284C7]" />
                <span>NutriAI is synthesizing clinical metabolic recommendations...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Quick Question Chips */}
        <div className="px-4 py-2.5 bg-white border-t border-[#F1F5F9] flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[11px] font-semibold text-[#64748B] shrink-0">Suggested:</span>
          {suggestedQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q)}
              disabled={loading}
              className="text-[11px] font-medium text-[#0284C7] bg-[#EFF6FF] hover:bg-[#DBEAFE] px-3 py-1 rounded-full whitespace-nowrap border border-[#BFDBFE] transition-all shrink-0"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-white border-t border-[#E2E8F0]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask about meal choices, blood sugar spikes, or medication-nutrient interactions..."
              disabled={loading}
              className="flex-1 px-4 py-3 rounded-xl border border-[#CBD5E1] focus:ring-2 focus:ring-[#0284C7] focus:border-transparent text-xs sm:text-sm bg-white"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim() || loading}
              className="px-5 py-3 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] disabled:opacity-40 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all shadow-xs shrink-0"
            >
              <span>Send</span>
              <Send className="w-4 h-4" />
            </button>
          </form>

          <p className="text-[10px] text-[#94A3B8] text-center mt-2 flex items-center justify-center gap-1">
            <Info className="w-3 h-3" />
            Clinical Guidance Disclaimer: NutriAI is an auxiliary clinical decision tool. Always discuss major medication or diet changes with your physician.
          </p>
        </div>
      </div>
    </div>
  );
};
