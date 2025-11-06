export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
      <div className="text-center max-w-4xl mx-auto px-4">
        <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-orange-400 bg-clip-text text-transparent">
          Welcome to CreatorOS
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          The all-in-one platform for content creators, freelancers, and entrepreneurs. 
          Manage your content, grow your audience, and scale your business.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <a 
            href="/signup" 
            className="bg-purple-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-purple-700 transition-colors"
          >
            Get Started →
          </a>
          <a 
            href="/login" 
            className="border border-purple-600 text-purple-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-purple-50 transition-colors"
          >
            Sign In
          </a>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <div className="text-center p-6 rounded-lg bg-white border shadow-sm">
            <div className="w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
              ✏️
            </div>
            <h3 className="text-xl font-semibold mb-2">AI Content Studio</h3>
            <p className="text-gray-600">Create amazing content with AI-powered tools and personalized brand voices.</p>
          </div>
          <div className="text-center p-6 rounded-lg bg-white border shadow-sm">
            <div className="w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
              💼
            </div>
            <h3 className="text-xl font-semibold mb-2">Freelance Hub</h3>
            <p className="text-gray-600">Find projects, manage clients, and grow your freelance business.</p>
          </div>
          <div className="text-center p-6 rounded-lg bg-white border shadow-sm">
            <div className="w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
              🏪
            </div>
            <h3 className="text-xl font-semibold mb-2">E-commerce Suite</h3>
            <p className="text-gray-600">Sell products, manage inventory, and track your online store performance.</p>
          </div>
        </div>
        
        <div className="mt-12 text-sm text-gray-500">
          🎉 Your CreatorOS is live and running!
        </div>
      </div>
    </div>
  );
}