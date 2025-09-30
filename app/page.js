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
    // Hero Section with Background Image
    {
      id: 'hero-main',
      type: 'backgroundImage',
      props: {
        backgroundImage: '', // You'll upload your venue image here
        overlayOpacity: 0.5,
        overlayColor: 'black',
        minHeight: 'min-h-screen',
        animation: 'fade-in'
      }
    },
    
    // Floating Main Title
    {
      id: 'title-float',
      type: 'floatingText',
      props: {
        content: "The Nightshade's Bloom",
        fontSize: 'text-6xl',
        textAlign: 'center',
        textColor: 'text-white',
        backgroundColor: 'bg-black/70',
        padding: 'px-8 py-4',
        borderRadius: 'rounded-lg',
        position: { x: 100, y: 100 },
        width: 600,
        height: 100,
        animation: 'fade-in'
      }
    },
    
    // Floating Tagline
    {
      id: 'tagline-float',
      type: 'floatingText',
      props: {
        content: 'Where Elegance Meets Mystery',
        fontSize: 'text-2xl',
        textAlign: 'center',
        textColor: 'text-purple-300',
        backgroundColor: 'bg-transparent',
        padding: 'px-6 py-2',
        borderRadius: 'rounded',
        position: { x: 150, y: 220 },
        width: 500,
        height: 60,
        animation: 'fade-in'
      }
    },

    // Introduction Section
    {
      id: 'intro-section',
      type: 'text',
      props: {
        content: `# Welcome to The Nightshade's Bloom

Step through our doors into a world of refined entertainment and hidden opportunities. By day, we are Eorzea's premier establishment for music, dance, and libations. Our stage hosts the realm's finest bards and dancers, while our bartenders craft elixirs that soothe the soul.

But whispers tell of something more—exclusive gatherings in private chambers, discrete transactions between trusted parties, and arrangements that never see the light of day. For those who know where to look, The Nightshade's Bloom offers... alternative services.`,
        fontSize: 'text-lg',
        textAlign: 'center',
        padding: 'py-16 px-8',
        animation: 'slide-up'
      }
    },

    // Divider
    {
      id: 'divider-1',
      type: 'divider',
      props: {
        style: 'line',
        color: 'purple',
        thickness: 'thin'
      }
    },

    // What We Offer Section
    {
      id: 'offerings-title',
      type: 'text',
      props: {
        content: '## Our Offerings',
        fontSize: 'text-4xl',
        textAlign: 'center',
        padding: 'pt-16 pb-8',
        animation: 'fade-in'
      }
    },

    // Three Column Features
    {
      id: 'feature-1',
      type: 'text',
      props: {
        content: `### 🎭 Entertainment
        
World-class performers grace our stage nightly. From haunting ballads to electrifying dances, our artists create an atmosphere of wonder and allure.`,
        fontSize: 'text-base',
        textAlign: 'center',
        padding: 'py-8 px-4',
        animation: 'slide-up'
      }
    },

    {
      id: 'feature-2',
      type: 'text',
      props: {
        content: `### 🍷 Fine Spirits
        
Our master mixologists craft beverages that range from the exquisite to the exotic. Each drink tells a story, each sip an experience.`,
        fontSize: 'text-base',
        textAlign: 'center',
        padding: 'py-8 px-4',
        animation: 'slide-up'
      }
    },

    {
      id: 'feature-3',
      type: 'text',
      props: {
        content: `### 🗝️ Exclusive Services
        
For discerning clientele, we offer private consultations and bespoke arrangements. Discretion is our specialty, satisfaction our guarantee.`,
        fontSize: 'text-base',
        textAlign: 'center',
        padding: 'py-8 px-4',
        animation: 'slide-up'
      }
    },

    // Divider
    {
      id: 'divider-2',
      type: 'divider',
      props: {
        style: 'line',
        color: 'nightshade',
        thickness: 'thin'
      }
    },

    // Call to Action Buttons Section
    {
      id: 'cta-title',
      type: 'text',
      props: {
        content: '## Join Us',
        fontSize: 'text-4xl',
        textAlign: 'center',
        padding: 'pt-16 pb-8',
        animation: 'fade-in'
      }
    },

    {
      id: 'cta-subtitle',
      type: 'text',
      props: {
        content: 'Whether you seek an evening of entertainment or something more... specialized.',
        fontSize: 'text-xl',
        textAlign: 'center',
        padding: 'pb-12',
        animation: 'fade-in'
      }
    },

    // Button Row
    {
      id: 'button-events',
      type: 'button',
      props: {
        text: 'View Events',
        link: '/events',
        style: 'primary',
        size: 'large',
        alignment: 'center',
        animation: 'fade-in'
      }
    },

    {
      id: 'spacer-1',
      type: 'spacer',
      props: {
        height: 'small'
      }
    },

    {
      id: 'button-staff',
      type: 'button',
      props: {
        text: 'Meet Our Staff',
        link: '/staff',
        style: 'secondary',
        size: 'large',
        alignment: 'center',
        animation: 'fade-in'
      }
    },

    {
      id: 'spacer-2',
      type: 'spacer',
      props: {
        height: 'small'
      }
    },

    {
      id: 'button-contact',
      type: 'button',
      props: {
        text: 'Private Inquiries',
        link: '/contact',
        style: 'outline',
        size: 'large',
        alignment: 'center',
        animation: 'fade-in'
      }
    },

    // Testimonial Section
    {
      id: 'divider-3',
      type: 'divider',
      props: {
        style: 'line',
        color: 'purple',
        thickness: 'thin'
      }
    },

    {
      id: 'testimonial-title',
      type: 'text',
      props: {
        content: '## What They Say',
        fontSize: 'text-4xl',
        textAlign: 'center',
        padding: 'pt-16 pb-8',
        animation: 'fade-in'
      }
    },

    {
      id: 'testimonial-1',
      type: 'testimonial',
      props: {
        quote: 'An evening at The Nightshade\'s Bloom is unlike any other. The atmosphere is electric, the drinks divine, and the... connections made are invaluable.',
        author: 'A Satisfied Patron',
        role: 'Regular Visitor',
        avatar: '',
        animation: 'fade-in'
      }
    },

    {
      id: 'testimonial-2',
      type: 'testimonial',
      props: {
        quote: 'I came for the music, stayed for the opportunities. The staff here understand discretion and professionalism better than anywhere in Eorzea.',
        author: 'Anonymous',
        role: 'Business Associate',
        avatar: '',
        animation: 'fade-in'
      }
    },

    // Final Spacer
    {
      id: 'final-spacer',
      type: 'spacer',
      props: {
        height: 'large'
      }
    },

    // Closing Text
    {
      id: 'closing-text',
      type: 'text',
      props: {
        content: `*The Nightshade's Bloom - Where every night holds a secret.*`,
        fontSize: 'text-xl',
        textAlign: 'center',
        padding: 'py-8',
        animation: 'fade-in'
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
