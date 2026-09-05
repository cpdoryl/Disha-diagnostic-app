import { create } from 'zustand';
import { ViewState, School, ChallengeDomain, CommunicationMessage } from './types';

import { collection, getDocs, doc, setDoc, getDoc } from 'firebase/firestore';
import { db, auth } from './lib/firebase';
import { saveSchoolToFirestore, deleteSchoolFromFirestore, fetchSchoolsFromFirestore, findSchoolByName } from './lib/schoolService';

interface AppState {
  currentView: ViewState;
  setCurrentView: (view: ViewState) => void;
  customDomain: string;
  setCustomDomain: (domain: string) => void;
  isAdmin: boolean;
  setIsAdmin: (val: boolean) => void;
  activeSchool: School | null;
  schools: School[];
  setActiveSchool: (school: School | null) => void;
  addSchool: (schoolData: Omit<School, 'id'>) => Promise<School>;
  updateActiveSchool: (updatedData: Partial<School>) => void;
  deleteSchool: (id: string) => void;
  domains: ChallengeDomain[];
  // True whenever `domains` is the MOCK_DOMAINS placeholder rather than real
  // Firestore data - no `domains` collection is ever seeded or Firestore-rule
  // permitted in production today, so this is true for every real user. Lets
  // the UI say so instead of silently presenting fabricated numbers as real.
  isDomainsSample: boolean;
  communications: CommunicationMessage[];
  isLoadingData: boolean;
  fetchData: () => Promise<void>;
  addCommunication: (msg: Omit<CommunicationMessage, 'id'>) => Promise<void>;
}

export const MOCK_DOMAINS: ChallengeDomain[] = [
  { id: 'd1', title: 'Student Retention', description: 'Engagement, attendance, mentor relationships', score: 85, trend: 'flat' },
  { id: 'd2', title: 'Dropout Prevention', description: 'Academic gaps, trend velocity', score: 92, trend: 'up' },
  { id: 'd3', title: 'Teacher Retention', description: 'Tenure, professional development', score: 78, trend: 'down' },
  { id: 'd4', title: 'System Consistency', description: 'Compliance, outcome variance', score: 88, trend: 'up' },
  { id: 'd5', title: 'Academic Performance', description: 'Board results, pedagogy effectiveness', score: 81, trend: 'flat' },
  { id: 'd6', title: 'Parental Satisfaction', description: 'NPS, response times', score: 75, trend: 'down' },
  { id: 'd7', title: 'Emotional Wellbeing', description: 'Wellbeing pulse, support', score: 89, trend: 'up' },
  { id: 'd8', title: 'School Reputation', description: 'Referrals, brand visibility', score: 83, trend: 'up' },
  { id: 'd9', title: 'Competitive Positioning', description: 'Unique offerings, market pos', score: 79, trend: 'flat' },
];

export const MOCK_COMMUNICATIONS: CommunicationMessage[] = [
  { id: 'com1', title: 'Midterm Parent-Teacher Meeting', content: 'Dear parents, the midterm evaluation PTM is scheduled for Saturday, 25th July from 9 AM to 1 PM.', sender: 'Principal Office', timestamp: '2026-07-18T10:00:00Z', recipientGroup: 'All Parents' },
  { id: 'com2', title: 'Annual Sports Day Registrations', content: 'Students can now register for the annual sports events starting from Monday. Contact your PE teacher.', sender: 'Sports Department', timestamp: '2026-07-17T14:30:00Z', recipientGroup: 'All Students' }
];

const loadSavedSchools = (): School[] => {
  try {
    const saved = localStorage.getItem('disha_registered_schools');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Failed to load schools from localStorage', e);
  }
  return [];
};

const loadSavedActiveSchool = (schoolsList: School[]): School | null => {
  try {
    const savedId = localStorage.getItem('disha_active_school_id');
    if (savedId) {
      const match = schoolsList.find(s => s.id === savedId);
      if (match) return match;
    }
  } catch (e) {
    console.error('Failed to load active school from localStorage', e);
  }
  return schoolsList.length > 0 ? schoolsList[0] : null;
};

const initialSchools = loadSavedSchools();
const initialActiveSchool = loadSavedActiveSchool(initialSchools);

export const useAppStore = create<AppState>((set) => ({
  currentView: 'DASHBOARD',
  setCurrentView: (view) => set({ currentView: view }),
  customDomain: typeof localStorage !== 'undefined' ? (localStorage.getItem('disha_custom_domain') || 'disha.rylneuroacademy.com') : 'disha.rylneuroacademy.com',
  setCustomDomain: (domain) => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('disha_custom_domain', domain);
    }
    set({ customDomain: domain });
  },
  isAdmin: false,
  setIsAdmin: (val) => set({ isAdmin: val }),
  activeSchool: initialActiveSchool,
  schools: initialSchools,
  setActiveSchool: (school) => {
    if (school) {
      localStorage.setItem('disha_active_school_id', school.id);
    } else {
      localStorage.removeItem('disha_active_school_id');
    }
    // Persist per-account too, so the active school survives a new device/browser/login
    const uid = auth.currentUser?.uid;
    if (uid) {
      setDoc(doc(db, 'users', uid), { activeSchoolId: school?.id || null }, { merge: true })
        .catch(err => console.error('Failed to persist active school to user profile:', err));
    }
    set({ activeSchool: school });
  },
  addSchool: async (schoolData) => {
    // Reuse an existing school with the same name instead of forking a duplicate
    // that would orphan any assessment data already tied to the original.
    const existing = await findSchoolByName(schoolData.name).catch(() => null);
    const resolvedSchool: School = existing || {
      ...schoolData,
      id: 'sch_' + Date.now(),
    };

    if (!existing) {
      saveSchoolToFirestore(resolvedSchool).catch(err => console.error('Failed to save school to Firestore:', err));
    }

    localStorage.setItem('disha_active_school_id', resolvedSchool.id);
    const uid = auth.currentUser?.uid;
    if (uid) {
      setDoc(doc(db, 'users', uid), { activeSchoolId: resolvedSchool.id }, { merge: true })
        .catch(err => console.error('Failed to persist active school to user profile:', err));
    }

    set((state) => {
      const alreadyPresent = state.schools.some(s => s.id === resolvedSchool.id);
      const updatedSchools = alreadyPresent ? state.schools : [...state.schools, resolvedSchool];
      localStorage.setItem('disha_registered_schools', JSON.stringify(updatedSchools));
      return {
        schools: updatedSchools,
        activeSchool: resolvedSchool,
      };
    });
    return resolvedSchool;
  },
  updateActiveSchool: (updatedData) => {
    set((state) => {
      if (!state.activeSchool) return state;
      const updatedSchool: School = { ...state.activeSchool, ...updatedData };
      const updatedSchools = state.schools.map(s => s.id === updatedSchool.id ? updatedSchool : s);
      localStorage.setItem('disha_registered_schools', JSON.stringify(updatedSchools));

      // Persist to Firestore database
      saveSchoolToFirestore(updatedSchool).catch(err => console.error('Failed to update school in Firestore:', err));

      return {
        activeSchool: updatedSchool,
        schools: updatedSchools,
      };
    });
  },
  deleteSchool: (id) => {
    // Delete from Firestore database
    deleteSchoolFromFirestore(id).catch(err => console.error('Failed to delete school from Firestore:', err));

    set((state) => {
      const updatedSchools = state.schools.filter(s => s.id !== id);
      const nextActive = state.activeSchool?.id === id ? (updatedSchools[0] || null) : state.activeSchool;
      localStorage.setItem('disha_registered_schools', JSON.stringify(updatedSchools));
      if (nextActive) {
        localStorage.setItem('disha_active_school_id', nextActive.id);
      } else {
        localStorage.removeItem('disha_active_school_id');
      }
      return {
        schools: updatedSchools,
        activeSchool: nextActive,
      };
    });
  },
  domains: MOCK_DOMAINS,
  isDomainsSample: true,
  communications: MOCK_COMMUNICATIONS,
  isLoadingData: false,
  fetchData: async () => {
    set({ isLoadingData: true });
    try {
      // Promise.allSettled (not Promise.all): these collections are denied by
      // the Firestore rules for this account, and a single rejection must not
      // take down the schools fetch that the rest of the app depends on to
      // restore activeSchool on a fresh browser/device.
      const [domainsResult, communicationsResult, schoolsResult] = await Promise.allSettled([
        getDocs(collection(db, 'domains')),
        getDocs(collection(db, 'communications')),
        fetchSchoolsFromFirestore(),
      ]);

      const domainsSnap = domainsResult.status === 'fulfilled' ? domainsResult.value : null;
      const communicationsSnap = communicationsResult.status === 'fulfilled' ? communicationsResult.value : null;
      const fetchedSchools = schoolsResult.status === 'fulfilled' ? schoolsResult.value : [];

      if (schoolsResult.status === 'rejected') {
        console.error('Failed to fetch schools:', schoolsResult.reason);
      }

      // Fall back to the account's remembered active school (Firestore) when this
      // device/browser has no local record of it — e.g. a fresh login elsewhere.
      let remoteActiveSchoolId: string | null = null;
      const uid = auth.currentUser?.uid;
      if (uid && !localStorage.getItem('disha_active_school_id')) {
        try {
          const userSnap = await getDoc(doc(db, 'users', uid));
          remoteActiveSchoolId = userSnap.exists() ? (userSnap.data().activeSchoolId || null) : null;
        } catch (err) {
          console.error('Failed to load active school from user profile:', err);
        }
      }

      set(state => {
        let mergedSchools = state.schools;
        if (fetchedSchools && fetchedSchools.length > 0) {
          // Merge or replace schools with Firestore registered schools
          const schoolMap = new Map<string, School>();
          state.schools.forEach(s => schoolMap.set(s.id, s));
          fetchedSchools.forEach(s => schoolMap.set(s.id, s));
          mergedSchools = Array.from(schoolMap.values());
        }

        const savedActiveId = localStorage.getItem('disha_active_school_id') || remoteActiveSchoolId;
        let currentActive = state.activeSchool;
        if (savedActiveId && mergedSchools.length > 0) {
          const match = mergedSchools.find(s => s.id === savedActiveId);
          if (match) currentActive = match;
        } else if (!currentActive && mergedSchools.length > 0) {
          currentActive = mergedSchools[0];
        }

        if (currentActive) {
          localStorage.setItem('disha_active_school_id', currentActive.id);
        }
        localStorage.setItem('disha_registered_schools', JSON.stringify(mergedSchools));

        return {
          domains: domainsSnap && domainsSnap.docs.length > 0 ? domainsSnap.docs.map(d => d.data() as ChallengeDomain) : MOCK_DOMAINS,
          isDomainsSample: !(domainsSnap && domainsSnap.docs.length > 0),
          communications: communicationsSnap && communicationsSnap.docs.length > 0 ? communicationsSnap.docs.map(d => d.data() as CommunicationMessage) : MOCK_COMMUNICATIONS,
          schools: mergedSchools,
          activeSchool: currentActive,
          isLoadingData: false
        };
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      set({ isLoadingData: false });
    }
  },
  addCommunication: async (msgData) => {
    try {
      const docRef = doc(collection(db, 'communications'));
      const newMsg = { ...msgData, id: docRef.id };
      await setDoc(docRef, newMsg);
      set(state => ({ communications: [...state.communications, newMsg] }));
    } catch (error) {
      console.error('Error adding communication:', error);
    }
  }
}));
