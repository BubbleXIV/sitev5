export default function MenuLoading() {
  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="h-12 bg-gradient-to-r from-nightshade-400/20 to-purple-400/20 rounded-lg mb-4 animate-pulse"></div>
          <div className="h-6 bg-white/10 rounded-lg max-w-md mx-auto animate-pulse"></div>
        </div>

        {[...Array(3)].map((_, categoryIndex) => (
          <div key={categoryIndex} className="mb-12">
            <div className="h-8 bg-white/10 rounded-lg max-w-xs mx-auto mb-8 animate-pulse"></div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="card animate-pulse">
                  <div className="w-full h-48 bg-gradient-to-br from-nightshade-800/50 to-gray-800/50 rounded-lg mb-4"></div>
                  <div className="flex justify-between items-start mb-3">
                    <div className="h-6 bg-white/10 rounded flex-1 mr-4"></div>
                    <div className="h-6 bg-purple-400/20 rounded w-20"></div>
                  </div>
                  <div className="h-16 bg-white/10 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}