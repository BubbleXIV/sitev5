'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'

export default function RiddleCard({ params }) {
  const [riddle, setRiddle] = useState(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showCard, setShowCard] = useState(false)
  const [error, setError] = useState(null)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const router = useRouter()

  useEffect(() => {
    fetchRiddle()
  }, [params.slug])

  useEffect(() => {
    if (riddle && !error) {
      setTimeout(() => setShowCard(true), 1000)
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

  const handleAnswerSelect = (answerIndex) => {
    setSelectedAnswer(answerIndex)
    
    setTimeout(() => {
      const totalRiddles = riddle.riddles.length
      
      if (currentStep === totalRiddles) {
        setCurrentStep(totalRiddles + 1)
        setTimeout(() => {
          setShowCard(false)
          setTimeout(() => setCurrentStep(0), 1000)
        }, 15000)
      } else if (currentStep < totalRiddles) {
        setCurrentStep(currentStep + 1)
        setSelectedAnswer(null)
      }
    }, 1500)
  }

  const handleCardClick = () => {
    if (!riddle || !riddle.riddles) return
    if (currentStep === 0) {
      setCurrentStep(1)
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

  const getCurrentRiddle = () => {
    if (!riddle || currentStep === 0 || currentStep > riddle.riddles.length) return null
    return riddle.riddles[currentStep - 1]
  }

  const isPasswordStep = () => riddle && currentStep > riddle.riddles.length
  const isRiddleStep = () => riddle && currentStep > 0 && currentStep <= riddle.riddles.length
  const isIntroStep = () => currentStep === 0

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

  if (error || !riddle) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-red-400 text-xl">{error || 'Riddle not found'}</div>
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
      
      {/* Moving Retro Triangle Behind Everything */}
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
      </div>

      {/* CSS Variables and Styles for Retro Triangle */}
      <style jsx>{`
        .retro-triangle {
          --labs-sys-color-triangle: #6eccee;
        }

        .triangle {
          position: absolute;
          width: 50vmin;
          aspect-ratio: 4/3;
          transform: translate(3vmin, 11.8vmin) rotate(1deg);
          filter: drop-shadow(0 0 15px var(--labs-sys-color-triangle));
          z-index: 1;
          perspective: 1000px;
          animation: triangle 10s linear infinite;
        }

        .triangle:after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(45deg, white, var(--labs-sys-color-triangle));
          clip-path: polygon(
            6% 22%,
            29% 94%,
            29% 94%,
            6% 22%,
            94% 3%,
            29% 94%,
            7% 22%,
            4% 19%,
            29% 94%,
            100% 0%
          );
          transform: translateY(4vmin);
        }

        @keyframes triangle {
          from {
            transform: translate(3vmin, 11.8vmin) rotate(1deg);
          }
          50% {
            transform: translate(3vmin, 12vmin) rotateX(-15deg) rotateY(-20deg);
          }
          to {
            transform: translate(3vmin, 11.8vmin) rotate(1deg);
          }
        }
      `}</style>

      {/* Retro Background Triangle */}
      <div className="retro-triangle absolute inset-0">
        <div className="triangle"></div>
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

      {/* Progress indicator */}
      {riddle.riddles && riddle.riddles.length > 0 && currentStep > 0 && (
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
              {currentStep > 0 && currentStep <= riddle.riddles.length && `Riddle ${currentStep} of ${riddle.riddles.length}`}
              {currentStep > riddle.riddles.length && 'Revelation'}
            </p>
          </div>
        </div>
      )}

      {/* Main Business Card */}
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
              <BusinessCard 
                onClick={handleCardClick}
                content={getCurrentContent()}
                logo={riddle.venue_logo}
                isPassword={isPasswordStep()}
                isRiddle={isRiddleStep()}
                isIntro={isIntroStep()}
                riddle={getCurrentRiddle()}
                onAnswerSelect={handleAnswerSelect}
                selectedAnswer={selectedAnswer}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-8 left-0 right-0 text-center z-20">
        <p className="text-gray-500 text-sm">
          {isIntroStep() && 'Click the card to begin'}
          {isRiddleStep() && 'Choose your answer'}
          {isPasswordStep() && 'The secret has been revealed'}
        </p>
      </div>
    </div>
  )
}

// Business Card Component
function BusinessCard({ 
  onClick, content, logo, isPassword, isRiddle, isIntro, 
  riddle, onAnswerSelect, selectedAnswer 
}) {
  // Mock answer options - you can later add this to the admin panel
  const mockAnswerOptions = [
    "Answer A: First option",
    "Answer B: Second option", 
    "Answer C: Third option"
  ]

  return (
    <div 
      className={`relative group ${isIntro ? 'cursor-pointer' : ''}`}
      onClick={isIntro ? onClick : undefined}
    >
      {/* Business Card - Standard business card proportions */}
      <div className="relative bg-gradient-to-br from-gray-900 to-black border border-gray-700 rounded-lg shadow-2xl overflow-hidden transition-all duration-300"
           style={{ width: '600px', height: '360px' }}>

        {/* Subtle border glow */}
        <div className="absolute inset-0 rounded-lg border border-purple-500/20"></div>

        {/* Card Content Container */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center p-8">

          {/* Logo */}
          {logo && (
            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center overflow-hidden border-2 border-gray-700 mb-6">
              <img src={logo} alt="Venue Logo" className="w-full h-full object-cover" />
            </div>
          )}

          {/* Content */}
          <div className="text-center space-y-6 w-full max-w-md">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${content}-${selectedAnswer}`}
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
                ) : isRiddle ? (
                  <div className="space-y-6">
                    <div className="text-white text-lg leading-relaxed">
                      {content}
                    </div>
                    
                    {/* Answer Options */}
                    <div className="space-y-3">
                      {mockAnswerOptions.map((option, index) => (
                        <button
                          key={index}
                          onClick={() => onAnswerSelect(index)}
                          disabled={selectedAnswer !== null}
                          className={`w-full p-3 border-2 rounded-lg text-left transition-all duration-300 ${
                            selectedAnswer === index
                              ? 'border-green-400 bg-green-400/20 text-green-300'
                              : selectedAnswer !== null
                              ? 'border-gray-600 bg-gray-800/50 text-gray-500 cursor-not-allowed'
                              : 'border-gray-500 bg-gray-700/50 text-white hover:border-purple-400 hover:bg-purple-400/20 cursor-pointer'
                          }`}
                        >
                          {option}
                        </button>
                      ))}
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

          {/* Hover effect for intro */}
          {isIntro && (
            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
          )}

          {/* Pulsing effect for password reveal */}
          {isPassword && (
            <div className="absolute inset-0 bg-green-400/10 animate-pulse rounded-lg"></div>
          )}
        </div>
      </div>

      {/* Outer glow effects */}
      {isPassword && (
        <div className="absolute inset-0 bg-green-400/20 rounded-lg blur-xl animate-pulse"></div>
      )}
    </div>
  )
}
