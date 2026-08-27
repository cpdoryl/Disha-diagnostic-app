import React, { useState } from 'react';
import { useAppStore } from '../../store';
import { LayoutDashboard, Target, BarChart2, Activity, Settings, LogOut, Menu, X, GraduationCap, Users, CheckSquare, Megaphone, HeartPulse, Plus, Building2, Edit3, Trash2, ChevronDown, Download, FileArchive, FileText, Sliders } from 'lucide-react';
import { cn } from '../../lib/utils';
import { ViewState, School } from '../../types';
import { auth } from '../../lib/firebase';
import { signOut } from 'firebase/auth';
import { SaathiChatbot } from '../SaathiChatbot';
import { SchoolRegisterModal } from '../SchoolRegisterModal';
import { downloadAllSampleDataAsZIP } from '../../lib/downloadSampleZip';
import { generateUserGuidePDF } from '../../lib/generateGuidePdf';

export const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const { currentView, setCurrentView, activeSchool, schools, setActiveSchool, deleteSchool, isLoadingData, isAdmin } = useAppStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [editingSchool, setEditingSchool] = useState<School | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleSignOut = () => {
    signOut(auth);
  };

  const handleOpenAddModal = () => {
    setEditingSchool(null);
    setIsRegisterModalOpen(true);
    setIsDropdownOpen(false);
  };

  const handleOpenEditModal = (e: React.MouseEvent, school: School) => {
    e.stopPropagation();
    setEditingSchool(school);
    setIsRegisterModalOpen(true);
    setIsDropdownOpen(false);
  };

  const handleDeleteSchool = (e: React.MouseEvent, schoolId: string) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to remove this school profile?')) {
      deleteSchool(schoolId);
    }
  };

  const navigation: { name: string; view: ViewState; icon: React.ElementType; stage?: string }[] = [
    { name: 'Dashboard', view: 'DASHBOARD', icon: LayoutDashboard },
    ...(isAdmin ? [{ name: 'Admin', view: 'ADMIN' as ViewState, icon: Users }] : []),
    { name: 'Disha Checkup', view: 'CHECKUP', icon: HeartPulse, stage: 'ANNUAL HEALTH CHECKUP' },
    { name: '14D Assessment', view: '14D_ASSESSMENT' as ViewState, icon: Target, stage: 'MULTILATERAL DIAGNOSTIC' },
    { name: 'Compare (Diagnose)', view: 'COMPARE', icon: BarChart2, stage: 'STAGE 2: BENCHMARK' },
    { name: 'Simulate (Model)', view: 'SIMULATE', icon: Activity, stage: 'STAGE 3: STRATEGIZE' },
    { name: 'Reverse Simulation', view: 'REVERSE_SIMULATION' as ViewState, icon: Sliders, stage: 'STAGE 3: STRATEGIZE' },
    { name: 'Synthesize (Report)', view: 'SYNTHESIZE', icon: FileText, stage: 'STAGE 4: SYNTHESIZE' },
    { name: 'Monitoring', view: 'MONITORING', icon: Settings },
  ];

  const handleNavClick = (view: ViewState) => {
    setCurrentView(view);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 flex flex-col",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">D</span>
              </div>
              DISHA <span className="text-blue-500 text-sm">v2.0</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-semibold">Diagnostic Engine</p>
          </div>
          <button className="lg:hidden" onClick={() => setIsMobileMenuOpen(false)}>
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        {/* Active School Section */}
        <div className="px-6 py-4 border-t border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] text-slate-400 uppercase tracking-wider font-bold">Active School Profile</p>
            {activeSchool && (
              <button 
                onClick={(e) => handleOpenEditModal(e, activeSchool)}
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 hover:underline font-semibold"
                title="Edit active school details"
              >
                <Edit3 className="w-3 h-3" /> Edit
              </button>
            )}
          </div>

          {activeSchool ? (
            <div className="relative">
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full text-left bg-slate-800 rounded-xl p-3 hover:bg-slate-750 transition-colors flex justify-between items-center border border-slate-700/60"
              >
                <div className="min-w-0 pr-2">
                  <p className="font-bold text-sm text-white truncate" title={activeSchool.name}>
                    {activeSchool.name}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5 truncate">
                    {activeSchool.city} &bull; {activeSchool.board}
                  </p>
                </div>
                <ChevronDown className={cn("w-4 h-4 text-slate-400 shrink-0 transition-transform", isDropdownOpen ? "rotate-180" : "")} />
              </button>

              {isDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden text-sm animate-in fade-in zoom-in-95 duration-150">
                  <div className="max-h-48 overflow-y-auto divide-y divide-slate-700/50">
                    {schools.map((school) => (
                      <div 
                        key={school.id}
                        onClick={() => {
                          setActiveSchool(school);
                          setIsDropdownOpen(false);
                        }}
                        className={cn(
                          "p-3 hover:bg-slate-700/70 transition-colors cursor-pointer flex items-center justify-between group",
                          activeSchool?.id === school.id ? "bg-blue-900/40 border-l-2 border-blue-500" : ""
                        )}
                      >
                        <div className="min-w-0 pr-2">
                          <p className="font-bold text-white truncate text-xs">{school.name}</p>
                          <p className="text-[11px] text-slate-400 truncate">{school.city} &bull; {school.board}</p>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={(e) => handleOpenEditModal(e, school)}
                            className="p-1 text-slate-400 hover:text-white hover:bg-slate-600 rounded"
                            title="Edit"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                          {schools.length > 1 && (
                            <button 
                              onClick={(e) => handleDeleteSchool(e, school.id)}
                              className="p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-600 rounded"
                              title="Delete"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <button 
                    onClick={handleOpenAddModal}
                    className="w-full text-left p-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 transition-colors border-t border-slate-700"
                  >
                    <Plus className="w-4 h-4" /> Add Another Actual School
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button 
              onClick={handleOpenAddModal}
              className="w-full text-left bg-blue-600 hover:bg-blue-700 text-white rounded-xl p-3.5 transition-all flex items-center justify-between shadow-lg shadow-blue-600/20 group"
            >
              <div className="flex items-center gap-2.5">
                <Building2 className="w-4 h-4" />
                <span className="font-bold text-xs">Register Actual School</span>
              </div>
              <Plus className="w-4 h-4 text-blue-200 group-hover:rotate-90 transition-transform" />
            </button>
          )}
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
          {navigation.map((item) => (
            <div key={item.name}>
              {item.stage && (
                <p className="px-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-6 mb-2">
                  {item.stage}
                </p>
              )}
              <button
                onClick={() => handleNavClick(item.view)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                  currentView === item.view
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                )}
              >
                <item.icon className={cn("w-5 h-5", currentView === item.view ? "text-white" : "text-slate-400")} />
                {item.name}
              </button>
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-2">
          <button
            onClick={() => generateUserGuidePDF(activeSchool?.name)}
            className="flex items-center gap-3 px-4 py-2.5 text-xs font-bold rounded-xl text-blue-300 hover:text-white bg-blue-950/60 hover:bg-blue-900/80 border border-blue-800/50 w-full transition-all shadow-sm cursor-pointer"
          >
            <Download className="w-4 h-4 text-blue-400" />
            User Manual PDF
          </button>
          <button onClick={handleSignOut} className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 w-full transition-colors cursor-pointer">
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">D</span>
            </div>
            <span className="font-bold">DISHA</span>
          </div>
          <button onClick={() => setIsMobileMenuOpen(true)}>
            <Menu className="w-6 h-6 text-gray-600" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-50/50">
          <div className="max-w-7xl mx-auto space-y-6">
            
            {!activeSchool && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 md:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm animate-in fade-in">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-amber-500 text-white rounded-xl shadow-md shrink-0">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-amber-900">No Active School Selected</h3>
                    <p className="text-xs text-amber-700 mt-0.5">Register your school with actual operational details (board, city tier, student count) to calibrate diagnostic algorithms.</p>
                  </div>
                </div>
                <button
                  onClick={handleOpenAddModal}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors shrink-0 flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Register Actual School
                </button>
              </div>
            )}
            {isLoadingData ? (
              <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
                <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                <p className="text-gray-500 font-medium animate-pulse">Syncing diagnostic data...</p>
              </div>
            ) : (
              children
            )}
          </div>
        </div>
      </main>
      <SaathiChatbot />
      <SchoolRegisterModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        editSchool={editingSchool}
      />
    </div>
  );
};
