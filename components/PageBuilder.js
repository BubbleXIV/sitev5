'use client'
import { useState, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { motion } from 'framer-motion'
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

// Import template components
import EventTemplate from '@/components/templates/EventTemplate'
import GalleryTemplate from '@/components/templates/GalleryTemplate'
import AffiliateTemplate from '@/components/templates/AffiliateTemplate'

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

const templateMap = {
  event: EventTemplate,
  gallery: GalleryTemplate,
  affiliate: AffiliateTemplate,
}

export default function PageBuilder({ content, isEditable = false, onSave, template }) {
  const [elements, setElements] = useState(content?.elements || [])
  const [selectedElement, setSelectedElement] = useState(null)
  const [isDraggingFloating, setIsDraggingFloating] = useState(false)
  const [draggedFloatingElement, setDraggedFloatingElement] = useState(null)
  const [isResizing, setIsResizing] = useState(false)
  
  // Template-specific state
  const [templateData, setTemplateData] = useState(() => {
    if (template && template !== 'blank') {
      // Extract template-specific data from content
      const { elements, ...templateSpecificData } = content || {}
      return templateSpecificData
    }
    return {}
  })

  useEffect(() => {
    setElements(content?.elements || [])
    if (template && template !== 'blank') {
      const { elements, ...templateSpecificData } = content || {}
      setTemplateData(templateSpecificData)
    }
  }, [content, template])

  // Handle template-specific updates
  const handleTemplateUpdate = (field, value) => {
    const newTemplateData = { ...templateData, [field]: value }
    setTemplateData(newTemplateData)
    
    if (onSave) {
      onSave({
        elements,
        ...newTemplateData
      })
    }
  }

  const onDragEnd = (result) => {
    if (!result.destination || !isEditable) return

    const newElements = Array.from(elements)
    const [reorderedItem] = newElements.splice(result.source.index, 1)
    newElements.splice(result.destination.index, 0, reorderedItem)

    setElements(newElements)
    if (onSave) {
      onSave({ 
        elements: newElements,
        ...templateData
      })
    }
  }

  const updateElement = (elementId, newProps) => {
    const newElements = elements.map(el =>
      el.id === elementId ? { ...el, props: { ...el.props, ...newProps } } : el
    )
    setElements(newElements)
    if (onSave) {
      onSave({ 
        elements: newElements,
        ...templateData
      })
    }
  }

  const addElement = (type) => {
    const newElement = {
      id: `${type}-${Date.now()}`,
      type,
      props: getDefaultProps(type)
    }
    const newElements = [...elements, newElement]
    setElements(newElements)
    if (onSave) {
      onSave({ 
        elements: newElements,
        ...templateData
      })
    }
  }

  const removeElement = (elementId) => {
    const newElements = elements.filter(el => el.id !== elementId)
    setElements(newElements)
    setSelectedElement(null)
    if (onSave) {
      onSave({ 
        elements: newElements,
        ...templateData
      })
    }
  }

  // Floating element drag handlers
  const handleFloatingMouseDown = (e, element) => {
    if (e.button !== 0 || isResizing) return
    
    e.preventDefault()
    setIsDraggingFloating(true)
    setDraggedFloatingElement(element)
    
    const startX = e.clientX - element.props.position.x
    const startY = e.clientY - element.props.position.y
    
    const handleMouseMove = (e) => {
      const newX = Math.max(0, e.clientX - startX)
      const newY = Math.max(0, e.clientY - startY)
      
      updateElement(element.id, {
        position: { x: newX, y: newY }
      })
    }
    
    const handleMouseUp = () => {
      setIsDraggingFloating(false)
      setDraggedFloatingElement(null)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
    
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  const handleResizeMouseDown = (e, element, direction) => {
    e.stopPropagation()
    e.preventDefault()
    
    setIsResizing(true)
    
    const startX = e.clientX
    const startY = e.clientY
    const startWidth = element.props.width || 200
    const startHeight = element.props.height || 60
    
    const handleMouseMove = (e) => {
      let newWidth = startWidth
      let newHeight = startHeight
      
      if (direction.includes('e')) {
        newWidth = Math.max(50, startWidth + (e.clientX - startX))
      }
      if (direction.includes('s')) {
        newHeight = Math.max(30, startHeight + (e.clientY - startY))
      }
      
      updateElement(element.id, {
        width: newWidth,
        height: newHeight
      })
    }
    
    const handleMouseUp = () => {
      setIsResizing(false)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
    
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  const getDefaultProps = (type) => {
    const defaults = {
      hero: {
        title: 'Hero Title',
        subtitle: 'Hero Subtitle',
        backgroundType: 'gradient',
        gradient: 'from-nightshade-900 to-purple-900',
        textAlign: 'center',
        animation: 'fade-in'
      },
      text: {
        content: 'Enter your text here...',
        fontSize: 'text-base',
        textAlign: 'left',
        animation: 'fade-in'
      },
      image: {
        src: '',
        alt: 'Image',
        size: 'medium',
        alignment: 'center',
        animation: 'fade-in'
      },
      button: {
        text: 'Click Me',
        link: '#',
        style: 'primary',
        size: 'medium',
        alignment: 'center',
        animation: 'fade-in'
      },
      contact: {
        title: 'Contact Us',
        fields: ['name', 'email', 'message'],
        animation: 'fade-in'
      },
      gallery: {
        images: [],
        columns: 3,
        spacing: 'medium',
        animation: 'fade-in'
      },
      video: {
        src: '',
        autoplay: false,
        muted: true,
        loop: false,
        animation: 'fade-in'
      },
      spacer: {
        height: 'medium'
      },
      divider: {
        style: 'line',
        color: 'white',
        thickness: 'thin'
      },
      testimonial: {
        quote: 'Amazing experience!',
        author: 'Anonymous',
        role: '',
        avatar: '',
        animation: 'fade-in'
      },
      backgroundImage: {
        backgroundImage: '',
        overlayOpacity: 0.6,
        overlayColor: 'black',
        minHeight: 'min-h-screen',
        animation: 'fade-in'
      },
      floatingText: {
        content: 'Floating Text',
        fontSize: 'text-2xl',
        textAlign: 'center',
        textColor: 'text-white',
        backgroundColor: 'bg-black/50',
        padding: 'px-6 py-3',
        borderRadius: 'rounded-lg',
        position: { x: 50, y: 50 },
        animation: 'fade-in'
      },
      floatingButton: {
        text: 'Floating Button',
        link: '#',
        style: 'primary',
        size: 'medium',
        position: { x: 50, y: 50 },
        animation: 'fade-in'
      }
    }
    return defaults[type] || {}
  }

  // If this is a template page, render the template directly
  if (template && template !== 'blank' && templateMap[template]) {
    const TemplateComponent = templateMap[template]
    return (
      <TemplateComponent
        data={templateData}
        isEditable={isEditable}
        onUpdate={handleTemplateUpdate}
      />
    )
  }
  
  return (
    <div className="min-h-screen relative">
      {isEditable && (
        <div className="fixed top-20 left-4 z-50 bg-gray-900/90 backdrop-blur-md border border-gray-700 rounded-lg p-4 w-64">
          <ElementToolbar onAddElement={addElement} />
          {selectedElement && (
            <div className="mt-4 max-h-96 overflow-y-auto bg-gray-800 rounded-lg">
              <ElementEditor
                element={selectedElement}
                onUpdate={updateElement}
                onRemove={removeElement}
                onClose={() => setSelectedElement(null)}
              />
            </div>
          )}
        </div>
      )}

      {/* Canvas container */}
      <div className="relative" style={{ minHeight: '100vh' }}>
        <div className="min-h-screen">
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="page-elements">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="min-h-screen"
                >
                  {elements.filter(el => el.type !== 'floatingText' && el.type !== 'floatingButton').map((element, index) => {
                    const Component = componentMap[element.type]
                    if (!Component) return null

                    return (
                      <Draggable
                        key={element.id}
                        draggableId={element.id}
                        index={index}
                        isDragDisabled={!isEditable}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`relative ${
                              isEditable ? 'group' : ''
                            } ${
                              snapshot.isDragging ? 'opacity-50' : ''
                            }`}
                          >
                            {isEditable && (
                              <div
                                {...provided.dragHandleProps}
                                className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <button
                                  onClick={() => setSelectedElement(element)}
                                  className="bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700"
                                >
                                  Edit
                                </button>
                              </div>
                            )}
                            <Component
                              {...element.props}
                              isEditing={isEditable}
                              onUpdate={(newProps) => updateElement(element.id, newProps)}
                            />
                          </div>
                        )}
                      </Draggable>
                    )
                  })}
                  {provided.placeholder}

                  {elements.filter(el => el.type !== 'floatingText' && el.type !== 'floatingButton').length === 0 && (
                    <div className="min-h-screen flex items-center justify-center">
                      <div className="text-center">
                        <h2 className="text-2xl font-bold mb-4 text-gray-400">
                          Start Building Your Page
                        </h2>
                        <p className="text-gray-500 mb-8">
                          Add elements using the toolbar on the left
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>

        {/* Floating elements positioned within canvas */}
        {elements.filter(el => el.type === 'floatingText' || el.type === 'floatingButton').map((element) => {
          const Component = componentMap[element.type]
          if (!Component || !element.props.position) return null

          const isSelected = selectedElement?.id === element.id

          return (
            <div
              key={`floating-${element.id}`}
              className={`absolute group z-40 ${
                isEditable ? 'cursor-move' : 'cursor-default'
              } ${
                isDraggingFloating && draggedFloatingElement?.id === element.id ? 'opacity-75' : ''
              } ${
                isSelected ? 'ring-2 ring-blue-400' : (isEditable ? 'hover:ring-1 hover:ring-blue-300' : '')
              }`}
              style={{
                left: `${element.props.position.x}px`,
                top: `${element.props.position.y}px`,
                width: `${element.props.width || 200}px`,
                height: `${element.props.height || 60}px`
              }}
              onMouseDown={isEditable ? (e) => handleFloatingMouseDown(e, element) : undefined}
              onClick={isEditable ? (e) => {
                e.stopPropagation()
                setSelectedElement(element)
              } : undefined}
            >
              {/* Floating element controls */}
              {isEditable && (
                <div className="absolute -top-8 left-0 opacity-0 group-hover:opacity-100 transition-opacity z-50">
                  <div className="flex space-x-1 bg-black/90 rounded px-2 py-1 text-xs">
                    <span className="text-gray-300">{element.type}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedElement(element)
                      }}
                      className="text-blue-400 hover:text-blue-300 px-1"
                      title="Edit"
                    >
                      ✏️
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
              )}

              {/* Resize handles */}
              {isSelected && isEditable && (
                <>
                  <div 
                    className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 cursor-se-resize z-50"
                    onMouseDown={(e) => handleResizeMouseDown(e, element, 'se')}
                  />
                  <div 
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-blue-500 cursor-s-resize z-50"
                    onMouseDown={(e) => handleResizeMouseDown(e, element, 's')}
                  />
                  <div 
                    className="absolute top-1/2 -translate-y-1/2 -right-1 w-3 h-3 bg-blue-500 cursor-e-resize z-50"
                    onMouseDown={(e) => handleResizeMouseDown(e, element, 'e')}
                  />
                </>
              )}

              <Component
                {...element.props}
                isEditing={true}
                onUpdate={(newProps) => updateElement(element.id, newProps)}
              />
            </div>
          )
        })}

// Element Toolbar Component
function ElementToolbar({ onAddElement }) {
  const [activeCategory, setActiveCategory] = useState('layout')

  const elements = {
    layout: [
      { type: 'hero', label: 'Hero Section', icon: '🎯' },
      { type: 'backgroundImage', label: 'Background Image', icon: '🌄' },
      { type: 'spacer', label: 'Spacer', icon: '📏' },
      { type: 'divider', label: 'Divider', icon: '➖' },
    ],
    content: [
      { type: 'text', label: 'Text Block', icon: '📝' },
      { type: 'testimonial', label: 'Testimonial', icon: '💬' },
    ],
    media: [
      { type: 'image', label: 'Image', icon: '🖼️' },
      { type: 'gallery', label: 'Gallery', icon: '🖼️' },
      { type: 'video', label: 'Video', icon: '🎥' },
    ],
    interactive: [
      { type: 'button', label: 'Button', icon: '🔘' },
      { type: 'contact', label: 'Contact Form', icon: '📋' },
    ],
    floating: [
      { type: 'floatingText', label: 'Floating Text', icon: '💭' },
      { type: 'floatingButton', label: 'Floating Button', icon: '🎈' },
    ]
  }

  const categories = Object.keys(elements)

  return (
    <div className="space-y-4">
      {/* Category Tabs */}
      <div className="flex flex-wrap gap-1">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
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
      <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto">
        {elements[activeCategory]?.map((element) => (
          <button
            key={element.type}
            onClick={() => onAddElement(element.type)}
            className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-left transition-colors group flex items-center space-x-2"
          >
            <span className="text-lg">{element.icon}</span>
            <span className="text-sm font-medium text-white group-hover:text-blue-300">
              {element.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

// Element Editor Component
function ElementEditor({ element, onUpdate, onRemove, onClose }) {
  const [props, setProps] = useState(element.props)

  const updateProp = (key, value) => {
    const newProps = { ...props, [key]: value }
    setProps(newProps)
    onUpdate(element.id, newProps)
  }

  const updatePosition = (axis, value) => {
    if (!props.position) return
    const newPosition = { ...props.position, [axis]: parseInt(value) || 0 }
    updateProp('position', newPosition)
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-white capitalize">{element.type} Settings</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-white">×</button>
      </div>

      <div className="space-y-4">
        {/* Position and size controls for floating elements */}
        {element.props.position && (
          <div className="bg-gray-800 p-3 rounded space-y-3">
            <h4 className="text-sm font-medium text-gray-300 mb-2">Position & Size</h4>
            <div className="grid grid-cols-2 gap-2">
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
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Width</label>
                <input
                  type="number"
                  value={props.width || 200}
                  onChange={(e) => updateProp('width', parseInt(e.target.value) || 200)}
                  className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Height</label>
                <input
                  type="number"
                  value={props.height || 60}
                  onChange={(e) => updateProp('height', parseInt(e.target.value) || 60)}
                  className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isStatic"
                checked={props.isStatic || false}
                onChange={(e) => updateProp('isStatic', e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="isStatic" className="text-sm text-gray-300">
                Stay in position when scrolling (Static)
              </label>
            </div>
          </div>
        )}

        {renderElementEditor(element.type, props, updateProp)}

        <div className="pt-4 border-t border-gray-700">
          <button
            onClick={() => onRemove(element.id)}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition-colors"
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
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
          />
          <input
            type="text"
            placeholder="Subtitle"
            value={props.subtitle || ''}
            onChange={(e) => updateProp('subtitle', e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
          />
          <select
            value={props.backgroundType || 'gradient'}
            onChange={(e) => updateProp('backgroundType', e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
          >
            <option value="gradient">Gradient</option>
            <option value="image">Image</option>
            <option value="video">Video</option>
          </select>
        </>
      )
    case 'text':
    case 'floatingText':
      return (
        <>
          <textarea
            placeholder="Content"
            value={props.content || ''}
            onChange={(e) => updateProp('content', e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white h-24"
          />
          <select
            value={props.fontSize || 'text-base'}
            onChange={(e) => updateProp('fontSize', e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
          >
            <option value="text-sm">Small</option>
            <option value="text-base">Medium</option>
            <option value="text-lg">Large</option>
            <option value="text-xl">Extra Large</option>
          </select>
          {type === 'floatingText' && (
            <>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Shape Preset</label>
                <select
                  value={props.shapePreset || 'custom'}
                  onChange={(e) => {
                    const preset = e.target.value
                    updateProp('shapePreset', preset)
                    
                    // Apply preset dimensions
                    switch (preset) {
                      case 'single-line':
                        updateProp('width', 300)
                        updateProp('height', 40)
                        break
                      case 'two-line':
                        updateProp('width', 250)
                        updateProp('height', 60)
                        break
                      case 'paragraph':
                        updateProp('width', 350)
                        updateProp('height', 120)
                        break
                      case 'square':
                        updateProp('width', 200)
                        updateProp('height', 200)
                        break
                      case 'wide-banner':
                        updateProp('width', 500)
                        updateProp('height', 80)
                        break
                    }
                  }}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                >
                  <option value="custom">Custom</option>
                  <option value="single-line">Single Line</option>
                  <option value="two-line">Two Lines</option>
                  <option value="paragraph">Paragraph</option>
                  <option value="square">Square</option>
                  <option value="wide-banner">Wide Banner</option>
                </select>
              </div>
              <select
                value={props.textColor || 'text-white'}
                onChange={(e) => updateProp('textColor', e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
              >
                <option value="text-white">White</option>
                <option value="text-black">Black</option>
                <option value="text-gray-500">Gray</option>
                <option value="text-blue-500">Blue</option>
                <option value="text-red-500">Red</option>
                <option value="text-green-500">Green</option>
                <option value="text-yellow-500">Yellow</option>
                <option value="text-purple-500">Purple</option>
              </select>
              <select
                value={props.backgroundColor || 'bg-black/50'}
                onChange={(e) => updateProp('backgroundColor', e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
              >
                <option value="bg-black/50">Semi Black</option>
                <option value="bg-white/50">Semi White</option>
                <option value="bg-gray-800/80">Dark Gray</option>
                <option value="bg-blue-600/50">Semi Blue</option>
                <option value="bg-red-600/50">Semi Red</option>
                <option value="bg-green-600/50">Semi Green</option>
                <option value="bg-yellow-600/50">Semi Yellow</option>
                <option value="bg-purple-600/50">Semi Purple</option>
                <option value="transparent">Transparent</option>
              </select>
              <select
                value={props.borderRadius || 'rounded-lg'}
                onChange={(e) => updateProp('borderRadius', e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
              >
                <option value="rounded-none">No Rounded</option>
                <option value="rounded-sm">Small Rounded</option>
                <option value="rounded">Medium Rounded</option>
                <option value="rounded-lg">Large Rounded</option>
                <option value="rounded-xl">Extra Large Rounded</option>
                <option value="rounded-full">Fully Rounded</option>
              </select>
            </>
          )}
        </>
      )
    case 'button':
    case 'floatingButton':
      return (
        <>
          <input
            type="text"
            placeholder="Button Text"
            value={props.text || ''}
            onChange={(e) => updateProp('text', e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
          />
          <input
            type="url"
            placeholder="Link URL"
            value={props.link || ''}
            onChange={(e) => updateProp('link', e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
          />
          <select
            value={props.style || 'primary'}
            onChange={(e) => updateProp('style', e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
          >
            <option value="primary">Primary</option>
            <option value="secondary">Secondary</option>
            <option value="outline">Outline</option>
          </select>
        </>
      )
    case 'backgroundImage':
      return (
        <>
          <input
            type="url"
            placeholder="Background Image URL"
            value={props.backgroundImage || ''}
            onChange={(e) => updateProp('backgroundImage', e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
          />
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
        </>
      )
    case 'image':
      return (
        <>
          <input
            type="url"
            placeholder="Image URL"
            value={props.src || ''}
            onChange={(e) => updateProp('src', e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
          />
          <input
            type="text"
            placeholder="Alt Text"
            value={props.alt || ''}
            onChange={(e) => updateProp('alt', e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
          />
        </>
      )
    case 'video':
      return (
        <>
          <input
            type="url"
            placeholder="Video URL"
            value={props.src || ''}
            onChange={(e) => updateProp('src', e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
          />
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="autoplay"
              checked={props.autoplay || false}
              onChange={(e) => updateProp('autoplay', e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="autoplay" className="text-sm text-gray-300">Autoplay</label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="muted"
              checked={props.muted !== false}
              onChange={(e) => updateProp('muted', e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="muted" className="text-sm text-gray-300">Muted</label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="loop"
              checked={props.loop || false}
              onChange={(e) => updateProp('loop', e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="loop" className="text-sm text-gray-300">Loop</label>
          </div>
        </>
      )
    case 'spacer':
      return (
        <select
          value={props.height || 'medium'}
          onChange={(e) => updateProp('height', e.target.value)}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
        >
          <option value="small">Small (2rem)</option>
          <option value="medium">Medium (4rem)</option>
          <option value="large">Large (8rem)</option>
          <option value="xl">Extra Large (12rem)</option>
        </select>
      )
    case 'divider':
      return (
        <>
          <select
            value={props.style || 'line'}
            onChange={(e) => updateProp('style', e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
          >
            <option value="line">Line</option>
            <option value="dashed">Dashed</option>
            <option value="dotted">Dotted</option>
            <option value="double">Double</option>
          </select>
          <select
            value={props.color || 'white'}
            onChange={(e) => updateProp('color', e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
          >
            <option value="white">White</option>
            <option value="gray">Gray</option>
            <option value="blue">Blue</option>
            <option value="red">Red</option>
            <option value="green">Green</option>
            <option value="yellow">Yellow</option>
            <option value="purple">Purple</option>
          </select>
          <select
            value={props.thickness || 'thin'}
            onChange={(e) => updateProp('thickness', e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
          >
            <option value="thin">Thin (1px)</option>
            <option value="medium">Medium (2px)</option>
            <option value="thick">Thick (4px)</option>
          </select>
        </>
      )
    case 'testimonial':
      return (
        <>
          <textarea
            placeholder="Quote"
            value={props.quote || ''}
            onChange={(e) => updateProp('quote', e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white h-24"
          />
          <input
            type="text"
            placeholder="Author Name"
            value={props.author || ''}
            onChange={(e) => updateProp('author', e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
          />
          <input
            type="text"
            placeholder="Role/Title"
            value={props.role || ''}
            onChange={(e) => updateProp('role', e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
          />
          <input
            type="url"
            placeholder="Avatar Image URL"
            value={props.avatar || ''}
            onChange={(e) => updateProp('avatar', e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
          />
        </>
      )
    case 'gallery':
      return (
        <>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Columns</label>
            <select
              value={props.columns || 3}
              onChange={(e) => updateProp('columns', parseInt(e.target.value))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
            >
              <option value={1}>1 Column</option>
              <option value={2}>2 Columns</option>
              <option value={3}>3 Columns</option>
              <option value={4}>4 Columns</option>
              <option value={5}>5 Columns</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Spacing</label>
            <select
              value={props.spacing || 'medium'}
              onChange={(e) => updateProp('spacing', e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
            >
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          </div>
        </>
      )
    case 'contact':
      return (
        <>
          <input
            type="text"
            placeholder="Form Title"
            value={props.title || ''}
            onChange={(e) => updateProp('title', e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
          />
          <div>
            <label className="block text-xs text-gray-400 mb-2">Fields</label>
            <div className="space-y-2">
              {['name', 'email', 'phone', 'message', 'subject'].map(field => (
                <div key={field} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={field}
                    checked={props.fields?.includes(field) || false}
                    onChange={(e) => {
                      const currentFields = props.fields || ['name', 'email', 'message']
                      if (e.target.checked) {
                        updateProp('fields', [...currentFields, field])
                      } else {
                        updateProp('fields', currentFields.filter(f => f !== field))
                      }
                    }}
                    className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                  />
                  <label htmlFor={field} className="text-sm text-gray-300 capitalize">
                    {field}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </>
      )
    default:
      return <div className="text-gray-400 text-sm">No settings available</div>
  }
}
