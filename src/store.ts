import { create } from 'zustand';
import { ViewState, School, ChallengeDomain, GapPrediction, SimulationModel, Dimension, Student, StaffMember, AttendanceRecord, CommunicationMessage } from './types';

import { collection, getDocs, doc, updateDoc, addDoc, setDoc } from 'firebase/firestore';
import { db } from './lib/firebase';
import { seedDatabase } from './lib/seed';
import { saveSchoolToFirestore, deleteSchoolFromFirestore, fetchSchoolsFromFirestore } from './lib/schoolService';

interface AppState {
  currentView: ViewState;
  setCurrentView: (view: ViewState) => void;
  isAdmin: boolean;
  setIsAdmin: (val: boolean) => void;
  activeSchool: School | null;
  schools: School[];
  setActiveSchool: (school: School | null) => void;
  addSchool: (schoolData: Omit<School, 'id'>) => School;
  updateActiveSchool: (updatedData: Partial<School>) => void;
  deleteSchool: (id: string) => void;
  domains: ChallengeDomain[];
  dimensions: Dimension[];
  gaps: GapPrediction[];
  simulations: SimulationModel[];
  students: Student[];
  staff: StaffMember[];
  attendance: AttendanceRecord[];
  communications: CommunicationMessage[];
  isLoadingData: boolean;
  fetchData: () => Promise<void>;
  updateSimulationTarget: (simId: string, targetValue: number) => Promise<void>;
  addStudent: (student: Omit<Student, 'id'>) => Promise<void>;
  addStaff: (staff: Omit<StaffMember, 'id'>) => Promise<void>;
  addAttendanceRecords: (records: Omit<AttendanceRecord, 'id'>[]) => Promise<void>;
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

export const MOCK_DIMENSIONS: Dimension[] = [
  { id: 'dim1', categoryId: 'c1', categoryName: 'Academic Excellence', name: 'Academic Reputation', score: 82, benchmark: 85 },
  { id: 'dim2', categoryId: 'c1', categoryName: 'Academic Excellence', name: 'Competence of Faculty', score: 78, benchmark: 80 },
  { id: 'dim3', categoryId: 'c1', categoryName: 'Academic Excellence', name: 'Curriculum & Pedagogy', score: 85, benchmark: 82 },
  { id: 'dim4', categoryId: 'c1', categoryName: 'Academic Excellence', name: 'Quality of Alumni', score: 75, benchmark: 78 },
  { id: 'dim5', categoryId: 'c2', categoryName: 'Welfare', name: 'Teacher Welfare', score: 72, benchmark: 75 },
  { id: 'dim6', categoryId: 'c2', categoryName: 'Welfare', name: 'Wellbeing Services', score: 88, benchmark: 80 },
  { id: 'dim7', categoryId: 'c2', categoryName: 'Welfare', name: 'Infrastructure', score: 90, benchmark: 85 },
  { id: 'dim8', categoryId: 'c3', categoryName: 'Individual Attention', name: 'Individual Attention', score: 84, benchmark: 80 },
  { id: 'dim9', categoryId: 'c3', categoryName: 'Individual Attention', name: 'Co-curricular', score: 86, benchmark: 82 },
  { id: 'dim10', categoryId: 'c3', categoryName: 'Individual Attention', name: 'Sports Education', score: 79, benchmark: 85 },
  { id: 'dim11', categoryId: 'c4', categoryName: 'Social Responsibility', name: 'Community Service', score: 81, benchmark: 75 },
  { id: 'dim12', categoryId: 'c4', categoryName: 'Social Responsibility', name: 'Parental Involvement', score: 70, benchmark: 78 },
  { id: 'dim13', categoryId: 'c4', categoryName: 'Social Responsibility', name: 'Leadership Quality', score: 88, benchmark: 85 },
  { id: 'dim14', categoryId: 'c4', categoryName: 'Social Responsibility', name: 'Value for Money', score: 82, benchmark: 80 },
];

export const MOCK_GAPS: GapPrediction[] = [
  {
    id: 'g1',
    domainId: 'd6',
    domainName: 'Parental Satisfaction',
    gapVsStandard: -8,
    gapVsPeer: -12,
    priorityRank: 1,
    rootCause: 'Delayed response to parent queries and lack of structured feedback loops during midterm.',
    recommendation: 'Implement a 24-hour SLA for parent communication and introduce termly pulse surveys.',
  },
  {
    id: 'g2',
    domainId: 'd3',
    domainName: 'Teacher Retention',
    gapVsStandard: -5,
    gapVsPeer: -7,
    priorityRank: 2,
    rootCause: 'High workload in administrative tasks reducing time for lesson planning and personal development.',
    recommendation: 'Automate attendance and fee tracking. Introduce 2 hours of dedicated planning time per week.',
  }
];

export const MOCK_SIMULATIONS: SimulationModel[] = [
  {
    id: 's1',
    targetMetric: 'Board Exam Pass Rate (Grade 10)',
    currentValue: 88,
    targetValue: 95,
    confidenceTier: 'A',
    districtPrecedent: 'St. Xavier High School (2024)',
    requiredChanges: [
      { factor: 'Remedial Class Attendance', current: '65%', required: '90%', impact: 45 },
      { factor: 'Weekly Mock Tests', current: '1', required: '2', impact: 35 },
      { factor: 'Teacher-Student Ratio in Core', current: '1:40', required: '1:30', impact: 20 },
    ]
  }
];

export const MOCK_STUDENTS: Student[] = [
  { id: 'st1', name: 'Aarav Sharma', gradeLevel: 'Grade 10', classSection: 'A', gender: 'Male', attendanceRate: 94, riskProfile: 'Low', academicPerformance: 88 },
  { id: 'st2', name: 'Ananya Iyer', gradeLevel: 'Grade 10', classSection: 'A', gender: 'Female', attendanceRate: 81, riskProfile: 'Medium', academicPerformance: 74 },
  { id: 'st3', name: 'Kabir Verma', gradeLevel: 'Grade 11', classSection: 'B', gender: 'Male', attendanceRate: 65, riskProfile: 'High', academicPerformance: 52 },
  { id: 'st4', name: 'Diya Patel', gradeLevel: 'Grade 12', classSection: 'A', gender: 'Female', attendanceRate: 97, riskProfile: 'Low', academicPerformance: 95 },
  { id: 'st5', name: 'Rohan Gupta', gradeLevel: 'Grade 9', classSection: 'C', gender: 'Male', attendanceRate: 88, riskProfile: 'Low', academicPerformance: 81 }
];

export const MOCK_STAFF: StaffMember[] = [
  { id: 'sf1', name: 'Dr. Suresh Kumar', role: 'Senior Teacher', subject: 'Mathematics', tenureMonths: 48, performanceScore: 92 },
  { id: 'sf2', name: 'Meera Deshmukh', role: 'Teacher', subject: 'Science', tenureMonths: 24, performanceScore: 85 },
  { id: 'sf3', name: 'Amit Trivedi', role: 'Assistant Teacher', subject: 'English', tenureMonths: 8, performanceScore: 78 }
];

export const MOCK_ATTENDANCE: AttendanceRecord[] = [
  { id: 'att1', date: '2026-07-19', studentId: 'st1', studentName: 'Aarav Sharma', status: 'Present' },
  { id: 'att2', date: '2026-07-19', studentId: 'st2', studentName: 'Ananya Iyer', status: 'Absent' },
  { id: 'att3', date: '2026-07-19', studentId: 'st3', studentName: 'Kabir Verma', status: 'Absent' },
  { id: 'att4', date: '2026-07-19', studentId: 'st4', studentName: 'Diya Patel', status: 'Present' },
  { id: 'att5', date: '2026-07-19', studentId: 'st5', studentName: 'Rohan Gupta', status: 'Present' }
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
    set({ activeSchool: school });
  },
  addSchool: (schoolData) => {
    const newSchool: School = {
      ...schoolData,
      id: 'sch_' + Date.now(),
    };
    // Persist to Firestore database
    saveSchoolToFirestore(newSchool).catch(err => console.error('Failed to save school to Firestore:', err));

    set((state) => {
      const updatedSchools = [...state.schools, newSchool];
      localStorage.setItem('disha_registered_schools', JSON.stringify(updatedSchools));
      localStorage.setItem('disha_active_school_id', newSchool.id);
      return {
        schools: updatedSchools,
        activeSchool: newSchool,
      };
    });
    return newSchool;
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
  dimensions: MOCK_DIMENSIONS,
  gaps: MOCK_GAPS,
  simulations: MOCK_SIMULATIONS,
  students: MOCK_STUDENTS,
  staff: MOCK_STAFF,
  attendance: MOCK_ATTENDANCE,
  communications: MOCK_COMMUNICATIONS,
  isLoadingData: false,
  fetchData: async () => {
    set({ isLoadingData: true });
    try {
      await seedDatabase(); // Make sure data exists
      
      const [domainsSnap, dimensionsSnap, gapsSnap, simSnap, studentsSnap, staffSnap, attendanceSnap, communicationsSnap, fetchedSchools] = await Promise.all([
        getDocs(collection(db, 'domains')),
        getDocs(collection(db, 'dimensions')),
        getDocs(collection(db, 'gaps')),
        getDocs(collection(db, 'simulations')),
        getDocs(collection(db, 'students')),
        getDocs(collection(db, 'staff')),
        getDocs(collection(db, 'attendance')),
        getDocs(collection(db, 'communications')),
        fetchSchoolsFromFirestore(),
      ]);

      set(state => {
        let mergedSchools = state.schools;
        if (fetchedSchools && fetchedSchools.length > 0) {
          // Merge or replace schools with Firestore registered schools
          const schoolMap = new Map<string, School>();
          state.schools.forEach(s => schoolMap.set(s.id, s));
          fetchedSchools.forEach(s => schoolMap.set(s.id, s));
          mergedSchools = Array.from(schoolMap.values());
        }

        const savedActiveId = localStorage.getItem('disha_active_school_id');
        let currentActive = state.activeSchool;
        if (savedActiveId && mergedSchools.length > 0) {
          const match = mergedSchools.find(s => s.id === savedActiveId);
          if (match) currentActive = match;
        } else if (!currentActive && mergedSchools.length > 0) {
          currentActive = mergedSchools[0];
        }

        localStorage.setItem('disha_registered_schools', JSON.stringify(mergedSchools));

        return {
          domains: domainsSnap.docs.map(d => d.data() as ChallengeDomain),
          dimensions: dimensionsSnap.docs.map(d => d.data() as Dimension),
          gaps: gapsSnap.docs.map(d => d.data() as GapPrediction),
          simulations: simSnap.docs.map(d => d.data() as SimulationModel),
          students: studentsSnap.docs.map(d => d.data() as Student),
          staff: staffSnap.docs.map(d => d.data() as StaffMember),
          attendance: attendanceSnap.docs.map(d => d.data() as AttendanceRecord),
          communications: communicationsSnap.docs.map(d => d.data() as CommunicationMessage),
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
  updateSimulationTarget: async (simId: string, targetValue: number) => {
    try {
      const simRef = doc(db, 'simulations', simId);
      await updateDoc(simRef, { targetValue });
      
      set(state => ({
        simulations: state.simulations.map(s => 
          s.id === simId ? { ...s, targetValue } : s
        )
      }));
    } catch (error) {
      console.error('Error updating simulation target:', error);
    }
  },
  addStudent: async (studentData) => {
    try {
      const docRef = doc(collection(db, 'students'));
      const newStudent = { ...studentData, id: docRef.id };
      await setDoc(docRef, newStudent);
      set(state => ({ students: [...state.students, newStudent] }));
    } catch (error) {
      console.error('Error adding student:', error);
    }
  },
  addStaff: async (staffData) => {
    try {
      const docRef = doc(collection(db, 'staff'));
      const newStaff = { ...staffData, id: docRef.id };
      await setDoc(docRef, newStaff);
      set(state => ({ staff: [...state.staff, newStaff] }));
    } catch (error) {
      console.error('Error adding staff member:', error);
    }
  },
  addAttendanceRecords: async (records) => {
    try {
      const addedRecords: AttendanceRecord[] = [];
      for (const record of records) {
        const docRef = doc(collection(db, 'attendance'));
        const newRecord = { ...record, id: docRef.id };
        await setDoc(docRef, newRecord);
        addedRecords.push(newRecord);
      }
      set(state => ({ attendance: [...state.attendance, ...addedRecords] }));
    } catch (error) {
      console.error('Error adding attendance records:', error);
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
