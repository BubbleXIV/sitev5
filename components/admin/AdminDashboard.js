'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import {
  Users,
  FileText,
  Menu as MenuIcon,
  Settings,
  BarChart3,
  Plus,
  Edit,
  Trash2,
  LogOut
} from 'lucide-react'
import StaffManager from '@/components/admin/StaffManager'
import MenuManager from '@/components/admin/MenuManager'
import PageManager from '@/components/admin/PageManager'
import AdminManager from '@/components/admin/AdminManager'
import ShadecardManager from '@/components/admin/ShadecardManager'

export default function AdminDashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [stats, setStats] = useState({
    totalPages: 0,
    totalStaff: 0,
    totalMenuItems: 0,
    totalAdmins: 0
  })

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const [pages, staff, menuItems, admins] = await Promise.all([
        supabase.from('pages').select('id').then(({ data }) => data?.length || 0),
        supabase.from('staff').select('id').then(({ data }) => data?.length || 0),
        supabase.from('menu_items').select('id').then(({ data }) => data?.length || 0),
        supabase.from('shadecard_riddles').select('id').then(({ data }) => data?.length || 0),
        supabase.from('admins').select('id').then(({ data }) => data?.length || 0)
      ])

      setStats({
        totalPages: pages,
        totalStaff: staff,
        totalMenuItems: menuItems,
        totalAdmins: admins,
        totalShadecards: shadecards
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('admin_token')
    onLogout()
  }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'pages', label: 'Pages', icon: FileText },
    { id: 'staff', label: 'Staff', icon: Users },
    { id: 'menu', label: 'Menu', icon: MenuIcon },
    { id: 'admins', label: 'Admins', icon: Settings },
    { id: 'shadecard', label: 'Shadecard', icon: Settings }, 
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardOverview stats={stats} />
      case 'pages':
        return <PageManager />
      case 'staff':
        return <StaffManager />
      case 'menu':
        return <MenuManager />
      case 'admins':
        return <AdminManager />
      case 'shadecard':
        return <ShadecardManager /> 
      default:
        return <DashboardOverview stats={stats} />
    }
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="glass-dark border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-nightshade-300">
              Admin Dashboard
            </h1>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 text-red-400 hover:text-red-300 transition-colors"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-nightshade-600 text-white'
                        : 'text-gray-300 hover:bg-white/10'
                    }`}
                  >
                    <Icon size={20} />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  )
}

// Dashboard Overview Component
function DashboardOverview({ stats }) {
  const statCards = [
    { label: 'Total Pages', value: stats.totalPages, icon: FileText, color: 'from-blue-500 to-blue-600' },
    { label: 'Staff Members', value: stats.totalStaff, icon: Users, color: 'from-green-500 to-green-600' },
    { label: 'Menu Items', value: stats.totalMenuItems, icon: MenuIcon, color: 'from-purple-500 to-purple-600' },
    { label: 'Shadecards', value: stats.totalShadecards || 0, icon: Settings, color: 'from-yellow-500 to-yellow-600' },
    { label: 'Administrators', value: stats.totalAdmins, icon: Settings, color: 'from-red-500 to-red-600' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white mb-6">Dashboard Overview</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat) => {
            const Icon = stat.icon
            return (
              <div key={stat.label} className="card">
                <div className="flex items-center">
                  <div className={`p-3 rounded-lg bg-gradient-to-r ${stat.color} mr-4`}>
                    <Icon size={24} className="text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">{stat.label}</p>
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full btn-primary text-left">
              <Plus size={16} className="inline mr-2" />
              Add New Page
            </button>
            <button className="w-full btn-secondary text-left">
              <Plus size={16} className="inline mr-2" />
              Add Staff Member
            </button>
            <button className="w-full btn-secondary text-left">
              <Plus size={16} className="inline mr-2" />
              Add Menu Item
            </button>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
          <div className="space-y-3 text-gray-300">
            <p className="text-sm">No recent activity to display.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
