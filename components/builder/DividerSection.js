'use client'
export default function DividerSection({
  style = 'line',
  color = 'white',
  thickness = 'thin'
}) {
  const thicknessClasses = {
    thin: 'h-px',
    medium: 'h-0.5',
    thick: 'h-1'
  }

  const colorClasses = {
    white: 'bg-white/20',
    nightshade: 'bg-nightshade-500/50',
    purple: 'bg-purple-500/50'
  }

  if (style === 'line') {
    return (
      <div className="py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className={`w-full ${thicknessClasses[thickness]} ${colorClasses[color]}`}></div>
        </div>
      </div>
    )
  }

  // For decorative style (line-dot-line)
  return (
    <div className="py-8">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <div className="flex items-center">
          <div className={`flex-1 ${thicknessClasses[thickness]} ${colorClasses[color]}`}></div>
          <div className="px-4">
            <div className="w-2 h-2 bg-nightshade-500 rounded-full"></div>
          </div>
          <div className={`flex-1 ${thicknessClasses[thickness]} ${colorClasses[color]}`}></div>
        </div>
      </div>
    </div>
  )
}
