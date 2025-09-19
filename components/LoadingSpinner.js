export default function LoadingSpinner({ size = 'medium', color = 'nightshade' }) {
  const sizeClasses = {
    small: 'w-4 h-4 border-2',
    medium: 'w-8 h-8 border-2',
    large: 'w-12 h-12 border-3',
    xlarge: 'w-16 h-16 border-4'
  }

  const colorClasses = {
    nightshade: 'border-nightshade-500 border-t-transparent',
    purple: 'border-purple-500 border-t-transparent',
    white: 'border-white/50 border-t-transparent',
    blue: 'border-blue-500 border-t-transparent'
  }

  return (
    <div className="flex items-center justify-center">
      <div className={`animate-spin rounded-full ${sizeClasses[size]} ${colorClasses[color]}`}></div>
    </div>
  )
}