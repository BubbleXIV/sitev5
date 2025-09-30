'use client'
import { motion } from 'framer-motion'
import ImageUpload from '@/components/ImageUpload'

export default function CardSection({
  header = 'Section Header',
  subtext = 'Section description text',
  card1Image = '',
  card1Description = '',
  card1Link = '',
  card2Image = '',
  card2Description = '',
  card2Link = '',
  card3Image = '',
  card3Description = '',
  card3Link = '',
  card4Image = '',
  card4Description = '',
  card4Link = '',
  card5Image = '',
  card5Description = '',
  card5Link = '',
  button1Text = '',
  button1Link = '',
  button2Text = '',
  button2Link = '',
  button3Text = '',
  button3Link = '',
  button4Text = '',
  button4Link = '',
  button5Text = '',
  button5Link = '',
  animation = 'fade-in',
  isEditing = false,
  onUpdate
}) {
  const animations = {
    'fade-in': { opacity: [0, 1], transition: { duration: 0.8 } },
    'slide-up': { y: [30, 0], opacity: [0, 1], transition: { duration: 0.8 } },
  }

  const cards = [
    { image: card1Image, description: card1Description, link: card1Link },
    { image: card2Image, description: card2Description, link: card2Link },
    { image: card3Image, description: card3Description, link: card3Link },
    { image: card4Image, description: card4Description, link: card4Link },
    { image: card5Image, description: card5Description, link: card5Link },
  ].filter(card => card.image || card.description)

  const buttons = [
    { text: button1Text, link: button1Link },
    { text: button2Text, link: button2Link },
    { text: button3Text, link: button3Link },
    { text: button4Text, link: button4Link },
    { text: button5Text, link: button5Link },
  ].filter(btn => btn.text)

  if (isEditing) {
    return (
      <div className="p-6 border-2 border-green-500 rounded-lg bg-gray-900/50 my-8">
        <h3 className="text-lg font-bold mb-4 text-green-300">Card Section</h3>
        
        <div className="space-y-6">
          {/* Header & Subtext */}
          <div>
            <label className="block text-sm font-medium mb-2">Section Header</label>
            <input
              type="text"
              key={`header-${header}`}
              defaultValue={header}
              onBlur={(e) => onUpdate({ header: e.target.value })}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Subtext</label>
            <textarea
              key={`subtext-${subtext}`}
              defaultValue={subtext}
              onBlur={(e) => onUpdate({ subtext: e.target.value })}
              className="w-full min-h-20"
            />
          </div>

          {/* Cards */}
          <div className="border-t border-white/30 pt-4">
            <h4 className="text-sm font-semibold mb-3">Cards (up to 5)</h4>
            {[1, 2, 3, 4, 5].map((num) => {
              const imgKey = `card${num}Image`
              const descKey = `card${num}Description`
              const linkKey = `card${num}Link`
              const currentImg = eval(imgKey)
              const currentDesc = eval(descKey)
              const currentLink = eval(linkKey)
              
              return (
                <div key={num} className="mb-4 p-3 bg-gray-800/50 rounded">
                  <p className="text-xs text-gray-400 mb-2">Card {num}</p>
                  <ImageUpload
                    currentImage={currentImg}
                    onImageUploaded={(url) => onUpdate({ [imgKey]: url })}
                  />
                  <textarea
                    key={`${descKey}-${currentDesc}`}
                    defaultValue={currentDesc}
                    onBlur={(e) => onUpdate({ [descKey]: e.target.value })}
                    className="w-full mt-2 text-sm"
                    placeholder="Card description"
                  />
                  <input
                    key={`${linkKey}-${currentLink}`}
                    type="text"
                    defaultValue={currentLink}
                    onBlur={(e) => onUpdate({ [linkKey]: e.target.value })}
                    className="w-full mt-2 text-sm"
                    placeholder="Link URL (optional)"
                  />
                </div>
              )
            })}
          </div>

          {/* Buttons */}
          <div className="border-t border-white/30 pt-4">
            <h4 className="text-sm font-semibold mb-3">Bottom Buttons (up to 5)</h4>
            {[1, 2, 3, 4, 5].map((num) => {
              const textKey = `button${num}Text`
              const linkKey = `button${num}Link`
              const currentText = eval(textKey)
              const currentLink = eval(linkKey)
              
              return (
                <div key={num} className="grid grid-cols-2 gap-2 mb-2">
                  <input
                    key={`${textKey}-${currentText}`}
                    type="text"
                    defaultValue={currentText}
                    onBlur={(e) => onUpdate({ [textKey]: e.target.value })}
                    className="w-full text-sm"
                    placeholder={`Button ${num} Text`}
                  />
                  <input
                    key={`${linkKey}-${currentLink}`}
                    type="text"
                    defaultValue={currentLink}
                    onBlur={(e) => onUpdate({ [linkKey]: e.target.value })}
                    className="w-full text-sm"
                    placeholder="Link"
                  />
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      className="py-16 px-4"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={{
        visible: animations[animation] || animations['fade-in']
      }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">{header}</h2>
          <p className="text-xl text-gray-300">{subtext}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {cards.map((card, index) => (
            <div key={index} className="card hover:scale-105 transition-transform">
              {card.image && (
                <img
                  src={card.image}
                  alt={`Card ${index + 1}`}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
              )}
              <p className="text-gray-300 text-sm">{card.description}</p>
              {card.link && (
                <a
                  href={card.link}
                  className="text-nightshade-400 hover:text-nightshade-300 text-sm mt-2 inline-block"
                >
                  Learn More →
                </a>
              )}
            </div>
          ))}
        </div>

        {buttons.length > 0 && (
          <div className="flex flex-wrap gap-3 justify-center mt-12">
            {buttons.map((btn, index) => (
              <a
                key={index}
                href={btn.link || '#'}
                className="px-6 py-3 bg-gradient-to-r from-nightshade-600 to-purple-600 hover:from-nightshade-700 hover:to-purple-700 rounded-lg transition-all text-white font-medium"
              >
                {btn.text}
              </a>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}
