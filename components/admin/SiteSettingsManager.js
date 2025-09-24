'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Save, RotateCcw, Upload, ExternalLink, Globe, Image, FileText, Tag } from 'lucide-react'

export default function SiteSettingsManager() {
  const [settings, setSettings] = useState({
    site_name: '',
    site_description: '',
    site_logo: '',
    favicon_url: '',
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
    og_image: '',
    site_url: '',
    google_analytics_id: '',
    google_search_console: '',
    robots_txt: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('key', 'general')
        .single()

      if (data && data.value) {
        setSettings(data.value)
      } else {
        // Set default values if no data exists
        setSettings({
          site_name: 'The Nightshade\'s Bloom',
          site_description: 'A mystical venue where darkness meets elegance',
          site_logo: '',
          favicon_url: '',
          meta_title: '',
          meta_description: '',
          meta_keywords: '',
          og_image: '',
          site_url: 'https://your-domain.com',
          google_analytics_id: '',
          google_search_console: '',
          robots_txt: 'User-agent: *\nDisallow:'
        })
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
      setMessage('Error loading site settings')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('site_settings')
        .upsert([
          {
            key: 'general',
            value: settings
          }
        ], { onConflict: 'key' })
  
      if (error) throw error
  
      setMessage('Site settings saved successfully!')
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      console.error('Error saving settings:', error)
      setMessage('Error saving site settings')
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    setSettings({
      site_name: 'The Nightshade\'s Bloom',
      site_description: 'A mystical venue where darkness meets elegance',
      site_logo: '',
      favicon_url: '',
      meta_title: '',
      meta_description: '',
      meta_keywords: '',
      og_image: '',
      site_url: 'https://your-domain.com',
      google_analytics_id: '',
      google_search_console: '',
      robots_txt: 'User-agent: *\nDisallow:'
    })
    setMessage('Settings reset to defaults')
    setTimeout(() => setMessage(''), 3000)
  }

  const updateField = (field, value) => {
    setSettings(prev => ({
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Site Settings</h2>
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
        {/* General Settings */}
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <Globe size={20} />
            <span>General Information</span>
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Site Name
              </label>
              <input
                type="text"
                value={settings.site_name}
                onChange={(e) => updateField('site_name', e.target.value)}
                placeholder="Your Site Name"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-nightshade-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Site Description
              </label>
              <textarea
                value={settings.site_description}
                onChange={(e) => updateField('site_description', e.target.value)}
                placeholder="Brief description of your site"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-nightshade-500 focus:border-transparent resize-none"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Site URL
              </label>
              <input
                type="url"
                value={settings.site_url}
                onChange={(e) => updateField('site_url', e.target.value)}
                placeholder="https://your-domain.com"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-nightshade-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Branding */}
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <Image size={20} />
            <span>Branding</span>
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Site Logo URL
              </label>
              <div className="flex space-x-2">
                <input
                  type="url"
                  value={settings.site_logo}
                  onChange={(e) => updateField('site_logo', e.target.value)}
                  placeholder="https://example.com/logo.png"
                  className="flex-1 px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-nightshade-500 focus:border-transparent"
                />
                {settings.site_logo && (
                  <a
                    href={settings.site_logo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-400 hover:text-nightshade-400 transition-colors"
                  >
                    <ExternalLink size={16} />
                  </a>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Favicon URL
              </label>
              <div className="flex space-x-2">
                <input
                  type="url"
                  value={settings.favicon_url}
                  onChange={(e) => updateField('favicon_url', e.target.value)}
                  placeholder="https://example.com/favicon.ico"
                  className="flex-1 px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-nightshade-500 focus:border-transparent"
                />
                {settings.favicon_url && (
                  <a
                    href={settings.favicon_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-400 hover:text-nightshade-400 transition-colors"
                  >
                    <ExternalLink size={16} />
                  </a>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Recommended: 32x32px .ico or .png file
              </p>
            </div>

            {/* Logo Preview */}
            {settings.site_logo && (
              <div className="mt-4 p-3 bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-300 mb-2">Logo Preview:</p>
                <img
                  src={settings.site_logo}
                  alt="Site Logo"
                  className="h-12 w-auto object-contain"
                  onError={(e) => {
                    e.target.style.display = 'none'
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* SEO Settings */}
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <Tag size={20} />
            <span>SEO & Meta Tags</span>
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Meta Title
              </label>
              <input
                type="text"
                value={settings.meta_title}
                onChange={(e) => updateField('meta_title', e.target.value)}
                placeholder="Leave empty to use site name"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-nightshade-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Meta Description
              </label>
              <textarea
                value={settings.meta_description}
                onChange={(e) => updateField('meta_description', e.target.value)}
                placeholder="SEO description for search engines (150-160 characters)"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-nightshade-500 focus:border-transparent resize-none"
                rows={3}
              />
              <p className="text-xs text-gray-400 mt-1">
                Characters: {settings.meta_description.length}/160
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Meta Keywords
              </label>
              <input
                type="text"
                value={settings.meta_keywords}
                onChange={(e) => updateField('meta_keywords', e.target.value)}
                placeholder="keyword1, keyword2, keyword3"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-nightshade-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Open Graph Image URL
              </label>
              <input
                type="url"
                value={settings.og_image}
                onChange={(e) => updateField('og_image', e.target.value)}
                placeholder="https://example.com/og-image.jpg"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-nightshade-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-400 mt-1">
                Recommended: 1200x630px for social media sharing
              </p>
            </div>
          </div>
        </div>

        {/* Analytics & Tools */}
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <FileText size={20} />
            <span>Analytics & Tools</span>
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Google Analytics ID
              </label>
              <input
                type="text"
                value={settings.google_analytics_id}
                onChange={(e) => updateField('google_analytics_id', e.target.value)}
                placeholder="G-XXXXXXXXXX"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-nightshade-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Google Search Console Meta Tag
              </label>
              <input
                type="text"
                value={settings.google_search_console}
                onChange={(e) => updateField('google_search_console', e.target.value)}
                placeholder="Content value from verification meta tag"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-nightshade-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Robots.txt Content
              </label>
              <textarea
                value={settings.robots_txt}
                onChange={(e) => updateField('robots_txt', e.target.value)}
                placeholder="User-agent: *&#10;Disallow:"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-nightshade-500 focus:border-transparent font-mono text-sm resize-none"
                rows={4}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-4">Important Notes</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-900/20 border border-blue-500/20 rounded-lg">
            <h4 className="font-medium text-blue-300 mb-2">SEO Tips</h4>
            <ul className="text-sm text-blue-200 space-y-1">
              <li>• Keep meta descriptions under 160 characters</li>
              <li>• Use descriptive, unique titles for each page</li>
              <li>• Include relevant keywords naturally</li>
            </ul>
          </div>
          <div className="p-4 bg-yellow-900/20 border border-yellow-500/20 rounded-lg">
            <h4 className="font-medium text-yellow-300 mb-2">Image Requirements</h4>
            <ul className="text-sm text-yellow-200 space-y-1">
              <li>• Favicon: 32x32px, .ico or .png format</li>
              <li>• Logo: SVG or high-res PNG recommended</li>
              <li>• Open Graph: 1200x630px for best results</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
