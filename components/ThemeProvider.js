'use client'
import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function ThemeProvider({ children }) {
  useEffect(() => {
    loadAndApplyTheme()
    
    // Set up real-time subscription for theme changes
    const subscription = supabase
      .channel('theme_changes')
      .on('postgres_changes', 
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'theme_settings',
          filter: 'is_active=eq.true'
        }, 
        (payload) => {
          console.log('Theme updated via realtime:', payload.new)
          applyTheme(payload.new)
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const loadAndApplyTheme = async () => {
    try {
      const { data, error } = await supabase
        .from('theme_settings')
        .select('*')
        .eq('is_active', true)
        .single()

      console.log('Loaded theme from database:', data)

      if (data && !error) {
        applyTheme(data)
      } else {
        console.error('Error loading theme:', error)
      }
    } catch (error) {
      console.error('Error loading theme:', error)
    }
  }

  const applyTheme = (theme) => {
    if (!theme) return
    
    console.log('Applying theme:', theme)
    
    const root = document.documentElement
    root.style.setProperty('--color-primary', theme.primary_color || '#7c3aed')
    root.style.setProperty('--color-primary-light', theme.primary_light || '#a78bfa')
    root.style.setProperty('--color-primary-dark', theme.primary_dark || '#5b21b6')
    root.style.setProperty('--color-secondary', theme.secondary_color || '#9333ea')
    root.style.setProperty('--color-secondary-light', theme.secondary_light || '#c084fc')
    root.style.setProperty('--color-secondary-dark', theme.secondary_dark || '#6b21a8')
    root.style.setProperty('--bg-gradient-from', theme.bg_gradient_from || '#111827')
    root.style.setProperty('--bg-gradient-via', theme.bg_gradient_via || '#581c87')
    root.style.setProperty('--bg-gradient-to', theme.bg_gradient_to || '#111827')
    root.style.setProperty('--text-primary', theme.text_primary || '#ffffff')
    root.style.setProperty('--text-secondary', theme.text_secondary || '#d1d5db')
    root.style.setProperty('--glass-opacity', theme.glass_opacity || '0.10')
    root.style.setProperty('--border-opacity', theme.border_opacity || '0.20')
    
    console.log('Theme applied to CSS variables')
  }

  return <>{children}</>
}
