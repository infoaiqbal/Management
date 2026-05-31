/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { StudentProvider, useStudents } from './store/StudentContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import AdmissionForm from './pages/AdmissionForm';
import FormList from './pages/FormList';
import FeeCollection from './pages/FeeCollection';
import ReportGeneration from './pages/ReportGeneration';
import AddInfo from './pages/AddInfo';
import SearchInfo from './pages/SearchInfo';
import AccountPlaceholder from './pages/AccountPlaceholder';
import Auth from './components/Auth';

function MainApp() {
  const { user, loading } = useStudents();
  const [activeMenuItem, setActiveMenuItem] = useState('home');
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);

  const handleEdit = (id: string) => {
    setEditingStudentId(id);
    setActiveMenuItem('admission');
  };

  const handleAdmissionSuccess = () => {
    setEditingStudentId(null);
    setActiveMenuItem('forms');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0a1610]">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Auth onAuthSuccess={() => setActiveMenuItem('home')} />;
  }

  return (
    <Layout activeMenuItem={activeMenuItem} setActiveMenuItem={setActiveMenuItem}>
      {activeMenuItem === 'home' && <Home onEdit={handleEdit} onNavigate={setActiveMenuItem} />}
      {activeMenuItem === 'admission' && <AdmissionForm editId={editingStudentId} onSuccess={handleAdmissionSuccess} />}
      {activeMenuItem === 'forms' && <FormList onEdit={handleEdit} />}
      {activeMenuItem === 'fees' && <FeeCollection />}
      {activeMenuItem === 'reports' && <ReportGeneration />}
      {activeMenuItem === 'add_info' && <AddInfo />}
      {activeMenuItem === 'search_info' && <SearchInfo />}
      {activeMenuItem === 'account' && <AccountPlaceholder />}
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


