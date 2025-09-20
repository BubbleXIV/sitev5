'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Card from '@/components/ui/Card'
import ImageUpload from '@/components/ImageUpload'
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react'

export default function RiddleManager() {
  const [riddles, setRiddles] = useState([])
  const [isEditing, setIsEditing] = useState(false)
  const [currentRiddle, setCurrentRiddle] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRiddles()
  }, [])

  const fetchRiddles = async () => {
    try {
      const { data } = await supabase
        .from('riddle_cards')
        .select('*')
        .order('created_at', { ascending: false })
      
      setRiddles(data || [])
    } catch (error) {
      console.error('Error fetching riddles:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleActive = async (id, isActive) => {
    try {
      const { error } = await supabase
        .from('riddle_cards')
        .update({ is_active: !isActive })
        .eq('id', id)
      
      if (error) throw error
      fetchRiddles()
    } catch (error) {
      console.error('Error toggling riddle:', error)
    }
  }

  const deleteRiddle = async (id) => {
    if (!confirm('Are you sure you want to delete this riddle card?')) return
    
    try {
      const { error } = await supabase
        .from('riddle_cards')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      fetchRiddles()
    } catch (error) {
      console.error('Error deleting riddle:', error)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading riddles...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Riddle Card Management</h2>
        <Button onClick={() => setIsEditing(true)}>
          <Plus size={20} className="mr-2" />
          Create Riddle Card
        </Button>
      </div>

      {isEditing && (
        <RiddleForm
          riddle={currentRiddle}
          onSave={() => {
            fetchRiddles()
            setIsEditing(false)
            setCurrentRiddle(null)
          }}
          onCancel={() => {
            setIsEditing(false)
            setCurrentRiddle(null)
          }}
        />
      )}

      <div className="grid gap-6">
        {riddles.map((riddle) => (
          <Card key={riddle.id} className="p-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-xl font-bold text-white">{riddle.title}</h3>
                  <span className={`px-2 py-1 rounded text-xs ${
                    riddle.is_active ? 'bg-green-600' : 'bg-gray-600'
                  }`}>
                    {riddle.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                
                <p className="text-gray-400 mb-3">/{riddle.slug}</p>
                <p className="text-gray-300 mb-4 italic">"{riddle.intro_text}"</p>
                
                <div className="text-sm text-gray-400">
                  <div>Riddles: {riddle.riddles.length}</div>
                  <div>Password: {riddle.final_password}</div>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="small"
                  onClick={() => toggleActive(riddle.id, riddle.is_active)}
                >
                  {riddle.is_active ? <EyeOff size={16} /> : <Eye size={16} />}
                </Button>
                
                <Button
                  variant="secondary"
                  size="small"
                  onClick={() => {
                    setCurrentRiddle(riddle)
                    setIsEditing(true)
                  }}
                >
                  <Edit size={16} />
                </Button>

                <Button
                  variant="danger"
                  size="small"
                  onClick={() => deleteRiddle(riddle.id)}
                >
                  <Trash2 size={16} />
                </Button>

                {riddle.is_active && (
                  <Button
                    variant="primary"
                    size="small"
                    onClick={() => window.open(`/riddle/${riddle.slug}`, '_blank')}
                  >
                    View
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {riddles.length === 0 && (
        <Card className="text-center py-12">
          <h3 className="text-xl font-semibold text-white mb-2">No Riddle Cards</h3>
          <p className="text-gray-400 mb-6">Create your first interactive riddle card.</p>
          <Button onClick={() => setIsEditing(true)}>
            Create Your First Riddle Card
          </Button>
        </Card>
      )}
    </div>
  )
}

// Riddle Form Component (basic structure - you can expand this)
function RiddleForm({ riddle, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    title: riddle?.title || '',
    slug: riddle?.slug || '',
    intro_text: riddle?.intro_text || '',
    venue_logo: riddle?.venue_logo || '',
    final_password: riddle?.final_password || '',
    riddles: riddle?.riddles || [
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

      if (riddle?.id) {
        await supabase.from('riddle_cards').update(data).eq('id', riddle.id)
      } else {
        await supabase.from('riddle_cards').insert([data])
      }

      onSave()
    } catch (error) {
      console.error('Error saving riddle:', error)
    }
  }

  return (
    <Card className="p-6">
      <h3 className="text-xl font-bold text-white mb-6">
        {riddle ? 'Edit' : 'Create'} Riddle Card
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
            {riddle ? 'Update' : 'Create'} Riddle Card
          </Button>
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  )
}
