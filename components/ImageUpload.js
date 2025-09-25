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

      // Set output dimensions
      const outputWidth = cropAspectRatio === 1 ? 400 : 600
      const outputHeight = cropAspectRatio === 1 ? 400 : 400
      
      canvas.width = outputWidth
      canvas.height = outputHeight

      // Get container dimensions
      const containerRect = cropContainerRef.current.getBoundingClientRect()
      const containerWidth = containerRect.width
      const containerHeight = containerRect.height

      // Calculate how the image fits in the container
      const imgAspect = img.naturalWidth / img.naturalHeight
      const containerAspect = containerWidth / containerHeight

      let displayWidth, displayHeight
      if (imgAspect > containerAspect) {
        displayHeight = containerHeight
        displayWidth = containerHeight * imgAspect
      } else {
        displayWidth = containerWidth
        displayHeight = containerWidth / imgAspect
      }

      // Apply user's scale
      displayWidth *= cropSettings.scale
      displayHeight *= cropSettings.scale

      // Calculate the center offset for the displayed image
      const imgCenterX = containerWidth / 2
      const imgCenterY = containerHeight / 2

      // Calculate source coordinates on the original image
      const scaleFactorX = img.naturalWidth / displayWidth
      const scaleFactorY = img.naturalHeight / displayHeight

      // Calculate what part of the source image should be cropped
      const cropCenterX = imgCenterX - cropSettings.x
      const cropCenterY = imgCenterY - cropSettings.y

      const sourceCenterX = cropCenterX * scaleFactorX
      const sourceCenterY = cropCenterY * scaleFactorY

      const sourceX = Math.max(0, sourceCenterX - (outputWidth * scaleFactorX) / 2)
      const sourceY = Math.max(0, sourceCenterY - (outputHeight * scaleFactorY) / 2)
      const sourceWidth = Math.min(img.naturalWidth - sourceX, outputWidth * scaleFactorX)
      const sourceHeight = Math.min(img.naturalHeight - sourceY, outputHeight * scaleFactorY)

      // Draw the cropped portion
      ctx.drawImage(
        img,
        sourceX, sourceY, sourceWidth, sourceHeight,
        0, 0, outputWidth, outputHeight
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
      // Try to delete from storage if there's an image
      const imageToDelete = previewImage || currentImage
      if (imageToDelete && imageToDelete.includes('/storage/v1/object/public/')) {
        const path = imageToDelete.split('/images/').pop()
        if (path) {
          await supabase.storage
            .from('images')
            .remove([`images/${path}`])
        }
      }
      
      setPreviewImage('')
      if (onImageUploaded) {
        onImageUploaded('')
      }
    } catch (error) {
      console.error('Error removing image:', error)
      // Still clear the preview even if deletion failed
      setPreviewImage('')
      if (onImageUploaded) {
        onImageUploaded('')
      }
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
              className="relative w-full h-64 bg-gray-800 rounded-lg overflow-hidden cursor-move border-2 border-white/20 mb-4"
              onMouseDown={handleMouseDown}
              style={{ touchAction: 'none' }}
            >
              <img
                src={URL.createObjectURL(originalFile)}
                alt="Crop preview"
                className="absolute select-none pointer-events-none"
                style={{
                  width: 'auto',
                  height: '100%',
                  maxWidth: 'none',
                  transform: `translate(${cropSettings.x}px, ${cropSettings.y}px) scale(${cropSettings.scale})`,
                  transformOrigin: 'center center'
                }}
                draggable={false}
              />
              
              {/* Center Indicator */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                {cropAspectRatio === 1 ? (
                  /* Circle for square crops */
                  <div className="w-8 h-8 border-2 border-nightshade-400 rounded-full bg-nightshade-400/20 flex items-center justify-center">
                    <div className="w-1 h-1 bg-nightshade-400 rounded-full"></div>
                  </div>
                ) : (
                  /* Crosshair for rectangular crops */
                  <div className="relative">
                    <div className="w-6 h-0.5 bg-nightshade-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
                    <div className="h-6 w-0.5 bg-nightshade-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
                    <div className="w-2 h-2 border border-nightshade-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-nightshade-400/20"></div>
                  </div>
                )}
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
              💡 Drag the image to reposition • Use zoom controls to scale • Center indicator shows crop focus point
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
