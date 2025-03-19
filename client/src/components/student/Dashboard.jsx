import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import axios from 'axios'

const StudentDashboard = () => {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      // Instead of fetching from API, get courses from localStorage
      const registeredCourses = JSON.parse(localStorage.getItem('registeredCourses') || '[]');
      // Filter courses to only include ones where the student is enrolled
      const enrolledCourses = registeredCourses.filter(
        course => course.students && course.students.includes(user.email)
      );
      setCourses(enrolledCourses);
    } catch (error) {
      setError('Failed to fetch courses')
    }
    setLoading(false)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-black to-violet-950/20">
      {/* Navigation Bar */}
      <nav className="bg-black/40 backdrop-blur-md border-b border-violet-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-medium text-transparent bg-clip-text bg-gradient-to-r from-violet-200 to-violet-400">
                Student Portal
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <span className="text-sm text-violet-300/70">Welcome back,</span>
                <span className="ml-2 text-sm font-medium text-violet-200">{user?.email}</span>
              </div>
              <button
                onClick={handleLogout}
                className="btn-secondary"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2 mb-8">
          {/* Course Registration Card */}
          <div className="dashboard-card group">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-violet-200">Course Registration</h3>
                <p className="mt-1 text-sm text-violet-300/70">Register for new courses or view available courses</p>
                <div className="mt-4">
                  <Link to="/student/course-registration" className="btn-primary">
                    Register Now
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* View Marks Card */}
          <div className="dashboard-card group">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-violet-200">Academic Performance</h3>
                <p className="mt-1 text-sm text-violet-300/70">View your marks and academic progress</p>
                <div className="mt-4">
                  <Link to="/student/marks" className="btn-primary">
                    View Marks
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enrolled Courses */}
        <div className="space-y-6">
          <h2 className="section-title">Your Enrolled Courses</h2>
          
          {error && (
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.1)]">
              <div className="flex items-center">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="ml-3 text-sm text-red-400">{error}</p>
              </div>
            </div>
          )}

          {loading ? (
            <div className="text-center py-12">
              <div className="loading-spinner mx-auto"></div>
              <p className="mt-4 text-sm text-violet-300/70">Loading your courses...</p>
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-12 dashboard-card">
              <svg className="mx-auto h-12 w-12 text-violet-400/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-violet-200">No courses enrolled</h3>
              <p className="mt-1 text-sm text-violet-300/70">Get started by registering for your courses.</p>
              <div className="mt-6">
                <Link to="/student/course-registration" className="btn-primary">
                  Register for Courses
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => (
                <div key={course.course_id} className="dashboard-card group">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <h3 className="text-lg font-medium text-violet-200">{course.course_name}</h3>
                      <p className="text-sm text-violet-300/70">Course ID: {course.course_id}</p>
                      <p className="text-sm text-violet-300/70">Instructor: {course.teacher}</p>
                    </div>
                    <span className="badge badge-success">
                      Enrolled
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default StudentDashboard 