'use client'
import { useState } from 'react'
import { Plus, Edit, Trash2, ExternalLink, MessageCircle } from 'lucide-react'
import ImageUpload from '@/components/ImageUpload'

export default function AffiliateTemplate({ data, isEditable, onUpdate }) {
  const [isAddingAffiliate, setIsAddingAffiliate] = useState(false)
  const [editingAffiliateIndex, setEditingAffiliateIndex] = useState(null)

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

  return (
    <div className="min-h-screen bg-gray-900 text-white">
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
                className="bg-gray-800 rounded-lg p-6 hover:bg-gray-750 transition-colors relative group"
              >
                {/* Logo */}
                <div className="flex justify-center mb-4">
                  {affiliate.logo ? (
                    <img
                      src={affiliate.logo}
                      alt={`${affiliate.name} logo`}
                      className="h-16 w-auto object-contain"
                    />
                  ) : (
                    <div className="h-16 w-16 bg-gray-700 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">🏢</span>
                    </div>
                  )}
                </div>

                {/* Name */}
                <h3 className="text-xl font-bold text-center mb-3 text-nightshade-300">
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
                      className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                      title="Visit Website"
                    >
                      <ExternalLink size={16} />
                    </a>
                  )}
                  {affiliate.discord && (
                    <a
                      href={affiliate.discord}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
                      title="Join Discord"
                    >
                      <MessageCircle size={16} />
                    </a>
                  )}
                </div>

                {/* Edit Controls */}
                {isEditable && (
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex space-x-1">
                      <button
                        onClick={() => setEditingAffiliateIndex(index)}
                        className="p-1 bg-blue-600 hover:bg-blue-700 rounded"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => removeAffiliate(index)}
                        className="p-1 bg-red-600 hover:bg-red-700 rounded"
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
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-lg">
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
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
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
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white h-24 resize-none"
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
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
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
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
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
