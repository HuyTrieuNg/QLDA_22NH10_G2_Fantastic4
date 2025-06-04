import React from 'react';
import TeacherNavigation from './TeacherNavigation';

const TeacherLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <TeacherNavigation />
      <main className="py-6">
        {children}
      </main>
    </div>
  );
};

export default TeacherLayout;
