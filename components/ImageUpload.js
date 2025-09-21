'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Upload, X, Image as ImageIcon } from 'lucide-react'

export default function ImageUpload({ currentImage, onImageUploaded }) {
  const [uploading, setUploading] = useState(false)
  const [previewImage, setPreviewImage] = useState(currentImage)

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

      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `images/${fileName}`

      console.log('Uploading file:', filePath)

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        console.error('Upload error:', error)
        throw error
      }

      console.log('Upload successful:', data)

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath)

      console.log('Public URL:', publicUrl)
      
      setPreviewImage(publicUrl)
      if (onImageUploaded) {
        onImageUploaded(publicUrl)
      }
      
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Error uploading image: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  const removeImage = async () => {
    try {
      // If there's a current image, try to delete it from storage
      if (currentImage) {
        const path = currentImage.split('/').pop()
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

  return (
    <div className="space-y-4">
      {/* Current/Preview Image */}
      {previewImage && (
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
      <div className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center hover:border-white/30 transition-colors">
        {uploading ? (
          <div className="space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nightshade-400 mx-auto"></div>
            <p className="text-gray-300 text-sm">Uploading...</p>
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
                PNG, JPG, GIF up to 10MB
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

      {/* Error Message Area */}
      <div className="text-xs text-gray-400">
        <p>💡 If upload fails with "RLS policy" error:</p>
        <ol className="list-decimal list-inside mt-1 space-y-1">
          <li>Go to Supabase Dashboard → Storage</li>
          <li>Create bucket named "images" (if not exists)</li>
          <li>Set bucket to Public</li>
          <li>Go to SQL Editor and run RLS policies</li>
        </ol>
      </div>
    </div>
  )
}
