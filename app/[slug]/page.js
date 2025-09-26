'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import PageBuilder from '@/components/PageBuilder'
import { notFound } from 'next/navigation'
import SiteFooter from '@/components/SiteFooter'

export default function DynamicPage({ params }) {
  const [pageContent, setPageContent] = useState(null)
  const [pageData, setPageData] = useState(null) // ADD THIS - store the page data
  const [loading, setLoading] = useState(true)
  const [pageFound, setPageFound] = useState(true)

  useEffect(() => {
    fetchPageContent()
  }, [params.slug])

  const fetchPageContent = async () => {
    try {
      // Get page by slug
      const { data: page } = await supabase
        .from('pages')
        .select('*')
        .eq('slug', params.slug)
        .single()

      if (!page) {
        setPageFound(false)
        return
      }

      // Store the page data so we can access page.template
      setPageData(page)

      // Redirect to specific components for staff and menu pages
      if (page.is_staff_page || page.is_menu_page) {
        setPageFound(false)
        return
      }

      // Get page content
      const { data: content } = await supabase
        .from('page_content')
        .select('*')
        .eq('page_id', page.id)
        .single()

      setPageContent(content?.content || { elements: [] })
    } catch (error) {
      console.error('Error fetching page content:', error)
      setPageFound(false)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-xl">Loading...</div>
        </div>
        <SiteFooter />
      </div>
    )
  }

  if (!pageFound) {
    notFound()
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1">
        <PageBuilder 
          content={pageContent} 
          isEditable={false} 
          template={pageData?.template} // ADD THIS - pass the template
        />
      </div>
      <SiteFooter />
    </div>
  )
}
