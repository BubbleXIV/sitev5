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

export default function PageBuilder({ content, isEditable = false, onSave }) {
  const [elements, setElements] = useState(content?.elements || [])
  const [selectedElement, setSelectedElement] = useState(null)

  useEffect(() => {
    setElements(content?.elements || [])
  }, [content])

  const onDragEnd = (result) => {
    if (!result.destination || !isEditable) return

    const newElements = Array.from(elements)
    const [reorderedItem] = newElements.splice(result.source.index, 1)
    newElements.splice(result.destination.index, 0, reorderedItem)

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
    <div className="min-h-screen">
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

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="page-elements">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="min-h-screen"
            >
              {elements.map((element, index) => {
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
                              className="bg-nightshade-600 text-white px-2 py-1 rounded text-xs hover:bg-nightshade-700"
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

              {elements.length === 0 && isEditable && (
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
    </div>
  )
}

// Element Toolbar Component
function ElementToolbar({ onAddElement }) {
  const [isOpen, setIsOpen] = useState(false)

  const elements = [
    { type: 'hero', label: 'Hero Section', icon: '🎯' },
    { type: 'text', label: 'Text Block', icon: '📝' },
    { type: 'image', label: 'Image', icon: '🖼️' },
    { type: 'button', label: 'Button', icon: '🔘' },
    { type: 'backgroundImage', label: 'Background Image', icon: '🌄' },
    { type: 'floatingText', label: 'Floating Text', icon: '💭' },
    { type: 'floatingButton', label: 'Floating Button', icon: '🎈' },
    { type: 'gallery', label: 'Gallery', icon: '🖼️' },
    { type: 'video', label: 'Video', icon: '🎥' },
    { type: 'contact', label: 'Contact Form', icon: '📋' },
    { type: 'testimonial', label: 'Testimonial', icon: '💬' },
    { type: 'spacer', label: 'Spacer', icon: '📏' },
    { type: 'divider', label: 'Divider', icon: '➖' },
  ]

  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full btn-primary mb-4"
      >
        {isOpen ? 'Close' : 'Add Element'}
      </button>

      {isOpen && (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {elements.map((element) => (
            <button
              key={element.type}
              onClick={() => {
                onAddElement(element.type)
                setIsOpen(false)
              }}
              className="w-full text-left px-3 py-2 hover:bg-white/10 rounded-lg flex items-center space-x-2"
            >
              <span className="text-lg">{element.icon}</span>
              <span className="text-sm">{element.label}</span>
            </button>
          ))}
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

  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4 w-80 max-h-96 overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold capitalize">{element.type} Settings</h3>
        <button onClick={onClose} className="text-red-400 hover:text-red-300">×</button>
      </div>

      <div className="space-y-4">
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
      return (
        <>
          <textarea
            placeholder="Content"
            value={props.content || ''}
            onChange={(e) => updateProp('content', e.target.value)}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white h-24"
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
