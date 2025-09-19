'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function ButtonSection({
  text = 'Click Me',
  link = '#',
  style = 'primary',
  size = 'medium',
  alignment = 'center',
  animation = 'fade-in',
  isEditing = false,
  onUpdate
}) {
  const styleClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    outline: 'px-6 py-3 border-2 border-nightshade-500 hover:bg-nightshade-500 rounded-lg transition-all duration-300'
  }

  const sizeClasses = {
    small: 'px-4 py-2 text-sm',
    medium: 'px-6 py-3',
    large: 'px-8 py-4 text-lg'
  }

  const alignmentClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  }

  const animations = {
    'fade-in': { opacity: [0, 1], transition: { duration: 0.8 } },
    'bounce-in': { scale: [0, 1.1, 1], opacity: [0, 1], transition: { duration: 0.8 } },
    'slide-up': { y: [30, 0], opacity: [0, 1], transition: { duration: 0.8 } },
  }

  return (
    <motion.div
      className="py-8"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={{
        visible: animations[animation] || animations['fade-in']
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={alignmentClasses[alignment]}>
          {isEditing ? (
            <div className="inline-block space-y-4">
              <input
                type="text"
                value={text}
                onChange={(e) => onUpdate({ text: e.target.value })}
                className="block w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                placeholder="Button Text"
              />
              <input
                type="url"
                value={link}
                onChange={(e) => onUpdate({ link: e.target.value })}
                className="block w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                placeholder="Button Link"
              />
              <div className={`${styleClasses[style]} ${sizeClasses[size]} inline-block cursor-default`}>
                {text}
              </div>
            </div>
          ) : (
            <Link href={link} className={`${styleClasses[style]} ${sizeClasses[size]} inline-block`}>
              {text}
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  )
}
