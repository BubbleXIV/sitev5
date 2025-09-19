import { motion } from 'framer-motion'
import { useState } from 'react'
import ImageUpload from '@/components/ImageUpload'
import { X, Plus } from 'lucide-react'

export default function GallerySection({
  images = [],
  columns = 3,
  spacing = 'medium',
  animation = 'fade-in',
  isEditing = false,
  onUpdate
}) {
  const [selectedImage, setSelectedImage] = useState(null)

  const spacingClasses = {
    small: 'gap-2',
    medium: 'gap-4',
    large: 'gap-8'
  }

  const columnClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  }

  const animations = {
    'fade-in': { opacity: [0, 1], transition: { duration: 0.8 } },
    'zoom-in': { scale: [0.8, 1], opacity: [0, 1], transition: { duration: 0.8 } },
  }

  const addImage = (url) => {
    const newImages = [...images, { id: Date.now(), src: url, alt: 'Gallery image' }]
    onUpdate({ images: newImages })
  }

  const removeImage = (id) => {
    const newImages = images.filter(img => img.id !== id)
    onUpdate({ images: newImages })
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`grid ${columnClasses[columns]} ${spacingClasses[spacing]}`}>
          {images.map((image, index) => (
            <motion.div
              key={image.id}
              className="relative group cursor-pointer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => !isEditing && setSelectedImage(image)}
            >
              <img
                src={image.src}
                alt={image.alt}
                className="w-full h-64 object-cover rounded-lg hover:scale-105 transition-transform duration-300"
              />
              {isEditing && (
                <button
                  onClick={() => removeImage(image.id)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={16} />
                </button>
              )}
            </motion.div>
          ))}

          {isEditing && (
            <div className="flex items-center justify-center h-64 border-2 border-dashed border-white/30 rounded-lg">
              <ImageUpload
                onImageUploaded={addImage}
                currentImage=""
              />
            </div>
          )}
        </div>

        {images.length === 0 && !isEditing && (
          <div className="text-center py-12">
            <p className="text-gray-400">No images in gallery</p>
          </div>
        )}

        {/* Lightbox */}
        {selectedImage && (
          <div
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedImage(null)}
          >
            <div className="relative max-w-4xl max-h-full">
              <img
                src={selectedImage.src}
                alt={selectedImage.alt}
                className="max-w-full max-h-full object-contain"
              />
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 bg-black/50 text-white rounded-full p-2"
              >
                <X size={24} />
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}