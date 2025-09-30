'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import PageBuilder from '@/components/PageBuilder'

export default function PreviewPage() {
  const [pageContent, setPageContent] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPageContent()
    
    // Disable all links on the page
    const disableLinks = (e) => {
      const target = e.target.closest('a')
      if (target) {
        e.preventDefault()
        return false
      }
    }
    
    document.addEventListener('click', disableLinks, true)
    
    return () => {
      document.removeEventListener('click', disableLinks, true)
    }
  }, [])

  const fetchPageContent = async () => {
    try {
      const { data: page } = await supabase
        .from('pages')
        .select('*')
        .eq('slug', 'home')
        .single()

      if (page) {
        const { data: content } = await supabase
          .from('page_content')
          .select('*')
          .eq('page_id', page.id)
          .single()

        setPageContent(content?.content)
      }
    } catch (error) {
      console.error('Error fetching page content:', error)
    } finally {
      setLoading(false)
    }
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
      <PageBuilder content={pageContent} isEditable={false} />
    </div>
  )
}
