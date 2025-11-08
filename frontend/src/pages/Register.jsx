import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import api from '../services/api'

export default function Register() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [email, setEmail] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [logoFile, setLogoFile] = useState(null)
  const [logoPreview, setLogoPreview] = useState(null)
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const validate = () => {
    if (!companyName) return 'Company name is required'
    if (!email) return 'Email is required'
    // More lenient email validation
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!re.test(email)) return 'Email is not valid'
    if (!fullName) return 'Full name is required'
    if (!phone) return 'Phone is required'
    if (!password) return 'Password is required'
    if (password.length < 8) return 'Password must be at least 8 characters'
    if (password !== confirm) return 'Passwords do not match'
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
      // prepare company logo as base64 if provided
      let logoBase64 = null
      if (logoFile) {
        logoBase64 = await new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result)
          reader.onerror = reject
          reader.readAsDataURL(logoFile)
        })
      }
      const payload = {
        email,
        password,
        full_name: fullName,
        phone,
        company_name: companyName,
        company_logo: logoBase64,
      }
      const resp = await api.post('/auth/register', payload)
      // If backend returns token and user directly
      const { access_token, user } = resp.data
      if (access_token) {
        login(access_token, user)
        navigate('/dashboard')
        return
      }
      // Otherwise, try to log in via /auth/login
      const loginResp = await api.post('/auth/login', { email, password })
      const { access_token: token2, user: user2 } = loginResp.data
      login(token2, user2)
      navigate('/dashboard')
    } catch (err) {
      console.error(err)
      const msg = err?.response?.data?.detail || err.message || 'Registration failed'
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 mx-4">
        <h2 className="text-2xl font-semibold mb-6 text-center">Create an account</h2>

        {error && (
          <div className="mb-4 text-sm text-red-700 bg-red-100 p-3 rounded">{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-gray-700">Company name</label>
          <div className="flex items-center gap-3">
            <input
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="mt-1 w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Your company name"
            />
            <div className="flex flex-col items-center">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files && e.target.files[0]
                  setLogoFile(file || null)
                  if (file) setLogoPreview(URL.createObjectURL(file))
                  else setLogoPreview(null)
                }}
                className="mt-1"
              />
            </div>
          </div>
          {logoPreview && (
            <img src={logoPreview} alt="logo preview" className="mt-3 h-16 w-16 object-contain" />
          )}

          <label className="block text-sm font-medium text-gray-700 mt-4">Full name</label>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="mt-1 w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="John Doe"
          />

          <label className="block text-sm font-medium text-gray-700 mt-4">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="you@company.com"
          />

          <label className="block text-sm font-medium text-gray-700 mt-4">Phone</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-1 w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="+1 555 555 5555"
          />

          <label className="block text-sm font-medium text-gray-700 mt-4">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Password"
          />

          <label className="block text-sm font-medium text-gray-700 mt-4">Confirm password</label>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="mt-1 w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Confirm password"
          />

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <div className="mt-4 text-center text-sm">
          <Link to="/login" className="text-blue-600 hover:underline">Already have an account? Sign in</Link>
        </div>
      </div>
    </div>
  )
}
