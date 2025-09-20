'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Plus, Edit, Trash2, Eye, EyeOff, Move } from 'lucide-react'
import ImageUpload from '@/components/ImageUpload'

export default function ShadecardManager() {
  const [shadecards, setShadecards] = useState([])
  const [isEditing, setIsEditing] = useState(false)
  const [currentShadecard, setCurrentShadecard] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchShadecards()
  }, [])

  const fetchShadecards = async () => {
    try {
      const { data, error } = await supabase
        .from('shadecard_riddles')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      console.log('Fetched shadecards:', data)
      setShadecards(data || [])
    } catch (error) {
      console.error('Error fetching shadecards:', error)
      alert('Error loading shadecards: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (shadecardData) => {
    try {
      console.log('Saving shadecard:', shadecardData)
      
      // Ensure required fields
      if (!shadecardData.title || !shadecardData.slug) {
        alert('Title and slug are required')
        return
      }

      const dataToSave = {
        ...shadecardData,
        is_active: shadecardData.is_active !== undefined ? shadecardData.is_active : true,
        created_at: shadecardData.created_at || new Date().toISOString()
      }

      if (currentShadecard?.id) {
        const { data, error } = await supabase
          .from('shadecard_riddles')
          .update(dataToSave)
          .eq('id', currentShadecard.id)
          .select()

        if (error) throw error
        console.log('Shadecard updated:', data)
      } else {
        const { data, error } = await supabase
          .from('shadecard_riddles')
          .insert([dataToSave])
          .select()

        if (error) throw error
        console.log('Shadecard created:', data)
      }

      await fetchShadecards()
      setIsEditing(false)
      setCurrentShadecard(null)
      alert('Shadecard saved successfully!')
    } catch (error) {
      console.error('Error saving shadecard:', error)
      alert('Error saving shadecard: ' + error.message)
    }
  }

  const toggleActive = async (id, isActive) => {
    try {
      const { error } = await supabase
        .from('shadecard_riddles')
        .update({ is_active: !isActive })
        .eq('id', id)
      
      if (error) throw error
      await fetchShadecards()
    } catch (error) {
      console.error('Error toggling shadecard:', error)
      alert('Error updating shadecard status: ' + error.message)
    }
  }

  const deleteShadecard = async (id) => {
    if (!confirm('Are you sure you want to delete this shadecard?')) return
    
    try {
      const { error } = await supabase
        .from('shadecard_riddles')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      await fetchShadecards()
      alert('Shadecard deleted successfully!')
    } catch (error) {
      console.error('Error deleting shadecard:', error)
      alert('Error deleting shadecard: ' + error.message)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 bg-white/10 rounded-lg w-48 animate-pulse"></div>
          <div className="h-10 bg-white/10 rounded-lg w-40 animate-pulse"></div>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-24 bg-white/10 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Shadecard Management</h2>
          <p className="text-gray-400 text-sm mt-1">
            Create interactive riddle cards for your venue
          </p>
        </div>
        <button
          onClick={() => {
            setCurrentShadecard(null)
            setIsEditing(true)
          }}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Create Shadecard</span>
        </button>
      </div>

      <div className="space-y-4">
        {shadecards.map((shadecard) => (
          <div key={shadecard.id} className="card">
            <div className="flex justify-between items-start">
              <div className="flex-1 space-y-3">
                <div className="flex items-center space-x-3">
                  <h3 className="text-xl font-bold text-nightshade-300">{shadecard.title}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    shadecard.is_active 
                      ? 'bg-green-900/50 text-green-300' 
                      : 'bg-gray-900/50 text-gray-300'
                  }`}>
                    {shadecard.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">URL:</span>
                    <div className="text-purple-400 font-mono">/riddle/{shadecard.slug}</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Riddles:</span>
                    <div className="text-white">{shadecard.riddles?.length || 0} riddles</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Password:</span>
                    <div className="text-green-400 font-mono">{shadecard.final_password}</div>
                  </div>
                </div>
                
                {shadecard.intro_text && (
                  <div className="bg-white/5 rounded p-3 border border-white/10">
                    <p className="text-gray-300 italic text-sm">"{shadecard.intro_text}"</p>
                  </div>
                )}
              </div>

              <div className="flex space-x-2 ml-6">
                <button
                  onClick={() => toggleActive(shadecard.id, shadecard.is_active)}
                  className={`p-2 rounded ${
                    shadecard.is_active 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-gray-600 hover:bg-gray-700'
                  } transition-colors`}
                  title={shadecard.is_active ? 'Hide shadecard' : 'Show shadecard'}
                >
                  {shadecard.is_active ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
                
                <button
                  onClick={() => {
                    setCurrentShadecard(shadecard)
                    setIsEditing(true)
                  }}
                  className="btn-secondary text-sm"
                >
                  <Edit size={16} />
                </button>

                <button
                  onClick={() => deleteShadecard(shadecard.id)}
                  className="px-2 py-2 bg-red-600 hover:bg-red-700 rounded transition-colors"
                >
                  <Trash2 size={16} />
                </button>

                {shadecard.is_active && (
                  <button
                    onClick={() => window.open(`/riddle/${shadecard.slug}`, '_blank')}
                    className="btn-primary text-sm"
                  >
                    View
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {shadecards.length === 0 && (
        <div className="card text-center py-12">
          <h3 className="text-xl font-semibold text-white mb-2">No Shadecards Created</h3>
          <p className="text-gray-400 mb-6">Create your first interactive shadecard to get started.</p>
          <button 
            onClick={() => setIsEditing(true)}
            className="btn-primary"
          >
            Create Your First Shadecard
          </button>
        </div>
      )}

      {/* Shadecard Form Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <ShadecardForm
                shadecard={currentShadecard}
                onSave={handleSave}
                onCancel={() => {
                  setIsEditing(false)
                  setCurrentShadecard(null)
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Shadecard Form Component
function ShadecardForm({ shadecard, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    title: shadecard?.title || '',
    slug: shadecard?.slug || '',
    intro_text: shadecard?.intro_text || '',
    venue_logo: shadecard?.venue_logo || '',
    final_password: shadecard?.final_password || '',
    riddles: shadecard?.riddles || [
      { text: '', rpText: '' },
      { text: '', rpText: '' },
      { text: '', rpText: '' },
      { text: '', rpText: '' }
    ]
  })

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validation
    if (!formData.title.trim()) {
      alert('Title is required')
      return
    }
    
    if (!formData.slug.trim()) {
      alert('Slug is required')
      return
    }
    
    if (!formData.intro_text.trim()) {
      alert('Intro text is required')
      return
    }
    
    if (!formData.final_password.trim()) {
      alert('Final password is required')
      return
    }

    // Validate riddles
    const validRiddles = formData.riddles.filter(riddle => 
      riddle.text.trim() && riddle.rpText.trim()
    )
    
    if (validRiddles.length === 0) {
      alert('At least one complete riddle is required')
      return
    }

    const dataToSave = {
      ...formData,
      riddles: validRiddles,
      final_password: formData.final_password.toUpperCase()
    }
    
    onSave(dataToSave)
  }

  const updateRiddle = (index, field, value) => {
    const newRiddles = [...formData.riddles]
    newRiddles[index] = { ...newRiddles[index], [field]: value }
    setFormData(prev => ({ ...prev, riddles: newRiddles }))
  }

  const addRiddle = () => {
    if (formData.riddles.length >= 10) {
      alert('Maximum 10 riddles allowed')
      return
    }
    setFormData(prev => ({
      ...prev,
      riddles: [...prev.riddles, { text: '', rpText: '' }]
    }))
  }

  const removeRiddle = (index) => {
    if (formData.riddles.length <= 1) {
      alert('At least one riddle is required')
      return
    }
    const newRiddles = formData.riddles.filter((_, i) => i !== index)
    setFormData(prev => ({ ...prev, riddles: newRiddles }))
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-white">
          {shadecard ? 'Edit Shadecard' : 'Create Shadecard'}
        </h3>
        <button
          type="button"
          onClick={onCancel}
          className="text-gray-400 hover:text-white"
        >
          ✕
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                title: e.target.value,
                slug: prev.slug || generateSlug(e.target.value)
              }))}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              URL Slug *
            </label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white font-mono"
              required
            />
            <p className="text-xs text-gray-400 mt-1">Will be accessible at: /riddle/{formData.slug}</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Intro RP Text *
          </label>
          <textarea
            value={formData.intro_text}
            onChange={(e) => setFormData(prev => ({ ...prev, intro_text: e.target.value }))}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white resize-none"
            rows="3"
            placeholder="The atmospheric text that appears when visitors first arrive..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Venue Logo
          </label>
          <ImageUpload
            currentImage={formData.venue_logo}
            onImageUploaded={(url) => setFormData(prev => ({ ...prev, venue_logo: url }))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Final Password *
          </label>
          <input
            type="text"
            value={formData.final_password}
            onChange={(e) => setFormData(prev => ({ ...prev, final_password: e.target.value.toUpperCase() }))}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white font-mono text-center text-xl tracking-widest"
            placeholder="SECRET"
            required
          />
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-lg font-medium text-white">Riddles ({formData.riddles.length}/10)</h4>
            <button
              type="button"
              onClick={addRiddle}
              disabled={formData.riddles.length >= 10}
              className="btn-secondary text-sm"
            >
              <Plus size={16} className="mr-1" />
              Add Riddle
            </button>
          </div>

          <div className="space-y-6">
            {formData.riddles.map((riddle, index) => (
              <div key={index} className="bg-white/5 rounded-lg p-6 border border-white/10 space-y-4">
                <div className="flex justify-between items-center">
                  <h5 className="font-medium text-nightshade-300">Riddle {index + 1}</h5>
                  {formData.riddles.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeRiddle(index)}
                      className="px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-sm"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    RP Text (What the narrator says) *
                  </label>
                  <textarea
                    value={riddle.rpText}
                    onChange={(e) => updateRiddle(index, 'rpText', e.target.value)}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white resize-none"
                    rows="2"
                    placeholder="The shadows whisper of ancient secrets..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Riddle Text (What appears on the card) *
                  </label>
                  <textarea
                    value={riddle.text}
                    onChange={(e) => updateRiddle(index, 'text', e.target.value)}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white resize-none"
                    rows="3"
                    placeholder="I speak without a mouth and hear without ears..."
                    required
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-4 pt-6">
          <button type="button" onClick={onCancel} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn-primary">
            {shadecard ? 'Update' : 'Create'} Shadecard
          </button>
        </div>
      </form>
    </div>
  )
}
