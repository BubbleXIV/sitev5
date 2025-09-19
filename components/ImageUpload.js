'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Upload, Link as LinkIcon, X } from 'lucide-react'

export default function ImageUpload({ onImageUploaded, currentImage, bucket = 'images' }) {
  const [uploading, setUploading] = useState(false)
  const [urlInput, setUrlInput] = useState('')
  const [showUrlInput, setShowUrlInput] = useState(false)

  const uploadImage = async (event) => {
    try {
      setUploading(true)
      const file = event.target.files[0]
      if (!file) return

      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `${fileName}`

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath)

      onImageUploaded(data.publicUrl)
    } catch (error) {
      alert('Error uploading image: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onImageUploaded(urlInput.trim())
      setUrlInput('')
      setShowUrlInput(false)
    }
  }

  const removeImage = () => {
    onImageUploaded('')
  }

  return (
    <div className="space-y-4">
      {currentImage && (
        <div className="relative">
          <img src={currentImage} alt="Current" className="w-32 h-32 object-cover rounded-lg" />
          <button
            onClick={removeImage}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div className="flex space-x-2">
        <label className="btn-secondary cursor-pointer flex items-center space-x-2">
          <Upload size={16} />
          <span>{uploading ? 'Uploading...' : 'Upload File'}</span>
          <input
            type="file"
            accept="image/*"
            onChange={uploadImage}
            disabled={uploading}
            className="hidden"
          />
        </label>

        <button
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="btn-secondary flex items-center space-x-2"
        >
          <LinkIcon size={16} />
          <span>Use URL</span>
        </button>
      </div>

      {showUrlInput && (
        <div className="flex space-x-2">
          <input
            type="url"
            placeholder="Enter image URL"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
          />
          <button onClick={handleUrlSubmit} className="btn-primary">
            Add
          </button>
        </div>
      )}
    </div>
  )
}