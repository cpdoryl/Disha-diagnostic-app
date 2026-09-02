import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store';
import { School } from '../types';
import { Building2, X, Plus, Check, Shield, MapPin, Award, Users, CreditCard, Mail, Phone, Home } from 'lucide-react';

interface SchoolRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  editSchool?: School | null;
}

export const SchoolRegisterModal: React.FC<SchoolRegisterModalProps> = ({ isOpen, onClose, editSchool }) => {
  const { addSchool, updateActiveSchool } = useAppStore();

  const [name, setName] = useState('');
  const [schoolCode, setSchoolCode] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [board, setBoard] = useState('CBSE');
  const [schoolType, setSchoolType] = useState('Private');
  const [tier, setTier] = useState('Tier 2 (Capital / Large Cities)');
  const [feeBand, setFeeBand] = useState('Mid-tier (₹25k - ₹75k per year)');
  const [studentCount, setStudentCount] = useState('Medium (500 - 1500 students)');
  const [principalName, setPrincipalName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (editSchool) {
      setName(editSchool.name || '');
      setSchoolCode(editSchool.schoolCode || '');
      setCity(editSchool.city || '');
      setState(editSchool.state || '');
      setBoard(editSchool.board || 'CBSE');
      setSchoolType(editSchool.schoolType || 'Private');
      setTier(editSchool.tier || 'Tier 2 (Capital / Large Cities)');
      setFeeBand(editSchool.feeBand || 'Mid-tier (₹25k - ₹75k per year)');
      setStudentCount(editSchool.studentCount || 'Medium (500 - 1500 students)');
      setPrincipalName(editSchool.principalName || '');
      setContactEmail(editSchool.contactEmail || '');
      setContactPhone(editSchool.contactPhone || '');
      setAddress(editSchool.address || '');
    } else {
      setName('');
      setSchoolCode('');
      setCity('');
      setState('');
      setBoard('CBSE');
      setSchoolType('Private');
      setTier('Tier 2 (Capital / Large Cities)');
      setFeeBand('Mid-tier (₹25k - ₹75k per year)');
      setStudentCount('Medium (500 - 1500 students)');
      setPrincipalName('');
      setContactEmail('');
      setContactPhone('');
      setAddress('');
    }
    setError('');
  }, [editSchool, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter the official school name.');
      return;
    }
    if (!city.trim()) {
      setError('Please enter the city or location.');
      return;
    }

    const schoolPayload = {
      name: name.trim(),
      schoolCode: schoolCode.trim(),
      city: city.trim(),
      state: state.trim(),
      board,
      schoolType,
      tier,
      feeBand,
      studentCount,
      principalName: principalName.trim(),
      contactEmail: contactEmail.trim(),
      contactPhone: contactPhone.trim(),
      address: address.trim(),
    };

    if (editSchool) {
      updateActiveSchool(schoolPayload);
    } else {
      await addSchool(schoolPayload);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold tracking-tight">
                {editSchool ? 'Edit Active School Profile' : 'Register Actual School Details'}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {editSchool ? 'Update operational metadata for your institution' : 'Add your school details to personalize diagnostic engine models'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-lg flex items-center gap-2">
              <span>{error}</span>
            </div>
          )}

          {/* Basic Details */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Building2 className="w-3.5 h-3.5 text-blue-600" /> Basic Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  School Official Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. St. Xavier Senior Secondary School"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">School Code / ID</label>
                <input
                  type="text"
                  placeholder="e.g. SCH-2026-001"
                  value={schoolCode}
                  onChange={(e) => setSchoolCode(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  City / District <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="e.g. Jaipur / Lucknow"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">State / Province</label>
                <input
                  type="text"
                  placeholder="e.g. Maharashtra, Karnataka"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Board / Affiliation</label>
                <div className="relative">
                  <Award className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <select
                    value={board}
                    onChange={(e) => setBoard(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium bg-white"
                  >
                    <option value="CBSE">CBSE (Central Board)</option>
                    <option value="ICSE">ICSE / CISCE</option>
                    <option value="State Board">State Board</option>
                    <option value="IB">IB (International Baccalaureate)</option>
                    <option value="Cambridge / IGCSE">Cambridge / IGCSE</option>
                    <option value="Other">Other Affiliation</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">School Type</label>
                <select
                  value={schoolType}
                  onChange={(e) => setSchoolType(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium bg-white"
                >
                  <option value="Private">Private</option>
                  <option value="Public">Public</option>
                  <option value="Charter">Charter</option>
                  <option value="International">International</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Operational Demographics */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Users className="w-3.5 h-3.5 text-blue-600" /> Operational & Demographics Profile
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">City Tier</label>
                <select
                  value={tier}
                  onChange={(e) => setTier(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium bg-white"
                >
                  <option value="Tier 1 (Metros)">Tier 1 (Metros)</option>
                  <option value="Tier 2 (Capital / Large Cities)">Tier 2 (Capital / Large Cities)</option>
                  <option value="Tier 3 & Rural">Tier 3 & Rural</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Fee Band</label>
                <select
                  value={feeBand}
                  onChange={(e) => setFeeBand(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium bg-white"
                >
                  <option value="Budget (< ₹25k per year)">Budget (&lt; ₹25k / year)</option>
                  <option value="Mid-tier (₹25k - ₹75k per year)">Mid-tier (₹25k - ₹75k / year)</option>
                  <option value="Premium (> ₹75k per year)">Premium (&gt; ₹75k / year)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Student Strength</label>
                <select
                  value={studentCount}
                  onChange={(e) => setStudentCount(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium bg-white"
                >
                  <option value="Small (< 500 students)">Small (&lt; 500 students)</option>
                  <option value="Medium (500 - 1500 students)">Medium (500 - 1,500 students)</option>
                  <option value="Large (1500+ students)">Large (1,500+ students)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Contact & Administrative Details (Optional) */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-blue-600" /> Administrative Contact (Optional)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Principal / Administrator Name</label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Sunita Sharma"
                  value={principalName}
                  onChange={(e) => setPrincipalName(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Official Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="email"
                    placeholder="e.g. principal@school.edu.in"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Contact Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="tel"
                    placeholder="e.g. +91-98920-73660"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">School Address / Campus Details</label>
                <div className="relative">
                  <Home className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="e.g. Sector 12, Civil Lines, Jaipur, Rajasthan"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-sm font-bold hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-lg shadow-blue-600/25 transition-all flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              {editSchool ? 'Save Changes' : 'Register & Set as Active'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
