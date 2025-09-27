'use client'
import { useState } from 'react'
import { Plus, Edit, Trash2, ExternalLink, MessageCircle, Calendar, MapPin } from 'lucide-react'
import ImageUpload from '@/components/ImageUpload'

export default function EventTemplate({ content, isEditable, onSave }) {
  const [isEditingHero, setIsEditingHero] = useState(false)
  const [isEditingGuest, setIsEditingGuest] = useState(null)
  const [isAddingGuest, setIsAddingGuest] = useState(false)
  const [isEditingAffiliates, setIsEditingAffiliates] = useState(false)
  const [isEditingButtons, setIsEditingButtons] = useState(false)

  // Use content prop instead of data prop for consistency with PageBuilder
  const {
    hero_image = '',
    overlay_text = '',
    action_buttons = [],
    affiliate_logos = [],
    special_guests = []
  } = content || {}

  // Update onUpdate to work with onSave prop
  const onUpdate = (field, value) => {
    if (onSave) {
      const updatedContent = {
        ...content,
        [field]: value
      }
      onSave(updatedContent)
    }
  }

  const updateGuest = (index, guestData) => {
    const newGuests = [...special_guests]
    newGuests[index] = { ...newGuests[index], ...guestData }
    onUpdate('special_guests', newGuests)
    setIsEditingGuest(null)
  }

  const addGuest = (guestData) => {
    const newGuest = {
      id: Date.now(),
      name: '',
      bio: '',
      image: '',
      link: '',
      ...guestData
    }
    onUpdate('special_guests', [...special_guests, newGuest])
    setIsAddingGuest(false)
  }

  const removeGuest = (index) => {
    const newGuests = special_guests.filter((_, i) => i !== index)
    onUpdate('special_guests', newGuests)
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Hero Section */}
      <div className="relative min-h-screen flex items-center justify-center">
        {/* Background Image */}
        {hero_image && (
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${hero_image})` }}
          >
            <div className="absolute inset-0 bg-black/60"></div>
          </div>
        )}
        
        {!hero_image && (
          <div className="absolute inset-0 bg-gradient-to-br from-nightshade-900 to-purple-900"></div>
        )}

        {/* Content */}
        <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
          {overlay_text ? (
            <div className="mb-8">
              <div className="text-4xl md:text-6xl font-bold mb-4" dangerouslySetInnerHTML={{ __html: overlay_text }} />
            </div>
          ) : (
            <div className="mb-8">
              <h1 className="text-4xl md:text-6xl font-bold mb-4">Epic Event</h1>
              <p className="text-xl text-gray-300">Join us for an unforgettable experience</p>
            </div>
          )}

          {/* Action Buttons */}
          {action_buttons.length > 0 && (
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              {action_buttons.map((button, index) => (
                <a
                  key={index}
                  href={button.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`px-8 py-3 rounded-lg font-semibold transition-colors ${
                    button.style === 'primary' 
                      ? 'bg-nightshade-600 hover:bg-nightshade-700 text-white'
                      : button.style === 'secondary'
                      ? 'bg-gray-700 hover:bg-gray-600 text-white'
                      : 'border-2 border-white hover:bg-white hover:text-gray-900 text-white'
                  }`}
                >
                  {button.text}
                </a>
              ))}
            </div>
          )}

          {/* Edit Hero Controls */}
          {isEditable && (
            <div className="space-x-2">
              <button
                onClick={() => setIsEditingHero(true)}
                className="btn-primary"
              >
                Edit Hero
              </button>
              <button
                onClick={() => setIsEditingButtons(true)}
                className="btn-secondary"
              >
                Edit Buttons
              </button>
            </div>
          )}
        </div>

        {/* Affiliate Logos Overlay */}
        {affiliate_logos.length > 0 && (
          <div className="absolute bottom-8 left-8 right-8 z-10">
            <div className="flex flex-wrap justify-center items-center gap-6 opacity-80">
              {affiliate_logos.map((logo, index) => (
                <img
                  key={index}
                  src={logo.url}
                  alt={logo.name || 'Sponsor'}
                  className="h-12 w-auto object-contain filter brightness-0 invert"
                />
              ))}
            </div>
            {isEditable && (
              <div className="text-center mt-4">
                <button
                  onClick={() => setIsEditingAffiliates(true)}
                  className="btn-secondary text-sm"
                >
                  Edit Sponsors
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Special Guests Section */}
      <div className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Special Guests</h2>
            <p className="text-gray-400">Meet our featured performers and speakers</p>
          </div>

          {/* Edit Controls */}
          {isEditable && special_guests.length < 5 && (
            <div className="text-center mb-8">
              <button
                onClick={() => setIsAddingGuest(true)}
                className="btn-primary flex items-center space-x-2 mx-auto"
              >
                <Plus size={20} />
                <span>Add Guest</span>
              </button>
            </div>
          )}

          {special_guests.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">⭐</div>
              <h3 className="text-xl font-semibold text-gray-400 mb-2">
                No special guests yet
              </h3>
              {isEditable && (
                <p className="text-gray-500">Add up to 5 special guests to showcase</p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
              {special_guests.map((guest, index) => (
                <div
                  key={guest.id}
                  className="text-center group relative"
                >
                  {/* Guest Image */}
                  <div className="relative mb-4">
                    {guest.image ? (
                      <img
                        src={guest.image}
                        alt={guest.name}
                        className="w-32 h-32 mx-auto rounded-full object-cover border-4 border-nightshade-500"
                      />
                    ) : (
                      <div className="w-32 h-32 mx-auto rounded-full bg-gray-700 flex items-center justify-center border-4 border-nightshade-500">
                        <span className="text-3xl">👤</span>
                      </div>
                    )}
                    
                    {/* Edit Controls */}
                    {isEditable && (
                      <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex space-x-1">
                          <button
                            onClick={() => setIsEditingGuest(index)}
                            className="p-1 bg-blue-600 hover:bg-blue-700 rounded-full"
                          >
                            <Edit size={12} />
                          </button>
                          <button
                            onClick={() => removeGuest(index)}
                            className="p-1 bg-red-600 hover:bg-red-700 rounded-full"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Guest Info */}
                  <h3 className="font-bold text-lg mb-2 text-nightshade-300">
                    {guest.name || 'Guest Name'}
                  </h3>
                  
                  {guest.bio && (
                    <p className="text-gray-400 text-sm mb-3 line-clamp-3">
                      {guest.bio}
                    </p>
                  )}

                  {guest.link && (
                    <a
                      href={guest.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-nightshade-400 hover:text-nightshade-300 transition-colors"
                    >
                      <ExternalLink size={14} className="mr-1" />
                      <span className="text-sm">Learn More</span>
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {isEditingHero && (
        <HeroEditor
          heroImage={hero_image}
          overlayText={overlay_text}
          onSave={(data) => {
            onUpdate('hero_image', data.hero_image)
            onUpdate('overlay_text', data.overlay_text)
            setIsEditingHero(false)
          }}
          onClose={() => setIsEditingHero(false)}
        />
      )}

      {isEditingButtons && (
        <ButtonEditor
          buttons={action_buttons}
          onSave={(buttons) => {
            onUpdate('action_buttons', buttons)
            setIsEditingButtons(false)
          }}
          onClose={() => setIsEditingButtons(false)}
        />
      )}

      {isEditingAffiliates && (
        <AffiliateEditor
          affiliates={affiliate_logos}
          onSave={(affiliates) => {
            onUpdate('affiliate_logos', affiliates)
            setIsEditingAffiliates(false)
          }}
          onClose={() => setIsEditingAffiliates(false)}
        />
      )}

      {(isAddingGuest || isEditingGuest !== null) && (
        <GuestEditor
          guest={isEditingGuest !== null ? special_guests[isEditingGuest] : null}
          onSave={isEditingGuest !== null 
            ? (data) => updateGuest(isEditingGuest, data)
            : addGuest
          }
          onClose={() => {
            setIsAddingGuest(false)
            setIsEditingGuest(null)
          }}
        />
      )}
    </div>
  )
}

// Hero Editor Component
function HeroEditor({ heroImage, overlayText, onSave, onClose }) {
  const [formData, setFormData] = useState({
    hero_image: heroImage,
    overlay_text: overlayText
  })

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-lg">
        <h3 className="text-xl font-bold mb-4">Edit Hero Section</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Hero Image
            </label>
            <ImageUpload
              currentImage={formData.hero_image}
              onImageUploaded={(url) => setFormData(prev => ({ ...prev, hero_image: url }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Overlay Text (HTML allowed)
            </label>
            <textarea
              value={formData.overlay_text}
              onChange={(e) => setFormData(prev => ({ ...prev, overlay_text: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white h-24 resize-none"
              placeholder="<h1>Event Title</h1><p>Event description...</p>"
            />
          </div>
        </div>

        <div className="flex space-x-4 mt-6">
          <button onClick={() => onSave(formData)} className="flex-1 btn-primary">
            Save
          </button>
          <button onClick={onClose} className="flex-1 btn-secondary">
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

// Button Editor Component  
function ButtonEditor({ buttons, onSave, onClose }) {
  const [formButtons, setFormButtons] = useState(buttons.length > 0 ? buttons : [{ text: '', link: '', style: 'primary' }])

  const addButton = () => {
    if (formButtons.length < 3) {
      setFormButtons([...formButtons, { text: '', link: '', style: 'primary' }])
    }
  }

  const removeButton = (index) => {
    setFormButtons(formButtons.filter((_, i) => i !== index))
  }

  const updateButton = (index, field, value) => {
    const newButtons = [...formButtons]
    newButtons[index] = { ...newButtons[index], [field]: value }
    setFormButtons(newButtons)
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-lg">
        <h3 className="text-xl font-bold mb-4">Edit Action Buttons</h3>
        
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {formButtons.map((button, index) => (
            <div key={index} className="p-4 border border-gray-600 rounded space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-medium">Button {index + 1}</span>
                <button
                  onClick={() => removeButton(index)}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              
              <input
                type="text"
                placeholder="Button text"
                value={button.text}
                onChange={(e) => updateButton(index, 'text', e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
              />
              
              <input
                type="url"
                placeholder="Button link"
                value={button.link}
                onChange={(e) => updateButton(index, 'link', e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
              />
              
              <select
                value={button.style}
                onChange={(e) => updateButton(index, 'style', e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
              >
                <option value="primary">Primary</option>
                <option value="secondary">Secondary</option>
                <option value="outline">Outline</option>
              </select>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center mt-4">
          <button
            onClick={addButton}
            disabled={formButtons.length >= 3}
            className="btn-secondary text-sm"
          >
            Add Button ({formButtons.length}/3)
          </button>
        </div>

        <div className="flex space-x-4 mt-6">
          <button onClick={() => onSave(formButtons)} className="flex-1 btn-primary">
            Save
          </button>
          <button onClick={onClose} className="flex-1 btn-secondary">
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

// Affiliate Editor Component
function AffiliateEditor({ affiliates, onSave, onClose }) {
  const [formAffiliates, setFormAffiliates] = useState(affiliates.length > 0 ? affiliates : [{ name: '', url: '' }])

  const addAffiliate = () => {
    setFormAffiliates([...formAffiliates, { name: '', url: '' }])
  }

  const removeAffiliate = (index) => {
    setFormAffiliates(formAffiliates.filter((_, i) => i !== index))
  }

  const updateAffiliate = (index, field, value) => {
    const newAffiliates = [...formAffiliates]
    newAffiliates[index] = { ...newAffiliates[index], [field]: value }
    setFormAffiliates(newAffiliates)
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-lg">
        <h3 className="text-xl font-bold mb-4">Edit Sponsor Logos</h3>
        
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {formAffiliates.map((affiliate, index) => (
            <div key={index} className="p-4 border border-gray-600 rounded space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-medium">Sponsor {index + 1}</span>
                <button
                  onClick={() => removeAffiliate(index)}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              
              <input
                type="text"
                placeholder="Sponsor name"
                value={affiliate.name}
                onChange={(e) => updateAffiliate(index, 'name', e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
              />
              
              <div>
                <label className="block text-xs text-gray-400 mb-1">Logo</label>
                <ImageUpload
                  currentImage={affiliate.url}
                  onImageUploaded={(url) => updateAffiliate(index, 'url', url)}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center mt-4">
          <button
            onClick={addAffiliate}
            className="btn-secondary text-sm"
          >
            Add Sponsor
          </button>
        </div>

        <div className="flex space-x-4 mt-6">
          <button onClick={() => onSave(formAffiliates)} className="flex-1 btn-primary">
            Save
          </button>
          <button onClick={onClose} className="flex-1 btn-secondary">
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

// Guest Editor Component
function GuestEditor({ guest, onSave, onClose }) {
  const [formData, setFormData] = useState({
    name: guest?.name || '',
    bio: guest?.bio || '',
    image: guest?.image || '',
    link: guest?.link || ''
  })

  const handleSave = () => {
    if (!formData.name.trim()) {
      alert('Guest name is required')
      return
    }
    onSave(formData)
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-lg">
        <h3 className="text-xl font-bold mb-4">
          {guest ? 'Edit Guest' : 'Add Special Guest'}
        </h3>
        
        <div className="space-y-4">
          {/* Guest Image */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Guest Photo
            </label>
            <ImageUpload
              currentImage={formData.image}
              onImageUploaded={(url) => setFormData(prev => ({ ...prev, image: url }))}
              cropAspectRatio={1}
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
              placeholder="Guest name"
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
              placeholder="Brief bio about this guest..."
            />
          </div>

          {/* Link */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Profile/Website Link
            </label>
            <input
              type="url"
              value={formData.link}
              onChange={(e) => setFormData(prev => ({ ...prev, link: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
              placeholder="https://example.com"
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
