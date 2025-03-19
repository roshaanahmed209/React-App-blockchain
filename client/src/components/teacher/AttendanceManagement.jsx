import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

const AttendanceManagement = () => {
  const [courses, setCourses] = useState([])
  const [selectedCourse, setSelectedCourse] = useState('')
  const [studentEmail, setStudentEmail] = useState('')
  const [date, setDate] = useState('')
  const [status, setStatus] = useState('present')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [enrolledStudents, setEnrolledStudents] = useState([])
  
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    fetchCourses()
    const today = new Date().toISOString().split('T')[0]
    setDate(today)
  }, [])

  const fetchCourses = async () => {
    try {
      const registeredCourses = JSON.parse(localStorage.getItem('registeredCourses') || '[]');
      // Only show courses taught by this teacher
      const teacherCourses = registeredCourses.filter(course => course.teacher === user.email);
      setCourses(teacherCourses)
    } catch (error) {
      setError('Failed to fetch courses')
    }
    setLoading(false)
  }

  // Update enrolled students when course selection changes
  useEffect(() => {
    if (selectedCourse) {
      const course = courses.find(c => c.course_id === selectedCourse);
      if (course && course.students) {
        setEnrolledStudents(course.students.map((email, index) => ({
          email,
          name: `Student ${index + 1}`
        })));
      } else {
        setEnrolledStudents([]);
      }
    } else {
      setEnrolledStudents([]);
    }
  }, [selectedCourse, courses]);

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!selectedCourse || !studentEmail || !date || !status) {
      setError('Please fill in all fields')
      return
    }

    try {
      const attendanceRecords = JSON.parse(localStorage.getItem('attendanceRecords') || '[]')
      
      const newRecord = {
        id: Date.now().toString(),
        course_id: selectedCourse,
        student_email: studentEmail,
        date,
        status,
        recorded_by: user.email,
        created_at: new Date().toISOString()
      }
      
      attendanceRecords.push(newRecord)
      localStorage.setItem('attendanceRecords', JSON.stringify(attendanceRecords))
      
      setSuccess('Attendance recorded successfully')
      setStudentEmail('')
    } catch (error) {
      setError('Failed to record attendance')
    }
  }

  const getRecentAttendance = () => {
    const records = JSON.parse(localStorage.getItem('attendanceRecords') || '[]')
    return records
      .filter(record => record.recorded_by === user.email)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-black to-violet-950/20">
      {/* Navigation Bar */}
      <nav className="bg-black/40 backdrop-blur-md border-b border-violet-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-medium text-transparent bg-clip-text bg-gradient-to-r from-violet-200 to-violet-400">
                Attendance Management
              </h1>
            </div>
            <div className="flex items-center">
              <button
                onClick={() => navigate('/teacher/dashboard')}
                className="btn-secondary"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Record Attendance Form */}
          <div className="space-y-6">
            <h2 className="section-title">Record Attendance</h2>
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

              {loading ? (
                <div className="text-center py-12">
                  <div className="loading-spinner mx-auto"></div>
                  <p className="mt-4 text-sm text-violet-300/70">Loading courses...</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label htmlFor="course" className="block text-sm font-medium text-violet-300">
                      Course
                    </label>
                    <select
                      id="course"
                      value={selectedCourse}
                      onChange={(e) => setSelectedCourse(e.target.value)}
                      className="input-field"
                      required
                    >
                      <option value="">Select a course</option>
                      {courses.map((course) => (
                        <option key={course.course_id} value={course.course_id}>
                          {course.course_name} ({course.course_id})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="student" className="block text-sm font-medium text-violet-300">
                      Student
                    </label>
                    <select
                      id="student"
                      value={studentEmail}
                      onChange={(e) => setStudentEmail(e.target.value)}
                      className="input-field"
                      required
                    >
                      <option value="">Select a student</option>
                      {enrolledStudents.map((student) => (
                        <option key={student.email} value={student.email}>
                          {student.name} ({student.email})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="date" className="block text-sm font-medium text-violet-300">
                      Date
                    </label>
                    <input
                      type="date"
                      id="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="input-field"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="status" className="block text-sm font-medium text-violet-300">
                      Status
                    </label>
                    <select
                      id="status"
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="input-field"
                      required
                    >
                      <option value="present">Present</option>
                      <option value="absent">Absent</option>
                      <option value="late">Late</option>
                      <option value="excused">Excused</option>
                    </select>
                  </div>

                  <div>
                    <button
                      type="submit"
                      className="btn-primary w-full justify-center group"
                    >
                      <span className="inline-flex items-center">
                        Record Attendance
                        <svg className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Recent Attendance Records */}
          <div className="space-y-6">
            <h2 className="section-title">Recent Attendance Records</h2>
            <div className="dashboard-card">
              {getRecentAttendance().length === 0 ? (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-violet-400/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <h3 className="mt-4 text-lg font-medium text-violet-200">No attendance records</h3>
                  <p className="mt-1 text-sm text-violet-300/70">Start recording attendance to see records here.</p>
                </div>
              ) : (
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th className="table-header">Course</th>
                        <th className="table-header">Student</th>
                        <th className="table-header">Date</th>
                        <th className="table-header">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getRecentAttendance().map((record) => (
                        <tr key={record.id} className="table-row">
                          <td className="table-cell font-medium">{record.course_id}</td>
                          <td className="table-cell">{record.student_email}</td>
                          <td className="table-cell">{new Date(record.date).toLocaleDateString()}</td>
                          <td className="table-cell">
                            <span className={`badge ${
                              record.status === 'present' ? 'badge-success' :
                              record.status === 'absent' ? 'badge-error' :
                              record.status === 'late' ? 'badge-warning' :
                              'badge-secondary'
                            }`}>
                              {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default AttendanceManagement 