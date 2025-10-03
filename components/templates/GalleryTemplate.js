'use client'
import { useState } from 'react'
import { X, Plus, Edit, Trash2, ChevronDown, ChevronRight, Image as ImageIcon, GripVertical } from 'lucide-react'
import ImageUpload from '@/components/ImageUpload'

export default function GalleryTemplate({ data, isEditable, onUpdate }) {
  const [selectedImage, setSelectedImage] = useState(null)
  const [expandedCategories, setExpandedCategories] = useState({})
  const [isEditingCategories, setIsEditingCategories] = useState(false)
  const [isAddingImage, setIsAddingImage] = useState(false)
  const [editingImageIndex, setEditingImageIndex] = useState(null)
  const [draggedIndex, setDraggedIndex] = useState(null)

  const { gallery_images = [], gallery_categories = [] } = data

  // Group images by category
  const uncategorizedImages = gallery_images.filter(img => !img.category)
  const categorizedImages = gallery_categories.reduce((acc, category) => {
    acc[category] = gallery_images.filter(img => img.category === category)
    return acc
  }, {})

  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }))
  }

  const addCategory = (name) => {
    if (!name.trim() || gallery_categories.includes(name)) return
    onUpdate('gallery_categories', [...gallery_categories, name.trim()])
    setExpandedCategories(prev => ({ ...prev, [name.trim()]: true }))
  }

  const removeCategory = (categoryToRemove) => {
    const newCategories = gallery_categories.filter(cat => cat !== categoryToRemove)
    onUpdate('gallery_categories', newCategories)
    
    const updatedImages = gallery_images.map(img => ({
      ...img,
      category: img.category === categoryToRemove ? '' : img.category
    }))
    onUpdate('gallery_images', updatedImages)
  }

  const addImage = (imageData) => {
    const newImage = {
      id: Date.now(),
      url: '',
      title: '',
      description: '',
      category: '',
      ...imageData
    }
    onUpdate('gallery_images', [...gallery_images, newImage])
    setIsAddingImage(false)
  }

  const updateImage = (index, imageData) => {
    const newImages = [...gallery_images]
    newImages[index] = { ...newImages[index], ...imageData }
    onUpdate('gallery_images', newImages)
    setEditingImageIndex(null)
  }

  const removeImage = (index) => {
    const newImages = gallery_images.filter((_, i) => i !== index)
    onUpdate('gallery_images', newImages)
  }

  const handleDragStart = (index) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e, index) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return

    const newImages = [...gallery_images]
    const draggedItem = newImages[draggedIndex]
    newImages.splice(draggedIndex, 1)
    newImages.splice(index, 0, draggedItem)
    
    onUpdate('gallery_images', newImages)
    setDraggedIndex(index)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  const navigateImage = (direction, allImages) => {
    if (!selectedImage) return
    const currentIndex = allImages.findIndex(img => img.id === selectedImage.id)
    let newIndex
    
    if (direction === 'next') {
      newIndex = currentIndex + 1 >= allImages.length ? 0 : currentIndex + 1
    } else {
      newIndex = currentIndex - 1 < 0 ? allImages.length - 1 : currentIndex - 1
    }
    
    setSelectedImage(allImages[newIndex])
  }

  return (
    <div className="min-h-screen bg-gradient-themed text-white">
      {/* Header */}
      <div className="px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-4">Gallery</h1>
        
        {/* Edit Controls */}
        {isEditable && (
          <div className="flex justify-center gap-4 mb-8">
            <button
              onClick={() => setIsEditingCategories(true)}
              className="btn-secondary flex items-center space-x-2"
            >
              <Edit size={16} />
              <span>Manage Categories</span>
            </button>
            <button
              onClick={() => setIsAddingImage(true)}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus size={20} />
              <span>Add Image</span>
            </button>
          </div>
        )}
      </div>

      {/* Gallery Sections */}
      <div className="px-4 pb-8 max-w-7xl mx-auto space-y-8">
        {/* Uncategorized Images */}
        {uncategorizedImages.length > 0 && (
          <div>
            <div 
              className="flex items-center justify-between mb-4 cursor-pointer hover:bg-white/5 p-3 rounded-lg transition-colors"
              onClick={() => toggleCategory('uncategorized')}
            >
              <div className="flex items-center space-x-3">
                {expandedCategories['uncategorized'] !== false ? (
                  <ChevronDown size={24} className="text-nightshade-400" />
                ) : (
                  <ChevronRight size={24} className="text-nightshade-400" />
                )}
                <h2 className="text-2xl font-bold">Uncategorized</h2>
                <span className="text-sm text-gray-400">({uncategorizedImages.length})</span>
              </div>
            </div>
            
            {expandedCategories['uncategorized'] !== false && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {uncategorizedImages.map((image) => {
                  const index = gallery_images.findIndex(img => img.id === image.id)
                  return (
                    <ImageCard
                      key={image.id}
                      image={image}
                      index={index}
                      isEditable={isEditable}
                      draggedIndex={draggedIndex}
                      onDragStart={handleDragStart}
                      onDragOver={handleDragOver}
                      onDragEnd={handleDragEnd}
                      onEdit={() => setEditingImageIndex(index)}
                      onRemove={() => removeImage(index)}
                      onClick={() => !isEditable && setSelectedImage(image)}
                    />
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Categorized Images */}
        {gallery_categories.map(category => (
          categorizedImages[category]?.length > 0 && (
            <div key={category}>
              <div 
                className="flex items-center justify-between mb-4 cursor-pointer hover:bg-white/5 p-3 rounded-lg transition-colors"
                onClick={() => toggleCategory(category)}
              >
                <div className="flex items-center space-x-3">
                  {expandedCategories[category] !== false ? (
                    <ChevronDown size={24} className="text-nightshade-400" />
                  ) : (
                    <ChevronRight size={24} className="text-nightshade-400" />
                  )}
                  <h2 className="text-2xl font-bold">{category}</h2>
                  <span className="text-sm text-gray-400">({categorizedImages[category].length})</span>
                </div>
              </div>
              
              {expandedCategories[category] !== false && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {categorizedImages[category].map((image) => {
                    const index = gallery_images.findIndex(img => img.id === image.id)
                    return (
                      <ImageCard
                        key={image.id}
                        image={image}
                        index={index}
                        isEditable={isEditable}
                        draggedIndex={draggedIndex}
                        onDragStart={handleDragStart}
                        onDragOver={handleDragOver}
                        onDragEnd={handleDragEnd}
                        onEdit={() => setEditingImageIndex(index)}
                        onRemove={() => removeImage(index)}
                        onClick={() => !isEditable && setSelectedImage(image)}
                      />
                    )
                  })}
                </div>
              )}
            </div>
          )
        ))}

        {/* Empty State */}
        {gallery_images.length === 0 && (
          <div className="text-center py-16">
            <ImageIcon size={64} className="mx-auto text-gray-500 mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No images yet</h3>
            {isEditable && (
              <p className="text-gray-500">Add some images to get started</p>
            )}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-4 md:p-8"
          onClick={() => setSelectedImage(null)}
        >
          <div 
            className="relative w-full h-full max-w-7xl flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedImage.url}
              alt={selectedImage.title || 'Gallery image'}
              className="max-w-full max-h-full object-contain"
              style={{ maxHeight: 'calc(100vh - 8rem)' }}
            />
            
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-0 right-0 md:top-4 md:right-4 p-3 bg-black/50 hover:bg-black/70 rounded-lg transition-colors"
            >
              <X size={24} />
            </button>
            
            {gallery_images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    navigateImage('prev', gallery_images)
                  }}
                  className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 rounded-lg text-2xl transition-colors"
                >
                  ←
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    navigateImage('next', gallery_images)
                  }}
                  className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 rounded-lg text-2xl transition-colors"
                >
                  →
                </button>
              </>
            )}
            
            {(selectedImage.title || selectedImage.description) && (
              <div className="absolute bottom-0 left-0 right-0 md:bottom-4 md:left-4 md:right-4 bg-black/80 p-4 md:p-6 rounded-none md:rounded-lg">
                {selectedImage.title && (
                  <h3 className="font-bold text-lg md:text-xl mb-2">{selectedImage.title}</h3>
                )}
                {selectedImage.description && (
                  <p className="text-gray-300 text-sm md:text-base">{selectedImage.description}</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {isEditingCategories && (
        <CategoryEditor
          categories={gallery_categories}
          onAddCategory={addCategory}
          onRemoveCategory={removeCategory}
          onClose={() => setIsEditingCategories(false)}
        />
      )}

      {(isAddingImage || editingImageIndex !== null) && (
        <ImageEditor
          image={editingImageIndex !== null ? gallery_images[editingImageIndex] : null}
          categories={gallery_categories}
          onSave={editingImageIndex !== null 
            ? (data) => updateImage(editingImageIndex, data)
            : addImage
          }
          onClose={() => {
            setIsAddingImage(false)
            setEditingImageIndex(null)
          }}
        />
      )}
    </div>
  )
}

// Image Card Component
function ImageCard({ image, index, isEditable, draggedIndex, onDragStart, onDragOver, onDragEnd, onEdit, onRemove, onClick }) {
  return (
    <div
      draggable={isEditable}
      onDragStart={() => onDragStart(index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDragEnd={onDragEnd}
      className={`relative group ${isEditable ? 'cursor-move' : 'cursor-pointer'} ${
        draggedIndex === index ? 'opacity-50' : ''
      }`}
      onClick={onClick}
    >
      {isEditable && (
        <div className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
          <GripVertical size={20} className="text-white drop-shadow-lg" />
        </div>
      )}

      <div className="aspect-square glass-dark rounded-lg overflow-hidden">
        {image.url ? (
          <img
            src={image.url}
            alt={image.title || 'Gallery image'}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon size={32} className="text-gray-500" />
          </div>
        )}
        
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          {isEditable ? (
            <div className="flex space-x-2">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit()
                }}
                style={{ backgroundColor: 'var(--color-primary)' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-primary-dark)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--color-primary)'}
                className="p-2 rounded-lg"
              >
                <Edit size={16} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onRemove()
                }}
                style={{ backgroundColor: 'var(--color-primary)' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-primary-dark)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--color-primary)'}
                className="p-2 rounded-lg"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ) : (
            <span className="text-white text-sm">Click to view</span>
          )}
        </div>
      </div>
      
      {image.title && (
        <div className="mt-2">
          <h3 className="font-semibold truncate">{image.title}</h3>
        </div>
      )}
    </div>
  )
}

// Category Editor Component
function CategoryEditor({ categories, onAddCategory, onRemoveCategory, onClose }) {
  const [newCategory, setNewCategory] = useState('')

  const handleAdd = () => {
    onAddCategory(newCategory)
    setNewCategory('')
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="glass-dark rounded-lg p-6 w-full max-w-md">
        <h3 className="text-xl font-bold mb-4">Manage Categories</h3>
        
        <div className="flex space-x-2 mb-4">
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="Category name"
            className="flex-1 px-3 py-2 glass-dark border border-gray-600 rounded text-white"
            onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
          />
          <button
            onClick={handleAdd}
            className="px-4 py-2 rounded"
            style={{ backgroundColor: 'var(--color-primary)' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-primary-dark)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--color-primary)'}
          >
            Add
          </button>
        </div>

        <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
          {categories.map(category => (
            <div key={category} className="glass-dark rounded-lg p-6 w-full max-w-md">
              <span>{category}</span>
              <button
                onClick={() => onRemoveCategory(category)}
                className="text-red-400 hover:text-red-300"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>

        <button onClick={onClose} className="w-full btn-secondary">
          Done
        </button>
      </div>
    </div>
  )
}

// Image Editor Component
function ImageEditor({ image, categories, onSave, onClose }) {
  const [formData, setFormData] = useState({
    url: image?.url || '',
    title: image?.title || '',
    description: image?.description || '',
    category: image?.category || ''
  })

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="glass-dark rounded-lg p-6 w-full max-w-md">
        <h3 className="text-xl font-bold mb-4">
          {image ? 'Edit Image' : 'Add Image'}
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Image</label>
            <ImageUpload
              currentImage={formData.url}
              onImageUploaded={(url) => setFormData(prev => ({ ...prev, url }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 glass-dark border border-gray-600 rounded text-white"
              placeholder="Image title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white h-20 resize-none"
              placeholder="Image description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-3 py-2 glass-dark border border-gray-600 rounded text-white"
            >
              <option value="">No category</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex space-x-4 mt-6">
          <button onClick={() => onSave(formData)} className="flex-1 btn-primary" disabled={!formData.url}>
            Save
          </button>
          <button onClick={onClose} className="flex-1 btn-secondary">
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
