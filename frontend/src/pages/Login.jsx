import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import api from '../services/api'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const validate = () => {
    setError(null)
    if (!email) return 'Email is required'
    // More lenient email validation
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!re.test(email)) return 'Email is not valid'
    if (!password) return 'Password is required'
    if (password.length < 8) return 'Password must be at least 8 characters'
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const v = validate()
    if (v) {
      setError(v)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const resp = await api.post('/auth/login', { email, password })
      const { access_token, user } = resp.data
      // normalize company fields if backend nests them
      const enrichedUser = {
        ...user,
        company_name: user.company_name || (user.company && user.company.name) || null,
        company_logo: user.company_logo || (user.company && user.company.logo) || null,
      }
      login(access_token, enrichedUser)
      navigate('/dashboard')
    } catch (err) {
      console.error(err)
      const msg = err?.response?.data?.detail || err.message || 'Login failed'
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 mx-4">
        <h2 className="text-2xl font-semibold mb-6 text-center">Sign in to WorkZen</h2>

        {error && (
          <div className="mb-4 text-sm text-red-700 bg-red-100 p-3 rounded">{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="you@company.com"
          />

          <label className="block text-sm font-medium text-gray-700 mt-4">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Your password"
          />

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-4 flex justify-between text-sm">
          <Link to="/register" className="text-blue-600 hover:underline">Create account</Link>
          <Link to="/forgot-password" className="text-gray-600 hover:underline">Forgot password?</Link>
        </div>
      </div>
    </div>
  )
}
