import React, { useState, useEffect, useRef } from 'react';
import { Send, Mic, Image, Volume2, VolumeX, Loader2 } from 'lucide-react';
import io from 'socket.io-client';
import axios from 'axios';
import VoiceRecorder from './components/VoiceRecorder';
import ImageUpload from './components/ImageUpload';
import MessageList from './components/MessageList';
import './App.css';

const App = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Initialize WebSocket connection
    const newSocket = io('http://localhost:3001', {
      transports: ['websocket']
    });

    newSocket.on('connect', () => {
      console.log('Connected to server');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
    });

    newSocket.on('ai_response', (data) => {
      console.log('Received AI response:', data);
      setIsLoading(false);
      
      // Add AI response to messages
      const newMessage = {
        id: Date.now(),
        type: 'ai',
        text: data.text || '',
        audio: data.audio || null,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, newMessage]);
    });

    newSocket.on('transcription', (data) => {
      console.log('Received transcription:', data);
      // Add transcribed text to messages
      const newMessage = {
        id: Date.now(),
        type: 'user',
        text: data.text,
        audio: data.audioUrl,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, newMessage]);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const sendMessage = async (text, audioFile = null, imageFile = null) => {
    if (!text && !audioFile && !imageFile) return;

    setIsLoading(true);

    // Add user message to chat
    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: text || '',
      audio: audioFile ? URL.createObjectURL(audioFile) : null,
      image: imageFile ? URL.createObjectURL(imageFile) : null,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      const formData = new FormData();
      if (text) formData.append('text', text);
      if (audioFile) formData.append('audio', audioFile);
      if (imageFile) formData.append('image', imageFile);

      const response = await axios.post('http://localhost:3001/api/message', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Message sent successfully:', response.data);
    } catch (error) {
      console.error('Error sending message:', error);
      setIsLoading(false);
      
      // Add error message
      const errorMessage = {
        id: Date.now(),
        type: 'error',
        text: 'Sorry, there was an error processing your message. Please try again.',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleTextSubmit = (e) => {
    e.preventDefault();
    if (inputText.trim()) {
      sendMessage(inputText.trim());
      setInputText('');
    }
  };

  const handleVoiceMessage = (audioBlob) => {
    sendMessage('', audioBlob);
  };

  const handleImageUpload = (imageFile) => {
    sendMessage('', null, imageFile);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Math Teacher AI Assistant
          </h1>
          <p className="text-gray-600">
            Ask questions, share images, or send voice messages
          </p>
          <div className="flex items-center justify-center mt-2">
            <div className={`w-3 h-3 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm text-gray-500">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>

        {/* Chat Container */}
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Messages Area */}
          <div className="h-96 overflow-y-auto p-6 bg-gray-50">
            <MessageList messages={messages} />
            {isLoading && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500 mr-2" />
                <span className="text-gray-600">AI is thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-6 bg-white border-t border-gray-200">
            <form onSubmit={handleTextSubmit} className="flex items-end space-x-3">
              {/* Text Input */}
              <div className="flex-1">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type your message here..."
                  className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="2"
                  disabled={isLoading}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <VoiceRecorder onRecordingComplete={handleVoiceMessage} disabled={isLoading} />
                <ImageUpload onImageSelect={handleImageUpload} disabled={isLoading} />
                <button
                  type="submit"
                  disabled={!inputText.trim() || isLoading}
                  className="p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;


