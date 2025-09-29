'use client'

export default function CustomHTMLSection({ html, css, javascript, isEditing, onUpdate }) {
  if (isEditing) {
    return (
      <div className="p-6 border-2 border-purple-500 rounded-lg bg-gray-900/50">
        <h3 className="text-lg font-bold mb-4 text-purple-300">Custom HTML Section</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">HTML</label>
            <textarea
              value={html || ''}
              onChange={(e) => onUpdate({ html: e.target.value })}
              className="w-full h-40 font-mono text-sm"
              placeholder="<div>Your HTML here...</div>"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">CSS</label>
            <textarea
              value={css || ''}
              onChange={(e) => onUpdate({ css: e.target.value })}
              className="w-full h-40 font-mono text-sm"
              placeholder=".your-class { color: red; }"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">JavaScript (Optional)</label>
            <textarea
              value={javascript || ''}
              onChange={(e) => onUpdate({ javascript: e.target.value })}
              className="w-full h-32 font-mono text-sm"
              placeholder="// Your JS code here"
            />
          </div>

          <div className="bg-yellow-900/20 border border-yellow-600/50 rounded p-3 text-sm text-yellow-200">
            <strong>Note:</strong> Be careful with custom code. Test thoroughly before publishing.
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="custom-html-section">
      {css && <style dangerouslySetInnerHTML={{ __html: css }} />}
      {html && <div dangerouslySetInnerHTML={{ __html: html }} />}
      {javascript && (
        <script
          dangerouslySetInnerHTML={{
            __html: `(function() { ${javascript} })();`
          }}
        />
      )}
    </div>
  )
}
