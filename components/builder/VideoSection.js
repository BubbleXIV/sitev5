import { motion } from 'framer-motion'

export default function VideoSection({
  src = '',
  autoplay = false,
  muted = true,
  loop = false,
  animation = 'fade-in',
  isEditing = false,
  onUpdate
}) {
  const animations = {
    'fade-in': { opacity: [0, 1], transition: { duration: 0.8 } },
    'zoom-in': { scale: [0.8, 1], opacity: [0, 1], transition: { duration: 0.8 } },
  }

  return (
    <motion.div
      className="py-12"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={{
        visible: animations[animation] || animations['fade-in']
      }}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {isEditing ? (
          <div className="space-y-4">
            <input
              type="url"
              value={src}
              onChange={(e) => onUpdate({ src: e.target.value })}
              placeholder="Video URL"
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
            />
            <div className="flex space-x-4">
              <label className="flex items-center text-white">
                <input
                  type="checkbox"
                  checked={autoplay}
                  onChange={(e) => onUpdate({ autoplay: e.target.checked })}
                  className="mr-2"
                />
                Autoplay
              </label>
              <label className="flex items-center text-white">
                <input
                  type="checkbox"
                  checked={muted}
                  onChange={(e) => onUpdate({ muted: e.target.checked })}
                  className="mr-2"
                />
                Muted
              </label>
              <label className="flex items-center text-white">
                <input
                  type="checkbox"
                  checked={loop}
                  onChange={(e) => onUpdate({ loop: e.target.checked })}
                  className="mr-2"
                />
                Loop
              </label>
            </div>
          </div>
        ) : src ? (
          <video
            src={src}
            autoPlay={autoplay}
            muted={muted}
            loop={loop}
            controls
            className="w-full h-auto rounded-lg shadow-2xl"
          />
        ) : (
          <div className="w-full h-64 bg-gradient-to-br from-nightshade-800 to-gray-800 rounded-lg flex items-center justify-center">
            <span className="text-gray-400">No Video Selected</span>
          </div>
        )}
      </div>
    </motion.div>
  )
}