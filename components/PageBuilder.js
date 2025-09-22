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

// All elements that can be positioned as overlays
const overlayElements = [
  'floatingText', 'floatingButton', 'text', 'image', 'button', 
  'gallery', 'video', 'testimonial', 'contact', 'hero', 'divider', 'spacer'
]

// Elements that should remain in document flow (backgrounds only)
const flowElements = ['backgroundImage']

export default function PageBuilder({ content, isEditable = false, onSave }) {
  const [elements, setElements] = useState(content?.elements || [])
  const [selectedElement, setSelectedElement] = useState(null)
  const [draggedElement, setDraggedElement] = useState(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [viewMode, setViewMode] = useState('mixed') // 'mixed', 'overlay-only'
  const canvasRef = useRef(null)

  useEffect(() => {
    setElements(content?.elements || [])
  }, [content])

  // Separate flow elements from overlay elements
  const flowElementsList = elements.filter(el => flowElements.includes(el.type))
  const overlayElementsList = elements.filter(el => 
    viewMode === 'overlay-only' 
      ? !flowElements.includes(el.type)
      : overlayElements.includes(el.type)
  )

  const onDragEnd = (result) => {
    if (!result.destination || !isEditable) return

    const newFlowElements = Array.from(flowElementsList)
    const [reorderedItem] = newFlowElements.splice(result.source.index, 1)
    newFlowElements.splice(result.destination.index, 0, reorderedItem)

    const newElements = [...newFlowElements, ...overlayElementsList]
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
    
    // Set initial position for overlay elements
    if (overlayElements.includes(type) || viewMode === 'overlay-only') {
      // Try to center elements or place them in a grid
      const existingOverlays = overlayElementsList.length
      const gridCol = existingOverlays % 3
      const gridRow = Math.floor(existingOverlays / 3)
      
      newElement.props.position = {
        x: 100 + (gridCol * 220), // Space elements 220px apart
        y: 100 + (gridRow * 150)  // Stack rows 150px apart
      }
      newElement.props.width = newElement.props.width || 200
      newElement.props.height = newElement.props.height || 100
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

  const centerElements = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Get the actual canvas dimensions
    const canvasRect = canvas.getBoundingClientRect()
    const centerX = canvasRect.width / 2
    const totalElements = overlayElementsList.length
    
    if (totalElements === 0) return

    // Arrange elements in a horizontal line, centered
    const elementWidth = 200
    const spacing = 20
    const totalWidth = (totalElements * elementWidth) + ((totalElements - 1) * spacing)
    const startX = centerX - (totalWidth / 2)
    
    overlayElementsList.forEach((element, index) => {
      const newX = Math.max(0, startX + (index * (elementWidth + spacing)))
      updateElement(element.id, {
        position: { 
          x: newX, 
          y: element.props.position?.y || 100 
        },
        width: elementWidth
      })
    })
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
    
    // Constrain to canvas bounds
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
        height: 300
      },
      text: {
        content: 'Enter your text here...',
        fontSize: 'text-base',
        textAlign: 'left',
        animation: 'fade-in',
        position: { x: 100, y: 100 },
        width: 200,
        height: 100
      },
      image: {
        src: '',
        alt: 'Image',
        size: 'medium',
        alignment: 'center',
        animation: 'fade-in',
        position: { x: 100, y: 100 },
        width: 200,
        height: 150
      },
      button: {
        text: 'Click Me',
        link: '#',
        style: 'primary',
        size: 'medium',
        alignment: 'center',
        animation: 'fade-in',
        position: { x: 100, y: 100 },
        width: 120,
        height: 40
      },
      contact: {
        title: 'Contact Us',
        fields: ['name', 'email', 'message'],
        animation: 'fade-in',
        position: { x: 100, y: 100 },
        width: 300,
        height: 400
      },
      gallery: {
        images: [],
        columns: 3,
        spacing: 'medium',
        animation: 'fade-in',
        position: { x: 100, y: 100 },
        width: 400,
        height: 300
      },
      video: {
        src: '',
        autoplay: false,
        muted: true,
        loop: false,
        animation: 'fade-in',
        position: { x: 100, y: 100 },
        width: 400,
        height: 225
      },
      spacer: {
        height: 'medium',
        position: { x: 100, y: 100 },
        width: 300,
        height: 50
      },
      divider: {
        style: 'line',
        color: 'white',
        thickness: 'thin',
        position: { x: 100, y: 100 },
        width: 300,
        height: 20
      },
      testimonial: {
        quote: 'Amazing experience!',
        author: 'Anonymous',
        role: '',
        avatar: '',
        animation: 'fade-in',
        position: { x: 100, y: 100 },
        width: 300,
        height: 200
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
        width: 200,
        height: 60,
        animation: 'fade-in'
      },
      floatingButton: {
        text: 'Floating Button',
        link: '#',
        style: 'primary',
        size: 'medium',
        position: { x: 50, y: 50 },
        width: 150,
        height: 40,
        animation: 'fade-in'
      }
    }
    return defaults[type] || {}
  }
  
  return (
    <div className="min-h-screen relative" ref={canvasRef}>
      {isEditable && (
        <div className="fixed top-20 right-4 z-50 space-y-2">
          <ElementToolbar 
            onAddElement={addElement} 
            onCenterElements={centerElements}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
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

      {/* Flow Elements (backgrounds, spacers) */}
      {viewMode === 'mixed' && (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="page-elements">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="min-h-screen"
              >
                {flowElementsList.map((element, index) => {
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

                {flowElementsList.length === 0 && overlayElementsList.length === 0 && isEditable && (
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
      )}

      {/* Overlay Elements */}
      {overlayElementsList.map((element) => {
        const Component = componentMap[element.type]
        if (!Component) return null

        const isSelected = selectedElement?.id === element.id

        return (
          <div
            key={element.id}
            className={`absolute z-30 ${isEditable ? 'group' : ''} ${
              isDragging && draggedElement?.id === element.id ? 'opacity-75' : ''
            } ${
              isSelected ? 'ring-2 ring-blue-400 ring-opacity-50' : ''
            }`}
            style={{
              left: `${element.props.position?.x || 0}px`,
              top: `${element.props.position?.y || 0}px`,
              width: `${element.props.width || 200}px`,
              minHeight: `${element.props.height || 100}px`,
              cursor: isEditable ? 'move' : 'default'
            }}
            onMouseDown={(e) => handleElementMouseDown(e, element)}
          >
            {isEditable && (
              <div className="absolute -top-8 left-0 opacity-0 group-hover:opacity-100 transition-opacity z-40">
                <div className="flex space-x-1 bg-black/80 rounded px-2 py-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedElement(element)
                    }}
                    className="text-blue-400 hover:text-blue-300 text-xs px-1"
                  >
                    Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      removeElement(element.id)
                    }}
                    className="text-red-400 hover:text-red-300 text-xs px-1"
                  >
                    ×
                  </button>
                </div>
              </div>
            )}
            <div className={`w-full h-full ${
              isEditable ? 'border-2 border-dashed border-transparent group-hover:border-blue-400 transition-colors' : ''
            }`}>
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

// Enhanced Element Toolbar
function ElementToolbar({ onAddElement, onCenterElements, viewMode, onViewModeChange }) {
  const [isOpen, setIsOpen] = useState(false)

  const elements = [
    { type: 'hero', label: 'Hero Section', icon: '🎯', category: 'layout' },
    { type: 'backgroundImage', label: 'Background Image', icon: '🌄', category: 'layout' },
    { type: 'text', label: 'Text Block', icon: '📝', category: 'content' },
    { type: 'floatingText', label: 'Floating Text', icon: '💭', category: 'content' },
    { type: 'image', label: 'Image', icon: '🖼️', category: 'media' },
    { type: 'button', label: 'Button', icon: '🔘', category: 'interactive' },
    { type: 'floatingButton', label: 'Floating Button', icon: '🎈', category: 'interactive' },
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
    interactive: 'Interactive'
  }

  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4 max-w-xs">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="btn-primary flex-1 mr-2"
        >
          {isOpen ? 'Close' : 'Add Element'}
        </button>
        <button
          onClick={onCenterElements}
          className="btn-secondary text-xs px-2 py-1"
          title="Center all overlay elements"
        >
          Center
        </button>
      </div>

      {/* View Mode Toggle */}
      <div className="mb-4">
        <div className="flex bg-black/20 rounded-lg p-1">
          <button
            onClick={() => onViewModeChange('mixed')}
            className={`flex-1 text-xs px-2 py-1 rounded ${
              viewMode === 'mixed' ? 'bg-nightshade-600 text-white' : 'text-gray-300'
            }`}
          >
            Mixed
          </button>
          <button
            onClick={() => onViewModeChange('overlay-only')}
            className={`flex-1 text-xs px-2 py-1 rounded ${
              viewMode === 'overlay-only' ? 'bg-nightshade-600 text-white' : 'text-gray-300'
            }`}
          >
            Overlay
          </button>
        </div>
      </div>

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
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-white/10 rounded-lg flex items-center space-x-2 transition-colors"
                    >
                      <span className="text-lg">{element.icon}</span>
                      <span className="text-sm">{element.label}</span>
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

// Enhanced Element Editor
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

  const updateSize = (dimension, value) => {
    updateProp(dimension, parseFloat(value) || 100)
  }

  const isOverlayElement = overlayElements.includes(element.type)

  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4 w-80 max-h-96 overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold capitalize flex items-center space-x-2">
          <span>{element.type} Settings</span>
          {isOverlayElement && (
            <span className="text-xs bg-purple-500 px-2 py-0.5 rounded">OVERLAY</span>
          )}
        </h3>
        <button onClick={onClose} className="text-red-400 hover:text-red-300 text-lg">×</button>
      </div>

      <div className="space-y-4">
        {/* Position and Size controls for overlay elements */}
        {isOverlayElement && (
          <div className="p-3 bg-purple-500/10 rounded border border-purple-500/30">
            <h4 className="text-sm font-medium text-purple-300 mb-2">Position & Size</h4>
            <div className="grid grid-cols-2 gap-2 mb-2">
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
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-300 mb-1">Width</label>
                <input
                  type="number"
                  value={props.width || 200}
                  onChange={(e) => updateSize('width', e.target.value)}
                  className="w-full px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-300 mb-1">Height</label>
                <input
                  type="number"
                  value={props.height || 100}
                  onChange={(e) => updateSize('height', e.target.value)}
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
    case 'image':
      return (
        <>
          <input
            type="url"
            placeholder="Image URL"
            value={props.src || ''}
            onChange={(e) => updateProp('src', e.target.value)}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
          />
          <input
            type="text"
            placeholder="Alt Text"
            value={props.alt || ''}
            onChange={(e) => updateProp('alt', e.target.value)}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
          />
        </>
      )
    default:
      return <div className="text-gray-400 text-sm">No settings available for this element type</div>
  }
}
