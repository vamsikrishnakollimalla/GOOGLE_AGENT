import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Mic, MicOff, Lock, Eye, EyeOff, LogOut } from 'lucide-react';

const AuthenticatedChatApp = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [currentUser, setCurrentUser] = useState('');

  // Predefined credentials - In production, this should be handled server-side
  const validCredentials = [
    { username: 'admin', password: 'admin123' },
    { username: 'user1', password: 'password1' },
    { username: 'dilytics', password: 'dilytics2024' },
    { username: 'demo', password: 'demo123' }
  ];

  const handleLogin = (e) => {
    e.preventDefault();
    setLoginError('');

    const isValid = validCredentials.some(
      cred => cred.username === loginForm.username && cred.password === loginForm.password
    );

    if (isValid) {
      setIsAuthenticated(true);
      setCurrentUser(loginForm.username);
      setLoginForm({ username: '', password: '' });
    } else {
      setLoginError('Invalid username or password. Please try again.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser('');
    setLoginForm({ username: '', password: '' });
    setLoginError('');
  };

  // Login Component
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4" 
           style={{
             backgroundImage: 'url(https://i.postimg.cc/dLSRJbrS/image.png)',
             backgroundSize: 'cover',
             backgroundPosition: 'center',
             backgroundRepeat: 'no-repeat'
           }}>
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="max-w-md w-full relative z-10">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="bg-red-600 rounded-lg px-6 py-3 shadow-lg">
                <span className="text-white font-bold text-2xl tracking-wider">DILYTICS</span>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Procurement Agent</h1>
            <p className="text-gray-200">Please login to access the chat interface</p>
          </div>

          {/* Login Form */}
          <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl shadow-2xl p-8">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-blue-100 p-3 rounded-full">
                <Lock className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, username: e.target.value }))}
                  placeholder="Enter your username"
                  required
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleLogin(e);
                    }
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={loginForm.password}
                    onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Enter your password"
                    required
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleLogin(e);
                      }
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors duration-200"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {loginError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-700 text-sm">{loginError}</p>
                </div>
              )}

              <button
                type="button"
                onClick={handleLogin}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 font-medium"
              >
                Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Chat Interface Component (your existing code with logout button added)
  return <ChatInterface currentUser={currentUser} onLogout={handleLogout} />;
};

// Updated Chat Interface Component
const ChatInterface = ({ currentUser, onLogout }) => {
  const [messages, setMessages] = useState([
    { id: 1, text: `Hello ${currentUser}! How can I help you today?`, sender: 'bot', timestamp: new Date() }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [sessionId] = useState(() => `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setSpeechSupported(true);
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onstart = () => {
        setIsListening(true);
      };

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        
        const errorMessage = {
          id: Date.now() + 1,
          text: `Voice recognition error: ${event.error}. Please try again or type your message.`,
          sender: 'bot',
          timestamp: new Date(),
          isError: true
        };
        setMessages(prev => [...prev, errorMessage]);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const toggleVoiceRecording = () => {
    if (!speechSupported) {
      alert('Speech recognition is not supported in your browser. Please use Chrome, Safari, or Edge.');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage,
          sessionId: sessionId,
          user: currentUser
        }),
      });

      const data = await response.json();

      if (data.success && data.responses.length > 0) {
        const botMessage = {
          id: Date.now() + 1,
          text: data.responses.join(' '),
          sender: 'bot',
          timestamp: new Date(),
          intent: data.intent,
          confidence: data.confidence
        };
        setMessages(prev => [...prev, botMessage]);
      } else {
        throw new Error('No response from bot');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: "Sorry, I'm having trouble connecting right now. Please try again.",
        sender: 'bot',
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bot className="w-8 h-8" />
            <div>
              <h1 className="text-xl font-semibold">Procurement Agent</h1>
              <p className="text-blue-100 text-sm">Powered by Google Cloud</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* User Info */}
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium">Welcome, {currentUser}</p>
              <p className="text-xs text-blue-200">Session Active</p>
            </div>
            
            {/* DILYTICS Logo */}
            <div className="bg-red-600 rounded-lg px-3 py-2 shadow-md">
              <span className="text-white font-bold text-lg tracking-wider">DILYTICS</span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-start gap-3 ${
              message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
            }`}
          >
            {/* Avatar */}
            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
              message.sender === 'user' 
                ? 'bg-blue-500 text-white' 
                : message.isError 
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-600 text-white'
            }`}>
              {message.sender === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
            </div>

            {/* Message Bubble */}
            <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
              message.sender === 'user'
                ? 'bg-blue-500 text-white rounded-tr-md'
                : message.isError
                  ? 'bg-red-100 text-red-800 rounded-tl-md border-l-4 border-red-500'
                  : 'bg-white text-gray-800 rounded-tl-md shadow-sm border'
            }`}>
              <p className="text-sm leading-relaxed">{message.text}</p>
              
              {/* Debug info for bot messages */}
              {message.sender === 'bot' && message.intent && !message.isError && (
                <div className="mt-2 pt-2 border-t border-gray-200 text-xs text-gray-500">
                  <p>Intent: {message.intent}</p>
                  <p>Confidence: {(message.confidence * 100).toFixed(1)}%</p>
                </div>
              )}
              
              <p className="text-xs mt-1 opacity-70">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-600 text-white flex items-center justify-center">
              <Bot className="w-5 h-5" />
            </div>
            <div className="bg-white rounded-2xl rounded-tl-md px-4 py-3 shadow-sm border">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="border-t bg-white p-4">
        <div className="flex gap-3">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={isListening ? "Listening... Speak now" : "Type your message or click mic to speak..."}
            disabled={isLoading}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage(e);
              }
            }}
            className={`flex-1 px-4 py-3 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ${
              isListening 
                ? 'border-red-500 bg-red-50 animate-pulse' 
                : 'border-gray-300'
            }`}
          />
          
          {/* Voice Input Button */}
          {speechSupported && (
            <button
              onClick={toggleVoiceRecording}
              disabled={isLoading}
              className={`px-4 py-3 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 ${
                isListening
                  ? 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 animate-pulse'
                  : 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500'
              }`}
              title={isListening ? 'Stop recording' : 'Start voice input'}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          )}

          <button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </div>
        
        <div className="mt-2 text-center">
          <p className="text-xs text-gray-500">Session ID: {sessionId} | User: {currentUser}</p>
          {speechSupported && (
            <p className="text-xs text-gray-400 mt-1">
              💡 Tip: Click the microphone button or press and hold to use voice input
            </p>
          )}
          {!speechSupported && (
            <p className="text-xs text-orange-500 mt-1">
              ⚠️ Voice input not supported in this browser. Use Chrome, Safari, or Edge for voice features.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthenticatedChatApp;