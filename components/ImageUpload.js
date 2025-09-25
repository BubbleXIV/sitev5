'use client'
import { useState, useRef, useCallback, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Upload, X, Image as ImageIcon, ZoomIn, ZoomOut, RotateCcw, Check } from 'lucide-react'

export default function ImageUpload({ currentImage, onImageUploaded, cropAspectRatio = null }) {
  const [uploading, setUploading] = useState(false)
  const [previewImage, setPreviewImage] = useState(currentImage)
  const [showCropEditor, setShowCropEditor] = useState(false)
  const [originalFile, setOriginalFile] = useState(null)
  const [cropSettings, setCropSettings] = useState({
    scale: 1,
    x: 0,
    y: 0
  })
  
  const cropContainerRef = useRef()
  const isDragging = useRef(false)
  const dragStart = useRef({ x: 0, y: 0 })

  // Update preview when currentImage changes
  useEffect(() => {
    setPreviewImage(currentImage)
  }, [currentImage])

  const uploadImage = async (event) => {
    try {
      setUploading(true)
      
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.')
      }

      const file = event.target.files[0]
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Please select a valid image file.')
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('Image size must be less than 10MB.')
      }

      // Store the original file and show crop editor
      setOriginalFile(file)
      setShowCropEditor(true)
      setCropSettings({ scale: 1, x: 0, y: 0 })
      
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Error uploading image: ' + error.message)
    } finally {
      setUploading(false)
      // Reset file input
      event.target.value = ''
    }
  }

  const handleMouseDown = (e) => {
    if (!showCropEditor) return
    isDragging.current = true
    dragStart.current = {
      x: e.clientX - cropSettings.x,
      y: e.clientY - cropSettings.y
    }
    e.preventDefault()
  }

  const handleMouseMove = useCallback((e) => {
    if (!isDragging.current || !showCropEditor) return
    
    const newX = e.clientX - dragStart.current.x
    const newY = e.clientY - dragStart.current.y
    
    setCropSettings(prev => ({
      ...prev,
      x: newX,
      y: newY
    }))
  }, [showCropEditor])

  const handleMouseUp = useCallback(() => {
    isDragging.current = false
  }, [])

  const handleZoom = (direction, e) => {
    e.preventDefault()
    e.stopPropagation()
    setCropSettings(prev => ({
      ...prev,
      scale: Math.max(0.5, Math.min(3, prev.scale + (direction * 0.1)))
    }))
  }

  const resetCrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setCropSettings({ scale: 1, x: 0, y: 0 })
  }

  const saveCroppedImage = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!originalFile) return

    try {
      setUploading(true)

      // Create canvas for cropping
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()

      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
        img.src = URL.createObjectURL(originalFile)
      })

      // Set canvas size based on target use case
      // Staff images: 600x384 (matches w-full h-48 aspect ratio at common widths)
      // Menu images: 600x256 (matches w-full h-32 aspect ratio)
      // Alt images: 200x200 (for w-10 h-10 circular, but larger for quality)
      let canvasWidth, canvasHeight
      
      if (cropAspectRatio === 1) {
        // Square for alt characters
        canvasWidth = canvasHeight = 200
      } else if (cropAspectRatio === (32/48)) {
        // Menu aspect ratio (h-32 relative to h-48)
        canvasWidth = 600
        canvasHeight = 400
      } else {
        // Default staff aspect ratio
        canvasWidth = 600
        canvasHeight = 400
      }
      
      canvas.width = canvasWidth
      canvas.height = canvasHeight

      // Get container dimensions
      const container = cropContainerRef.current.getBoundingClientRect()
      const containerCenterX = container.width / 2
      const containerCenterY = container.height / 2

      // Calculate how the image naturally fits in the container (before user scaling/positioning)
      const containerAspect = container.width / container.height
      const imageAspect = img.naturalWidth / img.naturalHeight
      
      let naturalDisplayWidth, naturalDisplayHeight, imageOffsetX = 0, imageOffsetY = 0
      
      if (imageAspect > containerAspect) {
        // Image is wider than container - fits to height
        naturalDisplayHeight = container.height
        naturalDisplayWidth = naturalDisplayHeight * imageAspect
        imageOffsetX = (container.width - naturalDisplayWidth) / 2
      } else {
        // Image is taller than container - fits to width  
        naturalDisplayWidth = container.width
        naturalDisplayHeight = naturalDisplayWidth / imageAspect
        imageOffsetY = (container.height - naturalDisplayHeight) / 2
      }

      // Apply user's scale to get actual display size
      const scaledDisplayWidth = naturalDisplayWidth * cropSettings.scale
      const scaledDisplayHeight = naturalDisplayHeight * cropSettings.scale

      // Calculate the image's top-left corner position after user positioning
      const imageTopLeftX = containerCenterX + cropSettings.x + imageOffsetX - scaledDisplayWidth / 2
      const imageTopLeftY = containerCenterY + cropSettings.y + imageOffsetY - scaledDisplayHeight / 2

      // Convert container center (crop center) to image coordinates
      const cropCenterOnImageX = (containerCenterX - imageTopLeftX) / scaledDisplayWidth * img.naturalWidth
      const cropCenterOnImageY = (containerCenterY - imageTopLeftY) / scaledDisplayHeight * img.naturalHeight

      // Calculate crop dimensions on source image
      const sourceWidth = (canvasWidth / scaledDisplayWidth) * img.naturalWidth
      const sourceHeight = (canvasHeight / scaledDisplayHeight) * img.naturalHeight

      // Calculate source rectangle (centered on crop point)
      const sourceX = Math.max(0, Math.min(img.naturalWidth - sourceWidth, cropCenterOnImageX - sourceWidth / 2))
      const sourceY = Math.max(0, Math.min(img.naturalHeight - sourceHeight, cropCenterOnImageY - sourceHeight / 2))

      // Draw the cropped image
      ctx.drawImage(
        img,
        sourceX, sourceY, Math.min(sourceWidth, img.naturalWidth - sourceX), Math.min(sourceHeight, img.naturalHeight - sourceY),
        0, 0, canvasWidth, canvasHeight
      )

      // Convert to blob and upload
      const blob = await new Promise(resolve => {
        canvas.toBlob(resolve, 'image/jpeg', 0.9)
      })

      const fileExt = originalFile.name.split('.').pop() || 'jpg'
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `images/${fileName}`

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('images')
        .upload(filePath, blob, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) throw error

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath)

      setPreviewImage(publicUrl)
      if (onImageUploaded) {
        onImageUploaded(publicUrl)
      }

      // Cleanup
      URL.revokeObjectURL(img.src)
      setOriginalFile(null)
      setShowCropEditor(false)
      
    } catch (error) {
      console.error('Error saving cropped image:', error)
      alert('Error saving cropped image: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  const cancelCrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setOriginalFile(null)
    setShowCropEditor(false)
  }

  const removeImage = async () => {
    try {
      // Clear preview first for immediate UI feedback
      const oldPreview = previewImage
      setPreviewImage('')
      
      // Notify parent immediately
      if (onImageUploaded) {
        onImageUploaded('')
      }

      // Try to delete from storage in background
      const imageToDelete = oldPreview || currentImage
      if (imageToDelete && (imageToDelete.includes('supabase') || imageToDelete.includes('/images/'))) {
        // Extract just the filename part after /images/
        const match = imageToDelete.match(/\/images\/([^\/\?]+)/);
        if (match) {
          const filename = match[1]
          await supabase.storage
            .from('images')
            .remove([`images/${filename}`])
        }
      }
    } catch (error) {
      console.error('Error removing from storage:', error)
      // Don't show error to user since preview is already cleared
    }
  }

  // Add event listeners for mouse events when cropping
  useEffect(() => {
    if (showCropEditor && typeof window !== 'undefined') {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      
      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [showCropEditor, handleMouseMove, handleMouseUp])

  // Get preview box size based on crop type
  const getPreviewBoxSize = () => {
    if (cropAspectRatio === 1) {
      return { width: 100, height: 100 } // Square for alt characters
    } else if (cropAspectRatio === (32/48)) {
      return { width: 160, height: 107 } // Menu ratio (roughly 3:2)
    } else {
      return { width: 150, height: 100 } // Default staff ratio (3:2)
    }
  }

  const previewBoxSize = getPreviewBoxSize()

  return (
    <div className="space-y-4">
      {/* Crop Editor Modal */}
      {showCropEditor && originalFile && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg p-6 max-w-2xl w-full">
            <h3 className="text-xl font-bold text-white mb-4">Crop Image</h3>
            
            {/* Crop Container */}
            <div 
              ref={cropContainerRef}
              className="relative w-full h-80 bg-gray-800 rounded-lg overflow-hidden cursor-move border-2 border-white/20 mb-4"
              onMouseDown={handleMouseDown}
              style={{ touchAction: 'none' }}
            >
              <img
                src={URL.createObjectURL(originalFile)}
                alt="Crop preview"
                className="absolute select-none pointer-events-none object-contain w-full h-full"
                style={{
                  transform: `translate(${cropSettings.x}px, ${cropSettings.y}px) scale(${cropSettings.scale})`,
                  transformOrigin: 'center center'
                }}
                draggable={false}
              />
              
              {/* Crop preview box */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div 
                  className="border-2 border-nightshade-400 bg-nightshade-400/10 relative"
                  style={{
                    width: `${previewBoxSize.width}px`,
                    height: `${previewBoxSize.height}px`
                  }}
                >
                  {/* Corner markers */}
                  <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-nightshade-400"></div>
                  <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-nightshade-400"></div>
                  <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-nightshade-400"></div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-nightshade-400"></div>
                  
                  {/* Center crosshair */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-4 h-0.5 bg-nightshade-400 absolute"></div>
                    <div className="h-4 w-0.5 bg-nightshade-400 absolute"></div>
                    <div className="w-1 h-1 bg-nightshade-400 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Crop Controls */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div className="flex items-center space-x-2">
                <button
                  onClick={(e) => handleZoom(-1, e)}
                  className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition-colors"
                  title="Zoom Out"
                  type="button"
                >
                  <ZoomOut size={16} />
                </button>
                <span className="text-white text-sm min-w-[60px] text-center">
                  {Math.round(cropSettings.scale * 100)}%
                </span>
                <button
                  onClick={(e) => handleZoom(1, e)}
                  className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition-colors"
                  title="Zoom In"
                  type="button"
                >
                  <ZoomIn size={16} />
                </button>
                <button
                  onClick={resetCrop}
                  className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition-colors"
                  title="Reset"
                  type="button"
                >
                  <RotateCcw size={16} />
                </button>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={cancelCrop}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                  type="button"
                >
                  Cancel
                </button>
                <button
                  onClick={saveCroppedImage}
                  disabled={uploading}
                  className="px-4 py-2 bg-nightshade-600 hover:bg-nightshade-700 disabled:opacity-50 text-white rounded-lg transition-colors flex items-center space-x-2"
                  type="button"
                >
                  <Check size={16} />
                  <span>{uploading ? 'Saving...' : 'Save'}</span>
                </button>
              </div>
            </div>

            <p className="text-gray-400 text-sm">
              💡 Drag image to reposition • Zoom to scale • Box shows exact crop area • Corner markers show boundaries
            </p>
          </div>
        </div>
      )}

      {/* Current/Preview Image */}
      {previewImage && !showCropEditor && (
        <div className="relative">
          <img
            src={previewImage}
            alt="Preview"
            className="w-full max-w-sm h-48 object-cover rounded-lg border border-white/20"
          />
          <button
            onClick={removeImage}
            className="absolute top-2 right-2 p-1 bg-red-600 hover:bg-red-700 rounded-full text-white transition-colors"
            title="Remove image"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Upload Area */}
      {!showCropEditor && (
        <div className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center hover:border-white/30 transition-colors">
          {uploading ? (
            <div className="space-y-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nightshade-400 mx-auto"></div>
              <p className="text-gray-300 text-sm">Processing...</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-center">
                <ImageIcon size={48} className="text-gray-400" />
              </div>
              <div>
                <p className="text-gray-300 mb-2">
                  {previewImage ? 'Replace image' : 'Upload an image'}
                </p>
                <p className="text-gray-500 text-xs">
                  PNG, JPG, GIF up to 10MB • Crop after upload
                </p>
              </div>
              <label className="btn-secondary inline-flex items-center cursor-pointer">
                <Upload size={16} className="mr-2" />
                Choose File
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={uploadImage}
                  disabled={uploading}
                />
              </label>
            </div>
          )}
        </div>
      )}

      {/* Error Message Area */}
      {!showCropEditor && (
        <div className="text-xs text-gray-400">
          <p>💡 If upload fails with "RLS policy" error:</p>
          <ol className="list-decimal list-inside mt-1 space-y-1">
            <li>Go to Supabase Dashboard → Storage</li>
            <li>Create bucket named "images" (if not exists)</li>
            <li>Set bucket to Public</li>
            <li>Go to SQL Editor and run RLS policies</li>
          </ol>
        </div>
      )}
    </div>
  )
}
