'use client'
import { useState, useEffect } from 'react'
import { supabaseAdmin } from '@/lib/supabase'
import { Save, RotateCcw, ExternalLink } from 'lucide-react'

export default function FooterManager() {
  const [footerData, setFooterData] = useState({
    copyright: '',
    twitter_url: '',
    bluesky_url: '',
    instagram_url: '',
    discord_url: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchFooterData()
  }, [])

  const fetchFooterData = async () => {
    try {
      const { data, error } = await supabaseAdmin
        .from('site_settings')
        .select('*')
        .eq('key', 'footer')
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      if (data && data.value) {
        setFooterData(data.value)
      } else {
        // Set default values if no data exists
        setFooterData({
          copyright: `© ${new Date().getFullYear()} The Nightshades Bloom. All rights reserved.`,
          twitter_url: '',
          bluesky_url: '',
          instagram_url: '',
          discord_url: ''
        })
      }
    } catch (error) {
      console.error('Error fetching footer data:', error)
      setMessage('Error loading footer data: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    
    try {
      const { data, error } = await supabaseAdmin
        .from('site_settings')
        .upsert([
          {
            key: 'footer',
            value: footerData
          }
        ], {
          onConflict: 'key'
        })
        .select()

      if (error) throw error

      setMessage('Footer settings saved successfully!')
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      console.error('Error saving footer data:', error)
      setMessage('Error saving footer settings: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    setFooterData({
      copyright: `© ${new Date().getFullYear()} The Nightshades Bloom. All rights reserved.`,
      twitter_url: '',
      bluesky_url: '',
      instagram_url: '',
      discord_url: ''
    })
    setMessage('Footer settings reset to defaults')
    setTimeout(() => setMessage(''), 3000)
  }

  const updateField = (field, value) => {
    setFooterData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nightshade-400"></div>
      </div>
    )
  }

  const socialIcons = [
    {
      key: 'twitter_url',
      icon: TwitterIcon,
      name: 'Twitter/X',
      color: 'hover:text-blue-300'
    },
    {
      key: 'bluesky_url',
      icon: BlueskyIcon,
      name: 'Bluesky',
      color: 'hover:text-sky-400'
    },
    {
      key: 'instagram_url', 
      icon: Instagram,
      name: 'Instagram',
      color: 'hover:text-pink-400'
    },
    {
      key: 'discord_url',
      icon: DiscordIcon,
      name: 'Discord', 
      color: 'hover:text-indigo-400'
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Footer Management</h2>
        <div className="flex space-x-3">
          <button
            onClick={handleReset}
            disabled={saving}
            className="flex items-center space-x-2 btn-secondary"
          >
            <RotateCcw size={16} />
            <span>Reset</span>
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center space-x-2 btn-primary"
          >
            <Save size={16} />
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${
          message.includes('Error') 
            ? 'bg-red-900/20 border border-red-500/20 text-red-400'
            : 'bg-green-900/20 border border-green-500/20 text-green-400'
        }`}>
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Copyright Section */}
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4">Copyright Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Copyright Text
              </label>
              <textarea
                value={footerData.copyright}
                onChange={(e) => updateField('copyright', e.target.value)}
                placeholder="© 2024 Your Site Name. All rights reserved."
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-nightshade-500 focus:border-transparent resize-none"
                rows={3}
              />
              <p className="text-xs text-gray-400 mt-1">
                Tip: Use {new Date().getFullYear()} for current year
              </p>
            </div>
          </div>
        </div>

        {/* Social Media Section */}
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4">Social Media Links</h3>
          <div className="space-y-4">
            {socialFields.map((field) => (
              <div key={field.key}>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <span className="inline-flex items-center space-x-2">
                    <span>{field.icon}</span>
                    <span>{field.label}</span>
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={footerData[field.key]}
                    onChange={(e) => updateField(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-nightshade-500 focus:border-transparent pr-10"
                  />
                  {footerData[field.key] && (
                    <a
                      href={footerData[field.key]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-nightshade-400 transition-colors"
                      title="Test link"
                    >
                      <ExternalLink size={16} />
                    </a>
                  )}
                </div>
              </div>
            ))}
            <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500/20 rounded-lg">
              <p className="text-sm text-blue-300">
                <strong>Note:</strong> Only social media platforms with URLs will display as icons in the footer. 
                Leave fields empty to hide those icons.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Section */}
      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-4">Footer Preview</h3>
        <div className="bg-black/50 backdrop-blur-sm border border-white/10 rounded-lg p-6">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            {/* Copyright Preview */}
            <div className="text-gray-400 text-sm">
              {footerData.copyright || `© ${new Date().getFullYear()} The Nightshades Bloom. All rights reserved.`}
            </div>

            {/* Social Links Preview */}
            <div className="flex space-x-4">
              {socialFields.map((field) => {
                if (!footerData[field.key]?.trim()) return null
                return (
                  <div
                    key={field.key}
                    className="text-gray-400 hover:text-nightshade-400 transition-colors cursor-pointer"
                    title={field.label}
                  >
                    <span className="text-lg">{field.icon}</span>
                  </div>
                )
              })}
              {socialFields.every(field => !footerData[field.key]?.trim()) && (
                <span className="text-gray-500 text-sm">No social media links configured</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
