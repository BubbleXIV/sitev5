'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import bcrypt from 'bcryptjs'


export default function AdminLogin({ onLogin }) {
  const [credentials, setCredentials] = useState({ username: '', password: '' })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

const handleLogin = async (e) => {
  console.log('LOGIN FUNCTION CALLED') // Add this first
  e.preventDefault()
  setIsLoading(true)
  setError('')

  try {
    console.log('Attempting login with:', credentials.username)
    
    const { data: admin, error: queryError } = await supabase
      .from('admins')
      .select('*')
      .eq('username', credentials.username)
      .single()

    console.log('Query result:', admin, queryError)

    if (!admin) {
      throw new Error('Invalid credentials')
    }

    console.log('Stored hash:', admin.password_hash)
    console.log('Entered password:', credentials.password)
    
    const isValidPassword = await bcrypt.compare(credentials.password, admin.password_hash)
    console.log('Password valid:', isValidPassword)
    
    if (!isValidPassword) {
      throw new Error('Invalid credentials')
    }

    localStorage.setItem('admin_token', `admin_${admin.id}`)
    onLogin()
  } catch (error) {
    console.error('Login error:', error)
    setError('Invalid username or password')
  } finally {
    setIsLoading(false)
  }
}

  return (
    <div className="min-h-screen flex items-center justify-center py-12">
      <div className="max-w-md w-full">
        <div className="card">
          <h2 className="text-3xl font-bold text-center mb-8 text-nightshade-300">
            Admin Login
          </h2>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Username
              </label>
              <input
                type="text"
                value={credentials.username}
                onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-nightshade-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-nightshade-500"
                required
              />
            </div>

            {error && (
              <div className="text-red-400 text-sm text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary disabled:opacity-50"
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-gray-400">
            Default: admin / admin123
          </div>
        </div>
      </div>
    </div>
  )
}
