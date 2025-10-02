'use client'
import { useState } from 'react'
import { X, Plus, Edit, Trash2, Tag, Image as ImageIcon, GripVertical } from 'lucide-react'
import ImageUpload from '@/components/ImageUpload'

export default function GalleryTemplate({ data, isEditable, onUpdate }) {
  const [selectedImage, setSelectedImage] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [isEditingCategories, setIsEditingCategories] = useState(false)
  const [isAddingImage, setIsAddingImage] = useState(false)
  const [editingImageIndex, setEditingImageIndex] = useState(null)
  const [draggedIndex, setDraggedIndex] = useState(null)

  const { gallery_images = [], gallery_categories = [] } = data

  // Filter images by category
  const filteredImages = selectedCategory === 'all' 
    ? gallery_images 
    : gallery_images.filter(img => img.category === selectedCategory)

  const addCategory = (name) => {
    if (!name.trim() || gallery_categories.includes(name)) return
    onUpdate('gallery_categories', [...gallery_categories, name.trim()])
  }

  const removeCategory = (categoryToRemove) => {
    const newCategories = gallery_categories.filter(cat => cat !== categoryToRemove)
    onUpdate('gallery_categories', newCategories)
    
    // Remove category from images and reset filter if needed
    const updatedImages = gallery_images.map(img => ({
      ...img,
      category: img.category === categoryToRemove ? '' : img.category
    }))
    onUpdate('gallery_images', updatedImages)
    
    if (selectedCategory === categoryToRemove) {
      setSelectedCategory('all')
    }
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

  const navigateImage = (direction) => {
    if (!selectedImage) return
    const currentIndex = filteredImages.findIndex(img => img.id === selectedImage.id)
    let newIndex
    
    if (direction === 'next') {
      newIndex = currentIndex + 1 >= filteredImages.length ? 0 : currentIndex + 1
    } else {
      newIndex = currentIndex - 1 < 0 ? filteredImages.length - 1 : currentIndex - 1
    }
    
    setSelectedImage(filteredImages[newIndex])
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8">Gallery</h1>
        
        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedCategory === 'all'
                ? 'bg-nightshade-600 text-white'
                : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
            }`}
          >
            All
          </button>
          {gallery_categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedCategory === category
                  ? 'bg-nightshade-600 text-white'
                  : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
              }`}
            >
              {category}
            </button>
          ))}
          
          {isEditable && (
            <button
              onClick={() => setIsEditingCategories(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center space-x-2"
            >
              <Tag size={16} />
              <span>Manage Categories</span>
            </button>
          )}
        </div>

        {/* Edit Controls */}
        {isEditable && (
          <div className="flex justify-center mb-8">
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

      {/* Image Grid */}
      <div className="px-4 pb-8">
        {filteredImages.length === 0 ? (
          <div className="text-center py-16">
            <ImageIcon size={64} className="mx-auto text-gray-500 mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">
              {selectedCategory === 'all' ? 'No images yet' : `No images in "${selectedCategory}"`}
            </h3>
            {isEditable && (
              <p className="text-gray-500">Add some images to get started</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {gallery_images.map((image, index) => (
              <div
                key={image.id}
                draggable={isEditable}
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={`relative group ${isEditable ? 'cursor-move' : 'cursor-pointer'} ${
                  draggedIndex === index ? 'opacity-50' : ''
                }`}
                onClick={() => !isEditable && setSelectedImage(image)}
              >
                {/* Drag Handle */}
                {isEditable && (
                  <div className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <GripVertical size={20} className="text-white drop-shadow-lg" />
                  </div>
                )}

                <div className="aspect-square bg-gray-800 rounded-lg overflow-hidden">
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
                  
                  {/* Image Overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    {isEditable ? (
                      <div className="flex space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setEditingImageIndex(index)
                          }}
                          className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            removeImage(index)
                          }}
                          className="p-2 bg-red-600 hover:bg-red-700 rounded-lg"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ) : (
                      <span className="text-white text-sm">Click to view</span>
                    )}
                  </div>
                </div>
                
                {/* Image Info */}
                {image.title && (
                  <div className="mt-2">
                    <h3 className="font-semibold truncate">{image.title}</h3>
                    {image.category && (
                      <span className="text-xs text-nightshade-400 bg-nightshade-900/20 px-2 py-1 rounded">
                        {image.category}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
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
            
            {/* Close Button */}
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-0 right-0 md:top-4 md:right-4 p-3 bg-black/50 hover:bg-black/70 rounded-lg transition-colors"
            >
              <X size={24} />
            </button>
            
            {/* Navigation */}
            {filteredImages.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    navigateImage('prev')
                  }}
                  className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 rounded-lg text-2xl transition-colors"
                >
                  ←
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    navigateImage('next')
                  }}
                  className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 rounded-lg text-2xl transition-colors"
                >
                  →
                </button>
              </>
            )}
            
            {/* Image Info */}
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

      {/* Category Editor Modal */}
      {isEditingCategories && (
        <CategoryEditor
          categories={gallery_categories}
          onAddCategory={addCategory}
          onRemoveCategory={removeCategory}
          onClose={() => setIsEditingCategories(false)}
        />
      )}

      {/* Add/Edit Image Modal */}
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

// Category Editor Component
function CategoryEditor({ categories, onAddCategory, onRemoveCategory, onClose }) {
  const [newCategory, setNewCategory] = useState('')

  const handleAdd = () => {
    onAddCategory(newCategory)
    setNewCategory('')
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h3 className="text-xl font-bold mb-4">Manage Categories</h3>
        
        {/* Add New Category */}
        <div className="flex space-x-2 mb-4">
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="Category name"
            className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
            onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
          />
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded"
          >
            Add
          </button>
        </div>

        {/* Category List */}
        <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
          {categories.map(category => (
            <div key={category} className="flex justify-between items-center p-2 bg-gray-700 rounded">
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

        <button
          onClick={onClose}
          className="w-full btn-secondary"
        >
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

  const handleSave = () => {
    onSave(formData)
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h3 className="text-xl font-bold mb-4">
          {image ? 'Edit Image' : 'Add Image'}
        </h3>
        
        <div className="space-y-4">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Image
            </label>
            <ImageUpload
              currentImage={formData.url}
              onImageUploaded={(url) => setFormData(prev => ({ ...prev, url }))}
            />
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
              placeholder="Image title"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white h-20 resize-none"
              placeholder="Image description"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
            >
              <option value="">No category</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex space-x-4 mt-6">
          <button
            onClick={handleSave}
            className="flex-1 btn-primary"
            disabled={!formData.url}
          >
            Save
          </button>
          <button
            onClick={onClose}
            className="flex-1 btn-secondary"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
