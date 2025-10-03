'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import AdminDashboard from '@/components/admin/AdminDashboard'
import AdminLogin from '@/components/admin/AdminLogin'

export const dynamic = 'force-dynamic'

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const token = localStorage.getItem('admin_token')
    if (!token) {
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token })
      })

      if (response.ok) {
        setIsAuthenticated(true)
      } else {
        // Invalid token, remove it
        localStorage.removeItem('admin_token')
      }
    } catch (error) {
      console.error('Auth check error:', error)
      localStorage.removeItem('admin_token')
    }
    
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {isAuthenticated ? (
        <AdminDashboard onLogout={() => {
          localStorage.removeItem('admin_token')
          setIsAuthenticated(false)
        }} />
      ) : (
        <AdminLogin onLogin={() => setIsAuthenticated(true)} />
      )}
    </div>
  )
}
