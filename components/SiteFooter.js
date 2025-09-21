'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Facebook, Instagram, Twitter, MessageCircle } from 'lucide-react'

// Custom Bluesky icon since it's not in Lucide yet
const BlueskyIcon = ({ size = 20, className = "" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
  >
    <path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944.444 1.85.444 4.429c0 .359.017.693.044.99C.729 8.546 1.669 10.4 3.61 11.089c-.985.563-2.354.896-3.59.896v.912c2.377 0 4.297-.398 5.404-1.053C6.86 12.364 8.213 13.5 9.657 14.5c.527.364 1.058.697 1.621.986.563-.289 1.094-.622 1.621-.986C14.343 13.5 15.696 12.364 17.132 11.844c1.107.655 3.027 1.053 5.404 1.053v-.912c-1.236 0-2.605-.333-3.59-.896C20.887 10.4 21.827 8.546 22.068 5.419c.027-.297.044-.631.044-.99C22.112 1.85 19.99.944 17.354 2.805c-2.752 1.942-5.711 5.881-6.798 7.995z"/>
  </svg>
)

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
      icon: Facebook,
      name: 'Facebook',
      color: 'hover:text-blue-400'
    },
    {
      key: 'instagram_url', 
      icon: Instagram,
      name: 'Instagram',
      color: 'hover:text-pink-400'
    },
    {
      key: 'twitter_url',
      icon: Twitter, 
      name: 'Twitter',
      color: 'hover:text-blue-300'
    },
    {
      key: 'bluesky_url',
      icon: BlueskyIcon,
      name: 'Bluesky',
      color: 'hover:text-sky-400'
    },
    {
      key: 'discord_url',
      icon: MessageCircle,
      name: 'Discord', 
      color: 'hover:text-indigo-400'
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
              {activeSocialLinks.map(social => {
                const IconComponent = social.icon
                return (
                  <a
                    key={social.key}
                    href={footerData[social.key]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`text-gray-400 transition-colors ${social.color}`}
                    title={social.name}
                  >
                    <IconComponent size={20} />
                  </a>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </footer>
  )
}
