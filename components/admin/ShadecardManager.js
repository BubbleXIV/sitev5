'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Card from '@/components/ui/Card'
import ImageUpload from '@/components/ImageUpload'
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react'

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
      const { data } = await supabase
        .from('shadecard_riddles')
        .select('*')
        .order('created_at', { ascending: false })
      
      setShadecards(data || [])
    } catch (error) {
      console.error('Error fetching shadecards:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleActive = async (id, isActive) => {
    try {
      const { error } = await supabase
        .from('shadecard_riddles')
        .update({ is_active: !isActive })
        .eq('id', id)
      
      if (error) throw error
      fetchShadecards()
    } catch (error) {
      console.error('Error toggling shadecard:', error)
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
      fetchShadecards()
    } catch (error) {
      console.error('Error deleting shadecard:', error)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading shadecards...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Shadecard Management</h2>
        <Button onClick={() => setIsEditing(true)}>
          <Plus size={20} className="mr-2" />
          Create Shadecard
        </Button>
      </div>

      {isEditing && (
        <ShadecardForm
          shadecard={currentShadecard}
          onSave={() => {
            fetchShadecards()
            setIsEditing(false)
            setCurrentShadecard(null)
          }}
          onCancel={() => {
            setIsEditing(false)
            setCurrentShadecard(null)
          }}
        />
      )}

      <div className="grid gap-6">
        {shadecards.map((shadecard) => (
          <Card key={shadecard.id} className="p-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-xl font-bold text-white">{shadecard.title}</h3>
                  <span className={`px-2 py-1 rounded text-xs ${
                    shadecard.is_active ? 'bg-green-600' : 'bg-gray-600'
                  }`}>
                    {shadecard.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                
                <p className="text-gray-400 mb-3">/{shadecard.slug}</p>
                <p className="text-gray-300 mb-4 italic">"{shadecard.intro_text}"</p>
                
                <div className="text-sm text-gray-400">
                  <div>Riddles: {shadecard.riddles.length}</div>
                  <div>Password: {shadecard.final_password}</div>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="small"
                  onClick={() => toggleActive(shadecard.id, shadecard.is_active)}
                >
                  {shadecard.is_active ? <EyeOff size={16} /> : <Eye size={16} />}
                </Button>
                
                <Button
                  variant="secondary"
                  size="small"
                  onClick={() => {
                    setCurrentShadecard(shadecard)
                    setIsEditing(true)
                  }}
                >
                  <Edit size={16} />
                </Button>

                <Button
                  variant="danger"
                  size="small"
                  onClick={() => deleteShadecard(shadecard.id)}
                >
                  <Trash2 size={16} />
                </Button>

                {shadecard.is_active && (
                  <Button
                    variant="primary"
                    size="small"
                    onClick={() => window.open(`/shadecard/${shadecard.slug}`, '_blank')}
                  >
                    View
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {shadecards.length === 0 && (
        <Card className="text-center py-12">
          <h3 className="text-xl font-semibold text-white mb-2">No Shadecards</h3>
          <p className="text-gray-400 mb-6">Create your first interactive shadecard.</p>
          <Button onClick={() => setIsEditing(true)}>
            Create Your First Shadecard
          </Button>
        </Card>
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const data = {
        ...formData,
        is_active: false // Always create as inactive
      }

      if (shadecard?.id) {
        await supabase.from('shadecard_riddles').update(data).eq('id', shadecard.id)
      } else {
        await supabase.from('shadecard_riddles').insert([data])
      }

      onSave()
    } catch (error) {
      console.error('Error saving shadecard:', error)
    }
  }

  return (
    <Card className="p-6">
      <h3 className="text-xl font-bold text-white mb-6">
        {shadecard ? 'Edit' : 'Create'} Shadecard
      </h3>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              title: e.target.value,
              slug: prev.slug || e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-')
            }))}
            required
          />
          
          <Input
            label="URL Slug"
            value={formData.slug}
            onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Intro RP Text
          </label>
          <textarea
            value={formData.intro_text}
            onChange={(e) => setFormData(prev => ({ ...prev, intro_text: e.target.value }))}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white resize-none"
            rows="3"
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

        <Input
          label="Final Password"
          value={formData.final_password}
          onChange={(e) => setFormData(prev => ({ ...prev, final_password: e.target.value.toUpperCase() }))}
          required
        />

        {/* Riddle inputs would go here - simplified for brevity */}
        
        <div className="flex space-x-4">
          <Button type="submit">
            {shadecard ? 'Update' : 'Create'} Shadecard
          </Button>
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  )
}
