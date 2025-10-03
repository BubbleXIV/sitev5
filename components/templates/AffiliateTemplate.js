'use client'
import { useState } from 'react'
import { Plus, Edit, Trash2, Globe, GripVertical } from 'lucide-react'
import ImageUpload from '@/components/ImageUpload'

useEffect(() => {
  console.log('CSS Variables check:')
  console.log('--bg-gradient-from:', getComputedStyle(document.documentElement).getPropertyValue('--bg-gradient-from'))
  console.log('--color-primary:', getComputedStyle(document.documentElement).getPropertyValue('--color-primary'))
}, [])

// Discord icon component (since lucide-react doesn't have it)
function DiscordIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
    </svg>
  )
}

export default function AffiliateTemplate({ data, isEditable, onUpdate }) {
  const [isAddingAffiliate, setIsAddingAffiliate] = useState(false)
  const [editingAffiliateIndex, setEditingAffiliateIndex] = useState(null)
  const [draggedIndex, setDraggedIndex] = useState(null)

  const { affiliates = [] } = data

  const addAffiliate = (affiliateData) => {
    const newAffiliate = {
      id: Date.now(),
      name: '',
      bio: '',
      logo: '',
      website: '',
      discord: '',
      ...affiliateData
    }
    onUpdate('affiliates', [...affiliates, newAffiliate])
    setIsAddingAffiliate(false)
  }

  const updateAffiliate = (index, affiliateData) => {
    const newAffiliates = [...affiliates]
    newAffiliates[index] = { ...newAffiliates[index], ...affiliateData }
    onUpdate('affiliates', newAffiliates)
    setEditingAffiliateIndex(null)
  }

  const removeAffiliate = (index) => {
    const newAffiliates = affiliates.filter((_, i) => i !== index)
    onUpdate('affiliates', newAffiliates)
  }

  const handleDragStart = (index) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e, index) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return

    const newAffiliates = [...affiliates]
    const draggedItem = newAffiliates[draggedIndex]
    newAffiliates.splice(draggedIndex, 1)
    newAffiliates.splice(index, 0, draggedItem)
    
    onUpdate('affiliates', newAffiliates)
    setDraggedIndex(index)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  return (
    <div className="min-h-screen bg-[var(--bg-gradient-from,#111827)] text-white">
      {/* Header */}
      <div className="px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-4">Our Affiliates</h1>
        <p className="text-center text-gray-300 mb-8 max-w-2xl mx-auto">
          Discover our trusted partners and collaborators who share our vision and values.
        </p>

        {/* Edit Controls */}
        {isEditable && (
          <div className="flex justify-center mb-8">
            <button
              onClick={() => setIsAddingAffiliate(true)}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus size={20} />
              <span>Add Affiliate</span>
            </button>
          </div>
        )}
      </div>
  
      {/* Affiliates Grid */}
      <div className="px-4 pb-8">
        {affiliates.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🤝</div>
            <h3 className="text-xl font-semibold text-gray-400 mb-2">
              No affiliates yet
            </h3>
            {isEditable && (
              <p className="text-gray-500">Add some affiliates to get started</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {affiliates.map((affiliate, index) => (
              <div
                key={affiliate.id}
                draggable={isEditable}
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={`bg-[var(--bg-gradient-via,#1f2937)] rounded-lg p-6 hover:shadow-xl hover:shadow-[var(--color-primary,#7c3aed)]/20 hover:-translate-y-1 transition-all duration-300 relative group ${
                  isEditable ? 'cursor-move' : ''
                } ${draggedIndex === index ? 'opacity-50' : ''}`}
              >
                {/* Drag Handle */}
                {isEditable && (
                  <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <GripVertical size={20} className="text-gray-400" />
                  </div>
                )}
      
                {/* Logo */}
                <div className="flex justify-center items-center mb-6 h-48">
                  {affiliate.logo ? (
                    <img
                      src={affiliate.logo}
                      alt={`${affiliate.name} logo`}
                      className="max-h-48 max-w-full object-contain transition-transform duration-300 group-hover:scale-110"
                    />
                  ) : (
                    <div className="h-32 w-32 bg-[var(--bg-gradient-to,#374151)] rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                      <span className="text-4xl">🏢</span>
                    </div>
                  )}
                </div>

                {/* Name */}
                <h3 className="text-xl font-bold text-center mb-3 text-[var(--color-primary-light,#a78bfa)]">
                  {affiliate.name || 'Affiliate Name'}
                </h3>

                {/* Bio */}
                {affiliate.bio && (
                  <p className="text-gray-300 text-sm text-center mb-4 line-clamp-3">
                    {affiliate.bio}
                  </p>
                )}

                {/* Links */}
                <div className="flex justify-center space-x-3 mb-4">
                  {affiliate.website && (
                    <a
                      href={affiliate.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg transition-colors"
                      style={{
                        backgroundColor: 'var(--color-secondary)',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-secondary-dark)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--color-secondary)'}
                      title="Visit Website"
                    >
                      <Globe size={18} />
                    </a>
                  )}
                  {affiliate.discord && (
                    <a
                      href={affiliate.discord}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg transition-colors"
                      style={{
                        backgroundColor: 'var(--color-primary)',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-primary-dark)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--color-primary)'}
                      title="Join Discord"
                    >
                      <DiscordIcon size={18} />
                    </a>
                  )}
                </div>

                {/* Edit Controls */}
                {isEditable && (
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex space-x-1">
                      <button
                        onClick={() => setEditingAffiliateIndex(index)}
                        className="p-1 rounded transition-colors"
                        style={{
                          backgroundColor: 'var(--color-primary)',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-primary-dark)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--color-primary)'}
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => removeAffiliate(index)}
                        className="p-1 bg-red-600 hover:bg-red-700 rounded transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Affiliate Modal */}
      {(isAddingAffiliate || editingAffiliateIndex !== null) && (
        <AffiliateEditor
          affiliate={editingAffiliateIndex !== null ? affiliates[editingAffiliateIndex] : null}
          onSave={editingAffiliateIndex !== null 
            ? (data) => updateAffiliate(editingAffiliateIndex, data)
            : addAffiliate
          }
          onClose={() => {
            setIsAddingAffiliate(false)
            setEditingAffiliateIndex(null)
          }}
        />
      )}
    </div>
  )
}

// Affiliate Editor Component
function AffiliateEditor({ affiliate, onSave, onClose }) {
  const [formData, setFormData] = useState({
    name: affiliate?.name || '',
    bio: affiliate?.bio || '',
    logo: affiliate?.logo || '',
    website: affiliate?.website || '',
    discord: affiliate?.discord || ''
  })

  const handleSave = () => {
    if (!formData.name.trim()) {
      alert('Affiliate name is required')
      return
    }
    onSave(formData)
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--bg-gradient-via,#1f2937)] rounded-lg p-6 w-full max-w-lg">
        <h3 className="text-xl font-bold mb-4">
          {affiliate ? 'Edit Affiliate' : 'Add Affiliate'}
        </h3>
        
        <div className="space-y-4">
          {/* Logo Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Logo
            </label>
            <ImageUpload
              currentImage={formData.logo}
              onImageUploaded={(url) => setFormData(prev => ({ ...prev, logo: url }))}
            />
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 bg-[var(--bg-gradient-to,#374151)] border border-gray-600 rounded text-white"
              placeholder="Affiliate name"
              required
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Bio
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              className="w-full px-3 py-2 bg-[var(--bg-gradient-to,#374151)] border border-gray-600 rounded text-white h-24 resize-none"
              placeholder="Brief description about this affiliate..."
            />
          </div>

          {/* Website */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Website URL
            </label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
              className="w-full px-3 py-2 bg-[var(--bg-gradient-to,#374151)] border border-gray-600 rounded text-white"
              placeholder="https://example.com"
            />
          </div>

          {/* Discord */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Discord URL
            </label>
            <input
              type="url"
              value={formData.discord}
              onChange={(e) => setFormData(prev => ({ ...prev, discord: e.target.value }))}
              className="w-full px-3 py-2 bg-[var(--bg-gradient-to,#374151)] border border-gray-600 rounded text-white"
              placeholder="https://discord.gg/..."
            />
          </div>
        </div>

        <div className="flex space-x-4 mt-6">
          <button
            onClick={handleSave}
            className="flex-1 btn-primary"
            disabled={!formData.name.trim()}
          >
            Save
          </button>
          <button
            onClick={onClose}
            className="flex-1 btn-secondary"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
