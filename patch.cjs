const fs = require('fs');
let code = fs.readFileSync('src/pages/LandingPage.tsx', 'utf8');

const importReplacement = `import React, { useState } from 'react';
import { ArrowRight, Activity, Users, Settings, Database, LineChart, Target, Heart, CheckCircle2, MessageSquare, Briefcase, Star, Rocket, Zap, ShieldCheck, ChevronRight, X } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';`;

code = code.replace(
  `import React, { useState } from 'react';\nimport { ArrowRight, Activity, Users, Settings, Database, LineChart, Target, Heart, CheckCircle2, MessageSquare, Briefcase, Star, Rocket, Zap, ShieldCheck, ChevronRight, X } from 'lucide-react';`,
  importReplacement
);

const stateReplacement = `  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);
  const [selectedLegal, setSelectedLegal] = useState<string | null>(null);
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactData, setContactData] = useState({
    name: '',
    email: '',
    phone: '',
    schoolName: '',
    role: 'Principal',
    students: '100-500',
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
      setContactStatus('success');
      setTimeout(() => {
        setShowContactForm(false);
        setContactStatus('idle');
        setContactData({ name: '', email: '', phone: '', schoolName: '', role: 'Principal', students: '100-500', message: '' });
      }, 3000);
    } catch (error) {
      console.error('Error submitting contact form:', error);
      setContactStatus('error');
    }
  };`;

code = code.replace(
  `  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);\n  const [selectedLegal, setSelectedLegal] = useState<string | null>(null);`,
  stateReplacement
);

const modalReplacement = `      {/* Contact Modal */}
      {showContactForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto py-10">
          <div className="bg-[#2A1B4E] border border-white/10 rounded-2xl p-8 max-w-2xl w-full relative shadow-2xl my-auto">
            <button 
              onClick={() => setShowContactForm(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <h3 className="text-3xl font-bold text-white mb-2">Request a Demo</h3>
            <p className="text-slate-400 mb-8">Fill out the form below and our team will get back to you shortly to schedule a personalized demo for your school.</p>
            
            {contactStatus === 'success' ? (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-6 rounded-xl text-center">
                <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                </div>
                <h4 className="text-xl font-bold mb-2">Request Submitted!</h4>
                <p>Thank you for your interest. We will contact you soon.</p>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Full Name</label>
                    <input required value={contactData.name} onChange={(e) => setContactData({...contactData, name: e.target.value})} type="text" className="w-full bg-[#1F1135] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="John Doe" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Work Email</label>
                    <input required value={contactData.email} onChange={(e) => setContactData({...contactData, email: e.target.value})} type="email" className="w-full bg-[#1F1135] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="john@school.edu" />
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Phone Number</label>
                    <input required value={contactData.phone} onChange={(e) => setContactData({...contactData, phone: e.target.value})} type="tel" className="w-full bg-[#1F1135] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="+91 98765 43210" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">School Name</label>
                    <input required value={contactData.schoolName} onChange={(e) => setContactData({...contactData, schoolName: e.target.value})} type="text" className="w-full bg-[#1F1135] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Delhi Public School" />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Your Role</label>
                    <select value={contactData.role} onChange={(e) => setContactData({...contactData, role: e.target.value})} className="w-full bg-[#1F1135] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none">
                      <option>Principal / Director</option>
                      <option>School Owner / Trustee</option>
                      <option>Administrator</option>
                      <option>Teacher / Coordinator</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Number of Students</label>
                    <select value={contactData.students} onChange={(e) => setContactData({...contactData, students: e.target.value})} className="w-full bg-[#1F1135] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none">
                      <option>Less than 100</option>
                      <option>100 - 500</option>
                      <option>500 - 1000</option>
                      <option>1000 - 2000</option>
                      <option>More than 2000</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Additional Requirements / Message</label>
                  <textarea value={contactData.message} onChange={(e) => setContactData({...contactData, message: e.target.value})} rows={3} className="w-full bg-[#1F1135] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="How can we help your school?"></textarea>
                </div>

                {contactStatus === 'error' && (
                  <p className="text-red-400 text-sm">An error occurred. Please try again.</p>
                )}

                <div className="pt-4">
                  <button 
                    type="submit" 
                    disabled={contactStatus === 'submitting'}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white px-6 py-3.5 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {contactStatus === 'submitting' ? 'Submitting...' : 'Submit Request'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Feature Modal */}`;

code = code.replace(`      {/* Feature Modal */}`, modalReplacement);

// Replace "Request Demo" and "Schedule Demo" onClick behavior
code = code.replace(
  `<button onClick={onLoginClick} className="w-full sm:w-auto bg-transparent border-2 border-white/10 hover:bg-white/5 text-white px-8 py-4 rounded-xl font-bold transition-all active:scale-95 flex items-center justify-center gap-2 text-lg">
                Request Demo
              </button>`,
  `<button onClick={() => setShowContactForm(true)} className="w-full sm:w-auto bg-transparent border-2 border-white/10 hover:bg-white/5 text-white px-8 py-4 rounded-xl font-bold transition-all active:scale-95 flex items-center justify-center gap-2 text-lg">
                Request Demo
              </button>`
);

code = code.replace(
  `<button onClick={onLoginClick} className="bg-transparent border-2 border-white text-white hover:bg-white/10 px-8 py-4 rounded-xl font-bold transition-all active:scale-95 text-lg">
                Schedule Demo
              </button>`,
  `<button onClick={() => setShowContactForm(true)} className="bg-transparent border-2 border-white text-white hover:bg-white/10 px-8 py-4 rounded-xl font-bold transition-all active:scale-95 text-lg">
                Schedule Demo
              </button>`
);

fs.writeFileSync('src/pages/LandingPage.tsx', code);
console.log("Patched!");
