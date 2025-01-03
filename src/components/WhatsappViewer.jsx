import React, { useState, useEffect, useRef } from 'react';
import { Upload, Sun, Moon, Info, Search, X } from 'lucide-react';

const WhatsAppViewer = () => {
  const [messages, setMessages] = useState([]);
  const [currentUser, setCurrentUser] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isInfoVisible, setIsInfoVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [matchedIndexes, setMatchedIndexes] = useState([]);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const chatContainerRef = useRef(null);

  const parseDateTime = (dateTimeStr) => {
    return dateTimeStr.trim();
  };

  const parseWhatsAppMessage = (line) => {
    if (!line.trim()) return null;
    
    const regex = /^(\d{2}\/\d{2}\/\d{2},\s+\d{1,2}:\d{2}\s+[ap]m)\s+-\s+([^:]+):\s*(.+)$/;
    const match = line.match(regex);
    
    if (match) {
      const [, datetime, sender, content] = match;
      return {
        datetime: parseDateTime(datetime),
        sender: sender.trim(),
        content: content.trim(),
        isMedia: content.includes('<Media omitted>'),
        isEdited: content.includes('<This message was edited>')
      };
    } else {
      const systemMessageRegex = /^(\d{2}\/\d{2}\/\d{2},\s+\d{1,2}:\d{2}\s+[ap]m)\s+-\s+([^:]+)$/;
      const systemMatch = line.match(systemMessageRegex);
      
      if (systemMatch) {
        const [, datetime, content] = systemMatch;
        return {
          datetime: parseDateTime(datetime),
          sender: 'System',
          content: content.trim(),
          isSystem: true
        };
      }
    }
    return null;
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setMatchedIndexes([]);
      setCurrentMatchIndex(0);
      return;
    }

    const matches = messages.reduce((acc, msg, index) => {
      const content = msg.content.toLowerCase();
      const sender = msg.sender.toLowerCase();
      const searchLower = query.toLowerCase();
      
      if (content.includes(searchLower) || sender.includes(searchLower)) {
        acc.push(index);
      }
      return acc;
    }, []);

    setMatchedIndexes(matches);
    setCurrentMatchIndex(matches.length > 0 ? 0 : -1);

    // Scroll to first match
    if (matches.length > 0) {
      scrollToMessage(matches[0]);
    }
  };

  const scrollToMessage = (index) => {
    const element = document.getElementById(`message-${index}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const navigateSearch = (direction) => {
    if (matchedIndexes.length === 0) return;
    
    let newIndex;
    if (direction === 'next') {
      newIndex = (currentMatchIndex + 1) % matchedIndexes.length;
    } else {
      newIndex = (currentMatchIndex - 1 + matchedIndexes.length) % matchedIndexes.length;
    }
    
    setCurrentMatchIndex(newIndex);
    scrollToMessage(matchedIndexes[newIndex]);
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const lines = text.split('\n');
      
      const parsedMessages = lines
        .map(line => parseWhatsAppMessage(line))
        .filter(msg => msg !== null);

      if (parsedMessages.length > 0) {
        setMessages(parsedMessages);
        const senders = [...new Set(parsedMessages
          .filter(msg => !msg.isSystem)
          .map(msg => msg.sender))];
        setCurrentUser(senders[1] || senders[0]);
      }
    } catch (error) {
      console.error('Error processing file:', error);
    }
  };

  // Highlight matching text in the message
  const highlightText = (text, query) => {
    if (!query.trim()) return text;
    
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === query.toLowerCase() ? 
        <span key={i} className="bg-yellow-300 dark:bg-yellow-700">{part}</span> : part
    );
  };

  return (
    <div className={`flex flex-col h-full ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Fixed Header */}
      <div className={`fixed top-0 left-0 right-0 z-20 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
        <div className="max-w-6xl mx-auto px-2 sm:px-4">
          <div className="p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
              {/* Title and Counter */}
              <div className="flex items-center justify-between sm:justify-start sm:space-x-4">
                <h1 className={`text-xl sm:text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  Chat Viewer
                </h1>
                {messages.length > 0 && (
                  <span className={`px-2 py-1 rounded-full text-xs sm:text-sm ${
                    isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {messages.length} messages
                  </span>
                )}
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between sm:justify-end space-x-2 sm:space-x-4">
                {messages.length > 0 && (
                  <div className="relative flex items-center">
                    <Search className={`absolute left-2 w-4 h-4 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`} />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                      placeholder="Search messages..."
                      className={`pl-8 pr-20 py-1.5 rounded-lg text-sm ${
                        isDarkMode 
                          ? 'bg-gray-700 text-white placeholder-gray-400 border-gray-600' 
                          : 'bg-gray-100 text-gray-900 placeholder-gray-500 border-gray-200'
                      } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                    {searchQuery && (
                      <>
                        <div className={`absolute right-8 text-xs ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-600'
                        }`}>
                          {matchedIndexes.length > 0 ? 
                            `${currentMatchIndex + 1}/${matchedIndexes.length}` : 
                            'No results'}
                        </div>
                        <button
                          onClick={() => handleSearch('')}
                          className={`absolute right-2 p-1 rounded-full ${
                            isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'
                          }`}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                )}

                <button
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className={`p-2 rounded-full ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  {isDarkMode ? 
                    <Sun className="w-5 h-5 text-gray-300" /> : 
                    <Moon className="w-5 h-5 text-gray-600" />
                  }
                </button>

                <button
                  onClick={() => setIsInfoVisible(!isInfoVisible)}
                  className={`p-2 rounded-full ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  <Info className={`w-5 h-5 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} />
                </button>

                <label className={`flex items-center px-3 sm:px-4 py-2 rounded-lg cursor-pointer ${
                  isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'
                } transition-colors`}>
                  <Upload className="w-5 h-5 text-white sm:mr-2" />
                  <span className="hidden sm:inline text-white text-sm font-medium">Upload Chat</span>
                  <input
                    type="file"
                    accept=".txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Info Panel */}
          {isInfoVisible && (
            <div className={`p-3 sm:p-4 border-t ${
              isDarkMode ? 'bg-gray-800 text-gray-300 border-gray-700' : 'bg-gray-100 text-gray-600 border-gray-200'
            }`}>
              <h2 className="font-semibold mb-2">How to use:</h2>
              <ol className="list-decimal ml-4 sm:ml-5 space-y-1 text-sm">
                <li>Export your WhatsApp chat (Open chat → Menu → More → Export chat)</li>
                <li>Choose 'Without Media' when exporting</li>
                <li>Click 'Upload Chat' and select the exported .txt file</li>
                <li>Use the search bar to find specific messages or senders</li>
              </ol>
            </div>
          )}
        </div>
      </div>

      {/* Spacer for fixed header */}
      <div className={`h-16 ${isInfoVisible ? 'h-44' : 'h-20'} sm:h-20`} />

      {/* Scrollable Chat Container */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto px-2 sm:px-4 py-3 sm:py-4 space-y-2"
        style={{ 
          backgroundColor: isDarkMode ? '#1a1a1a' : '#f0f2f5',
          backgroundImage: isDarkMode 
            ? 'radial-gradient(circle at center, #242424 1px, transparent 1px)' 
            : 'radial-gradient(circle at center, #e5e7eb 1px, transparent 1px)',
          backgroundSize: '20px 20px',
          paddingBottom: '4rem'
        }}
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className={`text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              <Upload className="w-12 h-12 sm:w-16 sm:h-16 mb-4 mx-auto opacity-50" />
              <h2 className="text-lg sm:text-xl font-semibold mb-2">No messages to display</h2>
              <p className="text-xs sm:text-sm">Upload a WhatsApp chat export file to begin</p>
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              id={`message-${index}`}
              className={`flex ${message.isSystem ? 'justify-center' : 
                message.sender === currentUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[70%] rounded-lg p-2 sm:p-3 shadow-sm ${
                  matchedIndexes.includes(index) ? 'ring-2 ring-yellow-500' : ''
                } ${
                  message.isSystem 
                    ? isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-200 text-gray-600'
                    : message.sender === currentUser
                      ? isDarkMode ? 'bg-blue-900' : 'bg-blue-500 text-white'
                      : isDarkMode ? 'bg-gray-800' : 'bg-white'
                }`}
              >
                {!message.isSystem && message.sender !== currentUser && (
                  <div className={`text-xs sm:text-sm font-semibold ${
                    isDarkMode ? 'text-blue-400' : 'text-blue-600'
                  }`}>
                    {highlightText(message.sender, searchQuery)}
                  </div>
                )}
                <div className={`break-words text-sm sm:text-base ${
                  !message.isSystem && message.sender === currentUser 
                    ? 'text-white' 
                    : isDarkMode ? 'text-gray-300' : 'text-gray-800'
                }`}>
                  {message.isMedia ? (
                    <span className="italic opacity-75">Media file</span>
                  ) : (
                    highlightText(message.content, searchQuery)
                  )}
                  {message.isEdited && (
                    <span className="text-xs opacity-75 ml-2 italic">
                      (edited)
                    </span>
                  )}
                </div>
                <div className={`text-xs mt-1 text-right ${
                  message.sender === currentUser
                    ? 'text-blue-100'
                    : isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {message.datetime}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Search Navigation */}
      {matchedIndexes.length > 0 && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-20">
          <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg shadow-lg ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <button
              onClick={() => navigateSearch('prev')}
              className={`p-1.5 rounded-md ${
                isDarkMode 
                  ? 'hover:bg-gray-700 text-gray-300' 
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              ←
            </button>
            <span className={`text-sm ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              {currentMatchIndex + 1} of {matchedIndexes.length}
            </span>
            <button
              onClick={() => navigateSearch('next')}
              className={`p-1.5 rounded-md ${
                isDarkMode 
                  ? 'hover:bg-gray-700 text-gray-300' 
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WhatsAppViewer;