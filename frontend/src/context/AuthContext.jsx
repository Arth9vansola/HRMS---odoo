import React, { createContext, useState, useEffect } from 'react'

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem('token') || null
    } catch (e) {
      return null
    }
  })

  const [user, setUser] = useState(null)

  useEffect(() => {
    // On mount, we could fetch user profile if token exists
    if (token) {
      try {
        const raw = localStorage.getItem('user')
        if (raw) setUser(JSON.parse(raw))
      } catch (e) {
        // ignore malformed user payload
      }
    }
  }, [token])

  const login = (newToken, userObj) => {
    try {
      localStorage.setItem('token', newToken)
      if (userObj) {
        // persist company-related fields if present
        const toSave = {
          ...userObj,
          company_name: userObj.company_name || (userObj.company && userObj.company.name) || null,
          company_logo: userObj.company_logo || (userObj.company && userObj.company.logo) || null,
        }
        localStorage.setItem('user', JSON.stringify(toSave))
      }
    } catch (e) {
      // ignore
    }
    setToken(newToken)
    if (userObj) {
      const enriched = {
        ...userObj,
        company_name: userObj.company_name || (userObj.company && userObj.company.name) || null,
        company_logo: userObj.company_logo || (userObj.company && userObj.company.logo) || null,
      }
      setUser(enriched)
    }
  }

  const logout = () => {
    try {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    } catch (e) {
      // ignore
    }
    setToken(null)
    setUser(null)
    if (typeof window !== 'undefined') window.location.href = '/login'
  }

  return (
    <AuthContext.Provider value={{ token, user, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}
