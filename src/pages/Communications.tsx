import React, { useState } from 'react';
import { useAppStore } from '../store';
import { Megaphone, Send, Users, UserCheck, Mail, MessageSquare, ShieldAlert } from 'lucide-react';
import { cn } from '../lib/utils';

export const Communications = () => {
  const { communications, addCommunication } = useAppStore();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [recipientGroup, setRecipientGroup] = useState('All Parents');
  const [sender, setSender] = useState('Principal Office');
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    await addCommunication({
      title,
      content,
      sender,
      recipientGroup,
      timestamp: new Date().toISOString()
    });

    // Reset Form
    setTitle('');
    setContent('');
    setIsSent(true);
    setTimeout(() => setIsSent(false), 3000);
  };

  const getRecipientBadgeColor = (group: string) => {
    switch(group) {
      case 'All Parents': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'All Students': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'All Faculty': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">School Communications</h2>
        <p className="text-gray-500 mt-1 font-medium">Broadcast notices, parent announcements, and SMS/Email reminders.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column: Compose */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2 border-b border-gray-50 pb-4">
            <Megaphone className="w-5 h-5 text-blue-600 animate-pulse" />
            Compose Broadcast
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Message Title</label>
              <input 
                type="text" 
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Midterm Results Declaration"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Sender Entity</label>
              <input 
                type="text" 
                required
                value={sender}
                onChange={(e) => setSender(e.target.value)}
                placeholder="e.g. Office of the Principal"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Target Recipient Group</label>
              <select 
                value={recipientGroup}
                onChange={(e) => setRecipientGroup(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-bold"
              >
                <option value="All Parents">Parents & Guardians</option>
                <option value="All Students">All Enrolled Students</option>
                <option value="All Faculty">Teaching Staff & Faculty</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Message Body</label>
              <textarea 
                required
                rows={5}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write the message details here..."
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
              />
            </div>

            <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
              {isSent ? (
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-lg animate-fade-in">
                  Sent Successfully!
                </span>
              ) : (
                <div />
              )}
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)] flex items-center gap-2 text-sm"
              >
                <Send className="w-4 h-4" />
                Send Broadcast
              </button>
            </div>
          </form>
        </div>

        {/* Right 2 Columns: Sent messages log */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-indigo-500" />
              Outgoing Broadcast Log
            </h3>

            <div className="space-y-4 max-h-[560px] overflow-y-auto pr-1">
              {communications.length > 0 ? (
                [...communications].reverse().map((msg) => (
                  <div key={msg.id} className="p-5 border border-gray-100 rounded-2xl bg-gray-50/50 hover:bg-white hover:shadow-md transition-all space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <h4 className="font-bold text-gray-900 text-lg">{msg.title}</h4>
                      <span className={cn(
                        "text-xs font-bold px-2.5 py-1 rounded-full border shrink-0 text-center",
                        getRecipientBadgeColor(msg.recipientGroup)
                      )}>
                        {msg.recipientGroup}
                      </span>
                    </div>

                    <p className="text-gray-700 text-sm leading-relaxed font-medium">{msg.content}</p>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400 font-bold border-t border-gray-50 pt-3">
                      <span>Sender: <span className="text-gray-600 font-black">{msg.sender}</span></span>
                      <span>&bull;</span>
                      <span>{new Date(msg.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-400 py-10 font-medium">No outgoing messages logged yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
