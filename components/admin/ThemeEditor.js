'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function ThemeEditor() {
  const [theme, setTheme] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchActiveTheme()
  }, [])

  const fetchActiveTheme = async () => {
    try {
      const { data, error } = await supabase
        .from('theme_settings')
        .select('*')
        .eq('is_active', true)
        .single()

      if (error) throw error
      setTheme(data)
    } catch (error) {
      console.error('Error fetching theme:', error)
      setMessage('Error loading theme settings')
    } finally {
      setLoading(false)
    }
  }

  const handleColorChange = (field, value) => {
    setTheme(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage('')
    
    try {
      const { error } = await supabase
        .from('theme_settings')
        .update({
          primary_color: theme.primary_color,
          primary_light: theme.primary_light,
          primary_dark: theme.primary_dark,
          secondary_color: theme.secondary_color,
          secondary_light: theme.secondary_light,
          secondary_dark: theme.secondary_dark,
          bg_gradient_from: theme.bg_gradient_from,
          bg_gradient_via: theme.bg_gradient_via,
          bg_gradient_to: theme.bg_gradient_to,
          text_primary: theme.text_primary,
          text_secondary: theme.text_secondary,
          button_style: theme.button_style,
          button_radius: theme.button_radius,
          glass_opacity: theme.glass_opacity,
          border_opacity: theme.border_opacity
        })
        .eq('id', theme.id)

      if (error) throw error

      setMessage('Theme saved successfully!')
      setTimeout(() => setMessage(''), 3000)
      
      // Apply theme to CSS variables
      applyTheme(theme)
    } catch (error) {
      console.error('Error saving theme:', error)
      setMessage('Error saving theme')
    } finally {
      setSaving(false)
    }
  }

  const applyTheme = (themeData) => {
    const root = document.documentElement
    root.style.setProperty('--color-primary', themeData.primary_color)
    root.style.setProperty('--color-primary-light', themeData.primary_light)
    root.style.setProperty('--color-primary-dark', themeData.primary_dark)
    root.style.setProperty('--color-secondary', themeData.secondary_color)
    root.style.setProperty('--color-secondary-light', themeData.secondary_light)
    root.style.setProperty('--color-secondary-dark', themeData.secondary_dark)
    root.style.setProperty('--bg-gradient-from', themeData.bg_gradient_from)
    root.style.setProperty('--bg-gradient-via', themeData.bg_gradient_via)
    root.style.setProperty('--bg-gradient-to', themeData.bg_gradient_to)
    root.style.setProperty('--text-primary', themeData.text_primary)
    root.style.setProperty('--text-secondary', themeData.text_secondary)
    root.style.setProperty('--glass-opacity', themeData.glass_opacity)
    root.style.setProperty('--border-opacity', themeData.border_opacity)
  }

  const handleReset = async () => {
    if (!confirm('Reset to default theme? This will reload the page.')) return
    
    try {
      const { error } = await supabase
        .from('theme_settings')
        .update({
          primary_color: '#7c3aed',
          primary_light: '#a78bfa',
          primary_dark: '#5b21b6',
          secondary_color: '#9333ea',
          secondary_light: '#c084fc',
          secondary_dark: '#6b21a8',
          bg_gradient_from: '#111827',
          bg_gradient_via: '#581c87',
          bg_gradient_to: '#111827',
          text_primary: '#ffffff',
          text_secondary: '#d1d5db',
          button_style: 'gradient',
          button_radius: 'rounded-lg',
          glass_opacity: 0.10,
          border_opacity: 0.20
        })
        .eq('id', theme.id)

      if (error) throw error
      
      window.location.reload()
    } catch (error) {
      console.error('Error resetting theme:', error)
      setMessage('Error resetting theme')
    }
  }

  // Apply theme on load
  useEffect(() => {
    if (theme) {
      applyTheme(theme)
    }
  }, [theme])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading theme editor...</div>
      </div>
    )
  }

  if (!theme) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-400">No active theme found</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Theme Editor</h1>
          <div className="flex gap-4">
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              Reset to Default
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-nightshade-600 hover:bg-nightshade-700 rounded-lg transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Theme'}
            </button>
          </div>
        </div>

        {message && (
          <div className={`mb-4 p-4 rounded-lg ${message.includes('Error') ? 'bg-red-500/20 text-red-200' : 'bg-green-500/20 text-green-200'}`}>
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel - Controls */}
          <div className="space-y-6">
            {/* Primary Colors */}
            <div className="glass-dark rounded-xl p-6">
              <h2 className="text-2xl font-bold mb-4">Primary Colors</h2>
              <div className="space-y-4">
                <ColorPicker
                  label="Primary Color"
                  value={theme.primary_color}
                  onChange={(val) => handleColorChange('primary_color', val)}
                />
                <ColorPicker
                  label="Primary Light"
                  value={theme.primary_light}
                  onChange={(val) => handleColorChange('primary_light', val)}
                />
                <ColorPicker
                  label="Primary Dark"
                  value={theme.primary_dark}
                  onChange={(val) => handleColorChange('primary_dark', val)}
                />
              </div>
            </div>

            {/* Secondary Colors */}
            <div className="glass-dark rounded-xl p-6">
              <h2 className="text-2xl font-bold mb-4">Secondary Colors</h2>
              <div className="space-y-4">
                <ColorPicker
                  label="Secondary Color"
                  value={theme.secondary_color}
                  onChange={(val) => handleColorChange('secondary_color', val)}
                />
                <ColorPicker
                  label="Secondary Light"
                  value={theme.secondary_light}
                  onChange={(val) => handleColorChange('secondary_light', val)}
                />
                <ColorPicker
                  label="Secondary Dark"
                  value={theme.secondary_dark}
                  onChange={(val) => handleColorChange('secondary_dark', val)}
                />
              </div>
            </div>

            {/* Background Gradient */}
            <div className="glass-dark rounded-xl p-6">
              <h2 className="text-2xl font-bold mb-4">Background Gradient</h2>
              <div className="space-y-4">
                <ColorPicker
                  label="Gradient From"
                  value={theme.bg_gradient_from}
                  onChange={(val) => handleColorChange('bg_gradient_from', val)}
                />
                <ColorPicker
                  label="Gradient Via"
                  value={theme.bg_gradient_via}
                  onChange={(val) => handleColorChange('bg_gradient_via', val)}
                />
                <ColorPicker
                  label="Gradient To"
                  value={theme.bg_gradient_to}
                  onChange={(val) => handleColorChange('bg_gradient_to', val)}
                />
              </div>
            </div>

            {/* Text Colors */}
            <div className="glass-dark rounded-xl p-6">
              <h2 className="text-2xl font-bold mb-4">Text Colors</h2>
              <div className="space-y-4">
                <ColorPicker
                  label="Primary Text"
                  value={theme.text_primary}
                  onChange={(val) => handleColorChange('text_primary', val)}
                />
                <ColorPicker
                  label="Secondary Text"
                  value={theme.text_secondary}
                  onChange={(val) => handleColorChange('text_secondary', val)}
                />
              </div>
            </div>

            {/* Button Settings */}
            <div className="glass-dark rounded-xl p-6">
              <h2 className="text-2xl font-bold mb-4">Button Settings</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Button Style</label>
                  <select
                    value={theme.button_style}
                    onChange={(e) => handleColorChange('button_style', e.target.value)}
                    className="w-full"
                  >
                    <option value="gradient">Gradient</option>
                    <option value="solid">Solid</option>
                    <option value="outline">Outline</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Button Radius</label>
                  <select
                    value={theme.button_radius}
                    onChange={(e) => handleColorChange('button_radius', e.target.value)}
                    className="w-full"
                  >
                    <option value="rounded-none">Square</option>
                    <option value="rounded-lg">Rounded</option>
                    <option value="rounded-full">Pill</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Glass Effect */}
            <div className="glass-dark rounded-xl p-6">
              <h2 className="text-2xl font-bold mb-4">Glass Effect</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Glass Opacity: {theme.glass_opacity}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={theme.glass_opacity}
                    onChange={(e) => handleColorChange('glass_opacity', parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Border Opacity: {theme.border_opacity}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={theme.border_opacity}
                    onChange={(e) => handleColorChange('border_opacity', parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Preview */}
          <div className="space-y-6 sticky top-8 h-fit">
            <div className="glass-dark rounded-xl p-6">
              <h2 className="text-2xl font-bold mb-4">Live Preview</h2>
              
              {/* Background Preview */}
              <div 
                className="h-32 rounded-lg mb-4"
                style={{
                  background: `linear-gradient(to bottom right, ${theme.bg_gradient_from}, ${theme.bg_gradient_via}, ${theme.bg_gradient_to})`
                }}
              />

              {/* Button Previews */}
              <div className="space-y-4">
                <button 
                  className={`px-6 py-3 w-full ${theme.button_radius} transition-all`}
                  style={{
                    background: theme.button_style === 'gradient' 
                      ? `linear-gradient(to right, ${theme.primary_color}, ${theme.secondary_color})`
                      : theme.button_style === 'solid'
                      ? theme.primary_color
                      : 'transparent',
                    border: theme.button_style === 'outline' ? `2px solid ${theme.primary_color}` : 'none',
                    color: theme.text_primary
                  }}
                >
                  Primary Button
                </button>

                <button 
                  className={`px-6 py-3 w-full ${theme.button_radius} transition-all`}
                  style={{
                    background: `rgba(255, 255, 255, ${theme.glass_opacity})`,
                    backdropFilter: 'blur(12px)',
                    border: `1px solid rgba(255, 255, 255, ${theme.border_opacity})`,
                    color: theme.text_primary
                  }}
                >
                  Glass Button
                </button>
              </div>

              {/* Text Preview */}
              <div className="mt-6 space-y-2">
                <p style={{ color: theme.text_primary }} className="text-lg font-bold">
                  Primary Text Example
                </p>
                <p style={{ color: theme.text_secondary }}>
                  Secondary text example for descriptions and body content.
                </p>
              </div>

              {/* Color Swatches */}
              <div className="mt-6">
                <p className="text-sm font-medium mb-2">Color Palette</p>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center">
                    <div 
                      className="h-12 rounded mb-1"
                      style={{ backgroundColor: theme.primary_light }}
                    />
                    <span className="text-xs">Primary Light</span>
                  </div>
                  <div className="text-center">
                    <div 
                      className="h-12 rounded mb-1"
                      style={{ backgroundColor: theme.primary_color }}
                    />
                    <span className="text-xs">Primary</span>
                  </div>
                  <div className="text-center">
                    <div 
                      className="h-12 rounded mb-1"
                      style={{ backgroundColor: theme.primary_dark }}
                    />
                    <span className="text-xs">Primary Dark</span>
                  </div>
                  <div className="text-center">
                    <div 
                      className="h-12 rounded mb-1"
                      style={{ backgroundColor: theme.secondary_light }}
                    />
                    <span className="text-xs">Secondary Light</span>
                  </div>
                  <div className="text-center">
                    <div 
                      className="h-12 rounded mb-1"
                      style={{ backgroundColor: theme.secondary_color }}
                    />
                    <span className="text-xs">Secondary</span>
                  </div>
                  <div className="text-center">
                    <div 
                      className="h-12 rounded mb-1"
                      style={{ backgroundColor: theme.secondary_dark }}
                    />
                    <span className="text-xs">Secondary Dark</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Color Picker Component
function ColorPicker({ label, value, onChange }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-2">{label}</label>
      <div className="flex gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-20 rounded cursor-pointer"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1"
          placeholder="#000000"
        />
      </div>
    </div>
  )
}
