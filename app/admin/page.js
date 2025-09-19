'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import AdminDashboard from '@/components/admin/AdminDashboard'
import AdminLogin from '@/components/admin/AdminLogin'

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = () => {
    const token = localStorage.getItem('admin_token')
    if (token) {
      // Verify token with your backend
      setIsAuthenticated(true)
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
        <AdminDashboard onLogout={() => setIsAuthenticated(false)} />
      ) : (
        <AdminLogin onLogin={() => setIsAuthenticated(true)} />
      )}
    </div>
  )
}