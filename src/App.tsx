import React, { useEffect, useState } from 'react';
import { AppLayout } from './components/layout/AppLayout';
import { Dashboard } from './pages/Dashboard';
import { useAppStore } from './store';
import { CaptureStage } from './pages/CaptureStage';
import { CompareStage } from './pages/CompareStage';
import { SimulateStage } from './pages/SimulateStage';
import { Monitoring } from './pages/Monitoring';
import { Students } from './pages/Students';
import { Staff } from './pages/Staff';
import { Attendance } from './pages/Attendance';
import { Communications } from './pages/Communications';
import { Login } from './pages/Login';
import { LandingPage } from './pages/LandingPage';
import { Admin } from './pages/Admin';
import { Checkup } from './pages/Checkup';
import { auth, db } from './lib/firebase';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { PublicSurvey } from './components/PublicSurvey';

export default function App() {
  const { currentView, fetchData, setIsAdmin } = useAppStore();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  const [pendingApproval, setPendingApproval] = useState(false);

  // Check for public survey link
  const urlParams = new URLSearchParams(window.location.search);
  const surveyTarget = urlParams.get('survey');
  const aid = urlParams.get('aid');

  if (surveyTarget && aid) {
    return <PublicSurvey stakeholder={surveyTarget} aid={aid} />;
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        if (user.email === 'rylneuroacademy@gmail.com' || user.email === 'demo@disha.edu') {
            setIsAdmin(user.email === 'rylneuroacademy@gmail.com');
            await setDoc(doc(db, 'users', user.uid), {
                email: user.email,
                isApproved: true,
                role: user.email === 'rylneuroacademy@gmail.com' ? 'admin' : 'demo'
            }, { merge: true });
            setShowLogin(false);
            setPendingApproval(false);
            await fetchData();
            setUser(user);
        } else {
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (userDoc.exists()) {
                if (userDoc.data().isApproved) {
                    setIsAdmin(userDoc.data().role === 'admin');
                    setShowLogin(false);
                    setPendingApproval(false);
                    await fetchData();
                    setUser(user);
                } else {
                    await signOut(auth);
                    setPendingApproval(true);
                    setUser(null);
                }
            } else {
                await setDoc(doc(db, 'users', user.uid), {
                    email: user.email,
                    isApproved: false,
                    role: 'school_owner',
                    createdAt: new Date().toISOString()
                });
                await signOut(auth);
                setPendingApproval(true);
                setUser(null);
            }
        }
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, [fetchData, setIsAdmin]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    if (showLogin || pendingApproval) {
      return <Login onBack={() => { setShowLogin(false); setPendingApproval(false); }} pendingApproval={pendingApproval} />;
    }
    return <LandingPage onLoginClick={() => setShowLogin(true)} />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'DASHBOARD':
        return <Dashboard />;
      case 'CHECKUP':
        return <Checkup />;
      case 'CAPTURE':
        return <CaptureStage />;
      case 'COMPARE':
        return <CompareStage />;
      case 'SIMULATE':
        return <SimulateStage />;
      case 'MONITORING':
        return <Monitoring />;
      case 'STUDENTS':
        return <Students />;
      case 'STAFF':
        return <Staff />;
      case 'ATTENDANCE':
        return <Attendance />;
      case 'COMMUNICATIONS':
        return <Communications />;
      case 'ADMIN':
        return <Admin />;
      default:
        return <Dashboard />;
    }
  };

  return <AppLayout>{renderView()}</AppLayout>;
}
