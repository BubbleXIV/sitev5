'use client'
export default function SpacerSection({ height = 'medium' }) {
  const heightClasses = {
    small: 'h-8',
    medium: 'h-16',
    large: 'h-32',
    xlarge: 'h-48'
  }

  return <div className={heightClasses[height]}></div>
}
