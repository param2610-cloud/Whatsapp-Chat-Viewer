import React, { useState } from 'react';
import WhatsAppViewer from './components/WhatsappViewer';
import { AlertCircle } from 'lucide-react';

function App() {
  const [error, setError] = useState(null);

  const handleError = (errorMessage) => {
    setError(errorMessage);
    setTimeout(() => setError(null), 5000);
  };

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Error Toast */}
      {error && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in px-4 w-full sm:w-auto">
          <div className="bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center max-w-sm mx-auto sm:max-w-none">
            <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        </div>
      )}

      {/* Background Decoration */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />

      {/* Main Content Container */}
      <div className="relative w-full h-full max-w-6xl mx-auto px-2 sm:px-4">
        {/* Main Component */}
        <div className="h-full rounded-xl shadow-2xl overflow-hidden">
          <WhatsAppViewer onError={handleError} />
        </div>
      </div>

      {/* Fixed Attribution */}
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-gray-50/90 to-gray-50/0 dark:from-gray-900/90 dark:to-gray-900/0 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-2">
          <p className="text-xs text-center text-gray-500 dark:text-gray-400">
            Made with ❤️ by Parambrata Ghosh
          </p>
        </div>
      </div>

      <style jsx>{`
        .bg-grid-pattern {
          background-size: 20px 20px;
          background-image: linear-gradient(to right, rgba(0,0,0,0.1) 1px, transparent 1px),
                          linear-gradient(to bottom, rgba(0,0,0,0.1) 1px, transparent 1px);
        }

        @keyframes fade-in {
          from { opacity: 0; transform: translate(-50%, -20px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

export default App;