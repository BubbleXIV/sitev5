'use client'
import { motion } from 'framer-motion'
import ImageUpload from '@/components/ImageUpload'

export default function HeroSection({
  title = 'Hero Title',
  subtitle = 'Hero Subtitle',
  backgroundType = 'gradient',
  backgroundImage = '',
  imageOpacity = 0.5,
  gradient = 'from-nightshade-900 to-purple-900',
  textAlign = 'center',
  animation = 'fade-in',
  button1Text = '',
  button1Link = '',
  button2Text = '',
  button2Link = '',
  isEditing = false,
  onUpdate
}) {
  const animations = {
    'fade-in': { opacity: [0, 1], transition: { duration: 1 } },
    'slide-up': { y: [50, 0], opacity: [0, 1], transition: { duration: 1 } },
    'slide-down': { y: [-50, 0], opacity: [0, 1], transition: { duration: 1 } },
  }

  const backgroundStyles = {
    gradient: `bg-gradient-to-br ${gradient}`,
    image: backgroundImage ? `bg-cover bg-center bg-no-repeat` : `bg-gradient-to-br ${gradient}`,
    video: 'bg-black'
  }

  return (
    <motion.div
      className={`relative min-h-screen flex items-center justify-center ${backgroundStyles[backgroundType]}`}
      style={backgroundType === 'image' && backgroundImage ? { backgroundImage: `url(${backgroundImage})` } : {}}
      initial="hidden"
      animate="visible"
      variants={{
        visible: animations[animation] || animations['fade-in']
      }}
    >
      {/* Overlay with adjustable opacity */}
      <div 
        className="absolute inset-0 bg-black"
        style={{ opacity: backgroundType === 'image' && backgroundImage ? imageOpacity : 0.3 }}
      ></div>

      <div className={`relative z-10 max-w-4xl mx-auto px-4 text-${textAlign}`}>
        {isEditing ? (
          <div className="space-y-4">
            <input
              type="text"
              value={title}
              onChange={(e) => onUpdate({ title: e.target.value })}
              className="w-full text-5xl font-bold bg-transparent border-2 border-dashed border-white/50 p-4 text-white"
              placeholder="Hero Title"
            />
            <input
              type="text"
              value={subtitle}
              onChange={(e) => onUpdate({ subtitle: e.target.value })}
              className="w-full text-xl bg-transparent border-2 border-dashed border-white/50 p-4 text-gray-300"
              placeholder="Hero Subtitle"
            />
            
            {backgroundType === 'image' && (
              <div className="mt-4 space-y-3 p-4 bg-gray-900/50 rounded-lg">
                <ImageUpload
                  currentImage={backgroundImage}
                  onImageUploaded={(url) => onUpdate({ backgroundImage: url })}
                />
                <div>
                  <label className="block text-sm font-medium mb-2 text-white">
                    Image Overlay Opacity: {imageOpacity}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={imageOpacity}
                    onChange={(e) => onUpdate({ imageOpacity: parseFloat(e.target.value) })}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Lower = brighter image, Higher = darker overlay
                  </p>
                </div>
              </div>
            )}

            {/* Optional Button Controls */}
            <div className="mt-6 pt-6 border-t border-white/30 bg-gray-900/30 p-4 rounded-lg">
              <h4 className="text-sm font-semibold mb-3 text-white">Hero Buttons (Optional)</h4>
              <p className="text-xs text-gray-400 mb-4">Leave empty to hide buttons</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs mb-1 text-gray-300">Button 1 Text</label>
                  <input
                    type="text"
                    defaultValue={button1Text || ''}
                    onBlur={(e) => onUpdate({ button1Text: e.target.value })}
                    className="w-full text-sm"
                    placeholder="View Events"
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1 text-gray-300">Button 1 Link</label>
                  <input
                    type="text"
                    defaultValue={button1Link || ''}
                    onBlur={(e) => onUpdate({ button1Link: e.target.value })}
                    className="w-full text-sm"
                    placeholder="/events"
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1 text-gray-300">Button 2 Text</label>
                  <input
                    type="text"
                    defaultValue={button2Text || ''}
                    onBlur={(e) => onUpdate({ button2Text: e.target.value })}
                    className="w-full text-sm"
                    placeholder="Contact Us"
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1 text-gray-300">Button 2 Link</label>
                  <input
                    type="text"
                    defaultValue={button2Link || ''}
                    onBlur={(e) => onUpdate({ button2Link: e.target.value })}
                    className="w-full text-sm"
                    placeholder="/contact"
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <h1 className="text-5xl md:text-7xl font-bold text-white drop-shadow-[0_0_15px_rgba(168,85,247,0.5)] leading-tight pb-2">
              {title}
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto">
              {subtitle}
            </p>

            {/* Optional Buttons - only render if text is provided */}
            {(button1Text || button2Text) && (
              <div className="flex flex-wrap gap-4 justify-center mt-8">
                {button1Text && (
                  <a
                    href={button1Link || '#'}
                    className="px-8 py-4 bg-gradient-to-r from-nightshade-600 to-purple-600 hover:from-nightshade-700 hover:to-purple-700 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-white font-medium text-lg"
                  >
                    {button1Text}
                  </a>
                )}
                {button2Text && (
                  <a
                    href={button2Link || '#'}
                    className="px-8 py-4 glass hover:bg-white/20 rounded-lg transition-all duration-300 border border-nightshade-500/50 hover:border-nightshade-400 text-white font-medium text-lg"
                  >
                    {button2Text}
                  </a>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}
