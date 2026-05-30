import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Student } from '../types';
import localforage from 'localforage';

interface StudentContextType {
  students: Student[];
  addStudent: (student: Student) => Promise<void>;
  updateStudent: (student: Student) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;
  loading: boolean;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  showAlert: (message: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
  showConfirm: (message: string, onConfirm: () => void, onCancel?: () => void) => void;
}

interface AlertState {
  isOpen: boolean;
  message: string;
  type: 'success' | 'warning' | 'error' | 'info';
}

interface ConfirmState {
  isOpen: boolean;
  message: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

const StudentContext = createContext<StudentContextType | undefined>(undefined);

export const StudentProvider = ({ children }: { children: ReactNode }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  // Custom alert and confirm states
  const [alert, setAlert] = useState<AlertState>({ isOpen: false, message: '', type: 'info' });
  const [confirm, setConfirm] = useState<ConfirmState>({ isOpen: false, message: '', onConfirm: () => {} });

  const showAlert = (message: string, type: 'success' | 'warning' | 'error' | 'info' = 'info') => {
    setAlert({ isOpen: true, message, type });
  };

  const showConfirm = (message: string, onConfirm: () => void, onCancel?: () => void) => {
    setConfirm({ isOpen: true, message, onConfirm, onCancel });
  };

  useEffect(() => {
    // Load theme
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } else {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    }

    // Load students
    try {
      localforage.getItem<Student[]>('madrasa_students').then((data) => {
        if (data) setStudents(data);
        setLoading(false);
      }).catch(err => {
        console.error("Localforage load error", err);
        setLoading(false);
      });
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const saveToStorage = async (data: Student[]) => {
    setStudents(data);
    try {
      await localforage.setItem('madrasa_students', data);
    } catch(err) {
      console.error("Localforage save error", err);
    }
  };

  const addStudent = async (student: Student) => {
    const newData = [...students, student];
    await saveToStorage(newData);
  };

  const updateStudent = async (updatedStudent: Student) => {
    const newData = students.map(s => s.id === updatedStudent.id ? updatedStudent : s);
    await saveToStorage(newData);
  };

  const deleteStudent = async (id: string) => {
    const newData = students.filter(s => s.id !== id);
    await saveToStorage(newData);
  };

  return (
    <StudentContext.Provider value={{ students, addStudent, updateStudent, deleteStudent, loading, theme, toggleTheme, showAlert, showConfirm }}>
      {children}
      
      {/* Custom Alert Modal */}
      {alert.isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#11241c] border-2 border-dashed border-emerald-500/50 dark:border-emerald-400/30 rounded-xl shadow-2xl max-w-sm w-full p-6 text-center space-y-4">
            <div className="flex items-center justify-center mx-auto text-emerald-500 w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950">
              {alert.type === 'success' ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
              ) : alert.type === 'error' ? (
                <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>
              ) : alert.type === 'warning' ? (
                <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 111.083.984l-.04.018-1.041.52-.04.018a.75.75 0 00-.51 1.01l.04.108c.209.569.845.87 1.414.662l.04-.018 1.042-.52.04-.018a.75.75 0 00.51-1.01l-.04-.108a.75.75 0 00-1.01-.51l-.04.018" /></svg>
              )}
            </div>
            <p className="text-gray-800 dark:text-gray-200 font-medium text-lg leading-relaxed">
              {alert.message}
            </p>
            <button
              onClick={() => setAlert({ ...alert, isOpen: false })}
              className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              ঠিক আছে
            </button>
          </div>
        </div>
      )}

      {/* Custom Confirm Modal */}
      {confirm.isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#11241c] border-2 border-dashed border-red-500/50 dark:border-red-400/30 rounded-xl shadow-2xl max-w-sm w-full p-6 text-center space-y-4">
            <div className="flex items-center justify-center mx-auto text-red-500 w-12 h-12 rounded-full bg-red-100 dark:bg-red-950">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.03A11.95 11.95 0 0112 2.25c2.91 0 5.713.52 8.3 1.457M12 21.75a11.95 11.95 0 01-8.3-3.414" />
              </svg>
            </div>
            <p className="text-gray-800 dark:text-gray-200 font-medium text-lg leading-relaxed">
              {confirm.message}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setConfirm({ ...confirm, isOpen: false });
                  if (confirm.onCancel) confirm.onCancel();
                }}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-medium rounded-lg border border-gray-250 dark:border-gray-700 transition-colors focus:outline-none"
              >
                বাতিল
              </button>
              <button
                onClick={() => {
                  setConfirm({ ...confirm, isOpen: false });
                  confirm.onConfirm();
                }}
                className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all focus:outline-none"
              >
                নিশ্চিত করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </StudentContext.Provider>
  );
};

export const useStudents = () => {
  const context = useContext(StudentContext);
  if (!context) {
    throw new Error('useStudents must be used within a StudentProvider');
  }
  return context;
};
