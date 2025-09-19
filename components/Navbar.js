'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Menu, X } from 'lucide-react'

export default function Navbar() {
  const [pages, setPages] = useState([])
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    fetchPages()
  }, [])

  const fetchPages = async () => {
    const { data } = await supabase
      .from('pages')
      .select('*')
      .order('sort_order')
    setPages(data || [])
  }

  return (
    <nav className="glass-dark border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-nightshade-400 to-purple-400 bg-clip-text text-transparent">
            The Nightshade's Bloom
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {pages.map((page) => (
                <Link
                  key={page.id}
                  href={`/${page.slug}`}
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-white/10 transition-colors duration-200"
                >
                  {page.title}
                </Link>
              ))}
              <Link
                href="/admin"
                className="px-3 py-2 rounded-md text-sm font-medium hover:bg-white/10 transition-colors duration-200"
              >
                Admin
              </Link>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md hover:bg-white/10"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-white/10">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {pages.map((page) => (
              <Link
                key={page.id}
                href={`/${page.slug}`}
                className="block px-3 py-2 rounded-md text-base font-medium hover:bg-white/10"
                onClick={() => setIsOpen(false)}
              >
                {page.title}
              </Link>
            ))}
            <Link
              href="/admin"
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-white/10"
              onClick={() => setIsOpen(false)}
            >
              Admin
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}