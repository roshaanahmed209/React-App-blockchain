import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

const CourseRegistration = () => {
  const [availableCourses, setAvailableCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [registering, setRegistering] = useState(false)
  
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const registeredCourses = JSON.parse(localStorage.getItem('registeredCourses') || '[]');
    // Get all courses 
    setAvailableCourses(registeredCourses.map(course => ({
      ...course,
      registered: course.students && course.students.includes(user.email)
    })));
    setLoading(false);
  }, [user.email]);

  const handleRegister = async (courseId) => {
    setRegistering(true);
    setError('');
    setSuccess('');
    
    try {
      // Get the current courses from localStorage
      const registeredCourses = JSON.parse(localStorage.getItem('registeredCourses') || '[]');
      // Find the index of the course to update
      const courseIndex = registeredCourses.findIndex(course => course.course_id === courseId);
      
      if (courseIndex === -1) {
        setError('Course not found');
        setRegistering(false);
        return;
      }
      
      // Add student to the course's students array if not already included
      if (!registeredCourses[courseIndex].students) {
        registeredCourses[courseIndex].students = [];
      }
      
      if (!registeredCourses[courseIndex].students.includes(user.email)) {
        registeredCourses[courseIndex].students.push(user.email);
        localStorage.setItem('registeredCourses', JSON.stringify(registeredCourses));
        
        // Update UI
        setAvailableCourses(prevCourses => 
          prevCourses.map(course => 
            course.course_id === courseId 
              ? { ...course, registered: true }
              : course
          )
        );
        
        setSuccess(`Successfully registered for ${registeredCourses[courseIndex].course_name}`);
      } else {
        setError('You are already registered for this course');
      }
    } catch (error) {
      setError('Failed to register for the course');
    }
    
    setRegistering(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-black to-violet-950/20">
      {/* Navigation Bar */}
      <nav className="bg-black/40 backdrop-blur-md border-b border-violet-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-medium text-transparent bg-clip-text bg-gradient-to-r from-violet-200 to-violet-400">
                Course Registration
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
        <div className="space-y-8">
          {/* Available Courses Section */}
          <div className="space-y-6">
            <h2 className="section-title">Available Courses</h2>

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

            {success && (
              <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 shadow-[0_0_10px_rgba(34,197,94,0.1)]">
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
                <p className="mt-4 text-sm text-violet-300/70">Loading available courses...</p>
              </div>
            ) : (
              <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {availableCourses
                  .filter(course => !course.registered)
                  .map((course) => (
                    <div key={course.course_id} className="dashboard-card group">
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-lg font-medium text-violet-200">{course.course_name}</h3>
                          <div className="mt-1 space-y-1">
                            <p className="text-sm text-violet-300/70">Course ID: {course.course_id}</p>
                            <p className="text-sm text-violet-300/70">Instructor: {course.teacher}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRegister(course.course_id)}
                          disabled={registering}
                          className="btn-primary w-full justify-center group"
                        >
                          <span className="inline-flex items-center">
                            {registering ? 'Registering...' : 'Register for Course'}
                            <svg className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                          </span>
                        </button>
                      </div>
                    </div>
                  ))}

                {availableCourses.filter(course => !course.registered).length === 0 && (
                  <div className="col-span-full text-center py-12 dashboard-card">
                    <svg className="mx-auto h-12 w-12 text-violet-400/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <h3 className="mt-4 text-lg font-medium text-violet-200">All courses registered!</h3>
                    <p className="mt-1 text-sm text-violet-300/70">You've registered for all available courses.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Registered Courses Section */}
          <div className="space-y-6">
            <h2 className="section-title">Your Registered Courses</h2>
            
            {availableCourses.filter(course => course.registered).length === 0 ? (
              <div className="text-center py-12 dashboard-card">
                <svg className="mx-auto h-12 w-12 text-violet-400/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-violet-200">No courses registered yet</h3>
                <p className="mt-1 text-sm text-violet-300/70">Register for courses from the list above.</p>
              </div>
            ) : (
              <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {availableCourses
                  .filter(course => course.registered)
                  .map((course) => (
                    <div key={course.course_id} className="dashboard-card group">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <h3 className="text-lg font-medium text-violet-200">{course.course_name}</h3>
                          <p className="text-sm text-violet-300/70">Course ID: {course.course_id}</p>
                          <p className="text-sm text-violet-300/70">Instructor: {course.teacher}</p>
                        </div>
                        <span className="badge badge-success">
                          Registered
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default CourseRegistration 