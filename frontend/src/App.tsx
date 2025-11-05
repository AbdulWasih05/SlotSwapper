import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            SlotSwapper
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Peer-to-Peer Time Slot Exchange
          </p>
          
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-8">
            <h2 className="text-2xl font-semibold text-blue-900 mb-4">
              Initial Setup Complete!
            </h2>
            <p className=" mb-4">
              Frontend is configured and ready. Now implementing the main features:
            </p>
           
          </div>

          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={() => setCount((count) => count + 1)}
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-md"
            >
              Count: {count}
            </button>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Built with React 18 + TypeScript + Vite + Tailwind CSS
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
