'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'

export default function RiddleCard({ params }) {
  const [riddle, setRiddle] = useState(null)
  const [currentStep, setCurrentStep] = useState(0) // 0 = intro, 1-n = riddles, n+1 = password
  const [loading, setLoading] = useState(true)
  const [showCard, setShowCard] = useState(false)
  const [error, setError] = useState(null)
  const router = useRouter()

  useEffect(() => {
    fetchRiddle()
  }, [params.slug])

  useEffect(() => {
    if (riddle && !error) {
      // Start the sequence
      setTimeout(() => setShowCard(true), 1000) // Card appears after intro text
    }
  }, [riddle, error])

  const fetchRiddle = async () => {
    try {
      console.log('Fetching riddle with slug:', params.slug)
      
      const { data, error } = await supabase
        .from('shadecard_riddles')
        .select('*')
        .eq('slug', params.slug)
        .eq('is_active', true)
        .single()

      if (error) {
        console.error('Database error:', error)
        if (error.code === 'PGRST116') {
          setError('Riddle not found or inactive')
        } else {
          setError('Error loading riddle: ' + error.message)
        }
        return
      }

      if (!data) {
        setError('Riddle not found')
        return
      }

      console.log('Riddle loaded:', data)
      setRiddle(data)
    } catch (error) {
      console.error('Error fetching riddle:', error)
      setError('Failed to load riddle')
    } finally {
      setLoading(false)
    }
  }

  const handleCardClick = () => {
    if (!riddle || !riddle.riddles) return

    const totalRiddles = riddle.riddles.length
    
    if (currentStep === 0) {
      // Start riddles
      setCurrentStep(1)
    } else if (currentStep <= totalRiddles) {
      // Next riddle or show password
      if (currentStep === totalRiddles) {
        // Show password
        setCurrentStep(totalRiddles + 1)
        // Auto-fade after 15 seconds
        setTimeout(() => {
          setShowCard(false)
          setTimeout(() => setCurrentStep(0), 1000)
        }, 15000)
      } else {
        setCurrentStep(currentStep + 1)
      }
    }
  }

  const getCurrentRPText = () => {
    if (!riddle) return ""
    
    if (currentStep === 0) return riddle.intro_text
    if (currentStep > riddle.riddles.length) return "The secret is revealed. Guard it well, adventurer."
    if (currentStep <= riddle.riddles.length) {
      return riddle.riddles[currentStep - 1]?.rpText || ""
    }
    return ""
  }

  const getCurrentContent = () => {
    if (!riddle) return ""
    
    if (currentStep === 0) return "Click to begin your trial"
    if (currentStep > riddle.riddles.length) return riddle.final_password
    if (currentStep <= riddle.riddles.length) {
      return riddle.riddles[currentStep - 1]?.text || ""
    }
    return ""
  }

  const isPasswordStep = () => {
    return riddle && currentStep > riddle.riddles.length
  }

  const isClickable = () => {
    return !isPasswordStep()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <div className="text-white">Loading riddle...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-red-400 text-xl">{error}</div>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors"
          >
            Return Home
          </button>
        </div>
      </div>
    )
  }

  if (!riddle) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-red-400 text-xl">Riddle not found or inactive</div>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors"
          >
            Return Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black overflow-hidden relative">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-purple-900/20"></div>
      
      {/* RP Text at top */}
      <div className="relative z-20 pt-12 px-8 text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl mx-auto"
          >
            <p className="text-gray-300 text-lg italic leading-relaxed">
              {getCurrentRPText()}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress indicator */}
      {riddle.riddles && riddle.riddles.length > 0 && (
        <div className="relative z-20 pt-8 px-8 text-center">
          <div className="max-w-md mx-auto">
            <div className="flex items-center justify-center space-x-2">
              {Array.from({ length: riddle.riddles.length + 1 }, (_, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    i < currentStep
                      ? 'bg-purple-400'
                      : i === currentStep
                      ? 'bg-purple-600 ring-2 ring-purple-400'
                      : 'bg-gray-700'
                  }`}
                />
              ))}
            </div>
            <p className="text-gray-400 text-sm mt-2">
              {currentStep === 0 && 'Beginning'}
              {currentStep > 0 && currentStep <= riddle.riddles.length && `Riddle ${currentStep} of ${riddle.riddles.length}`}
              {currentStep > riddle.riddles.length && 'Revelation'}
            </p>
          </div>
        </div>
      )}

      {/* Main Card */}
      <div className="flex items-center justify-center min-h-screen px-8 relative z-10">
        <AnimatePresence>
          {showCard && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 1 }}
              className="relative"
            >
              <GlitchCard 
                onClick={handleCardClick}
                content={getCurrentContent()}
                logo={riddle.venue_logo}
                isPassword={isPasswordStep()}
                isClickable={isClickable()}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-8 left-0 right-0 text-center z-20">
        <p className="text-gray-500 text-sm">
          {isClickable() ? 'Click the card to continue' : 'The secret has been revealed'}
        </p>
      </div>
    </div>
  )
}

// Glitch Card Component
function GlitchCard({ onClick, content, logo, isPassword, isClickable }) {
  return (
    <div 
      className={`relative group ${isClickable ? 'cursor-pointer' : ''}`}
      onClick={isClickable ? onClick : undefined}
    >
      {/* Main Card */}
      <div className="relative bg-black border border-gray-800 rounded-lg p-12 min-w-[400px] min-h-[300px] flex flex-col items-center justify-center space-y-6 overflow-hidden">
        
        {/* Glitch Border Effects */}
        <div className="absolute inset-0 rounded-lg overflow-hidden">
          {/* Top edge glitch */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse"></div>
          
          {/* Bottom edge glitch */}
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-pink-400 to-transparent animate-pulse"></div>
          
          {/* Left edge glitch */}
          <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-transparent via-green-400 to-transparent animate-pulse"></div>
          
          {/* Right edge glitch */}
          <div className="absolute right-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-transparent via-yellow-400 to-transparent animate-pulse"></div>
          
          {/* Corner glitches */}
          <div className="absolute top-0 left-0 w-4 h-4 bg-red-400 opacity-30 animate-pulse"></div>
          <div className="absolute top-0 right-0 w-4 h-4 bg-blue-400 opacity-30 animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-4 h-4 bg-green-400 opacity-30 animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-4 h-4 bg-purple-400 opacity-30 animate-pulse"></div>
        </div>

        {/* Logo */}
        {logo && (
          <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center overflow-hidden border-2 border-gray-700">
            <img src={logo} alt="Venue Logo" className="w-full h-full object-cover" />
          </div>
        )}

        {/* Content */}
        <div className="text-center space-y-4 relative z-10 max-w-sm">
          <AnimatePresence mode="wait">
            <motion.div
              key={content}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5 }}
            >
              {isPassword ? (
                <div className="space-y-4">
                  <div className="text-sm text-green-300 uppercase tracking-wider">
                    Secret Revealed
                  </div>
                  <div className="text-4xl font-bold text-green-400 tracking-widest animate-pulse font-mono">
                    {content}
                  </div>
                  <div className="text-xs text-gray-400">
                    This message will fade in 15 seconds
                  </div>
                </div>
              ) : (
                <div className="text-white text-lg leading-relaxed">
                  {content}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Hover effect for clickable state */}
        {isClickable && (
          <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
        )}

        {/* Pulsing effect for password reveal */}
        {isPassword && (
          <div className="absolute inset-0 bg-green-400/10 animate-pulse rounded-lg"></div>
        )}
      </div>

      {/* Additional glow effects for password */}
      {isPassword && (
        <div className="absolute inset-0 bg-green-400/20 rounded-lg blur-xl animate-pulse"></div>
      )}
    </div>
  )
}
