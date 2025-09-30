'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Plus, Edit, Trash2, ChefHat, Eye, EyeOff } from 'lucide-react'
import ImageUpload from '@/components/ImageUpload'

export default function MenuManager() {
  const [categories, setCategories] = useState([])
  const [isEditingCategory, setIsEditingCategory] = useState(false)
  const [isEditingItem, setIsEditingItem] = useState(false)
  const [currentCategory, setCurrentCategory] = useState(null)
  const [currentItem, setCurrentItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showHidden, setShowHidden] = useState(false)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('menu_categories')
        .select(`
          *,
          menu_items (*)
        `)
        .order('sort_order')

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }

      setCategories(data || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
      alert('Error loading menu data: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleItemVisibility = async (item) => {
    try {
      const { error } = await supabase
        .from('menu_items')
        .update({ is_hidden: !item.is_hidden })
        .eq('id', item.id)

      if (error) throw error
      
      await fetchCategories()
      alert(`Item ${item.is_hidden ? 'shown' : 'hidden'} successfully!`)
    } catch (error) {
      console.error('Error toggling item visibility:', error)
      alert('Error updating item visibility: ' + error.message)
    }
  }

  const handleSaveCategory = async (categoryData) => {
    try {
      console.log('Saving category:', categoryData)
      
      if (currentCategory?.id) {
        const { data, error } = await supabase
          .from('menu_categories')
          .update(categoryData)
          .eq('id', currentCategory.id)
          .select()

        if (error) throw error
        console.log('Category updated:', data)
      } else {
        const { data, error } = await supabase
          .from('menu_categories')
          .insert([categoryData])
          .select()

        if (error) throw error
        console.log('Category created:', data)
      }

      await fetchCategories()
      setIsEditingCategory(false)
      setCurrentCategory(null)
      alert('Category saved successfully!')
    } catch (error) {
      console.error('Error saving category:', error)
      alert('Error saving category: ' + error.message)
    }
  }

  const handleSaveItem = async (itemData) => {
    try {
      console.log('Saving item:', itemData)
      
      if (!itemData.name || !itemData.category_id) {
        alert('Name and Category are required')
        return
      }

      const dataToSave = {
        ...itemData,
        price_gil: itemData.price_gil ? parseInt(itemData.price_gil) : null,
        sort_order: itemData.sort_order || 0,
        is_hidden: itemData.is_hidden || false
      }

      if (currentItem?.id) {
        const { data, error } = await supabase
          .from('menu_items')
          .update(dataToSave)
          .eq('id', currentItem.id)
          .select()

        if (error) throw error
        console.log('Item updated:', data)
      } else {
        const { data, error } = await supabase
          .from('menu_items')
          .insert([dataToSave])
          .select()

        if (error) throw error
        console.log('Item created:', data)
      }

      await fetchCategories()
      setIsEditingItem(false)
      setCurrentItem(null)
      alert('Menu item saved successfully!')
    } catch (error) {
      console.error('Error saving item:', error)
      alert('Error saving menu item: ' + error.message)
    }
  }

  const handleDeleteCategory = async (id) => {
    if (!confirm('Are you sure? This will delete all items in this category.')) return

    try {
      const { error } = await supabase
        .from('menu_categories')
        .delete()
        .eq('id', id)

      if (error) throw error
      await fetchCategories()
      alert('Category deleted successfully!')
    } catch (error) {
      console.error('Error deleting category:', error)
      alert('Error deleting category: ' + error.message)
    }
  }

  const handleDeleteItem = async (id) => {
    if (!confirm('Are you sure you want to delete this menu item?')) return

    try {
      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', id)

      if (error) throw error
      await fetchCategories()
      alert('Menu item deleted successfully!')
    } catch (error) {
      console.error('Error deleting item:', error)
      alert('Error deleting menu item: ' + error.message)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading menu...</div>
  }

  const visibleItems = categories.flatMap(cat => 
    cat.menu_items?.filter(item => !item.is_hidden) || []
  )
  const hiddenItems = categories.flatMap(cat => 
    cat.menu_items?.filter(item => item.is_hidden) || []
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Menu Management</h2>
          <p className="text-sm text-gray-400 mt-1">
            {visibleItems.length} visible items, {hiddenItems.length} hidden items
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowHidden(!showHidden)}
            className="btn-secondary flex items-center space-x-2"
          >
            {showHidden ? <Eye size={20} /> : <EyeOff size={20} />}
            <span>{showHidden ? 'Show Active' : 'Show Hidden'}</span>
          </button>
          <button
            onClick={() => {
              setCurrentCategory(null)
              setIsEditingCategory(true)
            }}
            className="btn-secondary flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>Add Category</span>
          </button>
          <button
            onClick={() => {
              setCurrentItem(null)
              setIsEditingItem(true)
            }}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>Add Menu Item</span>
          </button>
        </div>
      </div>

      {isEditingCategory && (
        <CategoryForm
          category={currentCategory}
          onSave={handleSaveCategory}
          onCancel={() => {
            setIsEditingCategory(false)
            setCurrentCategory(null)
          }}
        />
      )}

      {isEditingItem && (
        <ItemForm
          item={currentItem}
          categories={categories}
          onSave={handleSaveItem}
          onCancel={() => {
            setIsEditingItem(false)
            setCurrentItem(null)
          }}
        />
      )}

      {showHidden ? (
        /* Hidden Items Section */
        <div className="card">
          <h3 className="text-xl font-bold text-orange-400 mb-4">Hidden Items</h3>
          <p className="text-sm text-gray-400 mb-4">
            These items are hidden from the public menu but can be restored anytime.
          </p>
          
          {hiddenItems.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No hidden items</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {hiddenItems.map((item) => (
                <div key={item.id} className="bg-orange-900/20 rounded-lg p-4 border border-orange-500/30">
                  {item.image_url && (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-full h-32 object-cover rounded mb-3 opacity-60"
                    />
                  )}
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-white">{item.name}</h4>
                    {item.price_gil && (
                      <span className="text-purple-400 font-bold">
                        {item.price_gil.toLocaleString()} gil
                      </span>
                    )}
                  </div>
                  {item.description && (
                    <p className="text-gray-300 text-sm mb-3">{item.description}</p>
                  )}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleToggleItemVisibility(item)}
                      className="flex-1 btn-primary text-xs flex items-center justify-center space-x-1"
                      title="Show item on menu"
                    >
                      <Eye size={14} />
                      <span>Show</span>
                    </button>
                    <button
                      onClick={() => {
                        setCurrentItem(item)
                        setIsEditingItem(true)
                      }}
                      className="px-2 py-1 bg-yellow-600 hover:bg-yellow-700 rounded text-xs"
                      title="Edit item"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-xs"
                      title="Delete permanently"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Active Items by Category */
        <>
          {categories.map((category) => {
            const activeItems = category.menu_items?.filter(item => !item.is_hidden) || []
            
            return (
              <div key={category.id} className="card">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-nightshade-300">{category.name}</h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setCurrentCategory(category)
                        setIsEditingCategory(true)
                      }}
                      className="btn-secondary text-sm"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className="px-2 py-1 bg-red-600 hover:bg-red-700 rounded transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {activeItems.map((item) => (
                    <div key={item.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                      {item.image_url && (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-full h-32 object-cover rounded mb-3"
                        />
                      )}
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-white">{item.name}</h4>
                        {item.price_gil && (
                          <span className="text-purple-400 font-bold">
                            {item.price_gil.toLocaleString()} gil
                          </span>
                        )}
                      </div>
                      {item.description && (
                        <p className="text-gray-300 text-sm mb-3">{item.description}</p>
                      )}
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleToggleItemVisibility(item)}
                          className="px-2 py-1 bg-orange-600 hover:bg-orange-700 rounded text-xs"
                          title="Hide from menu"
                        >
                          <EyeOff size={14} />
                        </button>
                        <button
                          onClick={() => {
                            setCurrentItem(item)
                            setIsEditingItem(true)
                          }}
                          className="flex-1 btn-secondary text-xs"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-xs"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {activeItems.length === 0 && (
                  <p className="text-gray-400 text-center py-8">No visible items in this category</p>
                )}
              </div>
            )
          })}

          {categories.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400 mb-4">No menu categories found.</p>
              <button
                onClick={() => setIsEditingCategory(true)}
                className="btn-primary"
              >
                Create Your First Category
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

// Category Form Component
function CategoryForm({ category, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    name: category?.name || '',
    sort_order: category?.sort_order || 0,
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      alert('Category name is required')
      return
    }
    
    onSave({
      ...formData,
      sort_order: parseInt(formData.sort_order) || 0
    })
  }

  return (
    <div className="card">
      <h3 className="text-xl font-bold text-white mb-6">
        {category ? 'Edit Category' : 'Add Category'}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Category Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Sort Order
          </label>
          <input
            type="number"
            value={formData.sort_order}
            onChange={(e) => setFormData(prev => ({ ...prev, sort_order: e.target.value }))}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
            min="0"
          />
        </div>

        <div className="flex space-x-4">
          <button type="submit" className="btn-primary">
            {category ? 'Update' : 'Create'} Category
          </button>
          <button type="button" onClick={onCancel} className="btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

// Item Form Component
function ItemForm({ item, categories, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    category_id: item?.category_id || categories[0]?.id || '',
    name: item?.name || '',
    description: item?.description || '',
    price_gil: item?.price_gil || '',
    image_url: item?.image_url || '',
    sort_order: item?.sort_order || 0,
    is_hidden: item?.is_hidden || false,
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      alert('Item name is required')
      return
    }
    
    if (!formData.category_id) {
      alert('Please select a category')
      return
    }
    
    onSave({
      ...formData,
      price_gil: formData.price_gil ? parseInt(formData.price_gil) : null,
      sort_order: parseInt(formData.sort_order) || 0
    })
  }

  return (
    <div className="card">
      <h3 className="text-xl font-bold text-white mb-6">
        {item ? 'Edit Menu Item' : 'Add Menu Item'}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Category *
          </label>
          <select
            value={formData.category_id}
            onChange={(e) => setFormData(prev => ({ ...prev, category_id: e.target.value }))}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
            required
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Item Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Price (Gil)
            </label>
            <input
              type="number"
              value={formData.price_gil}
              onChange={(e) => setFormData(prev => ({ ...prev, price_gil: e.target.value }))}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
              min="0"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={3}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Item Image
          </label>
          <ImageUpload
            currentImage={formData.image_url}
            onImageUploaded={(url) => setFormData(prev => ({ ...prev, image_url: url }))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Sort Order
          </label>
          <input
            type="number"
            value={formData.sort_order}
            onChange={(e) => setFormData(prev => ({ ...prev, sort_order: e.target.value }))}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
            min="0"
          />
        </div>

        <div className="flex items-center space-x-3 p-3 bg-orange-900/20 border border-orange-500/30 rounded">
          <input
            type="checkbox"
            id="is_hidden"
            checked={formData.is_hidden}
            onChange={(e) => setFormData(prev => ({ ...prev, is_hidden: e.target.checked }))}
            className="w-4 h-4"
          />
          <label htmlFor="is_hidden" className="text-sm text-gray-300">
            Hide this item from the public menu
          </label>
        </div>

        <div className="flex space-x-4">
          <button type="submit" className="btn-primary">
            {item ? 'Update' : 'Create'} Menu Item
          </button>
          <button type="button" onClick={onCancel} className="btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
