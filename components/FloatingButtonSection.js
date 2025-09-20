'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function FloatingButtonSection({
  text = 'Floating Button',
  link = '#',
  style = 'primary',
  size = 'medium',
  position = { x: 50, y: 50 },
  animation = 'fade-in',
  isEditing = false,
  onUpdate
}) {
  const styleClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    outline: 'px-6 py-3 border-2 border-nightshade-500 hover:bg-nightshade-500 rounded-lg transition-all duration-300 text-white'
  }

  const sizeClasses = {
    small: 'px-4 py-2 text-sm',
    medium: 'px-6 py-3',
    large: 'px-8 py-4 text-lg'
  }

  const animations = {
    'fade-in': { opacity: [0, 1], transition: { duration: 0.8 } },
    'bounce-in': { scale: [0, 1.1, 1], opacity: [0, 1], transition: { duration: 0.8 } },
    'slide-up': { y: [30, 0], opacity: [0, 1], transition: { duration: 0.8 } }
  }

  return (
    <motion.div
      className="absolute inset-0 pointer-events-none"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={{
        visible: animations[animation] || animations['fade-in']
      }}
    >
      <div
        className="absolute pointer-events-auto"
        style={{
          left: `${position.x}%`,
          top: `${position.y}%`,
          transform: 'translate(-50%, -50%)'
        }}
      >
        {isEditing ? (
          <div className="space-y-2 min-w-48">
            <input
              type="text"
              value={text}
              onChange={(e) => onUpdate({ text: e.target.value })}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white text-sm"
              placeholder="Button text"
            />
            <input
              type="text"
              value={link}
              onChange={(e) => onUpdate({ link: e.target.value })}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white text-sm"
              placeholder="Button link"
            />
            
            <div className="grid grid-cols-2 gap-2">
              <input
                type="range"
                min="0"
                max="100"
                value={position.x}
                onChange={(e) => onUpdate({ position: { ...position, x: parseInt(e.target.value) } })}
                title={`X: ${position.x}%`}
              />
              <input
                type="range"
                min="0"
                max="100"
                value={position.y}
                onChange={(e) => onUpdate({ position: { ...position, y: parseInt(e.target.value) } })}
                title={`Y: ${position.y}%`}
              />
            </div>
            <div className="text-xs text-gray-400 text-center">
              Position: {position.x}%, {position.y}%
            </div>
          </div>
        ) : (
          <Link href={link} className={`${styleClasses[style]} ${sizeClasses[size]} inline-block`}>
            {text}
          </Link>
        )}
      </div>
    </motion.div>
  )
}
