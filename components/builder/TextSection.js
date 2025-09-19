'use client'
import { motion } from 'framer-motion'

export default function TextSection({
  content = 'Enter your text here...',
  fontSize = 'text-base',
  textAlign = 'left',
  padding = 'py-8',
  animation = 'fade-in',
  isEditing = false,
  onUpdate
}) {
  const animations = {
    'fade-in': { opacity: [0, 1], transition: { duration: 0.8 } },
    'slide-up': { y: [30, 0], opacity: [0, 1], transition: { duration: 0.8 } },
    'slide-left': { x: [30, 0], opacity: [0, 1], transition: { duration: 0.8 } },
    'slide-right': { x: [-30, 0], opacity: [0, 1], transition: { duration: 0.8 } },
  }

  return (
    <motion.div
      className={`${padding}`}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={{
        visible: animations[animation] || animations['fade-in']
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {isEditing ? (
          <textarea
            value={content}
            onChange={(e) => onUpdate({ content: e.target.value })}
            className={`w-full ${fontSize} text-${textAlign} bg-transparent border-2 border-dashed border-white/50 p-4 text-white min-h-32 resize-none`}
            placeholder="Enter your text here..."
          />
        ) : (
          <div className={`${fontSize} text-${textAlign} text-gray-300 leading-relaxed whitespace-pre-wrap`}>
            {content}
          </div>
        )}
      </div>
    </motion.div>
  )
}
