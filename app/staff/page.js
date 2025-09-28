'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { ChevronLeft, ChevronRight, User, ChevronDown, ChevronUp } from 'lucide-react'
import SiteFooter from '@/components/SiteFooter'

export default function StaffPage() {
  const [staff, setStaff] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentAlts, setCurrentAlts] = useState({}) // Track current alt for each staff member
  const [collapsedCategories, setCollapsedCategories] = useState({}) // Track collapsed state of categories

  useEffect(() => {
    fetchStaff()
    fetchCategories()
  }, [])

  const fetchStaff = async () => {
    try {
      console.log('Fetching staff data...')
      const { data: staffData, error } = await supabase
        .from('staff')
        .select(`
          *,
          staff_alts (*),
          staff_categories (*)
        `)
        .order('sort_order')

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }

      console.log('Staff data received:', staffData)

      // Initialize current alts to show main character (index -1)
      const initialAlts = {}
      staffData?.forEach(member => {
        initialAlts[member.id] = -1 // -1 for main character
        console.log(`Staff ${member.name}:`, {
          id: member.id,
          show_alts: member.show_alts,
          alts_count: member.staff_alts?.length || 0,
          alts_data: member.staff_alts
        })
      })
      
      setCurrentAlts(initialAlts)
      setStaff(staffData || [])
    } catch (error) {
      console.error('Error fetching staff:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const { data: categoriesData } = await supabase
        .from('staff_categories')
        .select('*')
        .order('sort_order')

      const initialCollapsedState = {}
      categoriesData?.forEach(category => {
        initialCollapsedState[category.id] = category.is_collapsed || false
      })
      
      setCollapsedCategories(initialCollapsedState)
      setCategories(categoriesData || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const cycleAlt = (staffId, direction) => {
    console.log(`=== Cycling alt for staff ID: ${staffId}, direction: ${direction} ===`)
    
    const member = staff.find(s => s.id === staffId)
    if (!member) {
      console.log('❌ Member not found for ID:', staffId)
      return
    }

    console.log(`📋 Staff Member: ${member.name}`)
    console.log(`🔧 show_alts: ${member.show_alts}`)
    console.log(`📊 staff_alts array:`, member.staff_alts)
    console.log(`📈 Total alts: ${member.staff_alts?.length || 0}`)

    const totalAlts = member.staff_alts?.length || 0
    
    // Only allow cycling if show_alts is enabled and there are alts
    if (!member.show_alts) {
      console.log('⚠️ show_alts is disabled for this member')
      return
    }

    if (totalAlts === 0) {
      console.log('⚠️ No alt characters found')
      return
    }

    const currentIndex = currentAlts[staffId] ?? -1
    const maxIndex = totalAlts - 1 // Last alt index (0-based)
    const minIndex = -1 // -1 for main character

    console.log(`📍 Current index: ${currentIndex}`)
    console.log(`📊 Index range: ${minIndex} to ${maxIndex}`)

    let newIndex = currentIndex

    if (direction === 'next') {
      // If at last alt, go to main. If at main or any alt, go to next
      newIndex = currentIndex >= maxIndex ? minIndex : currentIndex + 1
    } else {
      // If at main, go to last alt. If at any alt, go to previous
      newIndex = currentIndex <= minIndex ? maxIndex : currentIndex - 1
    }

    console.log(`➡️ New index: ${newIndex}`)

    // Validate new index
    if (newIndex !== -1 && (newIndex < 0 || newIndex >= totalAlts)) {
      console.log('❌ Invalid new index, aborting')
      return
    }

    // Update state
    setCurrentAlts(prev => {
      const updated = {
        ...prev,
        [staffId]: newIndex
      }
      console.log(`✅ Updated currentAlts:`, updated)
      return updated
    })
  }

  const getCurrentCharacter = (member) => {
    const currentIndex = currentAlts[member.id] ?? -1
    
    // console.log(`Getting character for ${member.name}, index: ${currentIndex}`)
    
    if (currentIndex === -1) {
      // Return main character
      return {
        name: member.name,
        role: member.role,
        bio: member.bio,
        image_url: member.image_url,
        isMain: true
      }
    } else {
      // Return alt character
      const alt = member.staff_alts?.[currentIndex]
      if (alt) {
        return {
          name: alt.name,
          role: alt.role,
          bio: alt.bio,
          image_url: alt.image_url,
          isMain: false
        }
      } else {
        console.log(`⚠️ Alt not found at index ${currentIndex}, using main`)
        // Fallback to main character if alt not found
        return {
          name: member.name,
          role: member.role,
          bio: member.bio,
          image_url: member.image_url,
          isMain: true
        }
      }
    }
  }

  const hasMultipleCharacters = (member) => {
    return member.show_alts === true && member.staff_alts && member.staff_alts.length > 0
  }

  // Group staff by categories
  const getStaffByCategory = () => {
    const categorizedStaff = {}
    const uncategorizedStaff = []

    // Initialize with all categories
    categories.forEach(category => {
      categorizedStaff[category.id] = {
        category,
        staff: []
      }
    })

    // Sort staff into categories
    staff.forEach(member => {
      if (member.category_id && categorizedStaff[member.category_id]) {
        categorizedStaff[member.category_id].staff.push(member)
      } else {
        uncategorizedStaff.push(member)
      }
    })

    // Add uncategorized section if there are uncategorized staff
    if (uncategorizedStaff.length > 0) {
      categorizedStaff['uncategorized'] = {
        category: { id: 'uncategorized', name: 'Uncategorized', sort_order: 999 },
        staff: uncategorizedStaff
      }
    }

    return categorizedStaff
  }

  // Toggle category collapse state
  const toggleCategory = (categoryId) => {
    setCollapsedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-1 bg-gradient-to-br from-gray-900 via-nightshade-900 to-purple-900">
          <div className="container mx-auto px-4 py-12">
            <div className="text-center mb-12">
              <div className="h-12 bg-gradient-to-r from-nightshade-400/20 to-purple-400/20 rounded-lg mb-4 animate-pulse"></div>
              <div className="h-6 bg-white/10 rounded-lg max-w-md mx-auto animate-pulse"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="card animate-pulse">
                  <div className="w-full h-64 bg-gradient-to-br from-nightshade-800/50 to-gray-800/50 rounded-lg mb-4"></div>
                  <div className="h-6 bg-white/10 rounded mb-2"></div>
                  <div className="h-4 bg-white/10 rounded mb-4 w-2/3"></div>
                  <div className="h-16 bg-white/10 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <SiteFooter />
      </div>
    )
  }

  const staffByCategory = getStaffByCategory()

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 bg-gradient-to-br from-gray-900 via-nightshade-900 to-purple-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-nightshade-400 to-purple-400 bg-clip-text text-transparent">
              Our Staff
            </h1>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Meet the dedicated team behind The Nightshade's Bloom. 
              {staff.some(member => hasMultipleCharacters(member)) && 
                " Hover over cards and use the arrows to view alternate characters."
              }
            </p>
          </div>

          {staff.length === 0 ? (
            <div className="text-center py-12">
              <User size={64} className="mx-auto text-gray-500 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Staff Members</h3>
              <p className="text-gray-400">Staff information will appear here once added.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(staffByCategory).map(([categoryId, { category, staff: categoryStaff }]) => {
                if (categoryStaff.length === 0) return null

                const isCollapsed = collapsedCategories[categoryId]
                
                return (
                  <div key={categoryId} className="space-y-4">
                    {/* Category Header */}
                    <button
                      onClick={() => toggleCategory(categoryId)}
                      className="w-full flex items-center justify-between p-4 bg-nightshade-800/50 hover:bg-nightshade-800/70 rounded-lg transition-all duration-200 border border-nightshade-600/30"
                    >
                      <div className="flex items-center space-x-3">
                        <h2 className="text-2xl font-bold text-nightshade-300">
                          {category.name}
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
                          const currentIndex = currentAlts[member.id] ?? -1
                          const totalCharacters = hasMultiple ? (member.staff_alts?.length || 0) + 1 : 1
                          
                          return (
                            <div key={member.id} className="card group hover:shadow-2xl hover:shadow-nightshade-500/20 transition-all duration-300">
                              {/* Debug info at top in development */}
                              {process.env.NODE_ENV === 'development' && (
                                <div className="mb-2 text-xs text-gray-500 bg-gray-800/50 p-2 rounded">
                                  <div>ID: {member.id} | Index: {currentIndex}</div>
                                  <div>Show Alts: {member.show_alts ? 'Yes' : 'No'} | Count: {member.staff_alts?.length || 0}</div>
                                  <div>Current: {currentChar.isMain ? 'Main' : `Alt ${currentIndex + 1}`}</div>
                                </div>
                              )}

                              {/* Special Role Banner */}
                              {member.special_role && (
                                <div className="mb-4 -mx-6 -mt-6 px-6 py-2 bg-gradient-to-r from-nightshade-600 to-purple-600 rounded-t-xl">
                                  <div className="text-sm font-semibold text-center text-white">
                                    {member.special_role}
                                  </div>
                                </div>
                              )}

                              {/* Character Image Container */}
                              <div className="relative mb-6">
                                <div className="w-full h-64 rounded-lg overflow-hidden bg-gradient-to-br from-nightshade-800 to-gray-800">
                                  {currentChar.image_url ? (
                                    <img
                                      src={currentChar.image_url}
                                      alt={currentChar.name}
                                      className="w-full h-full object-cover transition-all duration-500"
                                      key={`${member.id}-${currentIndex}`} // Force re-render on character change
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <User size={48} className="text-gray-400" />
                                    </div>
                                  )}
                                </div>

                                {/* Alt Navigation - Only show if there are multiple characters */}
                                {hasMultiple && (
                                  <>
                                    <button
                                      onClick={(e) => {
                                        e.preventDefault()
                                        e.stopPropagation()
                                        console.log(`🔄 Previous button clicked for: ${member.name}`)
                                        cycleAlt(member.id, 'prev')
                                      }}
                                      className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/70 hover:bg-black/90 p-2 rounded-full transition-all opacity-0 group-hover:opacity-100 backdrop-blur-sm z-10"
                                      title="Previous character"
                                    >
                                      <ChevronLeft size={20} className="text-white" />
                                    </button>
                                    
                                    <button
                                      onClick={(e) => {
                                        e.preventDefault()
                                        e.stopPropagation()
                                        console.log(`🔄 Next button clicked for: ${member.name}`)
                                        cycleAlt(member.id, 'next')
                                      }}
                                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/70 hover:bg-black/90 p-2 rounded-full transition-all opacity-0 group-hover:opacity-100 backdrop-blur-sm z-10"
                                      title="Next character"
                                    >
                                      <ChevronRight size={20} className="text-white" />
                                    </button>

                                    {/* Character Indicator */}
                                    <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black/70 backdrop-blur-sm px-3 py-1 rounded-full text-sm text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                      {currentChar.isMain ? 'Main' : `Alt ${currentIndex + 1}`}
                                    </div>

                                    {/* Character Dots */}
                                    <div className="absolute bottom-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <div className={`w-2 h-2 rounded-full transition-colors ${currentIndex === -1 ? 'bg-nightshade-400' : 'bg-white/30'}`}></div>
                                      {member.staff_alts?.map((_, altIndex) => (
                                        <div
                                          key={altIndex}
                                          className={`w-2 h-2 rounded-full transition-colors ${currentIndex === altIndex ? 'bg-nightshade-400' : 'bg-white/30'}`}
                                        ></div>
                                      ))}
                                    </div>
                                  </>
                                )}
                              </div>

                              {/* Character Info */}
                              <div className="text-center space-y-3">
                                <div>
                                  <h3 className="text-xl font-bold text-nightshade-300 mb-1 transition-all duration-300">
                                    {currentChar.name}
                                  </h3>
                                  <p className="text-purple-400 font-medium transition-all duration-300">
                                    {currentChar.role}
                                  </p>
                                </div>
                                
                                {currentChar.bio && (
                                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                                    <p className="text-gray-300 text-sm leading-relaxed transition-all duration-300">
                                      {currentChar.bio}
                                    </p>
                                  </div>
                                )}
                              </div>

                              {/* Multiple Characters Indicator */}
                              {hasMultiple && (
                                <div className="mt-4 text-center">
                                  <div className="inline-flex items-center space-x-2 text-xs text-gray-400 bg-white/5 px-3 py-1 rounded-full">
                                    <span>{totalCharacters} characters</span>
                                    <span>•</span>
                                    <span>Hover to navigate</span>
                                  </div>
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
          )}
        </div>
      </div>
      <SiteFooter />
    </div>
  )
}
