import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import ForgotPassword from "./components/auth/ForgotPassword";
import ResetPassword from "./components/auth/ResetPassword";
import UserProfile from "./components/user/UserProfile";
import ChangePassword from "./components/user/ChangePassword";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./components/Home";

// Teacher components
import TeacherDashboard from "./components/teacher/TeacherDashboard";
import TeacherCourses from "./components/teacher/TeacherCourses";
import CreateCourse from "./components/teacher/CreateCourse";
import EditCourse from "./components/teacher/EditCourse";
import CourseDetail from "./components/teacher/CourseDetail";
import CourseStudents from "./components/teacher/CourseStudents";
import CreateEditSection from "./components/teacher/CreateEditSection";
import CreateEditLesson from "./components/teacher/CreateEditLesson";
import CreateEditQuiz from "./components/teacher/CreateEditQuiz";
import AutoQuizGeneration from "./components/teacher/AutoQuizGeneration";

import "./index.css";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            {/* User Profile Routes */}
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/change-password" element={<ChangePassword />} />

            {/* Teacher Routes */}
            <Route path="/teacher" element={<Navigate to="/teacher/dashboard" replace />} />
            <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
            <Route path="/teacher/courses" element={<TeacherCourses />} />
            <Route path="/teacher/courses/create" element={<CreateCourse />} />
            <Route path="/teacher/courses/:id" element={<CourseDetail />} />
            <Route path="/teacher/courses/:id/edit" element={<EditCourse />} />
            <Route path="/teacher/courses/:id/students" element={<CourseStudents />} />
              {/* Section Content Routes */}
            <Route path="/teacher/courses/:id/sections/create" element={<CreateEditSection isEdit={false} />} />
            <Route path="/teacher/sections/:sectionId/edit" element={<CreateEditSection isEdit={true} />} />            <Route path="/teacher/sections/:sectionId/lessons/create" element={<CreateEditLesson isEdit={false} />} />
            <Route path="/teacher/sections/:sectionId/lessons/:lessonId/edit" element={<CreateEditLesson isEdit={true} />} />            <Route path="/teacher/sections/:sectionId/quizzes/create" element={<CreateEditQuiz isEdit={false} />} />
            <Route path="/teacher/sections/:sectionId/quizzes/:quizId/edit" element={<CreateEditQuiz isEdit={true} />} />
            <Route path="/teacher/sections/:sectionId/generate-quiz" element={<AutoQuizGeneration />} />
          </Route>

          {/* Redirect to home for undefined routes */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        
        {/* Toast notifications */}
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              style: {
                background: '#10B981',
                color: '#fff',
              },
            },
            error: {
              style: {
                background: '#EF4444',
                color: '#fff',
              },
            },
          }}
        />
      </div>
    </Router>
  );
}

export default App;
