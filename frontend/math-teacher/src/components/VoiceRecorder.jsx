import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Square } from 'lucide-react';

const VoiceRecorder = ({ onRecordingComplete, disabled }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const intervalRef = useRef(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setAudioChunks(prev => [...prev, event.data]);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        onRecordingComplete(audioBlob);
        setAudioChunks([]);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Unable to access microphone. Please check your permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      clearInterval(intervalRef.current);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getButtonColor = () => {
    if (disabled) return 'bg-gray-400';
    if (isRecording) return 'bg-red-500 hover:bg-red-600';
    return 'bg-green-500 hover:bg-green-600';
  };

  const getButtonIcon = () => {
    if (isRecording) return <Square className="w-5 h-5" />;
    return <Mic className="w-5 h-5" />;
  };

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={isRecording ? stopRecording : startRecording}
        disabled={disabled}
        className={`p-3 text-white rounded-lg transition-colors ${getButtonColor()} disabled:cursor-not-allowed disabled:opacity-50`}
        title={isRecording ? 'Stop recording' : 'Start voice recording'}
      >
        {getButtonIcon()}
      </button>
      
      {isRecording && (
        <div className="mt-2 text-center">
          <div className="text-sm text-red-600 font-medium">
            {formatTime(recordingTime)}
          </div>
          <div className="flex justify-center space-x-1 mt-1">
            <div className="w-1 h-1 bg-red-500 rounded-full animate-pulse"></div>
            <div className="w-1 h-1 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-1 h-1 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceRecorder;


