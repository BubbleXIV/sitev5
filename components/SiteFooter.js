'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function SiteFooter() {
  const [footerData, setFooterData] = useState({
    copyright: '',
    facebook_url: '',
    instagram_url: '',
    twitter_url: '',
    bluesky_url: '',
    discord_url: ''
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFooterData()
  }, [])

  const fetchFooterData = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('key', 'footer')
        .single()

      if (data && data.value) {
        setFooterData(data.value)
      }
    } catch (error) {
      console.error('Error fetching footer data:', error)
      // Set default values if no data exists
      setFooterData({
        copyright: `© ${new Date().getFullYear()} The Nightshade's Bloom. All rights reserved.`,
        facebook_url: '',
        instagram_url: '',
        twitter_url: '',
        bluesky_url: '',
        discord_url: ''
      })
    } finally {
      setLoading(false)
    }
  }

  const socialIcons = [
    {
      key: 'facebook_url',
      name: 'Facebook',
      logo: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
      color: 'hover:text-[#1877F2]'
    },
    {
      key: 'instagram_url', 
      name: 'Instagram',
      logo: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      ),
      color: 'hover:text-[#E4405F]'
    },
    {
      key: 'twitter_url',
      name: 'Twitter/X',
      logo: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      ),
      color: 'hover:text-white'
    },
    {
      key: 'bluesky_url',
      name: 'Bluesky',
      logo: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944.444 1.85.444 4.429c0 .359.017.693.044.99C.729 8.546 1.669 10.4 3.61 11.089c-.985.563-2.354.896-3.59.896v.912c2.377 0 4.297-.398 5.404-1.053C6.86 12.364 8.213 13.5 9.657 14.5c.527.364 1.058.697 1.621.986.563-.289 1.094-.622 1.621-.986C14.343 13.5 15.696 12.364 17.132 11.844c1.107.655 3.027 1.053 5.404 1.053v-.912c-1.236 0-2.605-.333-3.59-.896C20.887 10.4 21.827 8.546 22.068 5.419c.027-.297.044-.631.044-.99C22.112 1.85 19.99.944 17.354 2.805c-2.752 1.942-5.711 5.881-6.798 7.995z"/>
        </svg>
      ),
      color: 'hover:text-[#00D4FF]'
    },
    {
      key: 'discord_url',
      name: 'Discord',
      logo: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419-.0190 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9460 2.4189-2.1568 2.4189Z"/>
        </svg>
      ),
      color: 'hover:text-[#5865F2]'
    }
  ]

  if (loading) {
    return (
      <footer className="bg-black/50 backdrop-blur-sm border-t border-white/10 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="h-4 bg-white/10 rounded w-48 animate-pulse"></div>
            <div className="flex space-x-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="w-5 h-5 bg-white/10 rounded animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
      </footer>
    )
  }

  // Filter out empty social links
  const activeSocialLinks = socialIcons.filter(social => footerData[social.key]?.trim())

  return (
    <footer className="bg-black/50 backdrop-blur-sm border-t border-white/10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          {/* Copyright */}
          <div className="text-gray-400 text-sm">
            {footerData.copyright || `© ${new Date().getFullYear()} The Nightshade's Bloom. All rights reserved.`}
          </div>

          {/* Social Links */}
          {activeSocialLinks.length > 0 && (
            <div className="flex space-x-4">
              {activeSocialLinks.map(social => (
                <a
                  key={social.key}
                  href={footerData[social.key]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`text-gray-400 transition-colors ${social.color}`}
                  title={social.name}
                >
                  {social.logo}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  )
}
