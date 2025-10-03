'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Trash2, Edit2, Save, X, Search, RefreshCw, AlertCircle } from 'lucide-react'

export default function ImageLibrary() {
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [editNotes, setEditNotes] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [scanning, setScanning] = useState(false)

  useEffect(() => {
    fetchImages()
  }, [])

  const fetchImages = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('image_library')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setImages(data || [])
    } catch (error) {
      console.error('Error fetching images:', error)
      alert('Error loading images: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const startEdit = (image) => {
    setEditingId(image.id)
    setEditNotes(image.notes || '')
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditNotes('')
  }

  const saveNotes = async (imageId) => {
    try {
      const { error } = await supabase
        .from('image_library')
        .update({ 
          notes: editNotes,
          updated_at: new Date().toISOString()
        })
        .eq('id', imageId)

      if (error) throw error

      setImages(images.map(img => 
        img.id === imageId ? { ...img, notes: editNotes } : img
      ))
      setEditingId(null)
      setEditNotes('')
    } catch (error) {
      console.error('Error saving notes:', error)
      alert('Error saving notes: ' + error.message)
    }
  }

  const deleteImage = async (image) => {
    if (!confirm(`Delete "${image.filename}"? This cannot be undone.`)) return

    if (image.used_in && image.used_in.length > 0) {
      if (!confirm(`Warning: This image is used in ${image.used_in.length} location(s):\n${image.used_in.join(', ')}\n\nDelete anyway?`)) {
        return
      }
    }

    try {
      // Extract filename from URL
      const match = image.url.match(/\/images\/([^\/\?]+)/)
      if (match) {
        const filename = match[1]
        
        // Delete from storage
        const { error: storageError } = await supabase.storage
          .from('images')
          .remove([`images/${filename}`])

        if (storageError) throw storageError
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('image_library')
        .delete()
        .eq('id', image.id)

      if (dbError) throw dbError

      setImages(images.filter(img => img.id !== image.id))
    } catch (error) {
      console.error('Error deleting image:', error)
      alert('Error deleting image: ' + error.message)
    }
  }

  const scanForUsage = async () => {
    if (!confirm('Scan all pages and templates for image usage? This may take a moment.')) return

    try {
      setScanning(true)

      // Get all pages
      const { data: pages, error: pagesError } = await supabase
        .from('pages')
        .select('id, slug, title')

      if (pagesError) throw pagesError

      // Get all page content
      const { data: pageContents, error: contentsError } = await supabase
        .from('page_content')
        .select('page_id, content')
      
      if (contentsError) throw contentsError

      // Create a map of image URLs to their usage locations
      const imageUsage = {}

      // Scan through all content
      pageContents.forEach(content => {
        const page = pages.find(p => p.id === content.page_id)
        const pageName = page ? (page.title || page.slug) : 'Unknown'
      
        // Convert content to string for searching
        const contentStr = JSON.stringify(content.content || {})
      
        // Find all image URLs in the content
        images.forEach(image => {
          if (contentStr.includes(image.url)) {
            if (!imageUsage[image.url]) {
              imageUsage[image.url] = []
            }
            if (!imageUsage[image.url].includes(pageName)) {
              imageUsage[image.url].push(pageName)
            }
          }
        })
      })

      // Update each image with its usage
      for (const image of images) {
        const locations = imageUsage[image.url] || []
        
        const { error } = await supabase
          .from('image_library')
          .update({ 
            used_in: locations,
            updated_at: new Date().toISOString()
          })
          .eq('id', image.id)

        if (error) {
          console.error('Error updating image usage:', error)
        }
      }

      // Refresh the list
      await fetchImages()
      alert('Scan complete! Image usage updated.')
    } catch (error) {
      console.error('Error scanning for usage:', error)
      alert('Error scanning: ' + error.message)
    } finally {
      setScanning(false)
    }
  }

  const filteredImages = images.filter(img => 
    (img.filename?.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (img.notes?.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (img.used_in?.some(loc => loc.toLowerCase().includes(searchTerm.toLowerCase())))
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: 'var(--color-primary)' }}></div>
          <p className="text-gray-400">Loading images...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold mb-2">Image Library</h2>
          <p className="text-gray-400 text-sm">
            {images.length} image{images.length !== 1 ? 's' : ''} in storage
          </p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={fetchImages}
            className="btn-secondary text-sm flex items-center gap-2"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
          <button
            onClick={scanForUsage}
            disabled={scanning}
            className="btn-primary text-sm flex items-center gap-2"
          >
            <Search size={16} />
            {scanning ? 'Scanning...' : 'Scan Usage'}
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search by filename, notes, or location..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 glass-dark border border-gray-600 rounded-lg text-white"
        />
      </div>

      {/* Images Grid */}
      {filteredImages.length === 0 ? (
        <div className="text-center py-16 glass-dark rounded-lg">
          <AlertCircle size={48} className="mx-auto text-gray-500 mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">
            {searchTerm ? 'No images found' : 'No images yet'}
          </h3>
          <p className="text-gray-500">
            {searchTerm ? 'Try a different search term' : 'Upload images using the Image Upload component'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredImages.map((image) => (
            <div key={image.id} className="glass-dark rounded-lg p-4 space-y-3">
              {/* Image Preview */}
              <div className="relative aspect-video bg-gray-800 rounded overflow-hidden">
                <img
                  src={image.url}
                  alt={image.filename}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Filename */}
              <div className="text-sm font-mono text-gray-300 truncate" title={image.filename}>
                {image.filename}
              </div>

              {/* Usage Badges */}
              {image.used_in && image.used_in.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {image.used_in.map((location, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-2 py-1 rounded"
                      style={{ 
                        backgroundColor: 'var(--color-primary)',
                        color: 'var(--text-primary)'
                      }}
                      title={location}
                    >
                      {location}
                    </span>
                  ))}
                </div>
              )}

              {/* Notes Section */}
              {editingId === image.id ? (
                <div className="space-y-2">
                  <textarea
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    placeholder="Add notes about this image..."
                    className="w-full px-3 py-2 glass-dark border border-gray-600 rounded text-white text-sm h-20 resize-none"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => saveNotes(image.id)}
                      className="flex-1 px-3 py-1 rounded text-white text-sm flex items-center justify-center gap-1"
                      style={{ backgroundColor: 'var(--color-primary)' }}
                    >
                      <Save size={14} />
                      Save
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="px-3 py-1 bg-gray-600 hover:bg-gray-700 rounded text-white text-sm flex items-center gap-1"
                    >
                      <X size={14} />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {image.notes ? (
                    <p className="text-sm text-gray-300 line-clamp-2">{image.notes}</p>
                  ) : (
                    <p className="text-sm text-gray-500 italic">No notes</p>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(image)}
                      className="flex-1 px-3 py-1 bg-gray-600 hover:bg-gray-700 rounded text-white text-sm flex items-center justify-center gap-1"
                    >
                      <Edit2 size={14} />
                      Edit Notes
                    </button>
                    <button
                      onClick={() => deleteImage(image)}
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-white text-sm flex items-center gap-1"
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </div>
                </div>
              )}

              {/* Metadata */}
              <div className="text-xs text-gray-500 pt-2 border-t border-gray-700">
                Uploaded: {new Date(image.created_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
