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
  LogOut,
  Globe,
  ChevronDown,
  Activity,
  Download,
  Calendar,
  Clock,
  Eye,
  TrendingUp,
  Database,
  ArrowUp,
  ArrowDown,
  Image as ImageIcon
} from 'lucide-react'
import StaffManager from '@/components/admin/StaffManager'
import MenuManager from '@/components/admin/MenuManager'
import PageManager from '@/components/admin/PageManager'
import AdminManager from '@/components/admin/AdminManager'
import ShadecardManager from '@/components/admin/ShadecardManager'
import FooterManager from '@/components/admin/FooterManager'
import SiteSettingsManager from '@/components/admin/SiteSettingsManager'
import ThemeEditor from '@/components/admin/ThemeEditor'
import ImageLibrary from '@/components/ImageLibrary'



// Activity Logger Hook
const useActivityLogger = () => {
  const logActivity = async (action, targetType = null, targetId = null, targetName = null, details = {}) => {
    try {
      if (typeof window === 'undefined') return
      
      const adminDataStr = localStorage.getItem('admin_data')
      if (!adminDataStr) {
        console.warn('No admin data found, skipping activity log')
        return
      }

      const adminData = JSON.parse(adminDataStr)
      
      const { error } = await supabase.from('admin_activity_logs').insert([{
        admin_id: adminData.id,
        admin_username: adminData.username,
        action,
        target_type: targetType,
        target_id: targetId,
        target_name: targetName,
        details,
        ip_address: null,
        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null
      }])

      if (error) {
        console.error('Error logging activity:', error)
      } else {
        console.log('Activity logged:', action)
      }
    } catch (error) {
      console.error('Failed to log activity:', error)
    }
  }

  return { logActivity }
}

export default function AdminDashboard({ onLogout }) {
  const toCentralTime = (utcDateString) => {
    if (!utcDateString) return 'N/A'
    
    // Force UTC interpretation by adding 'Z' if not present
    const dateStr = utcDateString.includes('Z') ? utcDateString : utcDateString + 'Z'
    const date = new Date(dateStr)
    
    if (isNaN(date.getTime())) return 'Invalid Date'
    
    return new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Chicago',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    }).format(date)
  }
  const [activeTab, setActiveTab] = useState('dashboard')
  const [stats, setStats] = useState({
    totalPages: 0,
    totalStaff: 0,
    totalMenuItems: 0,
    totalAdmins: 0,
    totalShadecards: 0,
    totalImages: 0,
    recentActivity: [],
    pagesByTemplate: {},
    staffByCategory: {},
    todayActivity: 0,
    weekActivity: 0,
    totalPageContent: 0
  })
  const [activityLogs, setActivityLogs] = useState([])
  const { logActivity } = useActivityLogger()

  useEffect(() => {
    fetchStats()
    fetchActivityLogs()
    // Log dashboard access
    logActivity('dashboard_access', 'dashboard', null, 'Dashboard')
  }, [])

  const fetchStats = async () => {
    try {
      const [
        pages, 
        staff, 
        menuItems, 
        shadecards, 
        admins,
        pageContent,
        staffCategories,
        recentActivity,
        todayActivity,
        weekActivity
      ] = await Promise.all([
        supabase.from('pages').select('id, template').then(({ data }) => data || []),
        supabase.from('staff').select('id, category_id, staff_categories(name)').then(({ data }) => data || []),
        supabase.from('menu_items').select('id').then(({ data }) => data?.length || 0),
        supabase.from('shadecard_riddles').select('id').then(({ data }) => data?.length || 0),
        supabase.from('admins').select('id').then(({ data }) => data?.length || 0),
        supabase.from('image_library').select('id').then(({ data }) => data?.length || 0), 
        supabase.from('page_content').select('id').then(({ data }) => data?.length || 0),
        supabase.from('staff_categories').select('id, name').then(({ data }) => data || []),
        supabase.from('admin_activity_logs').select('*').order('created_at', { ascending: false }).limit(5).then(({ data }) => data || []),
        supabase.from('admin_activity_logs').select('id').gte('created_at', new Date().toISOString().split('T')[0]).then(({ data }) => data?.length || 0),
        supabase.from('admin_activity_logs').select('id').gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()).then(({ data }) => data?.length || 0)
      ])

      // Analyze pages by template
      const pagesByTemplate = {}
      pages.forEach(page => {
        const template = page.template || 'blank'
        pagesByTemplate[template] = (pagesByTemplate[template] || 0) + 1
      })

      // Analyze staff by category
      const staffByCategory = {}
      staff.forEach(member => {
        const categoryName = member.staff_categories?.name || 'Uncategorized'
        staffByCategory[categoryName] = (staffByCategory[categoryName] || 0) + 1
      })

      setStats({
        totalPages: pages.length,
        totalStaff: staff.length,
        totalMenuItems: menuItems,
        totalAdmins: admins,
        totalShadecards: shadecards,
        totalImages: images,
        totalPageContent: pageContent,
        pagesByTemplate,
        staffByCategory,
        recentActivity,
        todayActivity,
        weekActivity
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const fetchActivityLogs = async () => {
    try {
      const { data } = await supabase
        .from('admin_activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100)
  
      console.log('First log timestamp:', data?.[0]?.created_at)  // Add this line
      setActivityLogs(data || [])
    } catch (error) {
      console.error('Error fetching activity logs:', error)
    }
  }

  const handleLogout = async () => {
    await logActivity('Logged out', 'auth', null, 'Admin Logout')
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_data')
    onLogout()
  }
  
  const handleQuickAction = async (action, targetTab) => {
    await logActivity('quick_action', 'navigation', null, `Quick ${action}`)
    setActiveTab(targetTab)
  }

  const handleTabChange = async (tabId) => {
    const tabLabel = tabs.find(t => t.id === tabId)?.label
    await logActivity(`Viewed ${tabLabel}`, 'tab', null, tabLabel)
    setActiveTab(tabId)
  }

  const exportActivityLogs = async () => {
    try {
      const { data } = await supabase
        .from('admin_activity_logs')
        .select('*')
        .order('created_at', { ascending: false })

      if (data) {
        const csv = convertToCSV(data)
        downloadCSV(csv, `activity-logs-${new Date().toISOString().split('T')[0]}.csv`)
        await logActivity('export', 'activity_logs', null, 'Activity Logs Export')
      }
    } catch (error) {
      console.error('Error exporting logs:', error)
    }
  }

  const convertToCSV = (data) => {
    const headers = ['Date', 'Admin', 'Action', 'Target Type', 'Target Name', 'Details']
    const csvContent = [
      headers.join(','),
      ...data.map(log => [
        new Date(log.created_at).toLocaleString(),
        log.admin_username || 'Unknown',
        log.action,
        log.target_type || '',
        log.target_name || '',
        JSON.stringify(log.details || {}).replace(/,/g, ';')
      ].map(field => `"${field}"`).join(','))
    ].join('\n')
    
    return csvContent
  }

  const downloadCSV = (csvContent, filename) => {
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.setAttribute('hidden', '')
    a.setAttribute('href', url)
    a.setAttribute('download', filename)
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'pages', label: 'Pages', icon: FileText },
    { id: 'staff', label: 'Staff', icon: Users },
    { id: 'menu', label: 'Menu', icon: MenuIcon },
    { id: 'theme', label: 'Theme', icon: Settings },
    { id: 'images', label: 'Images', icon: ImageIcon },
    { id: 'admins', label: 'Admins', icon: Settings },
    { id: 'shadecard', label: 'Shadecard', icon: Settings }, 
    { id: 'footer', label: 'Footer', icon: Globe },
    { id: 'site-settings', label: 'Site Settings', icon: Globe },
    { id: 'activity', label: 'Activity Logs', icon: Activity },
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardOverview stats={stats} onQuickAction={handleQuickAction} onRefresh={fetchStats} toCentralTime={toCentralTime} />
      case 'pages':
        return <PageManager />
      case 'staff':
        return <StaffManager />
      case 'menu':
        return <MenuManager />
      case 'images':
        return <ImageLibrary /> 
      case 'theme':
        return <ThemeEditor /> 
      case 'admins':
        return <AdminManager />
      case 'shadecard':
        return <ShadecardManager /> 
      case 'footer':
        return <FooterManager />
      case 'site-settings':
        return <SiteSettingsManager />
      case 'activity':
        return <ActivityLogs 
          logs={activityLogs}
          onExport={exportActivityLogs}
          onRefresh={fetchActivityLogs}
          toCentralTime={toCentralTime}
        />
      default:
        return <DashboardOverview stats={stats} onQuickAction={handleQuickAction} onRefresh={fetchStats} />
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
                    onClick={() => handleTabChange(tab.id)}
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
function DashboardOverview({ stats, onQuickAction, onRefresh, toCentralTime }) {
  const statCards = [
    { 
      label: 'Total Pages', 
      value: stats.totalPages, 
      icon: FileText, 
      color: 'from-blue-500 to-blue-600',
      change: '+5.2%',
      isPositive: true
    },
    { 
      label: 'Staff Members', 
      value: stats.totalStaff, 
      icon: Users, 
      color: 'from-green-500 to-green-600',
      change: '+2.1%',
      isPositive: true
    },
    { 
      label: 'Menu Items', 
      value: stats.totalMenuItems, 
      icon: MenuIcon, 
      color: 'from-purple-500 to-purple-600',
      change: '0%',
      isPositive: null
    },
    { 
      label: 'Shadecards', 
      value: stats.totalShadecards || 0, 
      icon: Settings, 
      color: 'from-yellow-500 to-yellow-600',
      change: '+12.5%',
      isPositive: true
    },
    { 
      label: 'Administrators', 
      value: stats.totalAdmins, 
      icon: Settings, 
      color: 'from-red-500 to-red-600',
      change: '0%',
      isPositive: null
    },
    { 
      label: 'Images', 
      value: stats.totalImages || 0, 
      icon: ImageIcon, 
      color: 'from-orange-500 to-orange-600',
      change: '0%',
      isPositive: null
    },
  ]

  const detailedStats = [
    { label: 'Page Content', value: stats.totalPageContent || 0, icon: Database, color: 'from-indigo-500 to-indigo-600' },
    { label: 'Today Activity', value: stats.todayActivity || 0, icon: TrendingUp, color: 'from-pink-500 to-pink-600' },
    { label: 'Week Activity', value: stats.weekActivity || 0, icon: Activity, color: 'from-cyan-500 to-cyan-600' },
  ]

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Dashboard Overview</h2>
        <button
          onClick={onRefresh}
          className="btn-secondary flex items-center space-x-2"
        >
          <Activity size={16} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="card relative">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg bg-gradient-to-r ${stat.color} mr-4`}>
                  <Icon size={24} className="text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">{stat.label}</p>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                </div>
              </div>
              {/* Percentage indicator in top right */}
              <div className="absolute top-3 right-3 flex items-center space-x-1">
                {stat.isPositive === true && (
                  <>
                    <ArrowUp size={12} className="text-green-400" />
                    <span className="text-xs text-green-400 font-semibold">{stat.change}</span>
                  </>
                )}
                {stat.isPositive === false && (
                  <>
                    <ArrowDown size={12} className="text-red-400" />
                    <span className="text-xs text-red-400 font-semibold">{stat.change}</span>
                  </>
                )}
                {stat.isPositive === null && (
                  <span className="text-xs text-gray-400 font-semibold">{stat.change}</span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Detailed Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {detailedStats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="card bg-white/5">
              <div className="flex items-center">
                <div className={`p-2 rounded-lg bg-gradient-to-r ${stat.color} mr-3`}>
                  <Icon size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">{stat.label}</p>
                  <p className="text-lg font-bold text-white">{stat.value}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button 
              onClick={() => onQuickAction('Add New Page', 'pages')}
              className="w-full btn-primary text-left flex items-center"
            >
              <Plus size={16} className="mr-2" />
              Add New Page
            </button>
            <button 
              onClick={() => onQuickAction('Add Staff Member', 'staff')}
              className="w-full btn-secondary text-left flex items-center"
            >
              <Plus size={16} className="mr-2" />
              Add Staff Member
            </button>
            <button 
              onClick={() => onQuickAction('Add Menu Item', 'menu')}
              className="w-full btn-secondary text-left flex items-center"
            >
              <Plus size={16} className="mr-2" />
              Add Menu Item
            </button>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {stats.recentActivity.length > 0 ? (
              stats.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="text-gray-300">
                    <span className="text-nightshade-400">{activity.admin_username}</span> {activity.action}
                    {activity.target_name && <span className="text-gray-500"> "{activity.target_name}"</span>}
                  </div>
                  <div className="text-gray-500 text-xs">
                    {toCentralTime(activity.created_at)}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-400">No recent activity to display.</p>
            )}
          </div>
        </div>
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pages by Template */}
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4">Pages by Template</h3>
          <div className="space-y-2">
            {Object.entries(stats.pagesByTemplate || {}).map(([template, count]) => (
              <div key={template} className="flex justify-between items-center">
                <span className="text-gray-300 capitalize">{template}</span>
                <span className="text-nightshade-400 font-semibold">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Staff by Category */}
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4">Staff by Category</h3>
          <div className="space-y-2">
            {Object.entries(stats.staffByCategory || {}).map(([category, count]) => (
              <div key={category} className="flex justify-between items-center">
                <span className="text-gray-300">{category}</span>
                <span className="text-nightshade-400 font-semibold">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// Activity Logs Component
function ActivityLogs({ logs, onExport, onRefresh, toCentralTime }) {
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  const filteredLogs = logs.filter(log => {
    const matchesFilter = filter === 'all' || log.action.includes(filter)
    const matchesSearch = searchTerm === '' || 
      log.admin_username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.target_name?.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesFilter && matchesSearch
  })

  const actionTypes = ['all', 'login', 'logout', 'create', 'update', 'delete', 'navigation']

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Activity Logs</h2>
        <div className="flex space-x-2">
          <button onClick={onRefresh} className="btn-secondary">
            <Activity size={16} className="mr-2" />
            Refresh
          </button>
          <button onClick={onExport} className="btn-primary">
            <Download size={16} className="mr-2" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Search</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by admin, action, or target..."
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Filter by Action</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
            >
              {actionTypes.map(type => (
                <option key={type} value={type} className="bg-gray-800">
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Date</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Admin</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Action</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Target</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-white/5">
                  <td className="px-4 py-3 text-sm text-gray-300">
                    {toCentralTime(log.created_at)}
                  </td>
                  <td className="px-4 py-3 text-sm text-nightshade-300">
                    {log.admin_username || 'Unknown'}
                  </td>
                  <td className="px-4 py-3 text-sm text-white">
                    <span className="px-2 py-1 bg-nightshade-600/20 rounded-full text-xs">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-300">
                    {log.target_type && (
                      <div>
                        <span className="text-purple-400">{log.target_type}</span>
                        {log.target_name && <div className="text-xs text-gray-500">{log.target_name}</div>}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400 max-w-xs truncate">
                    {log.details && Object.keys(log.details).length > 0 ? 
                      JSON.stringify(log.details) : '-'
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredLogs.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            No activity logs found matching your criteria.
          </div>
        )}
      </div>
    </div>
  )
}
