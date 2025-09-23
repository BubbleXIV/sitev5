'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Instagram, MessageCircle } from 'lucide-react'

// Custom icons for social media
const TwitterIcon = ({ size = 20, className = "" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
)

const BlueskyIcon = ({ size = 20, className = "" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 568 501" 
    fill="currentColor" 
    className={className}
  >
    <path d="M123.121 33.664C188.241 82.553 258.281 181.68 284 234.873c25.719-53.192 95.759-152.32 160.879-201.209C491.866-1.611 568-28.906 568 57.947c0 17.346-9.945 145.713-15.778 166.555-20.275 72.453-94.155 90.933-159.875 79.748C507.222 323.8 536.444 388.56 473.333 453.32c-119.86 122.992-172.272-30.859-185.702-70.281-2.462-7.227-3.614-10.608-3.631-7.733-.017-2.875-1.169.506-3.631 7.733-13.43 39.422-65.842 193.273-185.702 70.281-63.111-64.76-33.889-129.52 80.986-149.07-65.72 11.185-139.6-7.295-159.875-79.748C9.945 203.66 0 75.293 0 57.947 0-28.906 76.134-1.611 123.121 33.664Z"/>
  </svg>
)

const DiscordIcon = ({ size = 20, className = "" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 127.14 96.36" 
    fill="currentColor" 
    className={className}
  >
    <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z"/>
  </svg>
)

export default function SiteFooter() {
  const [footerData, setFooterData] = useState({
    copyright: '',
    twitter_url: '',
    bluesky_url: '',
    instagram_url: '',
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
        twitter_url: '',
        bluesky_url: '',
        instagram_url: '',
        discord_url: ''
      })
    } finally {
      setLoading(false)
    }
  }

  const socialIcons = [
    {
      key: 'twitter_url',
      icon: TwitterIcon,
      name: 'Twitter/X',
      color: 'hover:text-blue-300'
    },
    {
      key: 'bluesky_url',
      icon: BlueskyIcon,
      name: 'Bluesky',
      color: 'hover:text-sky-400'
    },
    {
      key: 'instagram_url', 
      icon: Instagram,
      name: 'Instagram',
      color: 'hover:text-pink-400'
    },
    {
      key: 'discord_url',
      icon: DiscordIcon,
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

          {/* Social Links - Only show if there are active links */}
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
                    className={`text-gray-400 transition-colors duration-200 ${social.color}`}
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
