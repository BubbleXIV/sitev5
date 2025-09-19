import { motion } from 'framer-motion'

export default function TestimonialSection({
  quote = 'Amazing experience!',
  author = 'Anonymous',
  role = '',
  avatar = '',
  animation = 'fade-in',
  isEditing = false,
  onUpdate
}) {
  const animations = {
    'fade-in': { opacity: [0, 1], transition: { duration: 0.8 } },
    'slide-up': { y: [30, 0], opacity: [0, 1], transition: { duration: 0.8 } },
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
        <div className="card text-center">
          {isEditing ? (
            <div className="space-y-4">
              <textarea
                value={quote}
                onChange={(e) => onUpdate({ quote: e.target.value })}
                placeholder="Testimonial quote"
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white h-24"
              />
              <input
                type="text"
                value={author}
                onChange={(e) => onUpdate({ author: e.target.value })}
                placeholder="Author name"
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
              />
              <input
                type="text"
                value={role}
                onChange={(e) => onUpdate({ role: e.target.value })}
                placeholder="Author role (optional)"
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
              />
            </div>
          ) : (
            <>
              <blockquote className="text-xl md:text-2xl font-medium text-gray-300 mb-8">
                "{quote}"
              </blockquote>
              <div className="flex items-center justify-center space-x-4">
                {avatar && (
                  <img
                    src={avatar}
                    alt={author}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                )}
                <div>
                  <div className="font-bold text-nightshade-300">{author}</div>
                  {role && <div className="text-sm text-gray-400">{role}</div>}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  )
}