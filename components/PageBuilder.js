'use client'

import { useState, useEffect, useRef } from 'react'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { motion } from 'framer-motion'

// Import all page builder components
import BackgroundImageSection from '@/components/builder/BackgroundImageSection'
import FloatingTextSection from '@/components/builder/FloatingTextSection'
import FloatingButtonSection from '@/components/builder/FloatingButtonSection'
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

// Map component types to actual components
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

// Elements to be treated as overlays with absolute positioning
const overlayElements = [
  'floatingText',
  'floatingButton',
  'text',
  'image',
  'button',
  'gallery',
  'video',
  'testimonial',
  'contact',
  'hero',
  'divider',
  'spacer'
]

// Elements to remain in document flow (backgrounds only)
const flowElements = ['backgroundImage']

export default function PageBuilder({ content, isEditable = false, onSave }) {
  // State with full elements list
  const [elements, setElements] = useState(content?.elements || [])
  // Currently selected element id & dragged element states
  const [selectedElement, setSelectedElement] = useState(null)
  const [draggedElement, setDraggedElement] = useState(null)
  // Mouse drag offset to maintain relative cursor position on drag
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  // Flag whether dragging is active
  const [isDragging, setIsDragging] = useState(false)
  // View mode: mixed shows all, overlay-only hides flow elems
  const [viewMode, setViewMode] = useState('mixed')

  // Canvas ref expanded to full viewport dimensions for proper centering
  const canvasRef = useRef(null)

  useEffect(() => {
    setElements(content?.elements || [])
  }, [content])

  // Separate elements to flow or overlay, adjusted for view mode
  const flowElementsList = elements.filter(el => flowElements.includes(el.type))
  const overlayElementsList = elements.filter(el =>
    viewMode === 'overlay-only'
      ? !flowElements.includes(el.type)
      : overlayElements.includes(el.type)
  )

  // Enhanced drag end handler for flow elements reorder only
  const onDragEnd = (result) => {
    if (!result.destination || !isEditable) return

    const newFlowElements = Array.from(flowElementsList)
    // Reorder dragged element within flow list
    const [reorderedItem] = newFlowElements.splice(result.source.index, 1)
    newFlowElements.splice(result.destination.index, 0, reorderedItem)

    // Merge reordered flow with overlay elements, preserving overlay order
    const newElements = [...newFlowElements, ...overlayElementsList]
    setElements(newElements)

    if (onSave) {
      onSave({ elements: newElements })
    }
  }

  // Function to update an element's properties by id with saving capability
  const updateElement = (elementId, newProps) => {
    const newElements = elements.map(el =>
      el.id === elementId
        ? { ...el, props: { ...el.props, ...newProps } }
        : el
    )
    setElements(newElements)
    if (onSave) {
      onSave({ elements: newElements })
    }
  }

    // Add new element to page builder
  const addElement = (type) => {
    const newElement = {
      id: `${type}-${Date.now()}`,
      type,
      props: getDefaultProps(type),
    }

    // Set initial position for overlays
    if (overlayElements.includes(type) || viewMode === 'overlay-only') {
      const existingOverlays = overlayElementsList.length
      const gridCol = existingOverlays % 3
      const gridRow = Math.floor(existingOverlays / 3)
      newElement.props.position = {
        x: 100 + gridCol * 220,
        y: 100 + gridRow * 150,
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

  // Remove element by ID
  const removeElement = (elementId) => {
    const newElements = elements.filter((el) => el.id !== elementId)
    setElements(newElements)
    setSelectedElement(null)
    if (onSave) {
      onSave({ elements: newElements })
    }
  }

  // Center overlay elements horizontally in the canvas
  const centerElements = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const canvasRect = canvas.getBoundingClientRect()
    const centerX = canvasRect.width / 2
    const totalElements = overlayElementsList.length
    if (totalElements === 0) return

    const elementWidth = 200
    const spacing = 20
    const totalWidth = totalElements * elementWidth + (totalElements - 1) * spacing
    const startX = centerX - totalWidth / 2

    overlayElementsList.forEach((element, index) => {
      const newX = Math.max(0, startX + index * (elementWidth + spacing))
      updateElement(element.id, {
        position: { x: newX, y: element.props.position?.y || 100 },
        width: elementWidth,
      })
    })
  }

  // Mouse down begins drag on overlay element
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

  // Mouse move updates position of dragged element
  const handleMouseMove = (e) => {
    if (!isDragging || !draggedElement || !canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const newX = e.clientX - rect.left - dragOffset.x
    const newY = e.clientY - rect.top - dragOffset.y

    // Constrain movement within canvas boundary
    const elementWidth = draggedElement.props.width || 200
    const elementHeight = draggedElement.props.height || 100

    const constrainedX = Math.max(0, Math.min(newX, rect.width - elementWidth))
    const constrainedY = Math.max(0, Math.min(newY, rect.height - elementHeight))

    updateElement(draggedElement.id, {
      position: { x: constrainedX, y: constrainedY },
    })
  }

  // Mouse up ends dragging session
  const handleMouseUp = () => {
    setIsDragging(false)
    setDraggedElement(null)
    setDragOffset({ x: 0, y: 0 })
  }

  // Add and remove mouse event listeners dynamically based on drag state
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

  // Returns default properties for new elements by type
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
        height: 300,
      },
      text: {
        content: 'Enter your text here...',
        fontSize: 'text-base',
        textAlign: 'left',
        animation: 'fade-in',
        position: { x: 100, y: 100 },
        width: 200,
        height: 100,
      },
      image: {
        src: '',
        alt: 'Image',
        size: 'medium',
        alignment: 'center',
        animation: 'fade-in',
        position: { x: 100, y: 100 },
        width: 200,
        height: 150,
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
        height: 40,
      },
      contact: {
        title: 'Contact Us',
        fields: ['name', 'email', 'message'],
        animation: 'fade-in',
        position: { x: 100, y: 100 },
        width: 300,
        height: 400,
      },
      gallery: {
        images: [],
        columns: 3,
        spacing: 'medium',
        animation: 'fade-in',
        position: { x: 100, y: 100 },
        width: 400,
        height: 300,
      },
      video: {
        src: '',
        autoplay: false,
        muted: true,
        loop: false,
        animation: 'fade-in',
        position: { x: 100, y: 100 },
        width: 400,
        height: 225,
      },
      spacer: {
        height: 'medium',
        position: { x: 100, y: 100 },
        width: 300,
        height: 50,
      },
      divider: {
        style: 'line',
        color: 'white',
        thickness: 'thin',
        position: { x: 100, y: 100 },
        width: 300,
        height: 20,
      },
      testimonial: {
        quote: 'Amazing experience!',
        author: 'Anonymous',
        role: '',
        avatar: '',
        animation: 'fade-in',
        position: { x: 100, y: 100 },
        width: 300,
        height: 200,
      },
      backgroundImage: {
        backgroundImage: '',
        overlayOpacity: 0.6,
        overlayColor: 'black',
        minHeight: 'min-h-screen',
        animation: 'fade-in',
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
        animation: 'fade-in',
      },
      floatingButton: {
        text: 'Floating Button',
        link: '#',
        style: 'primary',
        size: 'medium',
        position: { x: 50, y: 50 },
        width: 150,
        height: 40,
        animation: 'fade-in',
      },
    }
    return defaults[type] || {}
  }

  // Snap to grid helper function
  const snapToGrid = (value, gridSize = 10) => {
    return Math.round(value / gridSize) * gridSize
  }

  // Update overlay element position with snapping constraints
  const updateOverlayPosition = (elementId, newX, newY) => {
    const snappedX = snapToGrid(newX)
    const snappedY = snapToGrid(newY)
    updateElement(elementId, { position: { x: snappedX, y: snappedY } })
  }

  // Render individual element component by type
  const renderElement = (element) => {
    const Component = componentMap[element.type]
    if (!Component) return null
    return <Component key={element.id} {...element.props} />
  }

  // Render overlay elements with drag, select, and resize handlers
  const renderOverlayElement = (element, index) => {
    const isSelected = selectedElement?.id === element.id

    const style = {
      position: 'absolute',
      left: element.props.position?.x || 0,
      top: element.props.position?.y || 0,
      width: element.props.width || 'auto',
      height: element.props.height || 'auto',
      zIndex: isSelected ? 1000 : 10 + index,
      border: isSelected ? '2px solid #007BFF' : 'none',
      cursor: isEditable ? 'move' : 'default',
      backgroundColor: 'transparent',
    }

    return (
      <div
        key={element.id}
        style={style}
        onMouseDown={(e) => handleElementMouseDown(e, element)}
      >
        {renderElement(element)}
        {isSelected && isEditable && (
          <ResizeHandles
            element={element}
            onResize={(w, h) => updateElement(element.id, { width: w, height: h })}
          />
        )}
      </div>
    )
  }

  // Resize handles component (simple bottom-right drag handle)
  const ResizeHandles = ({ element, onResize }) => {
    const handleRef = useRef(null)
    const [dragging, setDragging] = useState(false)
    const [startPos, setStartPos] = useState({ x: 0, y: 0 })
    const [startSize, setStartSize] = useState({ width: 0, height: 0 })

    const onMouseDown = (e) => {
      e.stopPropagation()
      setDragging(true)
      setStartPos({ x: e.clientX, y: e.clientY })
      setStartSize({ width: element.props.width, height: element.props.height })
    }

    const onMouseMove = (e) => {
      if (!dragging) return
      e.preventDefault()
      const dx = e.clientX - startPos.x
      const dy = e.clientY - startPos.y
      const newWidth = snapToGrid(startSize.width + dx)
      const newHeight = snapToGrid(startSize.height + dy)
      onResize(newWidth, newHeight)
    }

    const onMouseUp = () => {
      setDragging(false)
    }

    useEffect(() => {
      if (dragging) {
        document.addEventListener('mousemove', onMouseMove)
        document.addEventListener('mouseup', onMouseUp)
      }
      return () => {
        document.removeEventListener('mousemove', onMouseMove)
        document.removeEventListener('mouseup', onMouseUp)
      }
    }, [dragging])

    return (
      <div
        ref={handleRef}
        onMouseDown={onMouseDown}
        style={{
          position: 'absolute',
          right: 0,
          bottom: 0,
          width: 16,
          height: 16,
          backgroundColor: '#007BFF',
          cursor: 'nwse-resize',
          zIndex: 11000,
        }}
      />
    )
  }

  // Layer controls to bring overlay elements forward or backward
  const bringForward = () => {
    if (!selectedElement) return
    const idx = overlayElementsList.findIndex((el) => el.id === selectedElement.id)
    if (idx < overlayElementsList.length - 1) {
      const newOverlayOrder = [...overlayElementsList]
      const [el] = newOverlayOrder.splice(idx, 1)
      newOverlayOrder.splice(idx + 1, 0, el)
      const newElements = [...flowElementsList, ...newOverlayOrder]
      setElements(newElements)
      if (onSave) onSave({ elements: newElements })
    }
  }

  const sendBackward = () => {
    if (!selectedElement) return
    const idx = overlayElementsList.findIndex((el) => el.id === selectedElement.id)
    if (idx > 0) {
      const newOverlayOrder = [...overlayElementsList]
      const [el] = newOverlayOrder.splice(idx, 1)
      newOverlayOrder.splice(idx - 1, 0, el)
      const newElements = [...flowElementsList, ...newOverlayOrder]
      setElements(newElements)
      if (onSave) onSave({ elements: newElements })
    }
  }

  return (
    <div
      ref={canvasRef}
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        overflow: 'auto',
        backgroundColor: '#f0f0f0',
        border: '1px solid #ccc',
        userSelect: isDragging ? 'none' : 'auto',
        padding: 20,
        boxSizing: 'border-box',
      }}
      onMouseDown={() => setSelectedElement(null)}
    >
      {/* Buttons for adding elements */}
      {isEditable && (
        <div style={{ marginBottom: 10, display: 'flex', gap: 8 }}>
          {Object.keys(componentMap).map((type) => (
            <button key={type} onClick={() => addElement(type)}>{`Add ${type}`}</button>
          ))}
          <button onClick={centerElements}>Center Overlays</button>
          <button onClick={() => setViewMode(viewMode === 'mixed' ? 'overlay-only' : 'mixed')}>
            {viewMode === 'mixed' ? 'Show Overlays Only' : 'Show All Elements'}
          </button>
        </div>
      )}

      {/* Flow elements droppable region */}
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="flow" type="flow">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps} style={{ width: '100%' }}>
              {flowElementsList.map((element, index) => (
                <Draggable key={element.id} draggableId={element.id} index={index}>
                  {(providedFlow) => (
                    <div
                      ref={providedFlow.innerRef}
                      {...providedFlow.draggableProps}
                      {...providedFlow.dragHandleProps}
                      style={{ marginBottom: 15, ...providedFlow.draggableProps.style }}
                    >
                      {renderElement(element)}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Overlay elements droppable region */}
      <DragDropContext onDragEnd={() => {}}>
        <Droppable droppableId="overlay" type="overlay">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              style={{ position: 'relative', width: '100%', height: '100%' }}
            >
              {overlayElementsList.map((element, index) => renderOverlayElement(element, index))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Layer control panel */}
      {selectedElement && isEditable && (
        <div
          style={{
            position: 'fixed',
            top: 20,
            right: 20,
            width: 220,
            backgroundColor: '#fff',
            padding: 15,
            borderRadius: 8,
            boxShadow: '0 0 15px rgba(0,0,0,0.1)',
            zIndex: 12000,
          }}
        >
          <h4>Layer Controls ({selectedElement.type})</h4>
          <button onClick={bringForward} style={{ marginRight: 10 }}>
            Bring Forward
          </button>
          <button onClick={sendBackward}>Send Backward</button>
          <button onClick={() => removeElement(selectedElement.id)} style={{ marginTop: 10, color: 'red' }}>
            Delete Element
          </button>
        </div>
      )}
    </div>
  )
}
