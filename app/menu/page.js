'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function MenuPage() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMenu()
  }, [])

  const fetchMenu = async () => {
    try {
      const { data: categoriesData } = await supabase
        .from('menu_categories')
        .select(`
          *,
          menu_items (*)
        `)
        .order('sort_order')

      // Sort menu items within each category
      const sortedCategories = categoriesData?.map(category => ({
        ...category,
        menu_items: category.menu_items?.sort((a, b) => a.sort_order - b.sort_order) || []
      })) || []

      setCategories(sortedCategories)
    } catch (error) {
      console.error('Error fetching menu:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-nightshade-400 to-purple-400 bg-clip-text text-transparent animate-glow">
            Menu
          </h1>
          <p className="text-lg text-gray-300">
            Discover our exquisite offerings
          </p>
        </div>

        {categories.map((category) => (
          <div key={category.id} className="mb-12">
            <h2 className="text-3xl font-bold mb-8 text-center text-nightshade-300">
              {category.name}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {category.menu_items.map((item) => (
                <div key={item.id} className="card hover:scale-105 transition-transform duration-300">
                  {item.image_url && (
                    <div className="mb-4 -mx-6 -mt-6">
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-full h-48 object-cover rounded-t-xl"
                      />
                    </div>
                  )}

                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-bold text-nightshade-300">
                      {item.name}
                    </h3>
                    {item.price_gil !== null && (
                      <span className="text-lg font-bold text-purple-400 ml-4 whitespace-nowrap">
                        {item.price_gil.toLocaleString()} gil
                      </span>
                    )}
                  </div>

                  {item.description && (
                    <p className="text-gray-300 text-sm leading-relaxed">
                      {item.description}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {category.menu_items.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-400">No items in this category yet.</p>
              </div>
            )}
          </div>
        ))}

        {categories.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">Menu coming soon...</p>
          </div>
        )}
      </div>
    </div>
  )
}
