import React, { useState } from 'react';
import { 
  ArrowRight, Activity, Users, Settings, Database, LineChart, Target, Heart, 
  CheckCircle2, MessageSquare, Briefcase, Star, Rocket, Zap, ShieldCheck, 
  ChevronRight, X, Sparkles, BookOpen, HelpCircle, Layers, Cpu, Award, 
  Clock, Scale, Sliders, AlertTriangle, FileText, ChevronDown
} from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { SaathiChatbot } from '../components/SaathiChatbot';

interface LandingPageProps {
  onLoginClick: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLoginClick }) => {
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);
  const [selectedLegal, setSelectedLegal] = useState<string | null>(null);
  const [showContactForm, setShowContactForm] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  
  const [contactData, setContactData] = useState({
    name: '',
    email: '',
    phone: '',
    schoolName: '',
    role: 'Principal / Director',
    students: '500 - 1000',
    message: ''
  });
  const [contactStatus, setContactStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactStatus('submitting');
    try {
      await addDoc(collection(db, 'contact_requests'), {
        ...contactData,
        createdAt: serverTimestamp(),
      });
      
      // Send to backend to trigger email notification
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactData),
      });

      setContactStatus('success');
      setTimeout(() => {
        setShowContactForm(false);
        setContactStatus('idle');
        setContactData({ name: '', email: '', phone: '', schoolName: '', role: 'Principal / Director', students: '500 - 1000', message: '' });
      }, 3000);
    } catch (error) {
      console.error('Error submitting contact form:', error);
      setContactStatus('error');
    }
  };

  const features = [
    { 
      icon: <Activity className="w-6 h-6" />, 
      title: 'First Opinion Triage Engine', 
      desc: '20-minute operational screening that diagnoses institutional root causes.',
      fullDesc: 'Just as a clinical doctor checks blood pressure and ECG before writing a prescription, DISHA’s First Opinion engine collects operational vitals (Student-Teacher Ratio, Parent Query SLA, Teacher Training Hours, Remedial Coverage) and generates an immediate 0-100 Health Score, risk classification, and differential diagnosis.'
    },
    { 
      icon: <Users className="w-6 h-6" />, 
      title: '360° Multilateral Survey Hub', 
      desc: 'Direct QR-code feedback capture from Parents, Teachers, Students & Staff.',
      fullDesc: 'Eliminate blind spots by gathering direct perception data from all four key school cohorts. Generates instant QR codes and clean mobile links to capture parent satisfaction, teacher workload balance, student emotional safety, and staff operational friction in real-time.'
    },
    { 
      icon: <Sliders className="w-6 h-6" />, 
      title: 'Predictive What-If Simulator', 
      desc: 'Model budget investments and policy decisions before spending capital.',
      fullDesc: 'Test the impact of strategic changes before committing financial resources. Adjust interactive decision sliders—such as increasing Teacher Training Hours or reducing Parent Inquiry Response Times—and watch DISHA project expected score gains, financial ROI, and reduced student/staff attrition risk.'
    },
    { 
      icon: <Award className="w-6 h-6" />, 
      title: 'Peer Benchmarking Radar', 
      desc: 'Compare your school against Metro/City Tier peers and national standards.',
      fullDesc: 'Benchmark your institution against top-tier peers within your specific Board affiliation (CBSE, ICSE, IB, Cambridge), City Tier, and Fee Bracket. Uncover where your school leads the market and pinpoint exact competitive gaps across 12 operational dimensions.'
    },
    { 
      icon: <LineChart className="w-6 h-6" />, 
      title: 'Operational SLA & Risk Tracker', 
      desc: 'Real-time monitoring of Parent Queries, Attendance Drops & Staff Risk.',
      fullDesc: 'Stay ahead of operational failures with live SLA countdown timers for parent support tickets, unexcused absence alerts, student drop-out warning flags, and teacher turnover risk tracking—all aggregated into a clean executive command center.'
    },
    { 
      icon: <Sparkles className="w-6 h-6" />, 
      title: 'AI Saathi Leadership Copilot', 
      desc: '24/7 AI Assistant trained on NEP 2020 & CBSE SQAAF framework standards.',
      fullDesc: 'Your dedicated institutional AI advisor. Saathi analyzes your active campus profile, diagnostic gaps, and operational metrics to draft customized institutional policies, parent communication templates, remedial roadmaps, and 30-60-90 day leadership action plans in seconds.'
    },
  ];

  const faqs = [
    {
      q: "Why does my school need DISHA if we already have an ERP or School Management Software?",
      a: "ERP systems are transactional software—they store student attendance, process fee collection, and generate grade cards. DISHA is an institutional diagnostic & operational intelligence engine. It analyzes root causes, measures parent satisfaction SLA response times, detects hidden teacher turnover risk, compares perception against real operational data, and predicts the financial impact of budget decisions."
    },
    {
      q: "How long does it take to complete the initial assessment?",
      a: "The First Opinion Health Checkup takes just 15 to 20 minutes. You simply select your primary institutional concerns, enter 4 operational vitals (such as Student-Teacher ratio and parent inquiry response time), and complete a 12-lens screening questionnaire to get an instant 0-100 Health Score and Action Plan."
    },
    {
      q: "What educational standards and frameworks are used in DISHA?",
      a: "DISHA's diagnostic engine is built on national and international quality standards, including NEP 2020 (National Education Policy teacher CPD standards), CBSE SQAAF (School Quality Assessment & Assurance Framework), the EWISR 14-Dimension School Ranking methodology, and Harvard/Cambridge educational governance principles."
    },
    {
      q: "Is student and school data safe and compliant with privacy laws?",
      a: "Yes. DISHA is fully compliant with the India Digital Personal Data Protection Act 2023 (DPDPA). All data is stored securely in Google Cloud infrastructure in India (asia-south1 region). We use strict role-based Firestore security rules and high-grade TLS 1.3 encryption. We never sell or share institutional data."
    },
    {
      q: "Can DISHA handle multi-campus groups, educational trusts, or franchises?",
      a: "Absolutely. DISHA includes an instant Multi-School Switcher. School owners, board chairs, and educational trusts can register and monitor multiple branch campuses from a single account while retaining branch-specific benchmarks and reports."
    }
  ];

  const renderPrivacyPolicy = () => (
    <div className="space-y-6 text-slate-300 text-sm leading-relaxed max-h-[60vh] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <p className="text-xs text-slate-400 font-mono">Last updated: March 2026 • Effective: March 2026</p>
          <p className="text-xs text-blue-400 font-semibold mt-1">Compliant with India Digital Personal Data Protection Act 2023 (DPDPA)</p>
        </div>
        <span className="bg-blue-500/10 border border-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-xs font-semibold">
          DPDPA Compliant
        </span>
      </div>

      <div className="bg-[#1F1135] border border-white/10 rounded-xl p-5">
        <h4 className="font-bold text-white mb-2 text-base flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" /> Executive Summary
        </h4>
        <p className="text-slate-300 text-sm">
          We collect your name, email, school administrative roles, and student/staff diagnostic data to provide school-wide wellbeing and academic insights. We use Google Firebase for secure cloud infrastructure and Google Gemini API for generating educational recommendations. <strong>We do not sell your data.</strong> You have the absolute right to access, correct, and delete your data at any time.
        </p>
      </div>

      <div>
        <h4 className="font-bold text-white text-base mb-2">1. Data Fiduciary</h4>
        <p className="mb-3">
          RYL Neuroacademy Pvt Ltd ("we," "our," or "us") is the Data Fiduciary under the India Digital Personal Data Protection Act 2023 (DPDPA).
        </p>
        <div className="bg-[#1F1135]/50 rounded-xl p-4 border border-white/5 grid md:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-slate-500">Registered Name</p>
            <p className="text-white font-medium text-xs">RYL Neuroacademy Pvt Ltd</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Platform</p>
            <p className="text-white font-medium text-xs">Disha School Diagnostic Engine™</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Grievance Officer / DPO</p>
            <p className="text-white font-medium text-xs">Ashish Chouksey, Director</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Contact</p>
            <p className="text-white font-medium text-xs">rylneuroacademy@gmail.com | +91 89820 73660</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#1F1135] text-slate-200 selection:bg-blue-600 selection:text-white font-sans overflow-x-hidden relative">
      
      {/* Contact Modal */}
      {showContactForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto py-10">
          <div className="bg-[#2A1B4E] border border-white/10 rounded-2xl p-8 max-w-2xl w-full relative shadow-2xl my-auto">
            <button 
              onClick={() => setShowContactForm(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <h3 className="text-3xl font-bold text-white mb-2">Request a Personalized Demo</h3>
            <p className="text-slate-400 mb-8">Schedule a 1-on-1 walkthrough with our educational diagnostics team for your institution.</p>
            
            {contactStatus === 'success' ? (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-6 rounded-xl text-center">
                <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                </div>
                <h4 className="text-xl font-bold mb-2">Request Submitted Successfully!</h4>
                <p>Our school diagnostic specialist will contact you within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Full Name *</label>
                    <input required value={contactData.name} onChange={(e) => setContactData({...contactData, name: e.target.value})} type="text" className="w-full bg-[#1F1135] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. Dr. S. K. Sharma" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Work Email *</label>
                    <input required value={contactData.email} onChange={(e) => setContactData({...contactData, email: e.target.value})} type="email" className="w-full bg-[#1F1135] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="principal@school.edu" />
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Phone Number *</label>
                    <input required value={contactData.phone} onChange={(e) => setContactData({...contactData, phone: e.target.value})} type="tel" className="w-full bg-[#1F1135] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="+91 98765 43210" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">School Name *</label>
                    <input required value={contactData.schoolName} onChange={(e) => setContactData({...contactData, schoolName: e.target.value})} type="text" className="w-full bg-[#1F1135] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. Delhi Public Academy" />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Your Role</label>
                    <select value={contactData.role} onChange={(e) => setContactData({...contactData, role: e.target.value})} className="w-full bg-[#1F1135] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option>Principal / Director</option>
                      <option>School Owner / Trustee</option>
                      <option>Academic Administrator</option>
                      <option>Department Coordinator</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Student Strength</label>
                    <select value={contactData.students} onChange={(e) => setContactData({...contactData, students: e.target.value})} className="w-full bg-[#1F1135] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option>Less than 300</option>
                      <option>300 - 500</option>
                      <option>500 - 1000</option>
                      <option>1000 - 2000</option>
                      <option>2000+</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Primary Challenge / Requirements</label>
                  <textarea value={contactData.message} onChange={(e) => setContactData({...contactData, message: e.target.value})} rows={3} className="w-full bg-[#1F1135] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="What key operational areas are you looking to diagnose or improve?"></textarea>
                </div>

                {contactStatus === 'error' && (
                  <p className="text-red-400 text-sm">An error occurred. Please try again or email us directly.</p>
                )}

                <div className="pt-2">
                  <button 
                    type="submit" 
                    disabled={contactStatus === 'submitting'}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white px-6 py-3.5 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {contactStatus === 'submitting' ? 'Submitting Request...' : 'Schedule School Walkthrough'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Feature Detail Modal */}
      {selectedFeature && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-[#2A1B4E] border border-white/10 rounded-2xl p-8 max-w-lg w-full relative shadow-2xl">
            <button 
              onClick={() => setSelectedFeature(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            {features.filter(f => f.title === selectedFeature).map(f => (
              <div key={f.title}>
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white mb-6">
                  {f.icon}
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">{f.title}</h3>
                <p className="text-slate-300 leading-relaxed text-sm mb-6">
                  {f.fullDesc}
                </p>
                <div className="mt-8">
                  <button onClick={() => { setSelectedFeature(null); onLoginClick(); }} className="w-full bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2">
                    Launch Assessment Demo <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Legal Modal */}
      {selectedLegal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-[#2A1B4E] border border-white/10 rounded-2xl p-8 w-full max-w-4xl relative shadow-2xl transition-all">
            <button 
              onClick={() => setSelectedLegal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <h3 className="text-2xl font-bold text-white mb-6">{selectedLegal}</h3>
            <div className="prose prose-invert max-w-none text-sm text-slate-300 leading-relaxed">
              {renderPrivacyPolicy()}
            </div>
            <div className="mt-8 pt-6 border-t border-white/10 text-right">
              <button onClick={() => setSelectedLegal(null)} className="bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Banner Credential */}
      <div className="bg-gradient-to-r from-purple-900/60 via-blue-900/60 to-purple-900/60 border-b border-white/10 py-2 text-center text-xs text-slate-300 px-4 flex flex-wrap items-center justify-center gap-4">
        <span className="flex items-center gap-1.5 font-medium">
          <Award className="w-3.5 h-3.5 text-amber-400" /> DPIIT Recognized Startup | Government of India
        </span>
        <span className="hidden sm:inline text-slate-600">•</span>
        <span className="flex items-center gap-1.5 font-medium text-slate-300">
          <Rocket className="w-3.5 h-3.5 text-blue-400" /> Incubated at AIC-IMS-BHU, Varanasi & NIT Raipur
        </span>
      </div>

      {/* Navigation Header */}
      <header className="container mx-auto px-6 py-5 flex items-center justify-between relative z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-900/20">
             <div className="w-4 h-5 border-2 border-white rounded-sm flex gap-0.5 p-0.5 items-end justify-center">
                <div className="w-1 h-3 bg-white rounded-sm"></div>
                <div className="w-1 h-1.5 bg-white rounded-sm"></div>
             </div>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight leading-none">DISHA</h1>
            <p className="text-[10px] text-slate-400 font-medium tracking-wider mt-0.5">School Diagnostic Engine</p>
          </div>
        </div>
        
        <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-slate-300">
          <a href="#why-disha" className="hover:text-white transition-colors">Why DISHA</a>
          <a href="#standards" className="hover:text-white transition-colors">Frameworks & Standards</a>
          <a href="#how-it-works" className="hover:text-white transition-colors">The 4-Step Engine</a>
          <a href="#features" className="hover:text-white transition-colors">Core Modules</a>
          <a href="#faqs" className="hover:text-white transition-colors">FAQs</a>
        </nav>

        <div className="flex items-center gap-3">
          <button onClick={onLoginClick} className="text-sm font-medium text-slate-300 hover:text-white transition-colors px-3 py-2">
            Sign In
          </button>
          <button onClick={onLoginClick} className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-blue-900/50 transition-all active:scale-95 flex items-center gap-1.5">
            Launch Platform <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative pt-12 pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1F1135] via-[#2A164D] to-[#1F1135] z-0"></div>
        <div className="container mx-auto px-6 relative z-10 grid lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-7 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-semibold mb-6">
              <Sparkles className="w-4 h-4 text-amber-400" /> 360° Institutional Health & Operational Intelligence
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.15] tracking-tight mb-6">
              Objective School Diagnostics. <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400">
                Not Subjective Opinions.
              </span>
            </h1>
            
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed mb-8">
              Move your school leadership from "gut feel" decision-making to evidence-based governance. DISHA diagnoses operational friction across 12 institutional lenses, detects hidden perception gaps, benchmarks against national standards, and simulates budget ROI before you spend.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-10">
              <button onClick={onLoginClick} className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl font-bold shadow-xl shadow-blue-900/50 transition-all active:scale-95 flex items-center justify-center gap-2 text-base sm:text-lg">
                Start First Opinion Checkup <ArrowRight className="w-5 h-5" />
              </button>
              <button onClick={() => setShowContactForm(true)} className="bg-white/5 border border-white/10 hover:bg-white/10 text-white px-7 py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 text-base">
                Book School Walkthrough
              </button>
            </div>
            
            <div className="pt-6 border-t border-white/10 grid grid-cols-3 gap-4 text-xs font-medium text-slate-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>20-Min Triage</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>NEP 2020 Aligned</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Zero Installation</span>
              </div>
            </div>
          </div>
          
          {/* Interactive Hero Card Preview */}
          <div className="lg:col-span-5 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-3xl -z-10 rounded-full"></div>
            
            <div className="bg-[#2A1B4E] border border-white/15 rounded-2xl p-6 shadow-2xl relative">
              
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></div>
                  <span className="text-xs font-semibold text-white tracking-wider uppercase">Live First Opinion Diagnosis</span>
                </div>
                <span className="text-[11px] bg-amber-500/10 border border-amber-500/30 text-amber-300 px-2.5 py-0.5 rounded-full font-medium">
                  CBSE Tier-1 Metro
                </span>
              </div>

              {/* Health Gauge Meter */}
              <div className="bg-[#1F1135] rounded-xl p-5 border border-white/5 mb-6 text-center">
                <p className="text-xs text-slate-400 uppercase font-medium tracking-wider mb-1">Institutional Health Index</p>
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-5xl font-black text-amber-400 tracking-tight">67</span>
                  <span className="text-xl text-slate-500 font-bold">/100</span>
                </div>
                <p className="text-xs text-amber-300/80 font-medium mt-1">Vulnerable Zone (Peer Avg: 74/100)</p>
              </div>

              {/* Delusional Comfort Alert Callout */}
              <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-rose-300 uppercase tracking-wide">Perception Gap Detected</h4>
                    <p className="text-xs text-slate-300 mt-0.5 leading-snug">
                      Leadership estimated Parent Satisfaction at <strong>85%</strong>, but actual Parent Query SLA is <strong>28 hours</strong> (Target: &lt;4 hrs). High risk of silent mid-year withdrawals.
                    </p>
                  </div>
                </div>
              </div>

              {/* Operational Lenses Bars */}
              <div className="space-y-3 mb-6">
                <div>
                  <div className="flex justify-between text-xs mb-1 font-medium">
                    <span className="text-slate-300">Parent Query SLA Compliance</span>
                    <span className="text-rose-400 font-bold">42% (Critical)</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-rose-500 w-[42%] rounded-full"></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1 font-medium">
                    <span className="text-slate-300">Teacher CPD Training (NEP 2020)</span>
                    <span className="text-amber-400 font-bold">58% (Lagging)</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400 w-[58%] rounded-full"></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1 font-medium">
                    <span className="text-slate-300">Student Retention Index</span>
                    <span className="text-emerald-400 font-bold">86% (Healthy)</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 w-[86%] rounded-full"></div>
                  </div>
                </div>
              </div>

              <button onClick={onLoginClick} className="w-full bg-white/10 hover:bg-white/20 text-white text-xs py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-1.5">
                Run Diagnostic for Your Campus <ChevronRight className="w-4 h-4" />
              </button>

            </div>
          </div>

        </div>
      </section>

      {/* WHY DISHA — PROBLEM VS SOLUTION */}
      <section id="why-disha" className="py-20 bg-[#1A1032] border-t border-white/5">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2">Institutional Pain Points</h2>
            <h3 className="text-3xl sm:text-4xl font-bold text-white mb-4">Why Traditional School Audits Fail</h3>
            <p className="text-slate-400 text-sm sm:text-base">
              School leaders are trapped between noisy complaints, costly slow consulting audits, and ERP tools that only process paperwork.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* The Old Way */}
            <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-8 relative">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 text-red-400 text-xs font-bold mb-6">
                <X className="w-4 h-4" /> TRADITIONAL CONSULTING & ERPS
              </div>
              <ul className="space-y-4 text-sm text-slate-300">
                <li className="flex items-start gap-3">
                  <X className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block">Slow & Expensive Audits</strong>
                    Consultants take 4–6 weeks for interviews and deliver 100-page reports that sit unread.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <X className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block">Subjective "Gut-Feel" Decisions</strong>
                    Principals react to vocal parents or aggressive staff rather than root causes.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <X className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block">ERP Data Silos</strong>
                    ERPs track attendance & fees, but cannot diagnose institutional health or predict attrition.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <X className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block">Wasteful Capital Allocation</strong>
                    Spending heavily on billboard ads when the true issue is a 24-hour parent enquiry response delay.
                  </div>
                </li>
              </ul>
            </div>

            {/* The DISHA Way */}
            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-8 relative">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold mb-6">
                <CheckCircle2 className="w-4 h-4" /> THE DISHA DIAGNOSTIC ENGINE
              </div>
              <ul className="space-y-4 text-sm text-slate-300">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block">Instant 20-Minute Triage</strong>
                    Get a clear 0-100 Health Score, operational risk zone, and doctor-metaphor diagnosis instantly.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block">360° Multilateral Verification</strong>
                    Cross-validate leadership ratings with direct feedback from Parents, Teachers, Students & Staff.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block">Predictive What-If Simulation</strong>
                    Test budget decisions on interactive sliders to see projected retention gains before spending.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block">Saathi AI Policy Assistant</strong>
                    Draft NEP-aligned policies, remedial strategies, and action plans in seconds.
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* STANDARDS & FRAMEWORKS */}
      <section id="standards" className="py-20 bg-[#1F1135]">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-2">Scientific & Regulatory Foundations</h2>
            <h3 className="text-3xl sm:text-4xl font-bold text-white mb-4">Anchored in Recognized Educational Standards</h3>
            <p className="text-slate-400 text-sm sm:text-base">
              DISHA does not use arbitrary scoring. All diagnostic formulas and 12 operational lenses are aligned with national policies and global research models.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="bg-[#2A1B4E]/60 border border-white/5 rounded-xl p-6 hover:border-purple-500/30 transition-all">
              <div className="w-10 h-10 bg-purple-500/20 text-purple-300 rounded-lg flex items-center justify-center font-bold text-lg mb-4">
                NEP
              </div>
              <h4 className="font-bold text-white text-lg mb-2">NEP 2020</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                National Education Policy benchmarks for 50-hour annual Continuous Professional Development (CPD) for teachers, Foundational Literacy & Numeracy (FLN), and holistic progress cards.
              </p>
            </div>

            <div className="bg-[#2A1B4E]/60 border border-white/5 rounded-xl p-6 hover:border-blue-500/30 transition-all">
              <div className="w-10 h-10 bg-blue-500/20 text-blue-300 rounded-lg flex items-center justify-center font-bold text-lg mb-4">
                SQAAF
              </div>
              <h4 className="font-bold text-white text-lg mb-2">CBSE SQAAF</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                CBSE School Quality Assessment & Assurance Framework parameters spanning Governance, Curriculum Planning, Inclusive Staffing, and Beneficiary Satisfaction.
              </p>
            </div>

            <div className="bg-[#2A1B4E]/60 border border-white/5 rounded-xl p-6 hover:border-amber-500/30 transition-all">
              <div className="w-10 h-10 bg-amber-500/20 text-amber-300 rounded-lg flex items-center justify-center font-bold text-lg mb-4">
                EWISR
              </div>
              <h4 className="font-bold text-white text-lg mb-2">EWISR 14-Dimensions</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                EducationWorld India School Rankings dimensions including Academic Reputation, Teacher Development, Leadership Quality, Infrastructure, and Value for Money.
              </p>
            </div>

            <div className="bg-[#2A1B4E]/60 border border-white/5 rounded-xl p-6 hover:border-emerald-500/30 transition-all">
              <div className="w-10 h-10 bg-emerald-500/20 text-emerald-300 rounded-lg flex items-center justify-center font-bold text-lg mb-4">
                WHO
              </div>
              <h4 className="font-bold text-white text-lg mb-2">WHO & UNICEF</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Adolescent mental wellness, digital safety protocols, anti-bullying frameworks, and socio-emotional school health standards.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* THE 4-STEP DISHA JOURNEY */}
      <section id="how-it-works" className="py-24 bg-[#1A1032]">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2">Methodology & Operational Flow</h2>
            <h3 className="text-3xl sm:text-4xl font-bold text-white mb-4">The 4-Step DISHA Diagnostic Engine</h3>
            <p className="text-slate-400 text-sm sm:text-base">
              A clear, systematic process designed for school owners, board members, and principals.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            
            {/* Step 1 */}
            <div className="bg-[#2A1B4E]/60 border border-white/5 rounded-2xl p-6 relative">
              <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-black text-lg mb-5 shadow-lg shadow-blue-600/30">
                1
              </div>
              <h4 className="text-lg font-bold text-white mb-2">First Opinion Triage</h4>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Select your primary worries and enter operational vitals (Student-Teacher Ratio, Parent Query SLA, Teacher Training Hours).
              </p>
              <div className="text-[11px] font-semibold text-blue-300 bg-blue-500/10 px-2.5 py-1 rounded border border-blue-500/20 inline-block">
                Output: Health Index & Risk Zone
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-[#2A1B4E]/60 border border-white/5 rounded-2xl p-6 relative">
              <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-black text-lg mb-5 shadow-lg shadow-indigo-600/30">
                2
              </div>
              <h4 className="text-lg font-bold text-white mb-2">360° Multilateral Capture</h4>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Generate clean QR codes & links for Parents, Teachers, Students & Staff to capture direct perception feedback.
              </p>
              <div className="text-[11px] font-semibold text-indigo-300 bg-indigo-500/10 px-2.5 py-1 rounded border border-indigo-500/20 inline-block">
                Output: Trust Gap & Alignment
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-[#2A1B4E]/60 border border-white/5 rounded-2xl p-6 relative">
              <div className="w-10 h-10 bg-purple-600 text-white rounded-xl flex items-center justify-center font-black text-lg mb-5 shadow-lg shadow-purple-600/30">
                3
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Peer Benchmarking</h4>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Compare your diagnostic performance against peer schools in your specific Board, City Tier, and Fee Bracket.
              </p>
              <div className="text-[11px] font-semibold text-purple-300 bg-purple-500/10 px-2.5 py-1 rounded border border-purple-500/20 inline-block">
                Output: Peer Ranking & Radar Gaps
              </div>
            </div>

            {/* Step 4 */}
            <div className="bg-[#2A1B4E]/60 border border-white/5 rounded-2xl p-6 relative">
              <div className="w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center font-black text-lg mb-5 shadow-lg shadow-emerald-600/30">
                4
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Simulate & Execute</h4>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Run What-If budget simulations to project score gains and consult AI Saathi to draft customized policy documents.
              </p>
              <div className="text-[11px] font-semibold text-emerald-300 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20 inline-block">
                Output: ROI Roadmap & Policy Drafts
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* CORE PLATFORM MODULES */}
      <section id="features" className="py-24 bg-[#1F1135]">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2">Complete Operational Suite</h2>
            <h3 className="text-3xl sm:text-4xl font-bold text-white mb-4">Core Platform Capabilities</h3>
            <p className="text-slate-400 text-sm sm:text-base">
              Everything required to diagnose, manage, and continuously elevate school performance.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div key={i} className="bg-[#2A1B4E]/50 border border-white/5 rounded-2xl p-6 group hover:bg-[#2A1B4E] transition-all">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white mb-6">
                  {feature.icon}
                </div>
                <h4 className="text-xl font-bold text-white mb-2">{feature.title}</h4>
                <p className="text-slate-400 text-sm mb-6 leading-relaxed">{feature.desc}</p>
                <button 
                  onClick={() => setSelectedFeature(feature.title)}
                  className="text-blue-400 font-medium text-sm flex items-center gap-1 group-hover:text-blue-300 transition-colors"
                >
                  Explore Module <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faqs" className="py-24 bg-[#1A1032]">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2">Frequently Asked Questions</h2>
            <h3 className="text-3xl font-bold text-white mb-4">Clear Answers for School Leaders</h3>
            <p className="text-slate-400 text-sm">Everything you need to know about implementing DISHA in your institution.</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-[#2A1B4E] border border-white/5 rounded-2xl overflow-hidden">
                <button 
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-6 text-left flex items-center justify-between gap-4 text-white font-bold text-base hover:bg-white/5 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${openFaq === idx ? 'rotate-180 text-blue-400' : ''}`} />
                </button>
                {openFaq === idx && (
                  <div className="px-6 pb-6 text-sm text-slate-300 leading-relaxed border-t border-white/5 pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-24 bg-[#1F1135]">
        <div className="container mx-auto px-6">
          <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-blue-700 rounded-3xl p-10 sm:p-16 text-center max-w-5xl mx-auto shadow-2xl relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-5xl font-bold text-white mb-6">Transform Your School Governance Today</h2>
              <p className="text-base sm:text-lg text-blue-100 mb-10 max-w-2xl mx-auto leading-relaxed">
                Join forward-thinking school owners, trustees, and principals who use DISHA to eliminate operational guesswork and drive evidence-based excellence.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <button onClick={onLoginClick} className="bg-white text-purple-900 hover:bg-slate-100 px-8 py-4 rounded-xl font-bold shadow-xl transition-all active:scale-95 text-base sm:text-lg">
                  Start Your Free Assessment
                </button>
                <button onClick={() => setShowContactForm(true)} className="bg-black/20 border-2 border-white/40 text-white hover:bg-black/30 px-8 py-4 rounded-xl font-bold transition-all active:scale-95 text-base sm:text-lg">
                  Schedule Live Walkthrough
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#110920] pt-16 pb-10 border-t border-white/10">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center">
                   <div className="w-3 h-4 border-2 border-white rounded-[2px] flex gap-[1px] p-[1px] items-end justify-center">
                      <div className="w-0.5 h-2 bg-white rounded-sm"></div>
                      <div className="w-0.5 h-1 bg-white rounded-sm"></div>
                   </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white leading-none">DISHA</h3>
                  <p className="text-[10px] text-slate-400 font-medium tracking-wider mt-0.5">School Diagnostic Engine</p>
                </div>
              </div>
              
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mb-6 max-w-md">
                An evidence-based 360-degree school diagnostic and operational intelligence platform helping K-12 institutions achieve measurable improvement through data-driven governance.
              </p>

              <div className="bg-[#1F1135] p-4 rounded-xl border border-white/5 space-y-2 text-xs text-slate-300 max-w-md">
                <p className="font-bold text-white">RYL Neuroacademy Pvt Ltd</p>
                <p className="text-slate-400 leading-relaxed">
                  DPIIT Recognized Startup | Incubated with AIC-IMS-BHU, Varanasi & NIT Raipur
                </p>
                <p className="text-slate-400 pt-1">
                  <strong>Email:</strong> rylneuroacademy@gmail.com | <strong>Phone:</strong> +91 89820 73660
                </p>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-white mb-4 text-sm">Platform Navigation</h4>
              <ul className="space-y-3 text-xs text-slate-400">
                <li><button onClick={onLoginClick} className="hover:text-white transition-colors">Sign In to Dashboard</button></li>
                <li><button onClick={onLoginClick} className="hover:text-white transition-colors">First Opinion Checkup</button></li>
                <li><a href="#why-disha" className="hover:text-white transition-colors">Why DISHA vs ERPs</a></li>
                <li><a href="#standards" className="hover:text-white transition-colors">Frameworks & Standards</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">The 4-Step Engine</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-4 text-sm">Legal & Compliance</h4>
              <ul className="space-y-3 text-xs text-slate-400">
                <li><button onClick={() => setSelectedLegal('Privacy Policy')} className="hover:text-white transition-colors">Privacy Policy (DPDPA 2023)</button></li>
                <li><button onClick={() => setSelectedLegal('Terms of Service')} className="hover:text-white transition-colors">Terms of Service</button></li>
                <li><button onClick={() => setSelectedLegal('Privacy Policy')} className="hover:text-white transition-colors">Data Protection Officer</button></li>
                <li><button onClick={() => setShowContactForm(true)} className="hover:text-white transition-colors">Grievance Redressal</button></li>
              </ul>
            </div>

          </div>

          <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 text-center">
            <p>© 2026 RYL Neuroacademy Pvt Ltd. All rights reserved.</p>
            <p>DISHA School Diagnostic Engine™ — Version 3.0 Production Edition</p>
          </div>
        </div>
      </footer>

      {/* Floating AI Assistant */}
      <SaathiChatbot />
    </div>
  );
};
