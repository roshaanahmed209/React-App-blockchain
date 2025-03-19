import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

const ViewMarks = () => {
  const [marks, setMarks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    fetchMarks()
  }, [])

  const fetchMarks = async () => {
    try {
      // Get all registered courses for this student
      const registeredCourses = JSON.parse(localStorage.getItem('registeredCourses') || '[]');
      // Get student's enrolled courses
      const enrolledCourses = registeredCourses.filter(
        course => course.students && course.students.includes(user.email)
      );
      
      // Get all marks records from localStorage
      const marksRecords = JSON.parse(localStorage.getItem('marksRecords') || '[]');
      
      // Filter marks for this student only
      const studentMarks = marksRecords.filter(record => record.student_email === user.email);
      
      // Group by course
      const coursesWithMarks = enrolledCourses.map(course => {
        // Find all marks for this course
        const courseMarks = studentMarks.filter(mark => mark.course_id === course.course_id);
        
        // Group by assessment type
        const assessments = [];
        const assessmentTypes = ['midterm', 'final', 'assignment', 'quiz'];
        
        // Add assessments that have marks recorded
        assessmentTypes.forEach(type => {
          const assessment = courseMarks.find(mark => mark.assessment_type === type);
          if (assessment) {
            assessments.push({
              type: assessment.assessment_type,
              marks: assessment.marks
            });
          }
        });
        
        return {
          course_id: course.course_id,
          course_name: course.course_name,
          assessments: assessments,
          hasMarks: assessments.length > 0
        };
      });
      
      setMarks(coursesWithMarks);
    } catch (error) {
      setError('Failed to fetch marks')
    }
    setLoading(false)
  }

  const getAssessmentBadgeClass = (marks) => {
    if (marks >= 80) return 'badge-success'
    if (marks >= 70) return 'badge-secondary'
    if (marks >= 60) return 'badge-warning'
    return 'badge-error'
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-black to-violet-950/20">
      {/* Navigation Bar */}
      <nav className="bg-black/40 backdrop-blur-md border-b border-violet-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-medium text-transparent bg-clip-text bg-gradient-to-r from-violet-200 to-violet-400">
                Academic Performance
              </h1>
            </div>
            <div className="flex items-center">
              <button
                onClick={() => navigate('/student/dashboard')}
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
        <div className="space-y-6">
          <h2 className="section-title">Your Academic Progress</h2>

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
              <p className="mt-4 text-sm text-violet-300/70">Loading your marks...</p>
            </div>
          ) : marks.length === 0 ? (
            <div className="text-center py-12 dashboard-card">
              <svg className="mx-auto h-12 w-12 text-violet-400/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-violet-200">No marks available</h3>
              <p className="mt-1 text-sm text-violet-300/70">You need to register for courses first.</p>
              <div className="mt-6">
                <button
                  onClick={() => navigate('/student/course-registration')}
                  className="btn-primary"
                >
                  Register for Courses
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {marks.map((course) => (
                <div key={course.course_id} className="dashboard-card group">
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-medium text-violet-200">{course.course_name}</h3>
                        <p className="mt-1 text-sm text-violet-300/70">Course ID: {course.course_id}</p>
                      </div>
                      {course.assessments.length > 0 ? (
                        <div className="badge badge-secondary">
                          {Math.round(course.assessments.reduce((sum, a) => sum + a.marks, 0) / course.assessments.length)}% Average
                        </div>
                      ) : null}
                    </div>
                    
                    {course.assessments.length > 0 ? (
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {course.assessments.map((assessment, index) => (
                          <div
                            key={index}
                            className="dashboard-card group p-4"
                          >
                            <div className="text-sm font-medium text-violet-300/70">
                              {assessment.type.charAt(0).toUpperCase() + assessment.type.slice(1)}
                            </div>
                            <div className="mt-1">
                              <span className={`badge ${getAssessmentBadgeClass(assessment.marks)}`}>
                                {assessment.marks}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <svg className="mx-auto h-8 w-8 text-violet-400/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-violet-200">No marks have been recorded yet</h3>
                        <p className="mt-1 text-xs text-violet-300/70">Marks will appear here when your teacher updates them</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {marks.filter(course => course.assessments.length > 0).length === 0 && (
                <div className="text-center py-8 dashboard-card">
                  <svg className="mx-auto h-12 w-12 text-violet-400/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="mt-4 text-lg font-medium text-violet-200">No marks recorded yet</h3>
                  <p className="mt-1 text-sm text-violet-300/70">Your teachers have not added any marks for your courses yet.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default ViewMarks 