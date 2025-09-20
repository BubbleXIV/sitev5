'use client'
import { motion } from 'framer-motion'
import ImageUpload from '@/components/ImageUpload'

export default function BackgroundImageSection({
  backgroundImage = '',
  overlayOpacity = 0.7,
  overlayColor = 'black',
  minHeight = 'min-h-screen',
  children = [],
  isEditing = false,
  onUpdate
}) {
  const animations = {
    'fade-in': { opacity: [0, 1], transition: { duration: 1 } },
    'slide-up': { y: [50, 0], opacity: [0, 1], transition: { duration: 1 } }
  }

  return (
    <motion.div 
      className={`relative ${minHeight} flex items-center justify-center bg-cover bg-center bg-no-repeat`}
      style={backgroundImage ? { backgroundImage: `url(${backgroundImage})` } : {}}
      initial="hidden"
      animate="visible"
      variants={{
        visible: animations['fade-in']
      }}
    >
      {/* Overlay */}
      <div 
        className={`absolute inset-0 bg-${overlayColor}`}
        style={{ opacity: overlayOpacity }}
      ></div>
      
      {/* Content */}
      <div className="relative z-10 w-full">
        {isEditing ? (
          <div className="space-y-4 p-8">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Background Image
              </label>
              <ImageUpload
                currentImage={backgroundImage}
                onImageUploaded={(url) => onUpdate({ backgroundImage: url })}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Overlay Opacity: {overlayOpacity}
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={overlayOpacity}
                onChange={(e) => onUpdate({ overlayOpacity: parseFloat(e.target.value) })}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Overlay Color
              </label>
              <select
                value={overlayColor}
                onChange={(e) => onUpdate({ overlayColor: e.target.value })}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
              >
                <option value="black">Black</option>
                <option value="gray-900">Dark Gray</option>
                <option value="nightshade-900">Nightshade</option>
                <option value="purple-900">Purple</option>
              </select>
            </div>

            <div className="border-2 border-dashed border-white/50 p-4 rounded-lg">
              <p className="text-gray-300">
                Add other page builder elements above or below this background section to overlay content.
              </p>
            </div>
          </div>
        ) : (
          // This section provides the background, other elements will be layered
          backgroundImage ? null : (
            <div className="text-center text-gray-400 p-8">
              <p>Add a background image to get started</p>
            </div>
          )
        )}
      </div>
    </motion.div>
  )
}
