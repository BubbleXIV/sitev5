'use client'
import { motion } from 'framer-motion'
import ImageUpload from '@/components/ImageUpload'

export default function BackgroundImageSection({
  backgroundImage = '',
  overlayOpacity = 0.6,
  overlayColor = 'black',
  minHeight = 'min-h-screen',
  animation = 'fade-in',
  isEditing = false,
  onUpdate
}) {
  const animations = {
    'fade-in': { opacity: [0, 1], transition: { duration: 1 } },
    'slide-up': { y: [50, 0], opacity: [0, 1], transition: { duration: 1 } }
  }

  return (
    <motion.div 
      className={`relative ${minHeight} bg-cover bg-center bg-no-repeat`}
      style={backgroundImage ? { backgroundImage: `url(${backgroundImage})` } : {}}
      initial="hidden"
      animate="visible"
      variants={{
        visible: animations[animation] || animations['fade-in']
      }}
    >
      {/* Overlay */}
      <div 
        className={`absolute inset-0`}
        style={{ 
          backgroundColor: overlayColor === 'black' ? '#000000' : 
                           overlayColor === 'nightshade' ? '#350f6a' : 
                           overlayColor === 'purple' ? '#581c87' : '#000000',
          opacity: overlayOpacity 
        }}
      ></div>
      
      {/* Content */}
      <div className="relative z-10 w-full h-full flex items-center justify-center">
        {isEditing ? (
          <div className="space-y-4 p-8 bg-black/50 rounded-lg max-w-md">
            <h3 className="text-white font-bold">Background Settings</h3>
            
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
                Overlay Opacity: {Math.round(overlayOpacity * 100)}%
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
                <option value="nightshade">Nightshade</option>
                <option value="purple">Purple</option>
              </select>
            </div>

            <p className="text-xs text-gray-400 mt-4">
              Add other elements above this section to overlay content on the background.
            </p>
          </div>
        ) : (
          !backgroundImage && (
            <div className="text-center text-gray-400 p-8">
              <p>Add a background image to get started</p>
            </div>
          )
        )}
      </div>
    </motion.div>
  )
}
