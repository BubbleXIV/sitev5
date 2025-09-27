// app/staff/page.js
'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react'

export default function StaffPage() {
  const [staff, setStaff] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentAlts, setCurrentAlts] = useState({}) // Track current alt for each staff member
  const [collapsedCategories, setCollapsedCategories] = useState({}) // Track collapsed state of categories

  useEffect(() => {
    fetchStaff()
  }, [])

  const fetchStaff = async () => {
    try {
      const { data: staffData } = await supabase
        .from('staff')
        .select(`
          *,
          staff_alts (*)
        `)
        .order('sort_order')

      // Initialize current alts to show main character (index -1)
      const initialAlts = {}
      staffData?.forEach(member => {
        initialAlts[member.id] = -1 // -1 for main character
      })
      setCurrentAlts(initialAlts)
      setStaff(staffData || [])
    } catch (error) {
      console.error('Error fetching staff:', error)
    } finally {
      setLoading(false)
    }
  }

  const cycleAlt = (staffId, direction) => {
    const member = staff.find(s => s.id === staffId)
    if (!member) return

    const totalAlts = member.staff_alts?.length || 0
    const maxIndex = member.show_alts ? totalAlts - 1 : -1
    const minIndex = -1 // -1 for main character

    const currentIndex = currentAlts[staffId] || -1
    let newIndex = currentIndex

    if (direction === 'next') {
      newIndex = currentIndex >= maxIndex ? minIndex : currentIndex + 1
    } else {
      newIndex = currentIndex <= minIndex ? maxIndex : currentIndex - 1
    }

    setCurrentAlts(prev => ({
      ...prev,
      [staffId]: newIndex
    }))
  }

  const getCurrentCharacter = (member) => {
    const currentIndex = currentAlts[member.id] || -1
    
    if (currentIndex === -1) {
      // Return main character
      return {
        name: member.name,
        role: member.role,
        bio: member.bio,
        image_url: member.image_url
      }
    } else {
      // Return alt character
      const alt = member.staff_alts?.[currentIndex]
      return alt || {
        name: member.name,
        role: member.role,
        bio: member.bio,
        image_url: member.image_url
      }
    }
  }

  const hasMultipleCharacters = (member) => {
    return member.show_alts && member.staff_alts && member.staff_alts.length > 0
  }

  // Group staff by role/category
  const getStaffByCategory = () => {
    const categories = {}
    staff.forEach(member => {
      const category = member.role || 'Other'
      if (!categories[category]) {
        categories[category] = []
      }
      categories[category].push(member)
    })
    return categories
  }

  // Toggle category collapse state
  const toggleCategory = (categoryName) => {
    setCollapsedCategories(prev => ({
      ...prev,
      [categoryName]: !prev[categoryName]
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading staff...</div>
      </div>
    )
  }

  const staffByCategory = getStaffByCategory()

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-nightshade-400 to-purple-400 bg-clip-text text-transparent animate-glow">
            Our Staff
          </h1>
          <p className="text-lg text-gray-300">
            Meet the dedicated team behind The Nightshade's Bloom
          </p>
        </div>

        {/* Staff Categories */}
        <div className="space-y-8">
          {Object.entries(staffByCategory).map(([categoryName, categoryStaff]) => {
            const isCollapsed = collapsedCategories[categoryName]
            
            return (
              <div key={categoryName} className="space-y-4">
                {/* Category Header */}
                <button
                  onClick={() => toggleCategory(categoryName)}
                  className="w-full flex items-center justify-between p-4 bg-nightshade-800/50 hover:bg-nightshade-800/70 rounded-lg transition-all duration-200 border border-nightshade-600/30"
                >
                  <div className="flex items-center space-x-3">
                    <h2 className="text-2xl font-bold text-nightshade-300">
                      {categoryName}
                    </h2>
                    <span className="text-sm text-gray-400 bg-nightshade-900/50 px-3 py-1 rounded-full">
                      {categoryStaff.length} member{categoryStaff.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="flex items-center text-nightshade-400">
                    {isCollapsed ? (
                      <ChevronDown size={24} className="transition-transform duration-200" />
                    ) : (
                      <ChevronUp size={24} className="transition-transform duration-200" />
                    )}
                  </div>
                </button>

                {/* Category Content */}
                {!isCollapsed && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pl-4">
                    {categoryStaff.map((member) => {
                      const currentChar = getCurrentCharacter(member)
                      const hasMultiple = hasMultipleCharacters(member)
                      const currentIndex = currentAlts[member.id] || -1
                      
                      return (
                        <div key={member.id} className="card group">
                          {/* Special Role Banner */}
                          {member.special_role && (
                            <div className="mb-4 -mx-6 -mt-6 px-6 py-2 bg-gradient-to-r from-nightshade-600 to-purple-600 rounded-t-xl">
                              <div className="text-sm font-semibold text-center">
                                {member.special_role}
                              </div>
                            </div>
                          )}

                          {/* Character Image */}
                          <div className="relative mb-4">
                            {currentChar.image_url ? (
                              <img
                                src={currentChar.image_url}
                                alt={currentChar.name}
                                className="w-full h-64 object-cover rounded-lg"
                              />
                            ) : (
                              <div className="w-full h-64 bg-gradient-to-br from-nightshade-800 to-gray-800 rounded-lg flex items-center justify-center">
                                <span className="text-gray-400">No Image</span>
                              </div>
                            )}

                            {/* Alt Navigation */}
                            {hasMultiple && (
                              <>
                                <button
                                  onClick={() => cycleAlt(member.id, 'prev')}
                                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 p-2 rounded-full transition-all opacity-0 group-hover:opacity-100"
                                >
                                  <ChevronLeft size={20} />
                                </button>
                                <button
                                  onClick={() => cycleAlt(member.id, 'next')}
                                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 p-2 rounded-full transition-all opacity-0 group-hover:opacity-100"
                                >
                                  <ChevronRight size={20} />
                                </button>

                                {/* Character Indicator */}
                                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black/50 px-3 py-1 rounded-full text-sm">
                                  {currentIndex === -1 ? 'Main' : `Alt ${currentIndex + 1}`}
                                </div>
                              </>
                            )}
                          </div>

                          {/* Character Info */}
                          <div className="text-center">
                            <h3 className="text-xl font-bold mb-2 text-nightshade-300">
                              {currentChar.name}
                            </h3>
                            <p className="text-purple-400 mb-3 font-medium">
                              {currentChar.role}
                            </p>
                            {currentChar.bio && (
                              <p className="text-gray-300 text-sm leading-relaxed">
                                {currentChar.bio}
                              </p>
                            )}
                          </div>

                          {/* Character Counter */}
                          {hasMultiple && (
                            <div className="mt-4 text-center text-xs text-gray-400">
                              {member.staff_alts.length + 1} characters available
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {staff.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No staff members found.</p>
          </div>
        )}
      </div>
    </div>
  )
}
