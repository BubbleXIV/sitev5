'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Plus, Edit, Trash2, FileText, Eye } from 'lucide-react'
import PageBuilder from '@/components/PageBuilder'
import Link from 'next/link'

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
      const { data } = await supabase
        .from('page_content')
        .select('*')
        .eq('page_id', page.id)
        .single()

      setPageContent(data?.content || { elements: [] })
      setCurrentPage(page)
      setEditingContent(true)
    } catch (error) {
      console.error('Error loading page content:', error)
      setPageContent({ elements: [] })
      setCurrentPage(page)
      setEditingContent(true)
    }
  }

  const savePageContent = async (content) => {
    try {
      const { data: existingContent } = await supabase
        .from('page_content')
        .select('id')
        .eq('page_id', currentPage.id)
        .single()

      if (existingContent) {
        const { error } = await supabase
          .from('page_content')
          .update({ content, updated_at: new Date().toISOString() })
          .eq('page_id', currentPage.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('page_content')
          .insert([{
            page_id: currentPage.id,
            content
          }])

        if (error) throw error
      }

      alert('Page content saved successfully!')
    } catch (error) {
      console.error('Error saving page content:', error)
      alert('Error saving page content')
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading pages...</div>
  }

  if (editingContent) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">
            Editing: {currentPage.title}
          </h2>
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
        {pages.map((page) => (
          <div key={page.id} className="card">
            <div className="flex items-center mb-4">
              <FileText className="text-nightshade-400 mr-3" size={24} />
              <div>
                <h3 className="font-bold text-lg text-nightshade-300">{page.title}</h3>
                <p className="text-gray-400 text-sm">/{page.slug}</p>
              </div>
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

            <div className="flex space-x-2">
              <Link
                href={`/${page.slug}`}
                target="_blank"
                className="flex-1 btn-secondary flex items-center justify-center space-x-1"
              >
                <Eye size={16} />
                <span>View</span>
              </Link>

              {!page.is_staff_page && !page.is_menu_page && (
                <button
                  onClick={() => loadPageContent(page)}
                  className="flex-1 btn-primary flex items-center justify-center space-x-1"
                >
                  <Edit size={16} />
                  <span>Edit</span>
                </button>
              )}

              <button
                onClick={() => {
                  setCurrentPage(page)
                  setIsEditing(true)
                }}
                className="px-3 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg transition-colors"
              >
                <Edit size={16} />
              </button>

              <button
                onClick={() => handleDeletePage(page.id)}
                className="px-3 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
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

  return (
    <div className="card">
      <h3 className="text-xl font-bold text-white mb-6">
        {page ? 'Edit Page' : 'Add Page'}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
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