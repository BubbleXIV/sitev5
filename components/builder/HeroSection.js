import { motion } from 'framer-motion'
import ImageUpload from '@/components/ImageUpload'

export default function HeroSection({
  title = 'Hero Title',
  subtitle = 'Hero Subtitle',
  backgroundType = 'gradient',
  backgroundImage = '',
  gradient = 'from-nightshade-900 to-purple-900',
  textAlign = 'center',
  animation = 'fade-in',
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
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black/30"></div>

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
              <div className="mt-4">
                <ImageUpload
                  currentImage={backgroundImage}
                  onImageUploaded={(url) => onUpdate({ backgroundImage: url })}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-nightshade-400 to-purple-400 bg-clip-text text-transparent animate-glow">
              {title}
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto">
              {subtitle}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  )
}