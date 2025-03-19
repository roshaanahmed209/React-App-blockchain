import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Login from './components/auth/Login'
import StudentDashboard from './components/student/Dashboard'
import TeacherDashboard from './components/teacher/Dashboard'
import CourseRegistration from './components/student/CourseRegistration'
import AttendanceManagement from './components/teacher/AttendanceManagement'
import MarksManagement from './components/teacher/MarksManagement'
import ViewMarks from './components/student/ViewMarks'
import './App.css'

const PrivateRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated } = useAuth()
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />
  }

  if (!allowedRoles.includes(user.user_type)) {
    return <Navigate to="/" />
  }

  return children
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app bg-black min-h-screen">
          <div className="typewriter-container">
            <h1 className="typewriter">University Portal</h1>
          </div>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            {/* Student Routes */}
            <Route 
              path="/student/dashboard" 
              element={
                <PrivateRoute allowedRoles={['student']}>
                  <StudentDashboard />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/student/course-registration" 
              element={
                <PrivateRoute allowedRoles={['student']}>
                  <CourseRegistration />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/student/marks" 
              element={
                <PrivateRoute allowedRoles={['student']}>
                  <ViewMarks />
                </PrivateRoute>
              } 
            />

            {/* Teacher Routes */}
            <Route 
              path="/teacher/dashboard" 
              element={
                <PrivateRoute allowedRoles={['teacher']}>
                  <TeacherDashboard />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/teacher/attendance" 
              element={
                <PrivateRoute allowedRoles={['teacher']}>
                  <AttendanceManagement />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/teacher/marks" 
              element={
                <PrivateRoute allowedRoles={['teacher']}>
                  <MarksManagement />
                </PrivateRoute>
              } 
            />

            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
