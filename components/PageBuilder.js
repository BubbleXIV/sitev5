'use client'
import { useState, useEffect, useRef } from 'react'
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

// Elements that support absolute positioning (overlays)
const overlayElements = ['floatingText', 'floatingButton']

export default function PageBuilder({ content, isEditable = false, onSave }) {
  const [elements, setElements] = useState(content?.elements || [])
  const [selectedElement, setSelectedElement] = useState(null)
  const [draggedOverlay, setDraggedOverlay] = useState(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [isDraggingOverlay, setIsDraggingOverlay] = useState(false)
  const canvasRef = useRef(null)

  useEffect(() => {
    setElements(content?.elements || [])
  }, [content])

  // Separate regular elements from overlay elements
  const regularElements = elements.filter(el => !overlayElements.includes(el.type))
  const overlayElementsList = elements.filter(el => overlayElements.includes(el.type))

  const onDragEnd = (result) => {
    if (!result.destination || !isEditable) return

    const newRegularElements = Array.from(regularElements)
    const [reorderedItem] = newRegularElements.splice(result.source.index, 1)
    newRegularElements.splice(result.destination.index, 0, reorderedItem)

    const newElements = [...newRegularElements, ...overlayElementsList]
    setElements(newElements)
    if (onSave) {
      onSave({ elements: newElements })
    }
  }

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
    
    // Add some randomness to overlay positions
    if (overlayElements.includes(type)) {
      newElement.props.position = {
        x: Math.random() * 300 + 50,
        y: Math.random() * 300 + 100
      }
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

  // Overlay dragging handlers
  const handleOverlayMouseDown = (e, element) => {
    if (!isEditable) return
    
    const rect = canvasRef.current.getBoundingClientRect()
    const offsetX = e.clientX - rect.left - (element.props.position?.x || 0)
    const offsetY = e.clientY - rect.top - (element.props.position?.y || 0)
    
    setDraggedOverlay(element)
    setDragOffset({ x: offsetX, y: offsetY })
    setIsDraggingOverlay(true)
    setSelectedElement(element)
    
    e.preventDefault()
    e.stopPropagation()
  }

  const handleOverlayMouseMove = (e) => {
    if (!isDraggingOverlay || !draggedOverlay || !canvasRef.current) return
    
    const rect = canvasRef.current.getBoundingClientRect()
    const newX = e.clientX - rect.left - dragOffset.x
    const newY = e.clientY - rect.top - dragOffset.y
    
    // Constrain to canvas bounds
    const constrainedX = Math.max(0, Math.min(newX, rect.width - 200)) // Assume 200px width
    const constrainedY = Math.max(0, Math.min(newY, rect.height - 100)) // Assume 100px height
    
    updateElement(draggedOverlay.id, { 
      position: { x: constrainedX, y: constrainedY }
    })
  }

  const handleOverlayMouseUp = () => {
    setIsDraggingOverlay(false)
    setDraggedOverlay(null)
    setDragOffset({ x: 0, y: 0 })
  }

  // Global mouse event handlers for overlay dragging
  useEffect(() => {
    if (isDraggingOverlay) {
      document.addEventListener('mousemove', handleOverlayMouseMove)
      document.addEventListener('mouseup', handleOverlayMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleOverlayMouseMove)
      document.removeEventListener('mouseup', handleOverlayMouseUp)
    }
  }, [isDraggingOverlay, draggedOverlay, dragOffset])

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
  
  return (
    <div className="min-h-screen relative" ref={canvasRef}>
      {isEditable && (
        <div className="fixed top-20 right-4 z-50 space-y-2">
          <ElementToolbar onAddElement={addElement} />
          {selectedElement && (
            <ElementEditor
              element={selectedElement}
              onUpdate={updateElement}
              onRemove={removeElement}
              onClose={() => setSelectedElement(null)}
            />
          )}
        </div>
      )}

      {/* Regular Elements with Drag and Drop */}
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="page-elements">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="min-h-screen"
            >
              {regularElements.map((element, index) => {
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
                          <div className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="flex space-x-2">
                              <div
                                {...provided.dragHandleProps}
                                className="bg-nightshade-600 text-white px-2 py-1 rounded text-xs hover:bg-nightshade-700 cursor-move"
                              >
                                ⋮⋮
                              </div>
                              <button
                                onClick={() => setSelectedElement(element)}
                                className="bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700"
                              >
                                Edit
                              </button>
                            </div>
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

              {regularElements.length === 0 && overlayElementsList.length === 0 && isEditable && (
                <div className="min-h-screen flex items-center justify-center">
                  <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4 text-gray-400">
                      Start Building Your Page
                    </h2>
                    <p className="text-gray-500 mb-8">
                      Add elements using the toolbar on the right
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Overlay Elements with Absolute Positioning */}
      {overlayElementsList.map((element) => {
        const Component = componentMap[element.type]
        if (!Component) return null

        return (
          <div
            key={element.id}
            className={`absolute z-20 ${isEditable ? 'group' : ''} ${
              isDraggingOverlay && draggedOverlay?.id === element.id ? 'opacity-75' : ''
            }`}
            style={{
              left: `${element.props.position?.x || 0}px`,
              top: `${element.props.position?.y || 0}px`,
              cursor: isEditable ? 'move' : 'default'
            }}
            onMouseDown={(e) => handleOverlayMouseDown(e, element)}
          >
            {isEditable && (
              <div className="absolute -top-8 left-0 opacity-0 group-hover:opacity-100 transition-opacity z-30">
                <div className="flex space-x-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedElement(element)
                    }}
                    className="bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      removeElement(element.id)
                    }}
                    className="bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700"
                  >
                    ×
                  </button>
                </div>
              </div>
            )}
            <div className={isEditable ? 'border-2 border-dashed border-transparent group-hover:border-blue-400 transition-colors' : ''}>
              <Component
                {...element.props}
                isEditing={isEditable}
                onUpdate={(newProps) => updateElement(element.id, newProps)}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

// Element Toolbar Component
function ElementToolbar({ onAddElement }) {
  const [isOpen, setIsOpen] = useState(false)

  const elements = [
    { type: 'hero', label: 'Hero Section', icon: '🎯', category: 'layout' },
    { type: 'text', label: 'Text Block', icon: '📝', category: 'content' },
    { type: 'image', label: 'Image', icon: '🖼️', category: 'media' },
    { type: 'button', label: 'Button', icon: '🔘', category: 'interactive' },
    { type: 'backgroundImage', label: 'Background Image', icon: '🌄', category: 'layout' },
    { type: 'floatingText', label: 'Floating Text', icon: '💭', category: 'overlay' },
    { type: 'floatingButton', label: 'Floating Button', icon: '🎈', category: 'overlay' },
    { type: 'gallery', label: 'Gallery', icon: '🖼️', category: 'media' },
    { type: 'video', label: 'Video', icon: '🎥', category: 'media' },
    { type: 'contact', label: 'Contact Form', icon: '📋', category: 'interactive' },
    { type: 'testimonial', label: 'Testimonial', icon: '💬', category: 'content' },
    { type: 'spacer', label: 'Spacer', icon: '📏', category: 'layout' },
    { type: 'divider', label: 'Divider', icon: '➖', category: 'layout' },
  ]

  const categories = {
    layout: 'Layout',
    content: 'Content', 
    media: 'Media',
    interactive: 'Interactive',
    overlay: 'Overlay'
  }

  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4 max-w-xs">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full btn-primary mb-4"
      >
        {isOpen ? 'Close Toolbar' : 'Add Element'}
      </button>

      {isOpen && (
        <div className="space-y-4 max-h-80 overflow-y-auto">
          {Object.entries(categories).map(([categoryKey, categoryName]) => {
            const categoryElements = elements.filter(el => el.category === categoryKey)
            if (categoryElements.length === 0) return null

            return (
              <div key={categoryKey}>
                <h4 className="text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                  {categoryName}
                </h4>
                <div className="space-y-1">
                  {categoryElements.map((element) => (
                    <button
                      key={element.type}
                      onClick={() => {
                        onAddElement(element.type)
                        if (!overlayElements.includes(element.type)) {
                          setIsOpen(false)
                        }
                      }}
                      className={`w-full text-left px-3 py-2 hover:bg-white/10 rounded-lg flex items-center space-x-2 transition-colors ${
                        overlayElements.includes(element.type) ? 'bg-purple-500/20 border border-purple-500/30' : ''
                      }`}
                    >
                      <span className="text-lg">{element.icon}</span>
                      <span className="text-sm">{element.label}</span>
                      {overlayElements.includes(element.type) && (
                        <span className="text-xs bg-purple-500 px-1 py-0.5 rounded">OVERLAY</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
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
    const newPosition = { ...props.position, [axis]: parseFloat(value) || 0 }
    updateProp('position', newPosition)
  }

  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4 w-80 max-h-96 overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold capitalize flex items-center space-x-2">
          <span>{element.type} Settings</span>
          {overlayElements.includes(element.type) && (
            <span className="text-xs bg-purple-500 px-2 py-0.5 rounded">OVERLAY</span>
          )}
        </h3>
        <button onClick={onClose} className="text-red-400 hover:text-red-300 text-lg">×</button>
      </div>

      <div className="space-y-4">
        {/* Position controls for overlay elements */}
        {overlayElements.includes(element.type) && (
          <div className="p-3 bg-purple-500/10 rounded border border-purple-500/30">
            <h4 className="text-sm font-medium text-purple-300 mb-2">Position</h4>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-300 mb-1">X Position</label>
                <input
                  type="number"
                  value={props.position?.x || 0}
                  onChange={(e) => updatePosition('x', e.target.value)}
                  className="w-full px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-300 mb-1">Y Position</label>
                <input
                  type="number"
                  value={props.position?.y || 0}
                  onChange={(e) => updatePosition('y', e.target.value)}
                  className="w-full px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {renderElementEditor(element.type, props, updateProp)}

        <div className="pt-4 border-t border-white/20">
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
    case 'floatingText':
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
            <option value="text-2xl">2X Large</option>
          </select>
          {type === 'floatingText' && (
            <>
              <select
                value={props.textColor || 'text-white'}
                onChange={(e) => updateProp('textColor', e.target.value)}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
              >
                <option value="text-white">White</option>
                <option value="text-black">Black</option>
                <option value="text-purple-400">Purple</option>
                <option value="text-blue-400">Blue</option>
                <option value="text-green-400">Green</option>
                <option value="text-red-400">Red</option>
              </select>
              <select
                value={props.backgroundColor || 'bg-black/50'}
                onChange={(e) => updateProp('backgroundColor', e.target.value)}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
              >
                <option value="bg-transparent">Transparent</option>
                <option value="bg-black/50">Semi-Black</option>
                <option value="bg-white/50">Semi-White</option>
                <option value="bg-purple-600/50">Semi-Purple</option>
                <option value="bg-blue-600/50">Semi-Blue</option>
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
      return <div className="text-gray-400 text-sm">No settings available for this element type</div>
  }
}
