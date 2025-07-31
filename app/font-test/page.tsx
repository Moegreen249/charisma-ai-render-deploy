export default function FontTestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-white text-center mb-8">
          Gilroy Font Test
        </h1>
        
        <div className="grid gap-6">
          {/* Font Weights */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Font Weights</h2>
            <div className="space-y-2 text-white">
              <p className="font-gilroy-light text-lg">Light (300) - The quick brown fox jumps over the lazy dog</p>
              <p className="font-gilroy-regular text-lg">Regular (400) - The quick brown fox jumps over the lazy dog</p>
              <p className="font-gilroy-medium text-lg">Medium (500) - The quick brown fox jumps over the lazy dog</p>
              <p className="font-gilroy-semibold text-lg">SemiBold (600) - The quick brown fox jumps over the lazy dog</p>
              <p className="font-gilroy-bold text-lg">Bold (700) - The quick brown fox jumps over the lazy dog</p>
              <p className="font-gilroy-extrabold text-lg">ExtraBold (800) - The quick brown fox jumps over the lazy dog</p>
            </div>
          </div>

          {/* Headings */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Headings</h2>
            <div className="space-y-2 text-white">
              <h1 className="text-4xl">Heading 1 - Main Title</h1>
              <h2 className="text-3xl">Heading 2 - Section Title</h2>
              <h3 className="text-2xl">Heading 3 - Subsection</h3>
              <h4 className="text-xl">Heading 4 - Minor Section</h4>
              <h5 className="text-lg">Heading 5 - Small Section</h5>
              <h6 className="text-base">Heading 6 - Tiny Section</h6>
            </div>
          </div>

          {/* Body Text */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Body Text</h2>
            <div className="space-y-4 text-white">
              <p className="text-lg">
                This is a paragraph with body text using the Gilroy font. The font should be applied consistently across all text elements in the application.
              </p>
              <p className="text-base">
                This is a smaller paragraph to test different text sizes. The Gilroy font should provide excellent readability and a modern appearance.
              </p>
              <p className="text-sm">
                This is small text that should also use the Gilroy font. Even at smaller sizes, the font should remain clear and legible.
              </p>
            </div>
          </div>

          {/* UI Elements */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
            <h2 className="text-2xl font-bold text-white mb-4">UI Elements</h2>
            <div className="space-y-4">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                Button with Gilroy Font
              </button>
              <input 
                type="text" 
                placeholder="Input field with Gilroy font" 
                className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <label className="block text-white font-medium">
                Label with Gilroy Font
              </label>
            </div>
          </div>

          {/* Tailwind Classes */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Tailwind Font Classes</h2>
            <div className="space-y-2 text-white">
              <p className="font-sans text-lg">font-sans - The quick brown fox jumps over the lazy dog</p>
              <p className="font-gilroy text-lg">font-gilroy - The quick brown fox jumps over the lazy dog</p>
              <p className="font-primary text-lg">font-primary - The quick brown fox jumps over the lazy dog</p>
              <p className="font-english text-lg">font-english - The quick brown fox jumps over the lazy dog</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 