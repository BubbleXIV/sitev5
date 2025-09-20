'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Plus, Edit, Trash2, User, ChevronDown, ChevronUp } from 'lucide-react'
import ImageUpload from '@/components/ImageUpload'

export default function StaffManager() {
  const [staff, setStaff] = useState([])
  const [isEditing, setIsEditing] = useState(false)
  const [currentStaff, setCurrentStaff] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [expandedStaff, setExpandedStaff] = useState({})

  useEffect(() => {
    fetchStaff()
  }, [])

  const fetchStaff = async () => {
    try {
      const { data, error } = await supabase
        .from('staff')
        .select(`
          *,
          staff_alts (*)
        `)
        .order('sort_order')

      if (error) throw error
      console.log('Fetched staff data:', data)
      setStaff(data || [])
    } catch (error) {
      console.error('Error fetching staff:', error)
      alert('Error loading staff data: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (staffData, altsData = []) => {
    setSaving(true)
    try {
      console.log('Saving staff:', staffData)
      console.log('Saving alts:', altsData)
      
      let staffId = currentStaff?.id

      if (staffId) {
        // Update existing staff
        const { data, error } = await supabase
          .from('staff')
          .update(staffData)
          .eq('id', staffId)
          .select()

        if (error) throw error
        console.log('Staff updated:', data)

        // Delete existing alts first
        const { error: deleteError } = await supabase
          .from('staff_alts')
          .delete()
          .eq('staff_id', staffId)

        if (deleteError) {
          console.error('Error deleting old alts:', deleteError)
          // Continue anyway, might be no existing alts
        }
      } else {
        // Create new staff
        const { data, error } = await supabase
          .from('staff')
          .insert([staffData])
          .select()
          .single()

        if (error) throw error
        console.log('Staff created:', data)
        staffId = data.id
      }

      // Insert alts if any
      if (altsData.length > 0) {
        const altsToInsert = altsData.map((alt, index) => ({
          ...alt,
          staff_id: staffId,
          sort_order: index
        }))

        const { data: altData, error: altsError } = await supabase
          .from('staff_alts')
          .insert(altsToInsert)
          .select()

        if (altsError) throw altsError
        console.log('Alts inserted:', altData)
      }

      await fetchStaff()
      setIsEditing(false)
      setCurrentStaff(null)
      alert('Staff member saved successfully!')
    } catch (error) {
      console.error('Error saving staff:', error)
      alert('Error saving staff member: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this staff member? This will also delete all their alt characters.')) return

    try {
      const { error } = await supabase
        .from('staff')
        .delete()
        .eq('id', id)

      if (error) throw error
      await fetchStaff()
      alert('Staff member deleted successfully!')
    } catch (error) {
      console.error('Error deleting staff:', error)
      alert('Error deleting staff member: ' + error.message)
    }
  }

  const toggleExpanded = (staffId) => {
    setExpandedStaff(prev => ({
      ...prev,
      [staffId]: !prev[staffId]
    }))
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 bg-white/10 rounded-lg w-48 animate-pulse"></div>
          <div className="h-10 bg-white/10 rounded-lg w-40 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="w-full h-48 bg-white/10 rounded-lg mb-4"></div>
              <div className="h-6 bg-white/10 rounded mb-2"></div>
              <div className="h-4 bg-white/10 rounded mb-4 w-2/3"></div>
              <div className="h-16 bg-white/10 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Staff Management</h2>
        <button
          onClick={() => {
            setCurrentStaff(null)
            setIsEditing(true)
          }}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Add Staff Member</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {staff.map((member) => (
          <div key={member.id} className="card relative">
            {member.image_url ? (
              <img
                src={member.image_url}
                alt={member.name}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
            ) : (
              <div className="w-full h-48 bg-gradient-to-br from-nightshade-800 to-gray-800 rounded-lg mb-4 flex items-center justify-center">
                <User size={48} className="text-gray-400" />
              </div>
            )}

            {member.special_role && (
              <div className="absolute top-2 left-2 px-3 py-1 bg-gradient-to-r from-nightshade-600 to-purple-600 rounded-full text-xs font-semibold text-white">
                {member.special_role}
              </div>
            )}

            <div className="space-y-3">
              <div>
                <h3 className="font-bold text-lg text-nightshade-300">{member.name}</h3>
                <p className="text-purple-400 font-medium">{member.role}</p>
              </div>

              {member.bio && (
                <p className="text-gray-300 text-sm leading-relaxed line-clamp-3">
                  {member.bio}
                </p>
              )}

              {member.show_alts && member.staff_alts && member.staff_alts.length > 0 && (
                <div className="pt-2 border-t border-white/10">
                  <button
                    onClick={() => toggleExpanded(member.id)}
                    className="flex items-center justify-between w-full text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    <span>{member.staff_alts.length} alt character{member.staff_alts.length !== 1 ? 's' : ''}</span>
                    {expandedStaff[member.id] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>

                  {expandedStaff[member.id] && (
                    <div className="mt-3 space-y-2">
                      {member.staff_alts
                        .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
                        .map((alt, index) => (
                        <div key={alt.id || index} className="p-3 bg-white/5 rounded-lg border border-white/10">
                          <div className="flex items-center space-x-3">
                            {alt.image_url ? (
                              <img
                                src={alt.image_url}
                                alt={alt.name}
                                className="w-10 h-10 object-cover rounded-full"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                                <User size={16} className="text-gray-400" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-white text-sm">{alt.name}</div>
                              <div className="text-purple-400 text-xs">{alt.role}</div>
                            </div>
                          </div>
                          {alt.bio && (
                            <p className="mt-2 text-gray-300 text-xs leading-relaxed">
                              {alt.bio}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="flex space-x-2 pt-3">
                <button
                  onClick={() => {
                    setCurrentStaff(member)
                    setIsEditing(true)
                  }}
                  className="flex-1 btn-secondary text-sm"
                >
                  <Edit size={16} className="mr-1" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(member.id)}
                  className="px-3 py-2 bg-red-600 hover:bg-red-700 rounded text-sm"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {staff.length === 0 && (
        <div className="card text-center py-12">
          <User size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Staff Members</h3>
          <p className="text-gray-400 mb-6">Get started by adding your first staff member.</p>
          <button 
            onClick={() => setIsEditing(true)}
            className="btn-primary"
          >
            Add Your First Staff Member
          </button>
        </div>
      )}

      {/* Staff Form Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <StaffForm
                staff={currentStaff}
                onSave={handleSave}
                onCancel={() => {
                  setIsEditing(false)
                  setCurrentStaff(null)
                }}
                saving={saving}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Staff Form Component
function StaffForm({ staff, onSave, onCancel, saving }) {
  const [formData, setFormData] = useState({
    name: staff?.name || '',
    role: staff?.role || '',
    bio: staff?.bio || '',
    image_url: staff?.image_url || '',
    special_role: staff?.special_role || '',
    sort_order: staff?.sort_order || 0,
    show_alts: staff?.show_alts || false,
  })

  const [alts, setAlts] = useState(staff?.staff_alts || [])
  const [errors, setErrors] = useState({})

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Basic validation
    if (!formData.name.trim()) {
      alert('Staff name is required')
      return
    }
    
    if (!formData.role.trim()) {
      alert('Staff role is required')
      return
    }

    // Validate alts if show_alts is enabled
    if (formData.show_alts) {
      const validAlts = alts.filter(alt => alt.name.trim() && alt.role.trim())
      if (alts.length !== validAlts.length) {
        alert('All alt characters must have a name and role')
        return
      }
      onSave(formData, validAlts)
    } else {
      onSave(formData, [])
    }
  }

  const addAlt = () => {
    if (alts.length >= 5) {
      alert('Maximum 5 alternate characters allowed')
      return
    }
    setAlts([...alts, { name: '', role: '', bio: '', image_url: '' }])
  }

  const updateAlt = (index, field, value) => {
    const newAlts = [...alts]
    newAlts[index] = { ...newAlts[index], [field]: value }
    setAlts(newAlts)
  }

  const removeAlt = (index) => {
    setAlts(alts.filter((_, i) => i !== index))
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-white">
          {staff ? 'Edit Staff Member' : 'Add Staff Member'}
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
              Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-nightshade-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Role *
            </label>
            <input
              type="text"
              value={formData.role}
              onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-nightshade-500"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Bio</label>
          <textarea
            value={formData.bio}
            onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
            rows={3}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-nightshade-500 resize-none"
            placeholder="Tell us about this staff member..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Profile Image</label>
          <ImageUpload
            currentImage={formData.image_url}
            onImageUploaded={(url) => setFormData(prev => ({ ...prev, image_url: url }))}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Special Role (Optional)
            </label>
            <input
              type="text"
              value={formData.special_role}
              onChange={(e) => setFormData(prev => ({ ...prev, special_role: e.target.value }))}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-nightshade-500"
              placeholder="e.g., Key Keeper, Manager"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Sort Order
            </label>
            <input
              type="number"
              value={formData.sort_order}
              onChange={(e) => setFormData(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-nightshade-500"
              min="0"
            />
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="show_alts"
            checked={formData.show_alts}
            onChange={(e) => setFormData(prev => ({ ...prev, show_alts: e.target.checked }))}
            className="rounded border-white/20 bg-white/10 text-nightshade-500 focus:ring-nightshade-500"
          />
          <label htmlFor="show_alts" className="text-gray-300">
            Enable alternate characters
          </label>
        </div>

        {formData.show_alts && (
          <div className="card bg-white/5">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-medium text-white">Alternate Characters</h4>
              <button
                type="button"
                onClick={addAlt}
                disabled={alts.length >= 5}
                className="btn-secondary text-sm"
              >
                Add Alt ({alts.length}/5)
              </button>
            </div>

            <div className="space-y-4">
              {alts.map((alt, index) => (
                <div key={index} className="p-4 border border-white/20 rounded-lg space-y-4">
                  <div className="flex justify-between items-center">
                    <h5 className="font-medium text-nightshade-300">Alt Character {index + 1}</h5>
                    <button
                      type="button"
                      onClick={() => removeAlt(index)}
                      className="px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-sm"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Alt Name *
                      </label>
                      <input
                        type="text"
                        value={alt.name}
                        onChange={(e) => updateAlt(index, 'name', e.target.value)}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Alt Role *
                      </label>
                      <input
                        type="text"
                        value={alt.role}
                        onChange={(e) => updateAlt(index, 'role', e.target.value)}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Alt Bio</label>
                    <textarea
                      value={alt.bio}
                      onChange={(e) => updateAlt(index, 'bio', e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-gray-400 resize-none"
                      placeholder="Alt character bio..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Alt Image</label>
                    <ImageUpload
                      currentImage={alt.image_url}
                      onImageUploaded={(url) => updateAlt(index, 'image_url', url)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-4 pt-6">
          <button type="button" onClick={onCancel} className="btn-secondary">
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={saving}
            className="btn-primary disabled:opacity-50"
          >
            {saving ? 'Saving...' : (staff ? 'Update' : 'Create') + ' Staff Member'}
          </button>
        </div>
      </form>
    </div>
