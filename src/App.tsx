/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { StudentProvider } from './store/StudentContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import AdmissionForm from './pages/AdmissionForm';
import FormList from './pages/FormList';
import FeeCollection from './pages/FeeCollection';
import ReportGeneration from './pages/ReportGeneration';
import AddInfo from './pages/AddInfo';
import SearchInfo from './pages/SearchInfo';
import AccountPlaceholder from './pages/AccountPlaceholder';

export default function App() {
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

  return (
    <StudentProvider>
      <Layout activeMenuItem={activeMenuItem} setActiveMenuItem={setActiveMenuItem}>
        {activeMenuItem === 'home' && <Home />}
        {activeMenuItem === 'admission' && <AdmissionForm editId={editingStudentId} onSuccess={handleAdmissionSuccess} />}
        {activeMenuItem === 'forms' && <FormList onEdit={handleEdit} />}
        {activeMenuItem === 'fees' && <FeeCollection />}
        {activeMenuItem === 'reports' && <ReportGeneration />}
        {activeMenuItem === 'add_info' && <AddInfo />}
        {activeMenuItem === 'search_info' && <SearchInfo />}
        {activeMenuItem === 'account' && <AccountPlaceholder />}
      </Layout>
    </StudentProvider>
  );
}

