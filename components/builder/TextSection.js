'use client'
import { motion } from 'framer-motion'

export default function TextSection({
  content = 'Enter your text here...',
  fontSize = 'text-base',
  textAlign = 'left',
  padding = 'py-8',
  animation = 'fade-in',
  button1Text = '',
  button1Link = '',
  button1Style = 'primary',
  button2Text = '',
  button2Link = '',
  button2Style = 'secondary',
  button3Text = '',
  button3Link = '',
  button3Style = 'outline',
  button4Text = '',
  button4Link = '',
  button4Style = 'outline',
  button5Text = '',
  button5Link = '',
  button5Style = 'outline',
  isEditing = false,
  onUpdate
}) {
  const animations = {
    'fade-in': { opacity: [0, 1], transition: { duration: 0.8 } },
    'slide-up': { y: [30, 0], opacity: [0, 1], transition: { duration: 0.8 } },
    'slide-left': { x: [30, 0], opacity: [0, 1], transition: { duration: 0.8 } },
    'slide-right': { x: [-30, 0], opacity: [0, 1], transition: { duration: 0.8 } },
  }

  const buttonStyles = {
    primary: 'px-6 py-3 bg-gradient-to-r from-nightshade-600 to-purple-600 hover:from-nightshade-700 hover:to-purple-700 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-white font-medium',
    secondary: 'px-6 py-3 glass hover:bg-white/20 rounded-lg transition-all duration-300 border border-nightshade-500/50 hover:border-nightshade-400 text-white font-medium',
    outline: 'px-6 py-3 border-2 border-nightshade-500 hover:border-nightshade-400 hover:bg-nightshade-500/10 rounded-lg transition-all duration-300 text-white font-medium'
  }

  const buttons = [
    { text: button1Text, link: button1Link, style: button1Style },
    { text: button2Text, link: button2Link, style: button2Style },
    { text: button3Text, link: button3Link, style: button3Style },
    { text: button4Text, link: button4Link, style: button4Style },
    { text: button5Text, link: button5Link, style: button5Style },
  ].filter(btn => btn.text)

  return (
    <motion.div
      className={`${padding}`}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={{
        visible: animations[animation] || animations['fade-in']
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {isEditing ? (
          <div className="space-y-4">
            <textarea
              value={content}
              onChange={(e) => onUpdate({ content: e.target.value })}
              className={`w-full ${fontSize} text-${textAlign} bg-transparent border-2 border-dashed border-white/50 p-4 text-white min-h-32 resize-none`}
              placeholder="Enter your text here..."
            />

            {/* Optional Button Controls */}
            <div className="mt-6 pt-6 border-t border-white/30 bg-gray-900/30 p-4 rounded-lg">
              <h4 className="text-sm font-semibold mb-3 text-white">Optional Buttons (up to 5)</h4>
              <p className="text-xs text-gray-400 mb-4">Leave empty to hide buttons</p>
              
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((num) => {
                  const textKey = `button${num}Text`
                  const linkKey = `button${num}Link`
                  const styleKey = `button${num}Style`
                  const currentText = eval(textKey)
                  const currentLink = eval(linkKey)
                  const currentStyle = eval(styleKey)
                  
                  return (
                    <div key={num} className="grid grid-cols-3 gap-2 bg-gray-800/50 p-2 rounded">
                      <input
                        type="text"
                        value={currentText || ''}
                        onChange={(e) => onUpdate({ [textKey]: e.target.value })}
                        className="w-full text-sm"
                        placeholder={`Button ${num} Text`}
                      />
                      <input
                        type="text"
                        value={currentLink || ''}
                        onChange={(e) => onUpdate({ [linkKey]: e.target.value })}
                        className="w-full text-sm"
                        placeholder={`/link${num}`}
                      />
                      <select
                        value={currentStyle || 'outline'}
                        onChange={(e) => onUpdate({ [styleKey]: e.target.value })}
                        className="w-full text-sm"
                      >
                        <option value="primary">Primary</option>
                        <option value="secondary">Secondary</option>
                        <option value="outline">Outline</option>
                      </select>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className={`${fontSize} text-${textAlign} text-gray-300 leading-relaxed whitespace-pre-wrap`}>
              {content}
            </div>

            {/* Render Buttons */}
            {buttons.length > 0 && (
              <div className={`flex flex-wrap gap-3 mt-6 justify-${textAlign === 'center' ? 'center' : textAlign === 'right' ? 'end' : 'start'}`}>
                {buttons.map((btn, index) => (
                  <a
                    key={index}
                    href={btn.link || '#'}
                    className={buttonStyles[btn.style] || buttonStyles.outline}
                  >
                    {btn.text}
                  </a>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}
