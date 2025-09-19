import { motion } from 'framer-motion'
import ImageUpload from '@/components/ImageUpload'

export default function ImageSection({
  src = '',
  alt = 'Image',
  size = 'medium',
  alignment = 'center',
  animation = 'fade-in',
  isEditing = false,
  onUpdate
}) {
  const sizeClasses = {
    small: 'max-w-md',
    medium: 'max-w-2xl',
    large: 'max-w-4xl',
    full: 'w-full'
  }

  const alignmentClasses = {
    left: 'ml-0',
    center: 'mx-auto',
    right: 'mr-0 ml-auto'
  }

  const animations = {
    'fade-in': { opacity: [0, 1], transition: { duration: 0.8 } },
    'zoom-in': { scale: [0.8, 1], opacity: [0, 1], transition: { duration: 0.8 } },
    'slide-up': { y: [50, 0], opacity: [0, 1], transition: { duration: 0.8 } },
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
        <div className={`${sizeClasses[size]} ${alignmentClasses[alignment]}`}>
          {isEditing ? (
            <div className="space-y-4">
              <ImageUpload
                currentImage={src}
                onImageUploaded={(url) => onUpdate({ src: url })}
              />
              <input
                type="text"
                value={alt}
                onChange={(e) => onUpdate({ alt: e.target.value })}
                placeholder="Alt text"
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
              />
            </div>
          ) : src ? (
            <img
              src={src}
              alt={alt}
              className="w-full h-auto rounded-lg shadow-2xl"
            />
          ) : (
            <div className="w-full h-64 bg-gradient-to-br from-nightshade-800 to-gray-800 rounded-lg flex items-center justify-center">
              <span className="text-gray-400">No Image Selected</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}