/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { StudentProvider, useStudents } from './store/StudentContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import AdmissionForm from './pages/AdmissionForm';
import FormList from './pages/FormList';
import FeeCollection from './pages/FeeCollection';
import ReportGeneration from './pages/ReportGeneration';
import AddInfo from './pages/AddInfo';
import SearchInfo from './pages/SearchInfo';
import Account from './pages/Account';
import DeveloperProfile from './pages/DeveloperProfile';
import Auth from './components/Auth';

function MainApp() {
  const { user, loading, isGuest, setGuestMode } = useStudents();
  const [activeMenuItem, setActiveMenuItem] = useState('home');
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (event.state && event.state.menu) {
        if (event.state.menu === 'admission' || event.state.menu === 'home') {
          setEditingStudentId(null);
        }
        setActiveMenuItem(event.state.menu);
      } else {
        setActiveMenuItem('home');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    // Initial load: set the current state in history so that popstate has a state to go back to.
    const urlParams = new URLSearchParams(window.location.search);
    const menu = urlParams.get('menu') || 'home';
    if (activeMenuItem === 'home' && menu === 'home') {
      window.history.replaceState({ menu: 'home' }, '', '?menu=home');
    }
  }, []);

  const handleEdit = (id: string) => {
    setEditingStudentId(id);
    setActiveMenuItem('admission');
    window.history.pushState({ menu: 'admission' }, '', '?menu=admission');
  };

  const handleAdmissionSuccess = () => {
    setEditingStudentId(null);
    setActiveMenuItem('forms');
    window.history.pushState({ menu: 'forms' }, '', '?menu=forms');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0a1610]">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user && !isGuest) {
    return <Auth onAuthSuccess={() => {
      setActiveMenuItem('home');
      window.history.replaceState({ menu: 'home' }, '', '?menu=home');
    }} onSkip={() => setGuestMode(true)} />;
  }

  const handleNavigation = (menu: string) => {
    if (menu === 'admission' || menu === 'home') {
      setEditingStudentId(null);
    }
    setActiveMenuItem(menu);
    window.history.pushState({ menu }, '', `?menu=${menu}`);
  };

  return (
    <Layout activeMenuItem={activeMenuItem} setActiveMenuItem={handleNavigation}>
      {activeMenuItem === 'home' && <Home onEdit={handleEdit} onNavigate={handleNavigation} />}
      {activeMenuItem === 'admission' && <AdmissionForm editId={editingStudentId} onSuccess={handleAdmissionSuccess} />}
      {activeMenuItem === 'forms' && <FormList onEdit={handleEdit} />}
      {activeMenuItem === 'fees' && <FeeCollection />}
      {activeMenuItem === 'reports' && <ReportGeneration />}
      {activeMenuItem === 'add_info' && <AddInfo />}
      {activeMenuItem === 'search_info' && <SearchInfo />}
      {activeMenuItem === 'account' && <Account />}
      {activeMenuItem === 'developer' && <DeveloperProfile />}
    </Layout>
  );
}

export default function App() {
  return (
    <StudentProvider>
      <MainApp />
    </StudentProvider>
  );
}


