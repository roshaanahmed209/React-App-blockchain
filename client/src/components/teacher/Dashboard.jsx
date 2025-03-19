import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

const TeacherDashboard = () => {
  const [courses, setCourses] = useState([])
  const [allCourses, setAllCourses] = useState([])
  const [newCourse, setNewCourse] = useState({ course_id: '', course_name: '' })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      const registeredCourses = JSON.parse(localStorage.getItem('registeredCourses') || '[]');
      const teacherCourses = registeredCourses.filter(course => course.teacher === user.email);
      setCourses(teacherCourses);
      setAllCourses(registeredCourses);
    } catch (error) {
      setError('Failed to fetch courses')
    }
    setLoading(false)
  }

  const handleCreateCourse = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    try {
      const courseToAdd = {
        ...newCourse,
        teacher: user.email,
        course_id: newCourse.course_id.toUpperCase(),
        students: [] // Initialize with empty students array
      };
      
      const existingCourses = JSON.parse(localStorage.getItem('registeredCourses') || '[]');
      
      if (existingCourses.some(course => course.course_id === courseToAdd.course_id)) {
        setError('Course ID already exists');
        return;
      }
      
      existingCourses.push(courseToAdd);
      localStorage.setItem('registeredCourses', JSON.stringify(existingCourses));
      
      setNewCourse({ course_id: '', course_name: '' })
      setSuccess('Course created successfully')
      fetchCourses()
    } catch (error) {
      setError('Failed to create course')
    }
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
                Teacher Portal
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
          {/* Attendance Management Card */}
          <div className="dashboard-card group">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-violet-200">Attendance Management</h3>
                <p className="mt-1 text-sm text-violet-300/70">Track and manage student attendance</p>
                <div className="mt-4">
                  <Link to="/teacher/attendance" className="btn-primary">
                    Manage Attendance
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Marks Management Card */}
          <div className="dashboard-card group">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-violet-200">Marks Management</h3>
                <p className="mt-1 text-sm text-violet-300/70">Grade and evaluate student performance</p>
                <div className="mt-4">
                  <Link to="/teacher/marks" className="btn-primary">
                    Manage Marks
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Create Course Form */}
        <div className="space-y-6">
          <h2 className="section-title">Create New Course</h2>
          <div className="dashboard-card">
            {error && (
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.1)] mb-6">
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <p className="ml-3 text-sm text-red-400">{error}</p>
                </div>
              </div>
            )}

            {success && (
              <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 shadow-[0_0_10px_rgba(34,197,94,0.1)] mb-6">
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <p className="ml-3 text-sm text-green-400">{success}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleCreateCourse} className="space-y-4">
              <div className="space-y-1">
                <label htmlFor="course_id" className="block text-sm font-medium text-violet-300">
                  Course ID
                </label>
                <input
                  type="text"
                  id="course_id"
                  value={newCourse.course_id}
                  onChange={(e) => setNewCourse({ ...newCourse, course_id: e.target.value })}
                  className="input-field"
                  placeholder="Enter course ID"
                  required
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="course_name" className="block text-sm font-medium text-violet-300">
                  Course Name
                </label>
                <input
                  type="text"
                  id="course_name"
                  value={newCourse.course_name}
                  onChange={(e) => setNewCourse({ ...newCourse, course_name: e.target.value })}
                  className="input-field"
                  placeholder="Enter course name"
                  required
                />
              </div>
              <div>
                <button
                  type="submit"
                  className="btn-primary w-full justify-center group"
                >
                  <span className="inline-flex items-center">
                    Create Course
                    <svg className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* All Courses in Database */}
        <div className="space-y-6 mt-8">
          <h2 className="section-title">All Courses in Database</h2>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="loading-spinner mx-auto"></div>
              <p className="mt-4 text-sm text-violet-300/70">Loading courses...</p>
            </div>
          ) : allCourses.length === 0 ? (
            <div className="text-center py-12 dashboard-card">
              <svg className="mx-auto h-12 w-12 text-violet-400/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-violet-200">No courses in database</h3>
              <p className="mt-1 text-sm text-violet-300/70">Get started by creating your first course.</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th className="table-header">Course ID</th>
                    <th className="table-header">Course Name</th>
                    <th className="table-header">Teacher</th>
                  </tr>
                </thead>
                <tbody>
                  {allCourses.map((course) => (
                    <tr key={course.course_id} className="table-row">
                      <td className="table-cell font-medium">{course.course_id}</td>
                      <td className="table-cell">{course.course_name}</td>
                      <td className="table-cell">{course.teacher}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Your Courses */}
        <div className="space-y-6 mt-8">
          <h2 className="section-title">Your Courses</h2>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="loading-spinner mx-auto"></div>
              <p className="mt-4 text-sm text-violet-300/70">Loading your courses...</p>
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-12 dashboard-card">
              <svg className="mx-auto h-12 w-12 text-violet-400/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-violet-200">No courses created</h3>
              <p className="mt-1 text-sm text-violet-300/70">Get started by creating your first course.</p>
            </div>
          ) : (
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => (
                <div key={course.course_id} className="dashboard-card group">
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <h3 className="text-lg font-medium text-violet-200">{course.course_name}</h3>
                      <p className="text-sm text-violet-300/70">Course ID: {course.course_id}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Link 
                        to={`/teacher/attendance?course=${course.course_id}`}
                        className="btn-secondary flex-1 justify-center text-sm"
                      >
                        Attendance
                      </Link>
                      <Link 
                        to={`/teacher/marks?course=${course.course_id}`}
                        className="btn-secondary flex-1 justify-center text-sm"
                      >
                        Marks
                      </Link>
                    </div>
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

export default TeacherDashboard 