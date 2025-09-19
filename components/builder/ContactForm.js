'use client'
import { motion } from 'framer-motion'
import { useState } from 'react'

export default function ContactForm({
  title = 'Contact Us',
  fields = ['name', 'email', 'message'],
  animation = 'fade-in',
  isEditing = false,
  onUpdate
}) {
  const [formData, setFormData] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    // Handle form submission here
    setTimeout(() => {
      setIsSubmitting(false)
      alert('Message sent successfully!')
      setFormData({})
    }, 2000)
  }

  const fieldTypes = {
    name: { type: 'text', placeholder: 'Your Name', label: 'Name' },
    email: { type: 'email', placeholder: 'your@email.com', label: 'Email' },
    phone: { type: 'tel', placeholder: 'Your Phone', label: 'Phone' },
    message: { type: 'textarea', placeholder: 'Your Message', label: 'Message' }
  }

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
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="card">
          {isEditing ? (
            <input
              type="text"
              value={title}
              onChange={(e) => onUpdate({ title: e.target.value })}
              className="w-full text-2xl font-bold mb-6 bg-transparent border-2 border-dashed border-white/50 p-2 text-white"
              placeholder="Contact Form Title"
            />
          ) : (
            <h2 className="text-3xl font-bold text-center mb-8 text-nightshade-300">
              {title}
            </h2>
          )}

          {!isEditing && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {fields.map((field) => {
                const fieldConfig = fieldTypes[field]
                if (!fieldConfig) return null

                return (
                  <div key={field}>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {fieldConfig.label}
                    </label>
                    {fieldConfig.type === 'textarea' ? (
                      <textarea
                        rows={4}
                        placeholder={fieldConfig.placeholder}
                        value={formData[field] || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, [field]: e.target.value }))}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-nightshade-500 focus:border-transparent"
                        required
                      />
                    ) : (
                      <input
                        type={fieldConfig.type}
                        placeholder={fieldConfig.placeholder}
                        value={formData[field] || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, [field]: e.target.value }))}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-nightshade-500 focus:border-transparent"
                        required
                      />
                    )}
                  </div>
                )
              })}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          )}
        </div>
      </div>
    </motion.div>
  )
}
