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
        .from('riddle_cards')
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
