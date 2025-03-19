import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [userType, setUserType] = useState('student')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await login(email, password, userType)
      if (result.success) {
        navigate(`/${userType}/dashboard`)
      } else {
        setError(result.error)
      }
    } catch (error) {
      setError('Failed to login')
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-black via-black to-violet-950/20">
      <div className="relative">
        {/* Glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-lg blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
        
        <div className="form-container relative space-y-8 animate-fadeIn">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-medium text-transparent bg-clip-text bg-gradient-to-r from-violet-200 to-violet-400">
              Welcome Back
            </h2>
            <p className="text-sm text-violet-300/70">
              Sign in to access your account
            </p>
          </div>
          
          <form className="space-y-6" onSubmit={handleSubmit}>
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

            <div className="space-y-5">
              <div className="space-y-1">
                <label htmlFor="email-address" className="block text-sm font-medium text-violet-300">
                  Email address
                </label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  required
                  className="input-field"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="password" className="block text-sm font-medium text-violet-300">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="input-field"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="user-type" className="block text-sm font-medium text-violet-300">
                  I am a
                </label>
                <select
                  id="user-type"
                  value={userType}
                  onChange={(e) => setUserType(e.target.value)}
                  className="input-field"
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                </select>
              </div>
            </div>

            {userType === 'teacher' && (
              <div className="p-4 rounded-lg bg-violet-500/5 border border-violet-500/20 shadow-[0_0_15px_rgba(139,92,246,0.1)]">
                <p className="text-sm text-violet-300/90">
                  <strong>Teacher Login:</strong> Use email <span className="text-violet-400">teacher@email.com</span> and password <span className="text-violet-400">teacher</span>
                </p>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full justify-center group"
              >
                {loading ? (
                  <div className="loading-spinner" />
                ) : (
                  <span className="inline-flex items-center">
                    Sign in
                    <svg className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                )}
              </button>
            </div>
          </form>

          <div className="text-center">
            <p className="text-sm text-violet-300/70">
              Registration is disabled. Please use one of the predefined accounts.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login 