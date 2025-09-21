'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'

export default function RiddleCard({ params }) {
  const [riddle, setRiddle] = useState(null)
  const [currentStep, setCurrentStep] = useState(0) // 0 = intro, 1-4 = riddles, 5 = password
  const [loading, setLoading] = useState(true)
  const [showCard, setShowCard] = useState(false)

  useEffect(() => {
    fetchRiddle()
  }, [params.slug])

  useEffect(() => {
    if (riddle) {
      // Start the sequence
      setTimeout(() => setShowCard(true), 1000) // Card appears after intro text
    }
  }, [riddle])

  const fetchRiddle = async () => {
    try {
      const { data, error } = await supabase
        .from('shadecard_riddles')
        .select('*')
        .eq('slug', params.slug)
        .eq('is_active', true)
        .single()

      if (error || !data) {
        console.error('Riddle not found:', error)
        return
      }

      setRiddle(data)
    } catch (error) {
      console.error('Error fetching riddle:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCardClick = () => {
    if (currentStep === 0) {
      // Start riddles
      setCurrentStep(1)
    } else if (currentStep <= riddle.riddles.length) {
      // Next riddle or show password
      if (currentStep === riddle.riddles.length) {
        // Show password
        setCurrentStep(5)
        // Auto-fade after 10 seconds
        setTimeout(() => {
          setShowCard(false)
          setTimeout(() => setCurrentStep(0), 1000)
        }, 10000)
      } else {
        setCurrentStep(currentStep + 1)
      }
    }
  }

  const getCurrentRPText = () => {
    if (currentStep === 0) return riddle?.intro_text
    if (currentStep === 5) return "The secret is revealed. Guard it well, adventurer."
    if (currentStep <= riddle?.riddles.length) {
      return riddle.riddles[currentStep - 1]?.rpText
    }
    return ""
  }

  const getCurrentContent = () => {
    if (currentStep === 0) return "Click to begin your trial"
    if (currentStep === 5) return riddle?.final_password
    if (currentStep <= riddle?.riddles.length) {
      return riddle.riddles[currentStep - 1]?.text
    }
    return ""
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  if (!riddle) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-red-400">Riddle not found or inactive</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black overflow-hidden relative">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-purple-900/20"></div>
      
      {/* Animated Triangle Background - Behind everything */}
      <div className="absolute inset-0 z-0">
        <motion.div
          animate={{
            rotate: [0, 360],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          style={{
            width: '600px',
            height: '600px',
            background: 'linear-gradient(45deg, rgba(147, 51, 234, 0.1), rgba(59, 130, 246, 0.1), rgba(16, 185, 129, 0.1))',
            clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
            filter: 'blur(2px)'
          }}
        />
        <motion.div
          animate={{
            rotate: [360, 0],
            scale: [1.2, 0.6, 1.2],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-1/2 left-1/4 transform -translate-x-1/2 -translate-y-1/2"
          style={{
            width: '300px',
            height: '300px',
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.08), rgba(245, 101, 101, 0.08))',
            clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
            filter: 'blur(1px)'
          }}
        />
        <motion.div
          animate={{
            rotate: [180, 540],
            scale: [0.5, 1.5, 0.5],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-1/3 right-1/4 transform translate-x-1/2 -translate-y-1/2"
          style={{
            width: '400px',
            height: '400px',
            background: 'linear-gradient(225deg, rgba(168, 85, 247, 0.06), rgba(139, 92, 246, 0.06))',
            clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
            filter: 'blur(3px)'
          }}
        />
      </div>
      
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

      {/* Main Card - Higher z-index to be above triangle */}
      <div className="flex items-center justify-center min-h-screen px-8 relative z-30">
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
                isPassword={currentStep === 5}
                isClickable={currentStep !== 5}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// Glitch Card Component
function GlitchCard({ onClick, content, logo, isPassword, isClickable }) {
  return (
    <div 
      className={`relative group z-40 ${isClickable ? 'cursor-pointer' : ''}`}
      onClick={isClickable ? onClick : undefined}
    >
      {/* Main Card with higher z-index */}
      <div className="relative bg-black border border-gray-800 rounded-lg p-12 min-w-[400px] min-h-[300px] flex flex-col items-center justify-center space-y-6 overflow-hidden z-50">
        
        {/* Glitch Border Effects */}
        <div className="absolute inset-0 rounded-lg overflow-hidden">
          {/* Top edge glitch */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-glitch-horizontal"></div>
          
          {/* Bottom edge glitch */}
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-pink-400 to-transparent animate-glitch-horizontal-reverse"></div>
          
          {/* Left edge glitch */}
          <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-transparent via-green-400 to-transparent animate-glitch-vertical"></div>
          
          {/* Right edge glitch */}
          <div className="absolute right-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-transparent via-yellow-400 to-transparent animate-glitch-vertical-reverse"></div>
          
          {/* Corner glitches */}
          <div className="absolute top-0 left-0 w-4 h-4 bg-red-400 opacity-30 animate-pulse"></div>
          <div className="absolute top-0 right-0 w-4 h-4 bg-blue-400 opacity-30 animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-4 h-4 bg-green-400 opacity-30 animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-4 h-4 bg-purple-400 opacity-30 animate-pulse"></div>
        </div>

        {/* Logo */}
        {logo && (
          <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center overflow-hidden">
            <img src={logo} alt="Venue Logo" className="w-full h-full object-cover" />
          </div>
        )}

        {/* Content */}
        <div className="text-center space-y-4 relative z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={content}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5 }}
            >
              {isPassword ? (
                <div className="text-4xl font-bold text-green-400 tracking-widest animate-pulse">
                  {content}
                </div>
              ) : (
                <div className="text-white text-lg max-w-xs leading-relaxed">
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
      </div>
    </div>
  )
}
