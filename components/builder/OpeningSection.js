'use client'
import { motion } from 'framer-motion'
import ImageUpload from '@/components/ImageUpload'

export default function OpeningSection({
  header = 'Venue Opening',
  subtext = 'Join us for this special occasion',
  eventDate = '',
  eventTime = '',
  location = '',
  // Special Guests (up to 5)
  guest1Image = '',
  guest1Description = '',
  guest1Link = '',
  guest2Image = '',
  guest2Description = '',
  guest2Link = '',
  guest3Image = '',
  guest3Description = '',
  guest3Link = '',
  guest4Image = '',
  guest4Description = '',
  guest4Link = '',
  guest5Image = '',
  guest5Description = '',
  guest5Link = '',
  // Venue Events (up to 10)
  event1Image = '',
  event1Description = '',
  event1ButtonText = '',
  event1ButtonLink = '',
  event2Image = '',
  event2Description = '',
  event2ButtonText = '',
  event2ButtonLink = '',
  event3Image = '',
  event3Description = '',
  event3ButtonText = '',
  event3ButtonLink = '',
  event4Image = '',
  event4Description = '',
  event4ButtonText = '',
  event4ButtonLink = '',
  event5Image = '',
  event5Description = '',
  event5ButtonText = '',
  event5ButtonLink = '',
  event6Image = '',
  event6Description = '',
  event6ButtonText = '',
  event6ButtonLink = '',
  event7Image = '',
  event7Description = '',
  event7ButtonText = '',
  event7ButtonLink = '',
  event8Image = '',
  event8Description = '',
  event8ButtonText = '',
  event8ButtonLink = '',
  event9Image = '',
  event9Description = '',
  event9ButtonText = '',
  event9ButtonLink = '',
  event10Image = '',
  event10Description = '',
  event10ButtonText = '',
  event10ButtonLink = '',
  animation = 'fade-in',
  isEditing = false,
  onUpdate
}) {
  const animations = {
    'fade-in': { opacity: [0, 1], transition: { duration: 0.8 } },
    'slide-up': { y: [30, 0], opacity: [0, 1], transition: { duration: 0.8 } },
  }

  const guests = [];
  for (let i = 1; i <= 5; i++) {
    const img = eval(`guest${i}Image`);
    const desc = eval(`guest${i}Description`);
    const link = eval(`guest${i}Link`);
    if (img || desc) guests.push({ image: img, description: desc, link });
  }

  const events = [];
  for (let i = 1; i <= 10; i++) {
    const img = eval(`event${i}Image`);
    const desc = eval(`event${i}Description`);
    const btnText = eval(`event${i}ButtonText`);
    const btnLink = eval(`event${i}ButtonLink`);
    if (img || desc) events.push({ image: img, description: desc, buttonText: btnText, buttonLink: btnLink });
  }

  if (isEditing) {
    return (
      <div className="p-6 border-2 border-pink-500 rounded-lg bg-gray-900/50 my-8 max-h-screen overflow-y-auto">
        <h3 className="text-lg font-bold mb-4 text-pink-300">Opening Section</h3>
        
        <div className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Header</label>
              <input
                type="text"
                key={`header-${header}`}
                defaultValue={header}
                onBlur={(e) => onUpdate({ header: e.target.value })}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Location</label>
              <input
                type="text"
                key={`location-${location}`}
                defaultValue={location}
                onBlur={(e) => onUpdate({ location: e.target.value })}
                className="w-full"
              />
            </div>
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Date</label>
              <input
                type="text"
                key={`date-${eventDate}`}
                defaultValue={eventDate}
                onBlur={(e) => onUpdate({ eventDate: e.target.value })}
                className="w-full"
                placeholder="December 25, 2024"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Time</label>
              <input
                type="text"
                key={`time-${eventTime}`}
                defaultValue={eventTime}
                onBlur={(e) => onUpdate({ eventTime: e.target.value })}
                className="w-full"
                placeholder="7:00 PM EST"
              />
            </div>
          </div>

          {/* Special Guests */}
          <div className="border-t border-white/30 pt-4">
            <h4 className="text-sm font-semibold mb-3">Special Guests (up to 5)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4, 5].map((num) => {
                const imgKey = `guest${num}Image`;
                const descKey = `guest${num}Description`;
                const linkKey = `guest${num}Link`;
                const currentImg = eval(imgKey);
                const currentDesc = eval(descKey);
                const currentLink = eval(linkKey);
                
                return (
                  <div key={num} className="p-3 bg-gray-800/50 rounded">
                    <p className="text-xs text-gray-400 mb-2">Guest {num}</p>
                    <ImageUpload
                      currentImage={currentImg}
                      onImageUploaded={(url) => onUpdate({ [imgKey]: url })}
                    />
                    <textarea
                      key={`${descKey}-${currentDesc}`}
                      defaultValue={currentDesc}
                      onBlur={(e) => onUpdate({ [descKey]: e.target.value })}
                      className="w-full mt-2 text-sm"
                      placeholder="Guest description"
                      rows="2"
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
                );
              })}
            </div>
          </div>

          {/* Venue Events */}
          <div className="border-t border-white/30 pt-4">
            <h4 className="text-sm font-semibold mb-3">Venue Events (up to 10)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                const imgKey = `event${num}Image`;
                const descKey = `event${num}Description`;
                const btnTextKey = `event${num}ButtonText`;
                const btnLinkKey = `event${num}ButtonLink`;
                const currentImg = eval(imgKey);
                const currentDesc = eval(descKey);
                const currentBtnText = eval(btnTextKey);
                const currentBtnLink = eval(btnLinkKey);
                
                return (
                  <div key={num} className="p-3 bg-gray-800/50 rounded">
                    <p className="text-xs text-gray-400 mb-2">Event {num}</p>
                    <ImageUpload
                      currentImage={currentImg}
                      onImageUploaded={(url) => onUpdate({ [imgKey]: url })}
                    />
                    <textarea
                      key={`${descKey}-${currentDesc}`}
                      defaultValue={currentDesc}
                      onBlur={(e) => onUpdate({ [descKey]: e.target.value })}
                      className="w-full mt-2 text-sm"
                      placeholder="Event description"
                      rows="2"
                    />
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <input
                        key={`${btnTextKey}-${currentBtnText}`}
                        type="text"
                        defaultValue={currentBtnText}
                        onBlur={(e) => onUpdate({ [btnTextKey]: e.target.value })}
                        className="w-full text-sm"
                        placeholder="Button text"
                      />
                      <input
                        key={`${btnLinkKey}-${currentBtnLink}`}
                        type="text"
                        defaultValue={currentBtnLink}
                        onBlur={(e) => onUpdate({ [btnLinkKey]: e.target.value })}
                        className="w-full text-sm"
                        placeholder="Button link"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
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
        {/* Header Section */}
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold text-white mb-4">{header}</h2>
          <p className="text-xl text-gray-300 mb-6">{subtext}</p>
          <div className="flex justify-center gap-8 text-lg">
            {eventDate && (
              <div>
                <span className="text-nightshade-400">📅 </span>
                <span className="text-white">{eventDate}</span>
              </div>
            )}
            {eventTime && (
              <div>
                <span className="text-nightshade-400">🕐 </span>
                <span className="text-white">{eventTime}</span>
              </div>
            )}
            {location && (
              <div>
                <span className="text-nightshade-400">📍 </span>
                <span className="text-white">{location}</span>
              </div>
            )}
          </div>
        </div>

        {/* Special Guests */}
        {guests.length > 0 && (
          <div className="mb-16">
            <h3 className="text-3xl font-bold text-center text-white mb-8">Special Guests</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {guests.map((guest, index) => (
                <div key={index} className="card text-center">
                  {guest.image && (
                    <img
                      src={guest.image}
                      alt={`Guest ${index + 1}`}
                      className="w-32 h-32 object-cover rounded-full mx-auto mb-4"
                    />
                  )}
                  <p className="text-gray-300 text-sm">{guest.description}</p>
                  {guest.link && (
                    <a
                      href={guest.link}
                      className="text-nightshade-400 hover:text-nightshade-300 text-sm mt-2 inline-block"
                    >
                      Profile →
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Venue Events */}
        {events.length > 0 && (
          <div>
            <h3 className="text-3xl font-bold text-center text-white mb-8">Venue Events</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event, index) => (
                <div key={index} className="card">
                  {event.image && (
                    <img
                      src={event.image}
                      alt={`Event ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                  )}
                  <p className="text-gray-300 mb-4">{event.description}</p>
                  {event.buttonText && (
                    <a
                      href={event.buttonLink || '#'}
                      className="inline-block px-6 py-3 bg-gradient-to-r from-nightshade-600 to-purple-600 hover:from-nightshade-700 hover:to-purple-700 rounded-lg transition-all text-white font-medium"
                    >
                      {event.buttonText}
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}
