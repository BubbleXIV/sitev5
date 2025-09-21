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
    
    // Auto-proceed after selection
    setTimeout(() => {
      const totalRiddles = riddle.riddles.length
      
      if (currentStep === totalRiddles) {
        // Show password after last riddle
        setCurrentStep(totalRiddles + 1)
        // Auto-fade after 15 seconds
        setTimeout(() => {
          setShowCard(false)
          setTimeout(() => setCurrentStep(0), 1000)
        }, 15000)
      } else if (currentStep < totalRiddles) {
        // Next riddle
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

  const isPasswordStep = () => {
    return riddle && currentStep > riddle.riddles.length
  }

  const isRiddleStep = () => {
    return riddle && currentStep > 0 && currentStep <= riddle.riddles.length
  }

  const isIntroStep = () => {
    return currentStep === 0
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
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-purple-900/20"></div>
      
      {/* Static overlay effect */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="glitch-bg"></div>
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

      {/* Glitch effect styles */}
      <style jsx>{`
        .glitch-bg {
          width: 100%;
          height: 100%;
          background-image: 
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              rgba(255,255,255,0.03) 2px,
              rgba(255,255,255,0.03) 4px
            ),
            repeating-linear-gradient(
              90deg,
              transparent,
              transparent 2px,
              rgba(255,255,255,0.03) 2px,
              rgba(255,255,255,0.03) 4px
            );
          animation: glitchBg 0.2s infinite;
        }

        @keyframes glitchBg {
          0% { transform: translate(0, 0); }
          10% { transform: translate(-2px, 2px); }
          20% { transform: translate(2px, -2px); }
          30% { transform: translate(-2px, -2px); }
          40% { transform: translate(2px, 2px); }
          50% { transform: translate(-2px, 2px); }
          60% { transform: translate(2px, -2px); }
          70% { transform: translate(-2px, -2px); }
          80% { transform: translate(2px, 2px); }
          90% { transform: translate(-2px, 2px); }
          100% { transform: translate(0, 0); }
        }
      `}</style>
    </div>
  )
}

// Enhanced Glitch Card Component
function GlitchCard({ 
  onClick, content, logo, isPassword, isRiddle, isIntro, 
  riddle, onAnswerSelect, selectedAnswer 
}) {
  const [glitchActive, setGlitchActive] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setGlitchActive(true)
      setTimeout(() => setGlitchActive(false), 150)
    }, 2000 + Math.random() * 3000)

    return () => clearInterval(interval)
  }, [])

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
      {/* Main Card */}
      <div className={`relative bg-black border-2 rounded-lg p-8 min-w-[500px] min-h-[400px] flex flex-col items-center justify-center space-y-6 overflow-hidden transition-all duration-300 ${
        glitchActive ? 'glitch-border' : 'border-gray-700'
      }`}>
        
        {/* Animated glitch border effect */}
        <div className={`absolute inset-0 rounded-lg transition-opacity duration-150 ${
          glitchActive ? 'opacity-100' : 'opacity-0'
        }`}>
          {/* Glitch border effects */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse"></div>
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-pink-400 to-transparent animate-pulse"></div>
          <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-transparent via-green-400 to-transparent animate-pulse"></div>
          <div className="absolute right-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-transparent via-yellow-400 to-transparent animate-pulse"></div>
          
          {/* Corner effects */}
          <div className="absolute top-0 left-0 w-4 h-4 bg-red-400 opacity-60 animate-pulse"></div>
          <div className="absolute top-0 right-0 w-4 h-4 bg-blue-400 opacity-60 animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-4 h-4 bg-green-400 opacity-60 animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-4 h-4 bg-purple-400 opacity-60 animate-pulse"></div>
        </div>

        {/* Intense glitch lines when active */}
        {glitchActive && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/4 left-0 right-0 h-[1px] bg-cyan-400 animate-pulse opacity-80"></div>
            <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-pink-400 animate-pulse opacity-60"></div>
            <div className="absolute top-3/4 left-0 right-0 h-[1px] bg-green-400 animate-pulse opacity-70"></div>
          </div>
        )}

        {/* Logo */}
        {logo && (
          <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center overflow-hidden border-2 border-gray-700">
            <img src={logo} alt="Venue Logo" className="w-full h-full object-cover" />
          </div>
        )}

        {/* Content */}
        <div className="text-center space-y-6 relative z-10 w-full max-w-md">
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

      {/* Outer glow effects */}
      {isPassword && (
        <div className="absolute inset-0 bg-green-400/20 rounded-lg blur-xl animate-pulse"></div>
      )}
      
      {glitchActive && (
        <div className="absolute inset-0 bg-purple-400/30 rounded-lg blur-lg animate-pulse"></div>
      )}

      <style jsx>{`
        .glitch-border {
          border-color: transparent;
          background: linear-gradient(45deg, 
            cyan, magenta, yellow, cyan
          ) 1;
          background-clip: padding-box;
          animation: glitchBorderAnimation 0.1s infinite;
        }

        @keyframes glitchBorderAnimation {
          0% { 
            filter: hue-rotate(0deg) saturate(1);
            transform: translateX(0px);
          }
          10% { 
            filter: hue-rotate(90deg) saturate(1.2);
            transform: translateX(2px);
          }
          20% { 
            filter: hue-rotate(180deg) saturate(0.8);
            transform: translateX(-2px);
          }
          30% { 
            filter: hue-rotate(270deg) saturate(1.5);
            transform: translateX(1px);
          }
          40% { 
            filter: hue-rotate(0deg) saturate(1);
            transform: translateX(-1px);
          }
          50% { 
            filter: hue-rotate(45deg) saturate(1.3);
            transform: translateX(0px);
          }
          60% { 
            filter: hue-rotate(135deg) saturate(0.9);
            transform: translateX(2px);
          }
          70% { 
            filter: hue-rotate(225deg) saturate(1.1);
            transform: translateX(-1px);
          }
          80% { 
            filter: hue-rotate(315deg) saturate(1.4);
            transform: translateX(1px);
          }
          90% { 
            filter: hue-rotate(180deg) saturate(0.7);
            transform: translateX(0px);
          }
          100% { 
            filter: hue-rotate(360deg) saturate(1);
            transform: translateX(0px);
          }
        }
      `}</style>
    </div>
  )
}
