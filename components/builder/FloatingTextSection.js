'use client'
import { motion } from 'framer-motion'

export default function FloatingTextSection({
  content = 'Floating Text',
  fontSize = 'text-2xl',
  textAlign = 'center',
  textColor = 'text-white',
  backgroundColor = 'bg-black/50',
  padding = 'px-6 py-3',
  borderRadius = 'rounded-lg',
  position = { x: 50, y: 50 }, // Percentage based positioning
  animation = 'fade-in',
  isEditing = false,
  onUpdate
}) {
  const animations = {
    'fade-in': { opacity: [0, 1], transition: { duration: 0.8 } },
    'slide-up': { y: [30, 0], opacity: [0, 1], transition: { duration: 0.8 } },
    'bounce-in': { scale: [0, 1.1, 1], opacity: [0, 1], transition: { duration: 0.8 } }
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
          <div className="space-y-2 min-w-64">
            <textarea
              value={content}
              onChange={(e) => onUpdate({ content: e.target.value })}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white text-sm"
              placeholder="Enter floating text..."
              rows="2"
            />
            
            <div className="grid grid-cols-2 gap-2">
              <select
                value={fontSize}
                onChange={(e) => onUpdate({ fontSize: e.target.value })}
                className="px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-xs"
              >
                <option value="text-sm">Small</option>
                <option value="text-base">Medium</option>
                <option value="text-lg">Large</option>
                <option value="text-xl">XL</option>
                <option value="text-2xl">2XL</option>
                <option value="text-4xl">4XL</option>
              </select>
              
              <select
                value={backgroundColor}
                onChange={(e) => onUpdate({ backgroundColor: e.target.value })}
                className="px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-xs"
              >
                <option value="bg-black/50">Semi-Black</option>
                <option value="bg-nightshade-900/80">Nightshade</option>
                <option value="bg-purple-900/80">Purple</option>
                <option value="bg-transparent">Transparent</option>
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <input
                type="range"
                min="0"
                max="100"
                value={position.x}
                onChange={(e) => onUpdate({ position: { ...position, x: parseInt(e.target.value) } })}
                className="text-xs"
                title={`X: ${position.x}%`}
              />
              <input
                type="range"
                min="0"
                max="100"
                value={position.y}
                onChange={(e) => onUpdate({ position: { ...position, y: parseInt(e.target.value) } })}
                className="text-xs"
                title={`Y: ${position.y}%`}
              />
            </div>
            <div className="text-xs text-gray-400 text-center">
              Position: {position.x}%, {position.y}%
            </div>
          </div>
        ) : (
          <div className={`${fontSize} ${textColor} ${backgroundColor} ${padding} ${borderRadius} ${textAlign} backdrop-blur-sm`}>
            {content}
          </div>
        )}
      </div>
    </motion.div>
  )
}
