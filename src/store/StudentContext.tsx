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
}

const StudentContext = createContext<StudentContextType | undefined>(undefined);

export const StudentProvider = ({ children }: { children: ReactNode }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

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
    <StudentContext.Provider value={{ students, addStudent, updateStudent, deleteStudent, loading, theme, toggleTheme }}>
      {children}
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
