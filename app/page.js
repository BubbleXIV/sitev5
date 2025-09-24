'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import PageBuilder from '@/components/PageBuilder'
import SiteFooter from '@/components/SiteFooter'

export default function Home() {
  const [pageContent, setPageContent] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPageContent()
  }, [])

  const fetchPageContent = async () => {
    try {
      // Get home page
      const { data: page } = await supabase
        .from('pages')
        .select('*')
        .eq('slug', 'home')
        .single()

      if (page) {
        // Get page content
        const { data: content } = await supabase
          .from('page_content')
          .select('*')
          .eq('page_id', page.id)
          .single()

        setPageContent(content?.content || getDefaultHomeContent())
      }
    } catch (error) {
      console.error('Error fetching page content:', error)
      setPageContent(getDefaultHomeContent())
    } finally {
      setLoading(false)
    }
  }

  const getDefaultHomeContent = () => ({
    elements: [
      {
        id: 'hero-1',
        type: 'hero',
        props: {
          title: "Welcome to The Nightshade's Bloom",
          subtitle: 'An Enchanting FFXIV Venue Experience',
          backgroundImage: '',
          backgroundType: 'gradient',
          gradient: 'from-nightshade-900 via-purple-900 to-gray-900',
          textAlign: 'center',
          animation: 'fade-in'
        }
      },
      {
        id: 'text-1',
        type: 'text',
        props: {
          content: 'Step into a world where elegance meets mystery. Our venue offers an immersive roleplay experience in the realm of Final Fantasy XIV.',
          fontSize: 'text-lg',
          textAlign: 'center',
          padding: 'py-8',
          animation: 'slide-up'
        }
      }
    ]
  })

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

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1">
        <PageBuilder content={pageContent} isEditable={false} />
      </div>
      <SiteFooter />
    </div>
  )
}
