import React, { useEffect, useMemo, useState } from 'react';
import { collection, deleteDoc, doc, getDocs, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { School } from '../types';
import { fetchSchoolsFromFirestore, saveSchoolToFirestore, deleteSchoolFromFirestore } from '../lib/schoolService';
import {
  CheckCircle, XCircle, Trash2, Search, Users, Building2, LayoutGrid,
  ClipboardList, Pencil, X, Save,
} from 'lucide-react';

interface AdminUser {
  id: string;
  email?: string;
  role?: string;
  isApproved?: boolean;
  createdAt?: string;
  activeSchoolId?: string;
}

const ROLE_OPTIONS = ['admin', 'school_owner', 'demo', 'teacher', 'principal', 'parent', 'student'];

type Tab = 'overview' | 'users' | 'schools';
type UserFilter = 'all' | 'pending' | 'approved';

export const Admin = () => {
  const [tab, setTab] = useState<Tab>('overview');

  // Users state
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [userFilter, setUserFilter] = useState<UserFilter>('all');

  // Schools state
  const [schools, setSchools] = useState<School[]>([]);
  const [schoolsLoading, setSchoolsLoading] = useState(true);
  const [schoolsError, setSchoolsError] = useState('');
  const [schoolSearch, setSchoolSearch] = useState('');
  const [editingSchool, setEditingSchool] = useState<School | null>(null);

  // Assessment count (for Overview)
  const [assessmentCount, setAssessmentCount] = useState<number | null>(null);

  const fetchUsers = async () => {
    setUsersLoading(true);
    setUsersError('');
    try {
      const snapshot = await getDocs(collection(db, 'users'));
      setUsers(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as AdminUser)));
    } catch (err: any) {
      console.error('Failed to fetch users', err);
      setUsersError('Could not load users. You may not have admin permissions on this account yet.');
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchSchools = async () => {
    setSchoolsLoading(true);
    setSchoolsError('');
    try {
      const list = await fetchSchoolsFromFirestore();
      setSchools(list);
    } catch (err: any) {
      console.error('Failed to fetch schools', err);
      setSchoolsError('Could not load schools.');
    } finally {
      setSchoolsLoading(false);
    }
  };

  const fetchAssessmentCount = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'assessments'));
      setAssessmentCount(snapshot.size);
    } catch (err) {
      console.error('Failed to fetch assessment count', err);
      setAssessmentCount(null);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchSchools();
    fetchAssessmentCount();
  }, []);

  const toggleApproval = async (userId: string, currentStatus: boolean | undefined) => {
    try {
      await updateDoc(doc(db, 'users', userId), { isApproved: !currentStatus });
      await fetchUsers();
    } catch (err) {
      console.error('Failed to update user approval', err);
      alert('Failed to update approval status. Check the browser console for details.');
    }
  };

  const changeRole = async (userId: string, role: string) => {
    try {
      await updateDoc(doc(db, 'users', userId), { role });
      await fetchUsers();
    } catch (err) {
      console.error('Failed to update user role', err);
      alert('Failed to update role. Check the browser console for details.');
    }
  };

  const deleteUser = async (userId: string, email?: string) => {
    if (!window.confirm(`Delete the user record for ${email || userId}? This only removes their app profile (approval status, role) - it does not delete their Firebase Auth sign-in, so they could sign up again as a new pending user.`)) {
      return;
    }
    try {
      await deleteDoc(doc(db, 'users', userId));
      await fetchUsers();
    } catch (err) {
      console.error('Failed to delete user', err);
      alert('Failed to delete user. Check the browser console for details.');
    }
  };

  const deleteSchool = async (school: School) => {
    if (!window.confirm(`Delete "${school.name}"? This does not delete its assessments/checkups/reports - only the school registration itself.`)) {
      return;
    }
    try {
      await deleteSchoolFromFirestore(school.id);
      await fetchSchools();
    } catch (err) {
      console.error('Failed to delete school', err);
      alert('Failed to delete school. Check the browser console for details.');
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (userFilter === 'pending' && u.isApproved) return false;
      if (userFilter === 'approved' && !u.isApproved) return false;
      if (userSearch.trim()) {
        const q = userSearch.trim().toLowerCase();
        return (u.email || '').toLowerCase().includes(q) || (u.role || '').toLowerCase().includes(q);
      }
      return true;
    });
  }, [users, userFilter, userSearch]);

  const filteredSchools = useMemo(() => {
    if (!schoolSearch.trim()) return schools;
    const q = schoolSearch.trim().toLowerCase();
    return schools.filter((s) =>
      s.name.toLowerCase().includes(q) || s.city.toLowerCase().includes(q) || (s.board || '').toLowerCase().includes(q)
    );
  }, [schools, schoolSearch]);

  const pendingCount = users.filter((u) => !u.isApproved).length;

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'overview', label: 'Overview', icon: <LayoutGrid className="w-4 h-4" /> },
    { key: 'users', label: 'Users', icon: <Users className="w-4 h-4" /> },
    { key: 'schools', label: 'Schools', icon: <Building2 className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">Admin Console</h2>
        <p className="text-gray-500 mt-1 font-medium">User approvals, school management, and platform overview.</p>
      </div>

      <div className="flex items-center gap-2 border-b border-gray-200">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-t-lg transition-colors ${
              tab === t.key
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.icon}
            {t.label}
            {t.key === 'users' && pendingCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 text-amber-700">
                {pendingCount} pending
              </span>
            )}
          </button>
        ))}
      </div>

      {(usersError || schoolsError) && tab !== 'overview' && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-800">
          {usersError || schoolsError}
        </div>
      )}

      {tab === 'overview' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard icon={<Users className="w-5 h-5" />} color="blue" label="Total Users" value={usersLoading ? '…' : users.length} />
          <StatCard icon={<ClipboardList className="w-5 h-5" />} color="amber" label="Pending Approvals" value={usersLoading ? '…' : pendingCount} />
          <StatCard icon={<Building2 className="w-5 h-5" />} color="emerald" label="Total Schools" value={schoolsLoading ? '…' : schools.length} />
          <StatCard icon={<LayoutGrid className="w-5 h-5" />} color="violet" label="Assessment Events" value={assessmentCount === null ? '…' : assessmentCount} />
        </div>
      )}

      {tab === 'users' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
              <input
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search by email or role..."
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 w-fit">
              {(['all', 'pending', 'approved'] as UserFilter[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setUserFilter(f)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-md capitalize transition-colors ${
                    userFilter === f ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {usersLoading ? (
            <div className="p-8 text-center text-gray-500 text-sm">Loading users...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50/50">
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">{u.email || u.id}</td>
                      <td className="px-6 py-4 text-sm">
                        <select
                          value={u.role || ''}
                          onChange={(e) => changeRole(u.id, e.target.value)}
                          className="text-xs font-bold rounded-md border border-gray-300 px-2 py-1 bg-white"
                        >
                          {!ROLE_OPTIONS.includes(u.role || '') && u.role && (
                            <option value={u.role}>{u.role}</option>
                          )}
                          {ROLE_OPTIONS.map((r) => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {u.isApproved ? (
                          <span className="px-2 py-1 text-xs font-bold rounded-full bg-emerald-100 text-emerald-700">Approved</span>
                        ) : (
                          <span className="px-2 py-1 text-xs font-bold rounded-full bg-amber-100 text-amber-700">Pending</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => toggleApproval(u.id, u.isApproved)}
                            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${
                              u.isApproved ? 'text-red-700 bg-red-100 hover:bg-red-200' : 'text-emerald-700 bg-emerald-100 hover:bg-emerald-200'
                            }`}
                          >
                            {u.isApproved ? <><XCircle className="w-3.5 h-3.5" /> Revoke</> : <><CheckCircle className="w-3.5 h-3.5" /> Approve</>}
                          </button>
                          <button
                            onClick={() => deleteUser(u.id, u.email)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">
                        No users match this view.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === 'schools' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="p-4 border-b border-gray-100">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
              <input
                value={schoolSearch}
                onChange={(e) => setSchoolSearch(e.target.value)}
                placeholder="Search by name, city, or board..."
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          {schoolsLoading ? (
            <div className="p-8 text-center text-gray-500 text-sm">Loading schools...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">City</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Board</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Tier</th>
                    <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredSchools.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50/50">
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">{s.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{s.city}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{s.board}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{s.tier}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setEditingSchool(s)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-bold text-blue-700 bg-blue-100 hover:bg-blue-200 transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" /> Edit
                          </button>
                          <button
                            onClick={() => deleteSchool(s)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-bold text-red-700 bg-red-100 hover:bg-red-200 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredSchools.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">
                        No schools match this search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {editingSchool && (
        <AdminSchoolEditModal
          school={editingSchool}
          onClose={() => setEditingSchool(null)}
          onSaved={() => {
            setEditingSchool(null);
            fetchSchools();
          }}
        />
      )}
    </div>
  );
};

const STAT_COLORS: Record<string, string> = {
  blue: 'bg-blue-100 text-blue-600',
  amber: 'bg-amber-100 text-amber-600',
  emerald: 'bg-emerald-100 text-emerald-600',
  violet: 'bg-violet-100 text-violet-600',
};

function StatCard({ icon, color, label, value }: { icon: React.ReactNode; color: string; label: string; value: React.ReactNode }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${STAT_COLORS[color]}`}>
        {icon}
      </div>
      <p className="text-3xl font-black text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 font-semibold mt-1">{label}</p>
    </div>
  );
}

// Admin editing an arbitrary school in the list writes straight to Firestore
// by that school's own id - it must NOT go through store.ts's
// updateActiveSchool(), which always edits whichever school happens to be
// active in the admin's own sidebar regardless of which one is being edited.
function AdminSchoolEditModal({ school, onClose, onSaved }: { school: School; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState<School>(school);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (field: keyof School) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSave = async () => {
    if (!form.name.trim() || !form.city.trim()) {
      setError('Name and city are required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await saveSchoolToFirestore(form);
      onSaved();
    } catch (err) {
      console.error('Failed to save school', err);
      setError('Failed to save. Check the browser console for details.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <h3 className="text-lg font-extrabold">Edit School</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {error && <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-lg">{error}</div>}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">School Name *</label>
            <input value={form.name} onChange={set('name')} className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">City *</label>
              <input value={form.city} onChange={set('city')} className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">State</label>
              <input value={form.state || ''} onChange={set('state')} className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Board</label>
              <input value={form.board} onChange={set('board')} className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tier</label>
              <input value={form.tier} onChange={set('tier')} className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Principal Name</label>
            <input value={form.principalName || ''} onChange={set('principalName')} className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Contact Email</label>
              <input value={form.contactEmail || ''} onChange={set('contactEmail')} className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Contact Phone</label>
              <input value={form.contactPhone || ''} onChange={set('contactPhone')} className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300" />
            </div>
          </div>
        </div>
        <div className="p-4 border-t border-slate-100 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2 disabled:opacity-60"
          >
            <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
