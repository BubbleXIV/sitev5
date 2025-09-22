'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Plus, Edit, Trash2, Shield, Eye, EyeOff } from 'lucide-react'
import bcrypt from 'bcryptjs'

export default function AdminManager() {
  const [admins, setAdmins] = useState([])
  const [isEditing, setIsEditing] = useState(false)
  const [currentAdmin, setCurrentAdmin] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAdmins()
  }, [])

  const fetchAdmins = async () => {
    try {
      const { data } = await supabase
        .from('admins')
        .select('id, username, created_at')
        .order('created_at')

      setAdmins(data || [])
    } catch (error) {
      console.error('Error fetching admins:', error)
    } finally {
      setLoading(false)
    }
  }

const handleSaveAdmin = async (adminData) => {
  try {
    // Use SHA256 instead of bcrypt to match login.js
    const crypto = require('crypto')
    const hashedPassword = crypto.createHash('sha256').update(adminData.password).digest('hex')

    if (currentAdmin?.id) {
      const updateData = { username: adminData.username }
      if (adminData.password) {
        updateData.password_hash = hashedPassword
      }

      const { error } = await supabase
        .from('admins')
        .update(updateData)
        .eq('id', currentAdmin.id)

      if (error) throw error
    } else {
      const { error } = await supabase
        .from('admins')
        .insert([{
          username: adminData.username,
          password_hash: hashedPassword
        }])

      if (error) throw error
    }

    await fetchAdmins()
    setIsEditing(false)
    setCurrentAdmin(null)
  } catch (error) {
    console.error('Error saving admin:', error)
    alert('Error saving administrator')
  }
}

  const handleDeleteAdmin = async (id) => {
    if (admins.length <= 1) {
      alert('Cannot delete the last administrator')
      return
    }

    if (!confirm('Are you sure you want to delete this administrator?')) return

    try {
      const { error } = await supabase
        .from('admins')
        .delete()
        .eq('id', id)

      if (error) throw error
      await fetchAdmins()
    } catch (error) {
      console.error('Error deleting admin:', error)
      alert('Error deleting administrator')
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading administrators...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Administrator Management</h2>
        <button
          onClick={() => {
            setCurrentAdmin(null)
            setIsEditing(true)
          }}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Add Administrator</span>
        </button>
      </div>

      {isEditing && (
        <AdminForm
          admin={currentAdmin}
          onSave={handleSaveAdmin}
          onCancel={() => {
            setIsEditing(false)
            setCurrentAdmin(null)
          }}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {admins.map((admin) => (
          <div key={admin.id} className="card">
            <div className="flex items-center mb-4">
              <Shield className="text-red-400 mr-3" size={24} />
              <div>
                <h3 className="font-bold text-lg text-nightshade-300">{admin.username}</h3>
                <p className="text-gray-400 text-sm">
                  Created: {new Date(admin.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => {
                  setCurrentAdmin(admin)
                  setIsEditing(true)
                }}
                className="flex-1 btn-secondary flex items-center justify-center space-x-1"
              >
                <Edit size={16} />
                <span>Edit</span>
              </button>
              <button
                onClick={() => handleDeleteAdmin(admin.id)}
                disabled={admins.length <= 1}
                className="px-3 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {admins.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400 mb-4">No administrators found.</p>
          <button
            onClick={() => setIsEditing(true)}
            className="btn-primary"
          >
            Add Administrator
          </button>
        </div>
      )}
    </div>
  )
}

// Admin Form Component
function AdminForm({ admin, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    username: admin?.username || '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match')
      return
    }

    if (!admin && !formData.password) {
      alert('Password is required for new administrators')
      return
    }

    if (formData.password && formData.password.length < 6) {
      alert('Password must be at least 6 characters long')
      return
    }

    onSave(formData)
  }

  return (
    <div className="card">
      <h3 className="text-xl font-bold text-white mb-6">
        {admin ? 'Edit Administrator' : 'Add Administrator'}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Username *
          </label>
          <input
            type="text"
            value={formData.username}
            onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Password {admin ? '(leave blank to keep current)' : '*'}
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white pr-10"
              required={!admin}
              minLength="6"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Confirm Password {admin ? '(if changing password)' : '*'}
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white pr-10"
              required={!admin || formData.password}
              minLength="6"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
            >
              {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div className="flex space-x-4">
          <button type="submit" className="btn-primary">
            {admin ? 'Update' : 'Create'} Administrator
          </button>
          <button type="button" onClick={onCancel} className="btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
