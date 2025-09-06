import React from 'react';
import { Volume2, VolumeX, Play, Pause } from 'lucide-react';
import AudioPlayer from './AudioPlayer';

const MessageList = ({ messages }) => {
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const renderMessageContent = (message) => {
    return (
      <div className="space-y-2">
        {/* Text Content */}
        {message.text && (
          <div className="text-sm leading-relaxed">
            {message.text}
          </div>
        )}

        {/* Image Content */}
        {message.image && (
          <div className="mt-2">
            <img 
              src={message.image} 
              alt="Uploaded content" 
              className="image-preview"
            />
          </div>
        )}

        {/* Audio Content */}
        {message.audio && (
          <div className="mt-2">
            <AudioPlayer audioUrl={message.audio} />
          </div>
        )}
      </div>
    );
  };

  const renderVoiceIndicator = () => (
    <div className="voice-wave">
      <div className="voice-bar"></div>
      <div className="voice-bar"></div>
      <div className="voice-bar"></div>
      <div className="voice-bar"></div>
      <div className="voice-bar"></div>
    </div>
  );

  if (messages.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <Volume2 className="w-16 h-16 mx-auto mb-4" />
        </div>
        <h3 className="text-xl font-semibold text-gray-600 mb-2">
          Welcome to Math Teacher AI!
        </h3>
        <p className="text-gray-500 max-w-md mx-auto">
          Start a conversation by typing a message, recording your voice, or uploading an image. 
          I'm here to help you learn math!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`message-bubble fade-in ${
            message.type === 'user' 
              ? 'user-message' 
              : message.type === 'error'
              ? 'error-message'
              : 'ai-message'
          } p-4 rounded-2xl shadow-sm`}
        >
          {/* Message Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              {message.type === 'user' && (
                <>
                  <div className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <span className="text-xs font-semibold">U</span>
                  </div>
                  <span className="text-sm font-medium">You</span>
                </>
              )}
              {message.type === 'ai' && (
                <>
                  <div className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <span className="text-xs font-semibold">AI</span>
                  </div>
                  <span className="text-sm font-medium">Math Teacher</span>
                </>
              )}
              {message.type === 'error' && (
                <>
                  <div className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <span className="text-xs font-semibold">!</span>
                  </div>
                  <span className="text-sm font-medium">Error</span>
                </>
              )}
            </div>
            <span className="text-xs opacity-75">
              {formatTime(message.timestamp)}
            </span>
          </div>

          {/* Message Content */}
          {renderMessageContent(message)}

          {/* Voice indicator for audio messages without text */}
          {message.audio && !message.text && message.type === 'user' && (
            <div className="mt-2">
              {renderVoiceIndicator()}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default MessageList;


