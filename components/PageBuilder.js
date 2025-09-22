'use client'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import BackgroundImageSection from '@/components/builder/BackgroundImageSection'
import FloatingTextSection from '@/components/builder/FloatingTextSection'
import FloatingButtonSection from '@/components/builder/FloatingButtonSection'

// Import all page builder components
import HeroSection from '@/components/builder/HeroSection'
import TextSection from '@/components/builder/TextSection'
import ImageSection from '@/components/builder/ImageSection'
import ButtonSection from '@/components/builder/ButtonSection'
import ContactForm from '@/components/builder/ContactForm'
import GallerySection from '@/components/builder/GallerySection'
import VideoSection from '@/components/builder/VideoSection'
import SpacerSection from '@/components/builder/SpacerSection'
import DividerSection from '@/components/builder/DividerSection'
import TestimonialSection from '@/components/builder/TestimonialSection'

const componentMap = {
  hero: HeroSection,
  text: TextSection,
  image: ImageSection,
  button: ButtonSection,
  contact: ContactForm,
  gallery: GallerySection,
  video: VideoSection,
  spacer: SpacerSection,
  divider: DividerSection,
  testimonial: TestimonialSection,
  backgroundImage: BackgroundImageSection,
  floatingText: FloatingTextSection,
  floatingButton: FloatingButtonSection,
}

export default function PageBuilder({ content, isEditable = false, onSave, onClose }) {
  const [elements, setElements] = useState(content?.elements || [])
  const [selectedElement, setSelectedElement] = useState(null)
  const [draggedElement, setDraggedElement] = useState(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(isEditable)
  const [canvasSize, setCanvasSize] = useState({ width: 1200, height: 800 })
  const canvasRef = useRef(null)

  useEffect(() => {
    setElements(content?.elements || [])
  }, [content])

  useEffect(() => {
    if (isEditable) {
      // Update canvas size to match viewport
      const updateCanvasSize = () => {
        if (canvasRef.current) {
          const rect = canvasRef.current.getBoundingClientRect()
          setCanvasSize({ width: rect.width, height: rect.height })
        }
      }
      
      updateCanvasSize()
      window.addEventListener('resize', updateCanvasSize)
      
      return () => window.removeEventListener('resize', updateCanvasSize)
    }
  }, [isEditable])

  const updateElement = (elementId, newProps) => {
    const newElements = elements.map(el =>
      el.id === elementId ? { ...el, props: { ...el.props, ...newProps } } : el
    )
    setElements(newElements)
    if (onSave) {
      onSave({ elements: newElements })
    }
  }

  const addElement = (type) => {
    const newElement = {
      id: `${type}-${Date.now()}`,
      type,
      props: getDefaultProps(type)
    }
    
    // Position new elements in center with slight offset for each new element
    const existingElements = elements.length
    const centerX = canvasSize.width / 2 - 100 // Offset by half default width
    const centerY = 100 + (existingElements * 50) // Stack with offset
    
    newElement.props.position = {
      x: Math.max(50, centerX),
      y: Math.max(50, centerY)
    }
    
    const newElements = [...elements, newElement]
    setElements(newElements)
    if (onSave) {
      onSave({ elements: newElements })
    }
  }

  const removeElement = (elementId) => {
    const newElements = elements.filter(el => el.id !== elementId)
    setElements(newElements)
    setSelectedElement(null)
    if (onSave) {
      onSave({ elements: newElements })
    }
  }

  const duplicateElement = (element) => {
    const newElement = {
      ...element,
      id: `${element.type}-${Date.now()}`,
      props: {
        ...element.props,
        position: {
          x: (element.props.position?.x || 0) + 20,
          y: (element.props.position?.y || 0) + 20
        }
      }
    }
    
    const newElements = [...elements, newElement]
    setElements(newElements)
    if (onSave) {
      onSave({ elements: newElements })
    }
  }

  // Element dragging handlers
  const handleElementMouseDown = (e, element) => {
    if (!isEditable) return
    
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return
    
    const offsetX = e.clientX - rect.left - (element.props.position?.x || 0)
    const offsetY = e.clientY - rect.top - (element.props.position?.y || 0)
    
    setDraggedElement(element)
    setDragOffset({ x: offsetX, y: offsetY })
    setIsDragging(true)
    setSelectedElement(element)
    
    e.preventDefault()
    e.stopPropagation()
  }

  const handleMouseMove = (e) => {
    if (!isDragging || !draggedElement || !canvasRef.current) return
    
    const rect = canvasRef.current.getBoundingClientRect()
    const newX = e.clientX - rect.left - dragOffset.x
    const newY = e.clientY - rect.top - dragOffset.y
    
    // Constrain to canvas bounds with element dimensions
    const elementWidth = draggedElement.props.width || 200
    const elementHeight = draggedElement.props.height || 100
    const constrainedX = Math.max(0, Math.min(newX, rect.width - elementWidth))
    const constrainedY = Math.max(0, Math.min(newY, rect.height - elementHeight))
    
    updateElement(draggedElement.id, { 
      position: { x: constrainedX, y: constrainedY }
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    setDraggedElement(null)
    setDragOffset({ x: 0, y: 0 })
  }

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, draggedElement, dragOffset])

  const getDefaultProps = (type) => {
    const defaults = {
      hero: {
        title: 'Hero Title',
        subtitle: 'Hero Subtitle',
        backgroundType: 'gradient',
        gradient: 'from-nightshade-900 to-purple-900',
        textAlign: 'center',
        animation: 'fade-in',
        position: { x: 100, y: 100 },
        width: 400,
        height: 200,
        zIndex: 10
      },
      text: {
        content: 'Enter your text here...',
        fontSize: 'text-base',
        textAlign: 'center',
        animation: 'fade-in',
        position: { x: 100, y: 100 },
        width: 300,
        height: 80,
        zIndex: 10,
        backgroundColor: 'transparent',
        textColor: 'text-white',
        padding: 'p-4'
      },
      image: {
        src: 'https://via.placeholder.com/300x200',
        alt: 'Image',
        animation: 'fade-in',
        position: { x: 100, y: 100 },
        width: 300,
        height: 200,
        zIndex: 10
      },
      button: {
        text: 'Click Me',
        link: '#',
        style: 'primary',
        size: 'medium',
        animation: 'fade-in',
        position: { x: 100, y: 100 },
        width: 150,
        height: 50,
        zIndex: 10
      },
      navbar: {
        brand: 'Brand',
        links: [
          { text: 'Home', url: '#' },
          { text: 'About', url: '#about' },
          { text: 'Contact', url: '#contact' }
        ],
        position: { x: 0, y: 0 },
        width: 1200,
        height: 60,
        zIndex: 50,
        backgroundColor: 'bg-black/90',
        textColor: 'text-white'
      },
      footer: {
        content: 'Copyright 2024. All rights reserved.',
        links: [],
        position: { x: 0, y: 700 },
        width: 1200,
        height: 100,
        zIndex: 10,
        backgroundColor: 'bg-gray-900',
        textColor: 'text-gray-300'
      },
      section: {
        content: '',
        backgroundColor: 'bg-gray-800/50',
        position: { x: 50, y: 100 },
        width: 500,
        height: 300,
        zIndex: 5,
        padding: 'p-8'
      },
      card: {
        title: 'Card Title',
        content: 'Card content goes here...',
        image: '',
        position: { x: 100, y: 100 },
        width: 300,
        height: 250,
        zIndex: 10,
        backgroundColor: 'bg-white/10',
        borderRadius: 'rounded-lg'
      },
      backgroundImage: {
        backgroundImage: 'https://via.placeholder.com/1200x800',
        overlayOpacity: 0.6,
        overlayColor: 'black',
        position: { x: 0, y: 0 },
        width: 1200,
        height: 800,
        zIndex: 1
      },
      // Legacy floating components
      floatingText: {
        content: 'Floating Text',
        fontSize: 'text-2xl',
        textAlign: 'center',
        textColor: 'text-white',
        backgroundColor: 'bg-black/50',
        padding: 'px-6 py-3',
        borderRadius: 'rounded-lg',
        position: { x: 100, y: 100 },
        width: 200,
        height: 60,
        zIndex: 20
      },
      floatingButton: {
        text: 'Floating Button',
        link: '#',
        style: 'primary',
        size: 'medium',
        position: { x: 100, y: 100 },
        width: 150,
        height: 40,
        zIndex: 20
      }
    }
    return defaults[type] || {}
  }

  // Sort elements by zIndex for proper layering
  const sortedElements = [...elements].sort((a, b) => (a.props.zIndex || 10) - (b.props.zIndex || 10))
  
  if (!isEditable) {
    // Preview mode - render normally
    return (
      <div className="min-h-screen relative">
        {sortedElements.map((element) => {
          const Component = componentMap[element.type]
          if (!Component) return null

          return (
            <div
              key={element.id}
              className="absolute"
              style={{
                left: `${element.props.position?.x || 0}px`,
                top: `${element.props.position?.y || 0}px`,
                width: `${element.props.width || 200}px`,
                minHeight: `${element.props.height || 100}px`,
                zIndex: element.props.zIndex || 10
              }}
            >
              <Component {...element.props} />
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex">
      {/* Sidebar Toolbar */}
      <div className="w-80 bg-gray-900 border-r border-gray-700 flex flex-col">
        <ElementToolbar 
          onAddElement={addElement}
          onClose={onClose}
        />
        
        {selectedElement && (
          <ElementEditor
            element={selectedElement}
            onUpdate={updateElement}
            onRemove={removeElement}
            onDuplicate={duplicateElement}
            onClose={() => setSelectedElement(null)}
          />
        )}
      </div>

      {/* Main Canvas */}
      <div className="flex-1 relative overflow-hidden">
        {/* Canvas Header */}
        <div className="absolute top-0 left-0 right-0 bg-black/80 backdrop-blur-sm border-b border-gray-700 z-40 p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <h2 className="text-white font-semibold">Page Builder</h2>
              <div className="text-sm text-gray-400">
                Canvas: {canvasSize.width} × {canvasSize.height}
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setElements([])}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded"
              >
                Clear All
              </button>
              <button
                onClick={onClose}
                className="px-4 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded"
              >
                Done
              </button>
            </div>
          </div>
        </div>

        {/* Canvas Area */}
        <div 
          ref={canvasRef}
          className="absolute inset-0 pt-16 bg-gray-800"
          style={{ 
            backgroundImage: 'radial-gradient(circle, #374151 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }}
        >
          {/* Render all elements as absolute positioned overlays */}
          {sortedElements.map((element) => {
            const Component = componentMap[element.type]
            if (!Component) return null

            const isSelected = selectedElement?.id === element.id

            return (
              <div
                key={element.id}
                className={`absolute group cursor-move ${
                  isDragging && draggedElement?.id === element.id ? 'opacity-75' : ''
                } ${
                  isSelected ? 'ring-2 ring-blue-400' : 'hover:ring-1 hover:ring-blue-300'
                }`}
                style={{
                  left: `${element.props.position?.x || 0}px`,
                  top: `${element.props.position?.y || 0}px`,
                  width: `${element.props.width || 200}px`,
                  minHeight: `${element.props.height || 100}px`,
                  zIndex: element.props.zIndex || 10
                }}
                onMouseDown={(e) => handleElementMouseDown(e, element)}
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedElement(element)
                }}
              >
                {/* Element Controls */}
                <div className="absolute -top-8 left-0 opacity-0 group-hover:opacity-100 transition-opacity z-50">
                  <div className="flex space-x-1 bg-black/90 rounded px-2 py-1 text-xs">
                    <span className="text-gray-300">{element.type}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        duplicateElement(element)
                      }}
                      className="text-blue-400 hover:text-blue-300 px-1"
                      title="Duplicate"
                    >
                      ⧉
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        updateElement(element.id, { 
                          zIndex: Math.max(1, (element.props.zIndex || 10) - 1)
                        })
                      }}
                      className="text-yellow-400 hover:text-yellow-300 px-1"
                      title="Send Back"
                    >
                      ↓
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        updateElement(element.id, { 
                          zIndex: (element.props.zIndex || 10) + 1
                        })
                      }}
                      className="text-yellow-400 hover:text-yellow-300 px-1"
                      title="Bring Forward"
                    >
                      ↑
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        removeElement(element.id)
                      }}
                      className="text-red-400 hover:text-red-300 px-1"
                      title="Delete"
                    >
                      ×
                    </button>
                  </div>
                </div>

                {/* Element Resize Handles */}
                {isSelected && (
                  <>
                    <div 
                      className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 cursor-se-resize z-50"
                      onMouseDown={(e) => {
                        e.stopPropagation()
                        // Add resize logic here if needed
                      }}
                    />
                    <div className="absolute -top-1 -left-1 w-2 h-2 bg-blue-500 rounded-full z-50" />
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full z-50" />
                    <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-blue-500 rounded-full z-50" />
                  </>
                )}

                {/* Component Wrapper */}
                <div className="w-full h-full overflow-hidden">
                  <Component
                    {...element.props}
                    isEditing={true}
                    onUpdate={(newProps) => updateElement(element.id, newProps)}
                  />
                </div>
              </div>
            )
          })}

          {/* Empty State */}
          {elements.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-gray-400">
                <h3 className="text-2xl font-bold mb-4">Start Building Your Page</h3>
                <p className="mb-4">Add elements from the sidebar to get started</p>
                <p className="text-sm">Drag and drop elements anywhere on the canvas</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Enhanced Element Toolbar
function ElementToolbar({ onAddElement, onClose }) {
  const [activeCategory, setActiveCategory] = useState('layout')

  const elements = {
    layout: [
      { type: 'backgroundImage', label: 'Background', icon: '🌄' },
      { type: 'section', label: 'Section', icon: '📦' },
      { type: 'navbar', label: 'Navigation', icon: '🧭' },
      { type: 'footer', label: 'Footer', icon: '⬇️' },
      { type: 'hero', label: 'Hero Section', icon: '🎯' },
      { type: 'spacer', label: 'Spacer', icon: '📏' },
      { type: 'divider', label: 'Divider', icon: '➖' },
    ],
    content: [
      { type: 'text', label: 'Text Block', icon: '📝' },
      { type: 'floatingText', label: 'Floating Text', icon: '💭' },
      { type: 'card', label: 'Card', icon: '🃏' },
      { type: 'testimonial', label: 'Testimonial', icon: '💬' },
    ],
    media: [
      { type: 'image', label: 'Image', icon: '🖼️' },
      { type: 'gallery', label: 'Gallery', icon: '🖼️' },
      { type: 'video', label: 'Video', icon: '🎥' },
    ],
    interactive: [
      { type: 'button', label: 'Button', icon: '🔘' },
      { type: 'floatingButton', label: 'Floating Button', icon: '🎈' },
      { type: 'contact', label: 'Contact Form', icon: '📋' },
    ]
  }

  const categories = Object.keys(elements)

  return (
    <div className="flex flex-col h-full p-4 space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-white">Elements</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white text-xl"
        >
          ×
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-1">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              activeCategory === category
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>

      {/* Elements Grid */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-2 gap-2">
          {elements[activeCategory]?.map((element) => (
            <button
              key={element.type}
              onClick={() => onAddElement(element.type)}
              className="p-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-left transition-colors group"
            >
              <div className="text-2xl mb-2">{element.icon}</div>
              <div className="text-sm font-medium text-white group-hover:text-blue-300">
                {element.label}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// Enhanced Element Editor
function ElementEditor({ element, onUpdate, onRemove, onDuplicate, onClose }) {
  const [props, setProps] = useState(element.props)

  const updateProp = (key, value) => {
    const newProps = { ...props, [key]: value }
    setProps(newProps)
    onUpdate(element.id, newProps)
  }

  const updatePosition = (axis, value) => {
    const newPosition = { ...props.position, [axis]: parseInt(value) || 0 }
    updateProp('position', newPosition)
  }

  const updateSize = (dimension, value) => {
    updateProp(dimension, parseInt(value) || 100)
  }

  return (
    <div className="flex-1 p-4 border-t border-gray-700 overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-white capitalize">
          {element.type} Settings
        </h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white"
        >
          ×
        </button>
      </div>

      <div className="space-y-4">
        {/* Position & Size Controls */}
        <div className="bg-gray-800 p-3 rounded">
          <h4 className="text-sm font-medium text-gray-300 mb-2">Position & Size</h4>
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div>
              <label className="block text-xs text-gray-400 mb-1">X</label>
              <input
                type="number"
                value={props.position?.x || 0}
                onChange={(e) => updatePosition('x', e.target.value)}
                className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Y</label>
              <input
                type="number"
                value={props.position?.y || 0}
                onChange={(e) => updatePosition('y', e.target.value)}
                className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Width</label>
              <input
                type="number"
                value={props.width || 200}
                onChange={(e) => updateSize('width', e.target.value)}
                className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Height</label>
              <input
                type="number"
                value={props.height || 100}
                onChange={(e) => updateSize('height', e.target.value)}
                className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Z-Index</label>
            <input
              type="number"
              value={props.zIndex || 10}
              onChange={(e) => updateProp('zIndex', parseInt(e.target.value) || 10)}
              className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
            />
          </div>
        </div>

        {/* Element-specific controls */}
        {renderElementEditor(element.type, props, updateProp)}

        {/* Actions */}
        <div className="space-y-2">
          <button
            onClick={() => onDuplicate(element)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded transition-colors"
          >
            Duplicate Element
          </button>
          <button
            onClick={() => onRemove(element.id)}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded transition-colors"
          >
            Remove Element
          </button>
        </div>
      </div>
    </div>
  )
}

function renderElementEditor(type, props, updateProp) {
  switch (type) {
    case 'hero':
      return (
        <>
          <input
            type="text"
            placeholder="Title"
            value={props.title || ''}
            onChange={(e) => updateProp('title', e.target.value)}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
          />
          <input
            type="text"
            placeholder="Subtitle"
            value={props.subtitle || ''}
            onChange={(e) => updateProp('subtitle', e.target.value)}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
          />
          <select
            value={props.backgroundType || 'gradient'}
            onChange={(e) => updateProp('backgroundType', e.target.value)}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
          >
            <option value="gradient">Gradient</option>
            <option value="image">Image</option>
            <option value="video">Video</option>
          </select>
        </>
      )
    case 'text':
      return (
        <>
          <textarea
            placeholder="Content"
            value={props.content || ''}
            onChange={(e) => updateProp('content', e.target.value)}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white h-24 resize-none"
          />
          <select
            value={props.fontSize || 'text-base'}
            onChange={(e) => updateProp('fontSize', e.target.value)}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
          >
            <option value="text-sm">Small</option>
            <option value="text-base">Medium</option>
            <option value="text-lg">Large</option>
            <option value="text-xl">Extra Large</option>
          </select>
        </>
      )
    case 'button':
      return (
        <>
          <input
            type="text"
            placeholder="Button Text"
            value={props.text || ''}
            onChange={(e) => updateProp('text', e.target.value)}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
          />
          <input
            type="url"
            placeholder="Link URL"
            value={props.link || ''}
            onChange={(e) => updateProp('link', e.target.value)}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
          />
          <select
            value={props.style || 'primary'}
            onChange={(e) => updateProp('style', e.target.value)}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
          >
            <option value="primary">Primary</option>
            <option value="secondary">Secondary</option>
            <option value="outline">Outline</option>
          </select>
        </>
      )
    default:
      return <div className="text-gray-400 text-sm">No settings available</div>
  }
}

    case 'image':
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Image URL</label>
            <input
              type="url"
              value={props.src || ''}
              onChange={(e) => updateProp('src', e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Alt Text</label>
            <input
              type="text"
              value={props.alt || ''}
              onChange={(e) => updateProp('alt', e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Border Radius</label>
            <select
              value={props.borderRadius || 'rounded-none'}
              onChange={(e) => updateProp('borderRadius', e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
            >
              <option value="rounded-none">None</option>
              <option value="rounded">Small</option>
              <option value="rounded-lg">Large</option>
              <option value="rounded-full">Circle</option>
            </select>
          </div>
        </div>
      )

    case 'hero':
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Title</label>
            <input
              type="text"
              value={props.title || ''}
              onChange={(e) => updateProp('title', e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Subtitle</label>
            <textarea
              value={props.subtitle || ''}
              onChange={(e) => updateProp('subtitle', e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm h-16 resize-none"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Background Type</label>
            <select
              value={props.backgroundType || 'gradient'}
              onChange={(e) => updateProp('backgroundType', e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
            >
              <option value="gradient">Gradient</option>
              <option value="image">Image</option>
              <option value="solid">Solid Color</option>
            </select>
          </div>
        </div>
      )

    case 'backgroundImage':
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Background Image URL</label>
            <input
              type="url"
              value={props.backgroundImage || ''}
              onChange={(e) => updateProp('backgroundImage', e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Overlay Opacity</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={props.overlayOpacity || 0.6}
              onChange={(e) => updateProp('overlayOpacity', parseFloat(e.target.value))}
              className="w-full"
            />
            <span className="text-xs text-gray-400">{props.overlayOpacity || 0.6}</span>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Overlay Color</label>
            <select
              value={props.overlayColor || 'black'}
              onChange={(e) => updateProp('overlayColor', e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
            >
              <option value="black">Black</option>
              <option value="white">White</option>
              <option value="blue">Blue</option>
              <option value="purple">Purple</option>
              <option value="green">Green</option>
            </select>
          </div>
        </div>
      )

    case 'card':
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Card Title</label>
            <input
              type="text"
              value={props.title || ''}
              onChange={(e) => updateProp('title', e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Card Content</label>
            <textarea
              value={props.content || ''}
              onChange={(e) => updateProp('content', e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm h-20 resize-none"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Card Image URL</label>
            <input
              type="url"
              value={props.image || ''}
              onChange={(e) => updateProp('image', e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
            />
          </div>
        </div>
      )

    case 'navbar':
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Brand Name</label>
            <input
              type="text"
              value={props.brand || ''}
              onChange={(e) => updateProp('brand', e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Background Color</label>
            <select
              value={props.backgroundColor || 'bg-black/90'}
              onChange={(e) => updateProp('backgroundColor', e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
            >
              <option value="bg-black/90">Black</option>
              <option value="bg-white/90">White</option>
              <option value="bg-blue-600/90">Blue</option>
              <option value="bg-gray-800/90">Gray</option>
            </select>
          </div>
        </div>
      )

    case 'section':
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Background Color</label>
            <select
              value={props.backgroundColor || 'bg-gray-800/50'}
              onChange={(e) => updateProp('backgroundColor', e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
            >
              <option value="transparent">Transparent</option>
              <option value="bg-black/50">Semi-Black</option>
              <option value="bg-white/10">Semi-White</option>
              <option value="bg-gray-800/50">Dark Gray</option>
              <option value="bg-blue-600/20">Light Blue</option>
              <option value="bg-purple-600/20">Light Purple</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Padding</label>
            <select
              value={props.padding || 'p-8'}
              onChange={(e) => updateProp('padding', e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
            >
              <option value="p-2">Small</option>
              <option value="p-4">Medium</option>
              <option value="p-8">Large</option>
              <option value="p-12">Extra Large</option>
            </select>
          </div>
        </div>
      )

    default:
      return (
        <div className="text-gray-400 text-sm">
          No additional settings available for this element type.
        </div>
      )
  }
} text-sm h-20 resize-none"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Font Size</label>
            <select
              value={props.fontSize || 'text-base'}
              onChange={(e) => updateProp('fontSize', e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
            >
              <option value="text-xs">Extra Small</option>
              <option value="text-sm">Small</option>
              <option value="text-base">Medium</option>
              <option value="text-lg">Large</option>
              <option value="text-xl">Extra Large</option>
              <option value="text-2xl">2X Large</option>
              <option value="text-3xl">3X Large</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Text Color</label>
            <select
              value={props.textColor || 'text-white'}
              onChange={(e) => updateProp('textColor', e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
            >
              <option value="text-white">White</option>
              <option value="text-black">Black</option>
              <option value="text-gray-500">Gray</option>
              <option value="text-blue-500">Blue</option>
              <option value="text-green-500">Green</option>
              <option value="text-red-500">Red</option>
              <option value="text-purple-500">Purple</option>
              <option value="text-yellow-500">Yellow</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Background</label>
            <select
              value={props.backgroundColor || 'transparent'}
              onChange={(e) => updateProp('backgroundColor', e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Font Size</label>
            <select
              value={props.fontSize || 'text-base'}
              onChange={(e) => updateProp('fontSize', e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
            >
              <option value="text-xs">Extra Small</option>
              <option value="text-sm">Small</option>
              <option value="text-base">Medium</option>
              <option value="text-lg">Large</option>
              <option value="text-xl">Extra Large</option>
              <option value="text-2xl">2X Large</option>
              <option value="text-3xl">3X Large</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Text Color</label>
            <select
              value={props.textColor || 'text-white'}
              onChange={(e) => updateProp('textColor', e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
            >
              <option value="text-white">White</option>
              <option value="text-black">Black</option>
              <option value="text-gray-500">Gray</option>
              <option value="text-blue-500">Blue</option>
              <option value="text-green-500">Green</option>
              <option value="text-red-500">Red</option>
              <option value="text-purple-500">Purple</option>
              <option value="text-yellow-500">Yellow</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Background</label>
            <select
              value={props.backgroundColor || 'transparent'}
              onChange={(e) => updateProp('backgroundColor', e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
            >
              <option value="transparent">Transparent</option>
              <option value="bg-black/50">Semi-Black</option>
              <option value="bg-white/50">Semi-White</option>
              <option value="bg-gray-800/80">Dark Gray</option>
              <option value="bg-blue-600/50">Semi-Blue</option>
              <option value="bg-green-600/50">Semi-Green</option>
              <option value="bg-red-600/50">Semi-Red</option>
              <option value="bg-purple-600/50">Semi-Purple</option>
            </select>
          </div>
        </div>
      )

    default:
      return (
        <div className="text-gray-400 text-sm">
          No additional settings available for this element type.
        </div>
      )
  }
}
