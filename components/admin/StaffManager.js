'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Plus, Edit, Trash2, User, ChevronDown, ChevronUp, Tag } from 'lucide-react'
import ImageUpload from '@/components/ImageUpload'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Card from '@/components/ui/Card'
import Modal from '@/components/ui/Modal'
import { validateStaffForm } from '@/lib/validations'

export default function StaffManager() {
  const [staff, setStaff] = useState([])
  const [categories, setCategories] = useState([])
  const [isEditing, setIsEditing] = useState(false)
  const [currentStaff, setCurrentStaff] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [expandedStaff, setExpandedStaff] = useState({})
  const [isEditingCategories, setIsEditingCategories] = useState(false)

  useEffect(() => {
    fetchStaff()
    fetchCategories()
  }, [])

  const fetchStaff = async () => {
    try {
      const { data } = await supabase
        .from('staff')
        .select(`
          *,
          staff_alts (*),
          staff_categories (*)
        `)
        .order('sort_order')

      setStaff(data || [])
    } catch (error) {
      console.error('Error fetching staff:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const { data } = await supabase
        .from('staff_categories')
        .select('*')
        .order('sort_order')

      setCategories(data || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const handleSave = async (staffData, altsData = []) => {
    setSaving(true)
    try {
      let staffId = currentStaff?.id

      if (staffId) {
        // Update existing staff
        const { error } = await supabase
          .from('staff')
          .update(staffData)
          .eq('id', staffId)

        if (error) throw error

        // Delete existing alts
        await supabase
          .from('staff_alts')
          .delete()
          .eq('staff_id', staffId)
      } else {
        // Create new staff
        const { data, error } = await supabase
          .from('staff')
          .insert([staffData])
          .select()
          .single()

        if (error) throw error
        staffId = data.id
      }

      // Insert alts if any
      if (altsData.length > 0) {
        const altsToInsert = altsData.map((alt, index) => ({
          ...alt,
          staff_id: staffId,
          sort_order: index
        }))

        const { error: altsError } = await supabase
          .from('staff_alts')
          .insert(altsToInsert)

        if (altsError) throw altsError
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

  const handleSaveCategory = async (categoryData) => {
    try {
      if (categoryData.id) {
        // Update existing category
        const { error } = await supabase
          .from('staff_categories')
          .update(categoryData)
          .eq('id', categoryData.id)
        if (error) throw error
      } else {
        // Create new category
        const { error } = await supabase
          .from('staff_categories')
          .insert([categoryData])
        if (error) throw error
      }
      await fetchCategories()
      alert('Category saved successfully!')
    } catch (error) {
      console.error('Error saving category:', error)
      alert('Error saving category: ' + error.message)
    }
  }

  const handleDeleteCategory = async (id) => {
    if (!confirm('Are you sure you want to delete this category? Staff in this category will be moved to uncategorized.')) return

    try {
      const { error } = await supabase
        .from('staff_categories')
        .delete()
        .eq('id', id)

      if (error) throw error
      await fetchCategories()
      await fetchStaff() // Refresh staff to update category references
      alert('Category deleted successfully!')
    } catch (error) {
      console.error('Error deleting category:', error)
      alert('Error deleting category: ' + error.message)
    }
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
            <Card key={i} className="animate-pulse">
              <div className="w-full h-48 bg-white/10 rounded-lg mb-4"></div>
              <div className="h-6 bg-white/10 rounded mb-2"></div>
              <div className="h-4 bg-white/10 rounded mb-4 w-2/3"></div>
              <div className="h-16 bg-white/10 rounded"></div>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Staff Management</h2>
        <div className="flex space-x-2">
          <Button
            onClick={() => setIsEditingCategories(true)}
            variant="secondary"
            className="flex items-center space-x-2"
          >
            <Tag size={20} />
            <span>Manage Categories</span>
          </Button>
          <Button
            onClick={() => {
              setCurrentStaff(null)
              setIsEditing(true)
            }}
            className="flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>Add Staff Member</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {staff.map((member) => (
          <Card key={member.id} hover className="relative">
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
                {member.staff_categories && (
                  <p className="text-gray-400 text-xs">Category: {member.staff_categories.name}</p>
                )}
              </div>

              {member.bio && (
                <p className="text-gray-300 text-sm leading-relaxed line-clamp-3">
                  {member.bio}
                </p>
              )}

              {member.staff_alts && member.staff_alts.length > 0 && (
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
                      {member.staff_alts.map((alt, index) => (
                        <div key={alt.id} className="p-3 bg-white/5 rounded-lg border border-white/10">
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
                <Button
                  onClick={() => {
                    setCurrentStaff(member)
                    setIsEditing(true)
                  }}
                  variant="secondary"
                  size="small"
                  className="flex-1"
                >
                  <Edit size={16} className="mr-1" />
                  Edit
                </Button>
                <Button
                  onClick={() => handleDelete(member.id)}
                  variant="danger"
                  size="small"
                  className="px-3"
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {staff.length === 0 && (
        <Card className="text-center py-12">
          <User size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Staff Members</h3>
          <p className="text-gray-400 mb-6">Get started by adding your first staff member.</p>
          <Button onClick={() => setIsEditing(true)}>
            Add Your First Staff Member
          </Button>
        </Card>
      )}

      {/* Staff Form Modal */}
      <Modal
        isOpen={isEditing}
        onClose={() => {
          setIsEditing(false)
          setCurrentStaff(null)
        }}
        title={currentStaff ? 'Edit Staff Member' : 'Add Staff Member'}
        size="large"
      >
        <StaffForm
          staff={currentStaff}
          categories={categories}
          onSave={handleSave}
          onCancel={() => {
            setIsEditing(false)
            setCurrentStaff(null)
          }}
          saving={saving}
        />
      </Modal>

      {/* Categories Management Modal */}
      <Modal
        isOpen={isEditingCategories}
        onClose={() => setIsEditingCategories(false)}
        title="Manage Staff Categories"
        size="large"
      >
        <CategoryManager
          categories={categories}
          onSaveCategory={handleSaveCategory}
          onDeleteCategory={handleDeleteCategory}
          onClose={() => setIsEditingCategories(false)}
        />
      </Modal>
    </div>
  )
}

// Staff Form Component
function StaffForm({ staff, categories, onSave, onCancel, saving }) {
  const [formData, setFormData] = useState({
    name: staff?.name || '',
    role: staff?.role || '',
    bio: staff?.bio || '',
    image_url: staff?.image_url || '',
    special_role: staff?.special_role || '',
    sort_order: staff?.sort_order || 0,
    show_alts: staff?.show_alts || false,
    category_id: staff?.category_id || null,
  })

  const [alts, setAlts] = useState(staff?.staff_alts || [])
  const [errors, setErrors] = useState({})

  const handleSubmit = (e) => {
    e.preventDefault()

    const validation = validateStaffForm(formData)
    if (!validation.isValid) {
      setErrors(validation.errors)
      return
    }

    // Validate alts
    const altErrors = alts.map(alt => validateStaffForm(alt))
    const hasAltErrors = altErrors.some(result => !result.isValid)

    if (hasAltErrors) {
      alert('Please fix errors in alternate characters')
      return
    }

    onSave(formData, alts)
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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          error={errors.name}
          required
        />
        <Input
          label="Role"
          value={formData.role}
          onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
          error={errors.role}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
        <select
          value={formData.category_id || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, category_id: e.target.value || null }))}
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white"
        >
          <option value="">No Category</option>
          {categories.map(category => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Bio</label>
        <textarea
          value={formData.bio}
          onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
          rows={3}
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-nightshade-500 focus:border-transparent resize-none"
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
        <Input
          label="Special Role (Optional)"
          value={formData.special_role}
          onChange={(e) => setFormData(prev => ({ ...prev, special_role: e.target.value }))}
          placeholder="e.g., Key Keeper, Manager"
        />
        <Input
          label="Sort Order"
          type="number"
          value={formData.sort_order}
          onChange={(e) => setFormData(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
          min="0"
        />
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
        <Card padding="default">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-medium text-white">Alternate Characters</h4>
            <Button
              type="button"
              onClick={addAlt}
              disabled={alts.length >= 5}
              variant="secondary"
              size="small"
            >
              Add Alt ({alts.length}/5)
            </Button>
          </div>

          <div className="space-y-4">
            {alts.map((alt, index) => (
              <div key={index} className="p-4 border border-white/20 rounded-lg space-y-4">
                <div className="flex justify-between items-center">
                  <h5 className="font-medium text-nightshade-300">Alt Character {index + 1}</h5>
                  <Button
                    type="button"
                    onClick={() => removeAlt(index)}
                    variant="danger"
                    size="small"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Alt Name"
                    value={alt.name}
                    onChange={(e) => updateAlt(index, 'name', e.target.value)}
                    required
                  />
                  <Input
                    label="Alt Role"
                    value={alt.role}
                    onChange={(e) => updateAlt(index, 'role', e.target.value)}
                    required
                  />
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
        </Card>
      )}

      <div className="flex justify-end space-x-4 pt-6">
        <Button type="button" onClick={onCancel} variant="secondary">
          Cancel
        </Button>
        <Button type="submit" loading={saving}>
          {staff ? 'Update' : 'Create'} Staff Member
        </Button>
      </div>
    </form>
  )
}

// Category Manager Component
function CategoryManager({ categories, onSaveCategory, onDeleteCategory, onClose }) {
  const [editingCategory, setEditingCategory] = useState(null)
  const [isAddingCategory, setIsAddingCategory] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-white">Staff Categories</h3>
        <Button
          onClick={() => setIsAddingCategory(true)}
          size="small"
        >
          Add Category
        </Button>
      </div>

      <div className="space-y-3">
        {categories.map((category) => (
          <div key={category.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
            <div>
              <h4 className="font-medium text-white">{category.name}</h4>
              {category.description && (
                <p className="text-sm text-gray-400">{category.description}</p>
              )}
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={() => setEditingCategory(category)}
                variant="secondary"
                size="small"
              >
                <Edit size={14} />
              </Button>
              <Button
                onClick={() => onDeleteCategory(category.id)}
                variant="danger"
                size="small"
              >
                <Trash2 size={14} />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {(editingCategory || isAddingCategory) && (
        <CategoryForm
          category={editingCategory}
          onSave={(data) => {
            onSaveCategory(data)
            setEditingCategory(null)
            setIsAddingCategory(false)
          }}
          onCancel={() => {
            setEditingCategory(null)
            setIsAddingCategory(false)
          }}
        />
      )}

      <div className="flex justify-end">
        <Button onClick={onClose} variant="secondary">
          Done
        </Button>
      </div>
    </div>
  )
}

// Category Form Component
function CategoryForm({ category, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    name: category?.name || '',
    description: category?.description || '',
    sort_order: category?.sort_order || 0,
    is_collapsed: category?.is_collapsed || false,
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      alert('Category name is required')
      return
    }
    
    // Only include id if we're editing an existing category
    const dataToSave = category?.id 
      ? { ...formData, id: category.id }
      : formData
    
    onSave(dataToSave)
  }

  return (
    <Card padding="default">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Category Name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          required
        />
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={2}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-gray-400 resize-none"
            placeholder="Optional description..."
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Sort Order"
            type="number"
            value={formData.sort_order}
            onChange={(e) => setFormData(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
          />
          <div className="flex items-center space-x-3 pt-6">
            <input
              type="checkbox"
              id="is_collapsed"
              checked={formData.is_collapsed}
              onChange={(e) => setFormData(prev => ({ ...prev, is_collapsed: e.target.checked }))}
              className="rounded border-white/20 bg-white/10 text-nightshade-500"
            />
            <label htmlFor="is_collapsed" className="text-gray-300 text-sm">
              Collapsed by default
            </label>
          </div>
        </div>
        <div className="flex space-x-3">
          <Button type="submit" size="small">
            Save
          </Button>
          <Button type="button" onClick={onCancel} variant="secondary" size="small">
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  )
}
