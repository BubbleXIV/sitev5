'use client'
import { motion } from 'framer-motion'
import ImageUpload from '@/components/ImageUpload'

export default function HighlightSection({
  header = 'Featured Event',
  subtext = 'Event description',
  leftImage = '',
  leftDescription = '',
  leftLink = '',
  rightImage = '',
  rightDescription = '',
  rightLink = '',
  animation = 'fade-in',
  isEditing = false,
  onUpdate
}) {
  const animations = {
    'fade-in': { opacity: [0, 1], transition: { duration: 0.8 } },
    'slide-up': { y: [30, 0], opacity: [0, 1], transition: { duration: 0.8 } },
  }

  if (isEditing) {
    return (
      <div className="p-6 border-2 border-yellow-500 rounded-lg bg-gray-900/50 my-8">
        <h3 className="text-lg font-bold mb-4 text-yellow-300">Highlight Section</h3>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Header</label>
            <input
              type="text"
              key={`header-${header}`}
              defaultValue={header}
              onBlur={(e) => onUpdate({ header: e.target.value })}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Subtext</label>
            <textarea
              key={`subtext-${subtext}`}
              defaultValue={subtext}
              onBlur={(e) => onUpdate({ subtext: e.target.value })}
              className="w-full min-h-20"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Left Side */}
            <div className="border-t border-white/30 pt-4">
              <h4 className="text-sm font-semibold mb-3">Left Image</h4>
              <ImageUpload
                currentImage={leftImage}
                onImageUploaded={(url) => onUpdate({ leftImage: url })}
              />
              <textarea
                key={`left-desc-${leftDescription}`}
                defaultValue={leftDescription}
                onBlur={(e) => onUpdate({ leftDescription: e.target.value })}
                className="w-full mt-2"
                placeholder="Left description"
              />
              <input
                key={`left-link-${leftLink}`}
                type="text"
                defaultValue={leftLink}
                onBlur={(e) => onUpdate({ leftLink: e.target.value })}
                className="w-full mt-2"
                placeholder="Link URL (optional)"
              />
            </div>

            {/* Right Side */}
            <div className="border-t border-white/30 pt-4">
              <h4 className="text-sm font-semibold mb-3">Right Image</h4>
              <ImageUpload
                currentImage={rightImage}
                onImageUploaded={(url) => onUpdate({ rightImage: url })}
              />
              <textarea
                key={`right-desc-${rightDescription}`}
                defaultValue={rightDescription}
                onBlur={(e) => onUpdate({ rightDescription: e.target.value })}
                className="w-full mt-2"
                placeholder="Right description"
              />
              <input
                key={`right-link-${rightLink}`}
                type="text"
                defaultValue={rightLink}
                onBlur={(e) => onUpdate({ rightLink: e.target.value })}
                className="w-full mt-2"
                placeholder="Link URL (optional)"
              />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      className="py-16 px-4"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={{
        visible: animations[animation] || animations['fade-in']
      }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">{header}</h2>
          <p className="text-xl text-gray-300">{subtext}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Card */}
          {(leftImage || leftDescription) && (
            <div className="card">
              {leftImage && (
                <img
                  src={leftImage}
                  alt="Left highlight"
                  className="w-full h-64 object-cover rounded-lg mb-4"
                />
              )}
              <p className="text-gray-300">{leftDescription}</p>
              {leftLink && (
                <a
                  href={leftLink}
                  className="mt-4 inline-block px-6 py-3 bg-gradient-to-r from-nightshade-600 to-purple-600 hover:from-nightshade-700 hover:to-purple-700 rounded-lg transition-all text-white font-medium"
                >
                  Learn More
                </a>
              )}
            </div>
          )}

          {/* Right Card */}
          {(rightImage || rightDescription) && (
            <div className="card">
              {rightImage && (
                <img
                  src={rightImage}
                  alt="Right highlight"
                  className="w-full h-64 object-cover rounded-lg mb-4"
                />
              )}
              <p className="text-gray-300">{rightDescription}</p>
              {rightLink && (
                <a
                  href={rightLink}
                  className="mt-4 inline-block px-6 py-3 bg-gradient-to-r from-nightshade-600 to-purple-600 hover:from-nightshade-700 hover:to-purple-700 rounded-lg transition-all text-white font-medium"
                >
                  Learn More
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
