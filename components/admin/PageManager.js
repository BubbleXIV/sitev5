'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Plus, Edit, Trash2, FileText, Eye, Image, Users, Calendar, Layout } from 'lucide-react'
import PageBuilder from '@/components/PageBuilder'
import Link from 'next/link'

const PAGE_TEMPLATES = [
  {
    id: 'blank',
    name: 'Blank Page',
    description: 'Build however you want with full flexibility',
    icon: Layout,
    fields: []
  },
  {
    id: 'gallery',
    name: 'Gallery Page',
    description: 'Show off pictures with categories and lightbox viewing',
    icon: Image,
    fields: ['gallery_images', 'gallery_categories']
  },
  {
    id: 'affiliate',
    name: 'Affiliate Page',
    description: 'Display affiliates with logos, bios, and links',
    icon: Users,
    fields: ['affiliates']
  },
  {
    id: 'event',
    name: 'Event Page',
    description: 'Event showcase with hero image, buttons, and special guests',
    icon: Calendar,
    fields: ['hero_image', 'overlay_text', 'action_buttons', 'affiliate_logos', 'special_guests']
  }
]

export default function PageManager() {
  const [pages, setPages] = useState([])
  const [isEditing, setIsEditing] = useState(false)
  const [currentPage, setCurrentPage] = useState(null)
  const [editingContent, setEditingContent] = useState(false)
  const [pageContent, setPageContent] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPages()
  }, [])

  const fetchPages = async () => {
    try {
      const { data } = await supabase
        .from('pages')
        .select('*')
        .order('sort_order')

      setPages(data || [])
    } catch (error) {
      console.error('Error fetching pages:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSavePage = async (pageData) => {
    try {
      if (currentPage?.id) {
        const { error } = await supabase
          .from('pages')
          .update(pageData)
          .eq('id', currentPage.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('pages')
          .insert([pageData])

        if (error) throw error
      }

      await fetchPages()
      setIsEditing(false)
      setCurrentPage(null)
    } catch (error) {
      console.error('Error saving page:', error)
      alert('Error saving page')
    }
  }

  const handleDeletePage = async (id) => {
    if (!confirm('Are you sure you want to delete this page?')) return

    try {
      const { error } = await supabase
        .from('pages')
        .delete()
        .eq('id', id)

      if (error) throw error
      await fetchPages()
    } catch (error) {
      console.error('Error deleting page:', error)
      alert('Error deleting page')
    }
  }

  const loadPageContent = async (page) => {
    try {
      // Get the most recent page content record
      const { data } = await supabase
        .from('page_content')
        .select('*')
        .eq('page_id', page.id)
        .order('created_at', { ascending: false })
        .limit(1)

      const content = data && data.length > 0 ? data[0].content : getDefaultTemplateContent(page.template)
      setPageContent(content)
      setCurrentPage(page)
      setEditingContent(true)
    } catch (error) {
      console.error('Error loading page content:', error)
      setPageContent(getDefaultTemplateContent(page.template))
      setCurrentPage(page)
      setEditingContent(true)
    }
  }

  const getDefaultTemplateContent = (template) => {
    switch (template) {
      case 'gallery':
        return { 
          elements: [],
          gallery_images: [],
          gallery_categories: []
        }
      case 'affiliate':
        return {
          elements: [],
          affiliates: []
        }
      case 'event':
        return {
          elements: [],
          hero_image: '',
          overlay_text: '',
          action_buttons: [],
          affiliate_logos: [],
          special_guests: []
        }
      default:
        return { elements: [] }
    }
  }

  const savePageContent = async (content) => {
    console.log('🔥 SAVE DEBUG - savePageContent called with:', content)
    console.log('🔥 SAVE DEBUG - currentPage:', currentPage)
    console.log('🔥 SAVE DEBUG - currentPage.id:', currentPage?.id)
    console.log('🔥 SAVE DEBUG - special_guests in content:', content?.special_guests)
    
    try {
      // Get the most recent page content record
      const { data: existingRecords } = await supabase
        .from('page_content')
        .select('id')
        .eq('page_id', currentPage.id)
        .order('created_at', { ascending: false })
        .limit(1)

      console.log('🔥 SAVE DEBUG - existingRecords:', existingRecords)

      if (existingRecords && existingRecords.length > 0) {
        console.log('🔥 SAVE DEBUG - Updating existing content with id:', existingRecords[0].id)
        const { error } = await supabase
          .from('page_content')
          .update({ content, updated_at: new Date().toISOString() })
          .eq('id', existingRecords[0].id)

        console.log('🔥 SAVE DEBUG - Update error:', error)
        if (error) throw error
      } else {
        console.log('🔥 SAVE DEBUG - Creating new content')
        const { error } = await supabase
          .from('page_content')
          .insert([{
            page_id: currentPage.id,
            content
          }])

        console.log('🔥 SAVE DEBUG - Insert error:', error)
        if (error) throw error
      }

      // Update local state immediately
      setPageContent(content)
      console.log('🔥 SAVE DEBUG - Save completed successfully')
      alert('Page content saved successfully!')
    } catch (error) {
      console.error('🔥 SAVE DEBUG - Error saving page content:', error)
      alert('Error saving page content')
    }
  }

  const getTemplateInfo = (templateId) => {
    return PAGE_TEMPLATES.find(t => t.id === templateId) || PAGE_TEMPLATES[0]
  }

  if (loading) {
    return <div className="text-center py-8">Loading pages...</div>
  }

  if (editingContent) {
    // ADD DEBUG STATEMENTS HERE - RIGHT BEFORE PAGEBUILDER RENDERS
    console.log('🔍 PageManager Debug:')
    console.log('currentPage:', currentPage)
    console.log('currentPage.template:', currentPage?.template)
    console.log('pageContent:', pageContent)

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white">
              Editing: {currentPage.title}
            </h2>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-sm text-gray-400">Template:</span>
              <span className="px-2 py-1 bg-nightshade-600/20 border border-nightshade-500/20 rounded text-xs text-nightshade-300">
                {getTemplateInfo(currentPage.template).name}
              </span>
            </div>
          </div>
          <div className="flex space-x-2">
            <Link
              href={`/${currentPage.slug}`}
              target="_blank"
              className="btn-secondary flex items-center space-x-2"
            >
              <Eye size={16} />
              <span>Preview</span>
            </Link>
            <button
              onClick={() => {
                setEditingContent(false)
                setCurrentPage(null)
                setPageContent(null)
              }}
              className="btn-secondary"
            >
              Back to Pages
            </button>
          </div>
        </div>
                
        <div className="bg-white/5 rounded-lg p-4">
          <PageBuilder
            content={pageContent}
            isEditable={true}
            onSave={savePageContent}
            template={currentPage.template}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Page Management</h2>
        <button
          onClick={() => {
            setCurrentPage(null)
            setIsEditing(true)
          }}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Add Page</span>
        </button>
      </div>

      {isEditing && (
        <PageForm
          page={currentPage}
          onSave={handleSavePage}
          onCancel={() => {
            setIsEditing(false)
            setCurrentPage(null)
          }}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pages.map((page) => {
          const templateInfo = getTemplateInfo(page.template)
          const TemplateIcon = templateInfo.icon
          
          return (
            <div key={page.id} className="card">
              <div className="flex items-center mb-4">
                <TemplateIcon className="text-nightshade-400 mr-3" size={24} />
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-nightshade-300">{page.title}</h3>
                  <p className="text-gray-400 text-sm">/{page.slug}</p>
                </div>
              </div>

              <div className="mb-3">
                <span className="px-2 py-1 bg-nightshade-600/20 border border-nightshade-500/20 rounded text-xs text-nightshade-300">
                  {templateInfo.name}
                </span>
              </div>

              {page.is_staff_page && (
                <div className="mb-3 px-2 py-1 bg-blue-600/20 border border-blue-500/50 rounded text-xs text-blue-300">
                  Staff Page
                </div>
              )}

              {page.is_menu_page && (
                <div className="mb-3 px-2 py-1 bg-green-600/20 border border-green-500/50 rounded text-xs text-green-300">
                  Menu Page
                </div>
              )}

<div className="flex flex-wrap gap-2">
                <Link
                  href={`/${page.slug}`}
                  target="_blank"
                  className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                  title="View Page"
                >
                  <Eye size={16} />
                </Link>

                {!page.is_staff_page && !page.is_menu_page && (
                  <button
                    onClick={() => loadPageContent(page)}
                    className="px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                    title="Edit Content"
                  >
                    <Edit size={16} />
                  </button>
                )}

                <button
                  onClick={() => {
                    setCurrentPage(page)
                    setIsEditing(true)
                  }}
                  className="px-3 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg transition-colors"
                  title="Edit Settings"
                >
                  <FileText size={16} />
                </button>

                <button
                  onClick={() => handleDeletePage(page.id)}
                  className="px-3 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                  title="Delete Page"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {pages.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400 mb-4">No pages found.</p>
          <button
            onClick={() => setIsEditing(true)}
            className="btn-primary"
          >
            Create Your First Page
          </button>
        </div>
      )}
    </div>
  )
}

// Page Form Component
function PageForm({ page, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    title: page?.title || '',
    slug: page?.slug || '',
    template: page?.template || 'blank',
    sort_order: page?.sort_order || 0,
  })

  const handleSubmit = (e) => {
    e.preventDefault()

    // Generate slug from title if not provided
    const slug = formData.slug || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

    onSave({
      ...formData,
      slug,
      is_staff_page: false,
      is_menu_page: false
    })
  }

  const selectedTemplate = PAGE_TEMPLATES.find(t => t.id === formData.template)
  const TemplateIcon = selectedTemplate?.icon || Layout

  return (
    <div className="card">
      <h3 className="text-xl font-bold text-white mb-6">
        {page ? 'Edit Page' : 'Add Page'}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Template Selection */}
        {!page && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Choose Template *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {PAGE_TEMPLATES.map((template) => {
                const Icon = template.icon
                return (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, template: template.id }))}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      formData.template === template.id
                        ? 'border-nightshade-500 bg-nightshade-500/10'
                        : 'border-white/20 hover:border-white/30'
                    }`}
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <Icon size={20} className="text-nightshade-400" />
                      <span className="font-medium text-white">{template.name}</span>
                    </div>
                    <p className="text-sm text-gray-400">{template.description}</p>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Current Template Display for Editing */}
        {page && (
          <div className="p-4 bg-nightshade-500/10 border border-nightshade-500/20 rounded-lg">
            <div className="flex items-center space-x-3">
              <TemplateIcon size={20} className="text-nightshade-400" />
              <div>
                <span className="font-medium text-white">{selectedTemplate?.name}</span>
                <p className="text-sm text-gray-400">{selectedTemplate?.description}</p>
              </div>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Page Title *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => {
              const title = e.target.value
              setFormData(prev => ({
                ...prev,
                title,
                slug: prev.slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
              }))
            }}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Page Slug *
          </label>
          <div className="flex items-center">
            <span className="text-gray-400 mr-1">/</span>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') }))}
              className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Sort Order
          </label>
          <input
            type="number"
            value={formData.sort_order}
            onChange={(e) => setFormData(prev => ({ ...prev, sort_order: parseInt(e.target.value) }))}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
          />
        </div>

        <div className="flex space-x-4">
          <button type="submit" className="btn-primary">
            {page ? 'Update' : 'Create'} Page
          </button>
          <button type="button" onClick={onCancel} className="btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
