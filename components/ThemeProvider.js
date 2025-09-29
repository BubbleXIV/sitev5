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

      if (data && !error) {
        applyTheme(data)
      }
    } catch (error) {
      console.error('Error loading theme:', error)
    }
  }

  const applyTheme = (theme) => {
    if (!theme) return
    
    const root = document.documentElement
    root.style.setProperty('--color-primary', theme.primary_color)
    root.style.setProperty('--color-primary-light', theme.primary_light)
    root.style.setProperty('--color-primary-dark', theme.primary_dark)
    root.style.setProperty('--color-secondary', theme.secondary_color)
    root.style.setProperty('--color-secondary-light', theme.secondary_light)
    root.style.setProperty('--color-secondary-dark', theme.secondary_dark)
    root.style.setProperty('--bg-gradient-from', theme.bg_gradient_from)
    root.style.setProperty('--bg-gradient-via', theme.bg_gradient_via)
    root.style.setProperty('--bg-gradient-to', theme.bg_gradient_to)
    root.style.setProperty('--text-primary', theme.text_primary)
    root.style.setProperty('--text-secondary', theme.text_secondary)
    root.style.setProperty('--glass-opacity', theme.glass_opacity)
    root.style.setProperty('--border-opacity', theme.border_opacity)
  }

  return <>{children}</>
}

// Then update your app/layout.js to include the ThemeProvider:
// Wrap your children with <ThemeProvider>{children}</ThemeProvider>
