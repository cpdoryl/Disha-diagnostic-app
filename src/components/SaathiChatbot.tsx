import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bot, X, ChevronRight, Send, Sparkles, Shield, 
  LifeBuoy, ArrowLeft, Mail, FileText, Check, AlertCircle, RefreshCw
} from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, doc, setDoc } from 'firebase/firestore';

interface Message {
  id: string;
  sender: 'bot' | 'user';
  text?: string;
  timestamp: Date;
  type?: 'text' | 'options' | 'form' | 'success';
  options?: { label: string; action: string }[];
  ticketId?: string;
}

export const SaathiChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [formState, setFormState] = useState({
    email: '',
    category: 'Technical Help',
    message: '',
    consent: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const initChat = () => {
    setMessages([
      {
        id: 'welcome',
        sender: 'bot',
        text: "Namaste! 🙏 Welcome to Saathi AI, your dedicated support assistant for the Disha School Diagnostic Engine™.\n\nI am here to guide you through our diagnostic features, how-to tutorials, and technical support. Since I am a specialized guided helper, please choose one of the options below to get started.",
        timestamp: new Date(),
        type: 'options',
        options: [
          { label: '📊 School Diagnostics Guide', action: 'guide_diagnostics' },
          { label: '🎓 Student Benchmarking', action: 'guide_students' },
          { label: '⚡ Simulation Sandbox Help', action: 'guide_sandbox' },
          { label: '⚙️ Administrative Setup', action: 'guide_admin' },
          { label: '🛡️ Privacy, Security & DPDP Rights', action: 'guide_dpdp' },
          { label: '✉️ Submit Support Request', action: 'open_form' }
        ]
      }
    ]);
  };

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      initChat();
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleOptionClick = (label: string, action: string) => {
    // Add user's choice to history
    const userMsgId = `user-${Date.now()}`;
    setMessages(prev => [
      ...prev,
      { id: userMsgId, sender: 'user', text: label, timestamp: new Date(), type: 'text' }
    ]);

    // Generate bot's response based on selection
    setTimeout(() => {
      const botMsgId = `bot-${Date.now()}`;
      let text = '';
      let options: { label: string; action: string }[] = [];
      let type: 'text' | 'options' | 'form' = 'options';

      const backToMainMenuOption = { label: '↩️ Back to Main Menu', action: 'main_menu' };

      switch (action) {
        case 'main_menu':
          text = "What else can I help you with today? Please select from the menu below:";
          options = [
            { label: '📊 School Diagnostics Guide', action: 'guide_diagnostics' },
            { label: '🎓 Student Benchmarking', action: 'guide_students' },
            { label: '⚡ Simulation Sandbox Help', action: 'guide_sandbox' },
            { label: '⚙️ Administrative Setup', action: 'guide_admin' },
            { label: '🛡️ Privacy, Security & DPDP Rights', action: 'guide_dpdp' },
            { label: '✉️ Submit Support Request', action: 'open_form' }
          ];
          break;

        case 'guide_diagnostics':
          text = "📊 **School Diagnostics (Baseline & Core Challenges)**\n\nThe Disha Diagnostics module performs structured surveys to assess institutional health across **9 Core Challenge Domains** (including school infrastructure, learning resource alignment, pupil safety, and staff burnout).\n\n**🔍 How-to Steps:**\n1. Go to the **Capture (Assess)** view in the navigation panel.\n2. Fill in the institutional scores or complete the Challenge Survey checklists corresponding to the challenges.\n3. Save to view current baseline ratings, performance trends, and risk grades instantly.";
          options = [
            { label: '⚡ Simulation Sandbox Help', action: 'guide_sandbox' },
            { label: '🛡️ Privacy & DPDP Rights', action: 'guide_dpdp' },
            backToMainMenuOption
          ];
          break;

        case 'guide_students':
          text = "🎓 **Student Benchmarking & Dropout Prediction**\n\nStudent Benchmarking monitors individualized student cohorts, mapping attendance trends, academic performances, and risk categorizations (Low, Medium, High dropout risk).\n\n**🔍 How-to Steps:**\n1. Open the **Student Directory** to view, search, or add student cohorts.\n2. Navigate to **Compare (Diagnose)** to evaluate local grade-level trends alongside peer boards and standards.\n3. Risk metrics are updated automatically whenever you update the daily registers.";
          options = [
            { label: '📊 School Diagnostics Guide', action: 'guide_diagnostics' },
            { label: '⚙️ Administrative Setup', action: 'guide_admin' },
            backToMainMenuOption
          ];
          break;

        case 'guide_sandbox':
          text = "⚡ **Simulation Sandbox & Action Modeling**\n\nThe Sandbox allows administrators to model hypothetical adjustments (such as boosting attendance rates or reducing teacher turnover) to see predictions on general school success scores.\n\n**🔍 How-to Steps:**\n1. Select the **Simulate (Model)** section from the sidebar.\n2. Slide the sliders to manipulate metrics like 'Class Size Reduction' or 'Attendance Optimization'.\n3. The predictive AI calculates outcomes and returns a structured **Action Blueprint** with regional confidence ratings.";
          options = [
            { label: '🎓 Student Benchmarking', action: 'guide_students' },
            { label: '⚙️ Administrative Setup', action: 'guide_admin' },
            backToMainMenuOption
          ];
          break;

        case 'guide_admin':
          text = "⚙️ **Administrative Setup & Daily Operations**\n\nDisha supports extensive administrative tools to register teaching staffs, update schedules, and broadcast school-wide announcements.\n\n**🔍 How-to Steps:**\n1. Navigate to the **Faculty & Staff** screen to register teachers, allocate subjects, and check scores.\n2. Log daily student attendances quickly inside the **Attendance Register** tab.\n3. Navigate to **Communications** to broadcast newsletters and school notices to parents or staff rosters.";
          options = [
            { label: '📊 School Diagnostics Guide', action: 'guide_diagnostics' },
            { label: '✉️ Submit Support Request', action: 'open_form' },
            backToMainMenuOption
          ];
          break;

        case 'guide_dpdp':
          text = "🛡️ **Privacy, Security & DPDP Compliance**\n\nRYL Neuroacademy Pvt Ltd operates Disha with world-class security matching the **Digital Personal Data Protection (DPDP) Act, 2023** of India:\n\n• **Data Storage:** All school metrics, student directories, and teacher logs are housed in secure, isolated Cloud Firestore servers in the **Mumbai, India region**.\n• **Data Ownership:** Your school retains full legal ownership of your diagnostic inputs. RYL Neuroacademy strictly processes data only to generate administrative metrics and predictive models.\n• **Your Rights:** You have full statutory rights of correction, access, and complete erasure. To exercise your data deletion rights, you can contact our Grievance Officer, Ashish Chouksey at info@rylneuroacademy.com.";
          options = [
            { label: '✉️ Submit Support Request', action: 'open_form' },
            backToMainMenuOption
          ];
          break;

        case 'open_form':
          text = "Please complete the technical support request form below. To proceed, you must provide explicit consent as required by the India DPDP Act 2023 so we can securely store and reply to your ticket.";
          type = 'form';
          break;

        default:
          text = "I'm sorry, I could not understand that request. Please select a valid option below:";
          options = [backToMainMenuOption];
          break;
      }

      setMessages(prev => [
        ...prev,
        { id: botMsgId, sender: 'bot', text, timestamp: new Date(), type, options }
      ]);
    }, 600);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.email || !formState.message || !formState.consent) {
      setSubmitError('Please complete all fields and provide your explicit DPDP consent.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const ticketId = `TKT-${Math.floor(100000 + Math.random() * 900000)}`;
      const timestamp = new Date().toISOString();
      const consentNotice = "I explicitly consent to RYL Neuroacademy processing my email and ticket details to resolve my query as per DPDP India 2023 regulations.";

      // Write support request to Firestore securely
      await setDoc(doc(db, 'support_requests', ticketId), {
        id: ticketId,
        email: formState.email,
        category: formState.category,
        message: formState.message,
        consentGiven: formState.consent,
        consentNotice: consentNotice,
        timestamp: timestamp,
        status: 'Open'
      });

      // Clear input fields
      setFormState({
        email: '',
        category: 'Technical Help',
        message: '',
        consent: false
      });

      // Add success response to chat
      setMessages(prev => [
        ...prev,
        {
          id: `success-${Date.now()}`,
          sender: 'bot',
          text: `Thank you. Your support request has been submitted securely under the Indian DPDP Act 2023. Our engineering team has registered your ticket and will email a response within 24-48 business hours.\n\n**Ticket ID:** ${ticketId}\n**Registered Email:** ${formState.email}`,
          timestamp: new Date(),
          type: 'success',
          ticketId,
          options: [
            { label: '↩️ Back to Main Menu', action: 'main_menu' }
          ]
        }
      ]);
    } catch (err: any) {
      console.error(err);
      setSubmitError('Failed to save support ticket. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatText = (text: string) => {
    return text.split('\n\n').map((para, i) => {
      // Simple bold formatter
      const formattedParts = para.split('**').map((part, index) => {
        if (index % 2 === 1) {
          return <strong key={index} className="text-white font-semibold">{part}</strong>;
        }
        return part;
      });

      return (
        <p key={i} className="mb-2 last:mb-0">
          {formattedParts}
        </p>
      );
    });
  };

  return (
    <>
      {/* Floating Chat Button */}
      <div className="fixed bottom-6 right-6 z-[9999]">
        <button
          onClick={() => setIsOpen(!isOpen)}
          id="saathi_chatbot_btn"
          className="bg-[#FF6B00] hover:bg-[#FF8533] active:bg-[#E05E00] text-white p-4 rounded-full shadow-2xl flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-all duration-200 relative group cursor-pointer"
          title="Saathi Support AI"
        >
          <div className="relative">
            <Bot className="w-6 h-6 text-white" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 border-2 border-white rounded-full animate-pulse" />
          </div>
          <span className="font-semibold text-sm max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-out whitespace-nowrap">
            SAATHI
          </span>
        </button>
      </div>

      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            id="saathi_chatbot_window"
            className="fixed bottom-24 right-6 w-[420px] max-w-[calc(100vw-32px)] h-[620px] max-h-[calc(100vh-140px)] bg-[#1F1135] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col z-[9999]"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-600 to-amber-500 p-4 text-white flex items-center justify-between shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center border border-white/10">
                  <Bot className="w-6 h-6 text-white animate-bounce" />
                </div>
                <div>
                  <h4 className="font-bold text-base leading-tight flex items-center gap-1.5">
                    Saathi AI <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                  </h4>
                  <p className="text-xs text-orange-100 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-300 animate-pulse" />
                    Your Disha Guide • Active Support
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white p-1.5 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              {messages.map((msg) => (
                <div key={msg.id} className="space-y-2">
                  <div className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl p-3.5 text-sm ${
                      msg.sender === 'user' 
                        ? 'bg-orange-600 text-white rounded-br-none shadow-md' 
                        : 'bg-[#2A1B4E] border border-white/5 text-slate-200 rounded-bl-none shadow-md'
                    }`}>
                      {msg.sender === 'bot' ? (
                        <div className="space-y-2 text-xs leading-relaxed text-slate-300">
                          {formatText(msg.text || '')}
                        </div>
                      ) : (
                        <p className="text-xs">{msg.text}</p>
                      )}
                      <p className={`text-[10px] mt-1.5 font-mono text-right ${
                        msg.sender === 'user' ? 'text-orange-200' : 'text-slate-500'
                      }`}>
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>

                  {/* Render Options if any */}
                  {msg.sender === 'bot' && msg.type === 'options' && msg.options && (
                    <div className="flex flex-col gap-2 pl-4 max-w-[90%]">
                      {msg.options.map((opt, oIdx) => (
                        <button
                          key={oIdx}
                          onClick={() => handleOptionClick(opt.label, opt.action)}
                          className="text-left w-full bg-[#35255E] hover:bg-[#433174] active:bg-[#2C1C4E] border border-white/5 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 hover:text-white transition-all duration-150 flex items-center justify-between group shadow-sm cursor-pointer"
                        >
                          <span>{opt.label}</span>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-orange-400 group-hover:translate-x-1 transition-all" />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Render Success Back Button */}
                  {msg.sender === 'bot' && msg.type === 'success' && msg.options && (
                    <div className="flex flex-col gap-2 pl-4 max-w-[90%]">
                      {msg.options.map((opt, oIdx) => (
                        <button
                          key={oIdx}
                          onClick={() => handleOptionClick(opt.label, opt.action)}
                          className="text-left w-full bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-xl px-3.5 py-2.5 text-xs text-emerald-400 hover:text-emerald-300 transition-all duration-150 flex items-center justify-between group shadow-sm cursor-pointer"
                        >
                          <span>{opt.label}</span>
                          <ChevronRight className="w-3.5 h-3.5 text-emerald-400 group-hover:translate-x-1 transition-all" />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Render DPDP Compliant Form */}
                  {msg.sender === 'bot' && msg.type === 'form' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-[#2A1B4E] border border-white/10 rounded-2xl p-4 space-y-4 shadow-lg ml-2"
                    >
                      <h5 className="font-bold text-xs text-white flex items-center gap-1.5 border-b border-white/15 pb-2">
                        <FileText className="w-4 h-4 text-orange-400" /> Secure Support Ticket
                      </h5>

                      <form onSubmit={handleFormSubmit} className="space-y-3">
                        <div>
                          <label className="block text-[11px] font-medium text-slate-400 mb-1">Your Registered Email *</label>
                          <div className="relative">
                            <input
                              type="email"
                              required
                              placeholder="admin@school.edu"
                              value={formState.email}
                              onChange={(e) => setFormState(prev => ({ ...prev, email: e.target.value }))}
                              className="w-full bg-[#1F1135] border border-white/10 rounded-lg py-2 pl-3 pr-8 text-xs text-white focus:outline-none focus:border-orange-500 placeholder:text-slate-600 transition-colors"
                            />
                            <Mail className="absolute right-2.5 top-2.5 w-3.5 h-3.5 text-slate-500" />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-medium text-slate-400 mb-1">Issue Category *</label>
                          <select
                            value={formState.category}
                            onChange={(e) => setFormState(prev => ({ ...prev, category: e.target.value }))}
                            className="w-full bg-[#1F1135] border border-white/10 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-orange-500 transition-colors"
                          >
                            <option value="Technical Help">🛠️ Technical Support</option>
                            <option value="Billing Query">💳 Billing / Licensing</option>
                            <option value="Diagnostics Assist">📊 Survey / Reporting Assist</option>
                            <option value="Grievance Redressal">⚖️ Grievance Redressal</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-medium text-slate-400 mb-1">Describe your query *</label>
                          <textarea
                            required
                            rows={3}
                            placeholder="Provide steps to reproduce your issue or questions about our platform..."
                            value={formState.message}
                            onChange={(e) => setFormState(prev => ({ ...prev, message: e.target.value }))}
                            className="w-full bg-[#1F1135] border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-orange-500 placeholder:text-slate-600 resize-none transition-colors"
                          />
                        </div>

                        {/* DPDP Consent Section */}
                        <div className="bg-[#1F1135] p-3 rounded-xl border border-white/5 space-y-2">
                          <p className="text-[10px] text-slate-400 leading-normal font-medium">
                            🇮🇳 **DPDP Act, 2023 Consent Notice:**
                            RYL Neuroacademy processes your query and email strictly to provide support. Your data is saved securely on regional Indian servers (Mumbai, MH). You can retract your consent anytime.
                          </p>
                          <label className="flex items-start gap-2 cursor-pointer pt-1">
                            <input
                              type="checkbox"
                              required
                              checked={formState.consent}
                              onChange={(e) => setFormState(prev => ({ ...prev, consent: e.target.checked }))}
                              className="mt-0.5 border-white/20 rounded bg-[#1F1135] text-orange-600 focus:ring-0 focus:ring-offset-0 focus:outline-none"
                            />
                            <span className="text-[10px] text-slate-300 leading-tight">
                              I explicitly consent to processing my personal email and message to resolve this ticket. *
                            </span>
                          </label>
                        </div>

                        {submitError && (
                          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-2.5 flex items-start gap-2 text-red-400">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                            <span className="text-[10px] leading-tight">{submitError}</span>
                          </div>
                        )}

                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 disabled:opacity-50 text-white rounded-lg py-2 px-4 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                        >
                          {isSubmitting ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Saving ticket...
                            </>
                          ) : (
                            <>
                              <Send className="w-3.5 h-3.5" /> Submit Secure Ticket
                            </>
                          )}
                        </button>
                      </form>
                    </motion.div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Footer */}
            <div className="bg-[#150926] border-t border-white/5 p-3 flex items-center justify-between text-[10px] text-slate-400">
              <span className="flex items-center gap-1">
                <Shield className="w-3 h-3 text-orange-400" /> Powered by RYL Neuroacademy
              </span>
              <span className="bg-orange-500/10 text-orange-400 px-2 py-0.5 rounded-full border border-orange-500/20">
                🇮🇳 India DPDP Compliant
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
