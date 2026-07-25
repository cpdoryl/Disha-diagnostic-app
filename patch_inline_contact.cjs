const fs = require('fs');
let code = fs.readFileSync('src/pages/LandingPage.tsx', 'utf8');

const footerStart = `      {/* Footer */}
      <footer id="contact" className="bg-[#110920] pt-20 pb-10 border-t border-white/5">`;

const contactSection = `      {/* Contact Section */}
      <section id="contact" className="py-24 bg-[#1A1032]">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto bg-[#2A1B4E] rounded-3xl p-8 lg:p-12 border border-white/5 shadow-2xl">
            <div className="text-center mb-10">
              <h2 className="text-4xl font-bold text-white mb-4">Get in Touch</h2>
              <p className="text-lg text-slate-400">Have questions or want to see Disha in action? We'd love to hear from you.</p>
            </div>
            
            {contactStatus === 'success' ? (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-8 rounded-xl text-center">
                <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                </div>
                <h4 className="text-2xl font-bold mb-2">Message Sent!</h4>
                <p className="text-emerald-300">Thank you for reaching out. Our team will get back to you shortly.</p>
                <button 
                  onClick={() => setContactStatus('idle')}
                  className="mt-6 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
                    <input required value={contactData.name} onChange={(e) => setContactData({...contactData, name: e.target.value})} type="text" className="w-full bg-[#1F1135] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Your Name" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Work Email</label>
                    <input required value={contactData.email} onChange={(e) => setContactData({...contactData, email: e.target.value})} type="email" className="w-full bg-[#1F1135] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="email@school.edu" />
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Phone Number</label>
                    <input required value={contactData.phone} onChange={(e) => setContactData({...contactData, phone: e.target.value})} type="tel" className="w-full bg-[#1F1135] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="+91 98765 43210" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">School Name</label>
                    <input required value={contactData.schoolName} onChange={(e) => setContactData({...contactData, schoolName: e.target.value})} type="text" className="w-full bg-[#1F1135] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Your School Name" />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Your Role</label>
                    <select value={contactData.role} onChange={(e) => setContactData({...contactData, role: e.target.value})} className="w-full bg-[#1F1135] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none">
                      <option>Principal / Director</option>
                      <option>School Owner / Trustee</option>
                      <option>Administrator</option>
                      <option>Teacher / Coordinator</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Number of Students</label>
                    <select value={contactData.students} onChange={(e) => setContactData({...contactData, students: e.target.value})} className="w-full bg-[#1F1135] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none">
                      <option>Less than 100</option>
                      <option>100 - 500</option>
                      <option>500 - 1000</option>
                      <option>1000 - 2000</option>
                      <option>More than 2000</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Message</label>
                  <textarea value={contactData.message} onChange={(e) => setContactData({...contactData, message: e.target.value})} rows={4} className="w-full bg-[#1F1135] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="How can we help?"></textarea>
                </div>

                {contactStatus === 'error' && (
                  <p className="text-red-400 text-sm text-center">An error occurred. Please try again or email us directly.</p>
                )}

                <div className="pt-2">
                  <button 
                    type="submit" 
                    disabled={contactStatus === 'submitting'}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {contactStatus === 'submitting' ? 'Sending Message...' : 'Send Message'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#110920] pt-20 pb-10 border-t border-white/5">`;

code = code.replace(footerStart, contactSection);

// Update nav link to scroll to contact section
code = code.replace(
  '<a href="#contact" className="hover:text-white transition-colors">Contact</a>',
  '<a href="#contact" className="hover:text-white transition-colors">Contact</a>'
); // Was already pointing to #contact, now #contact is the form instead of footer.

fs.writeFileSync('src/pages/LandingPage.tsx', code);
console.log("Patched contact section");
