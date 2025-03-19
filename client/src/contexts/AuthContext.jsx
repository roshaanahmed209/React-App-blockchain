import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext()

export const useAuth = () => {
  return useContext(AuthContext)
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  
  // Fixed student accounts
  const fixedStudentAccounts = [
    { email: 'student1@example.com', password: 'student1', user_type: 'student' },
    { email: 'student2@example.com', password: 'student2', user_type: 'student' },
    { email: 'student3@example.com', password: 'student3', user_type: 'student' },
    { email: 'student4@example.com', password: 'student4', user_type: 'student' },
    { email: 'student5@example.com', password: 'student5', user_type: 'student' },
  ]

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    if (token && userData) {
      setUser(JSON.parse(userData))
      setIsAuthenticated(true)
    }
    setLoading(false)
  }, [])

  const login = async (email, password, userType) => {
    try {
      // Handle fixed teacher credentials
      if (userType === 'teacher') {
        if (email === 'teacher@email.com' && password === 'teacher') {
          const userData = { email, user_type: 'teacher' }
          const token = 'teacher-fixed-token'
          
          localStorage.setItem('token', token)
          localStorage.setItem('user', JSON.stringify(userData))
          
          setUser(userData)
          setIsAuthenticated(true)
          
          return { success: true, user_type: 'teacher' }
        } else {
          return { 
            success: false, 
            error: 'Invalid teacher credentials. Use teacher@email.com and password "teacher"' 
          }
        }
      }
      
      // For students, check against fixed accounts
      const studentAccount = fixedStudentAccounts.find(
        account => account.email === email && account.password === password
      )
      
      if (studentAccount) {
        const userData = { email, user_type: 'student' }
        const token = 'student-fixed-token'
        
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(userData))
        
        setUser(userData)
        setIsAuthenticated(true)
        
        return { success: true, user_type: 'student' }
      } else {
        return { 
          success: false, 
          error: 'Invalid student credentials. Use one of the predefined student accounts.' 
        }
      }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'An error occurred during login' 
      }
    }
  }

  // Registration is removed, but we keep a stub that returns an error
  const register = async () => {
    return { 
      success: false, 
      error: 'Registration is disabled. Please use one of the predefined accounts.' 
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    setIsAuthenticated(false)
  }

  const value = {
    user,
    isAuthenticated,
    login,
    register,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
} 