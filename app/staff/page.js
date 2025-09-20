'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { ChevronLeft, ChevronRight, User } from 'lucide-react'

export default function StaffPage() {
  const [staff, setStaff] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentAlts, setCurrentAlts] = useState({}) // Track current alt for each staff member

  useEffect(() => {
    fetchStaff()
  }, [])

  const fetchStaff = async () => {
    try {
      console.log('Fetching staff data...')
      const { data: staffData, error } = await supabase
        .from('staff')
        .select(`
          *,
          staff_alts (*)
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
        console.log(`Staff ${member.name} has ${member.staff_alts?.length || 0} alts, show_alts: ${member.show_alts}`)
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
    if (!member) {
      console.log('Member not found for ID:', staffId)
      return
    }

    const totalAlts = member.staff_alts?.length || 0
    console.log(`Cycling alt for ${member.name}, total alts: ${totalAlts}, show_alts: ${member.show_alts}`)
    
    // Only allow cycling if show_alts is enabled and there are alts
    if (!member.show_alts || totalAlts === 0) {
      console.log('Alt cycling not available for this member')
      return
    }

    const maxIndex = totalAlts - 1
    const minIndex = -1 // -1 for main character

    const currentIndex = currentAlts[staffId] || -1
    let newIndex = currentIndex

    if (direction === 'next') {
      newIndex = currentIndex >= maxIndex ? minIndex : currentIndex + 1
    } else {
      newIndex = currentIndex <= minIndex ? maxIndex : currentIndex - 1
    }

    console.log(`Changing from index ${currentIndex} to ${newIndex}`)
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
    const hasAlts = member.show_alts && member.staff_alts && member.staff_alts.length > 0
    console.log(`${member.name} has multiple characters:`, hasAlts)
    return hasAlts
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-nightshade-900 to-purple-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nightshade-400 mx-auto mb-4"></div>
          <div className="text-xl text-white">Loading staff...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-nightshade-900 to-purple-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-nightshade-400 to-purple-400 bg-clip-text text-transparent">
            Our Staff
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Meet the dedicated team behind The Nightshade's Bloom. Click the arrows to view alternate characters where available.
          </p>
        </div>

        {staff.length === 0 ? (
          <div className="text-center py-12">
            <User size={64} className="mx-auto text-gray-500 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Staff Members</h3>
            <p className="text-gray-400">Staff information will appear here once added.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {staff.map((member) => {
              const currentChar = getCurrentCharacter(member)
              const hasMultiple = hasMultipleCharacters(member)
              const currentIndex = currentAlts[member.id] || -1
              const totalCharacters = hasMultiple ? (member.staff_alts?.length || 0) + 1 : 1
              
              return (
                <div key={member.id} className="card group hover:shadow-2xl hover:shadow-nightshade-500/20 transition-all duration-300">
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
                          className="w-full h-full object-cover transition-all duration-300"
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
                          onClick={() => cycleAlt(member.id, 'prev')}
                          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/70 hover:bg-black/90 p-2 rounded-full transition-all opacity-0 group-hover:opacity-100 backdrop-blur-sm"
                          title="Previous character"
                        >
                          <ChevronLeft size={20} className="text-white" />
                        </button>
                        
                        <button
                          onClick={() => cycleAlt(member.id, 'next')}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/70 hover:bg-black/90 p-2 rounded-full transition-all opacity-0 group-hover:opacity-100 backdrop-blur-sm"
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
                          <div className={`w-2 h-2 rounded-full ${currentIndex === -1 ? 'bg-nightshade-400' : 'bg-white/30'}`}></div>
                          {member.staff_alts?.map((_, altIndex) => (
                            <div
                              key={altIndex}
                              className={`w-2 h-2 rounded-full ${currentIndex === altIndex ? 'bg-nightshade-400' : 'bg-white/30'}`}
                            ></div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Character Info */}
                  <div className="text-center space-y-3">
                    <div>
                      <h3 className="text-xl font-bold text-nightshade-300 mb-1">
                        {currentChar.name}
                      </h3>
                      <p className="text-purple-400 font-medium">
                        {currentChar.role}
                      </p>
                    </div>
                    
                    {currentChar.bio && (
                      <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                        <p className="text-gray-300 text-sm leading-relaxed">
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

                  {/* Debug info (remove in production) */}
                  {process.env.NODE_ENV === 'development' && (
                    <div className="mt-2 text-xs text-gray-500 bg-gray-800/50 p-2 rounded">
                      <div>ID: {member.id}</div>
                      <div>Show Alts: {member.show_alts ? 'Yes' : 'No'}</div>
                      <div>Alts Count: {member.staff_alts?.length || 0}</div>
                      <div>Current Index: {currentIndex}</div>
                      <div>Is Main: {currentChar.isMain ? 'Yes' : 'No'}</div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
