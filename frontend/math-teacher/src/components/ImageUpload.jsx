import React, { useState, useRef } from 'react';
import { Image, X, Upload } from 'lucide-react';

const ImageUpload = ({ onImageSelect, disabled }) => {
  const [preview, setPreview] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (file) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target.result);
      };
      reader.readAsDataURL(file);
      onImageSelect(file);
    }
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const clearPreview = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openFileDialog = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  if (preview) {
    return (
      <div className="relative">
        <div className="relative w-12 h-12 rounded-lg overflow-hidden">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-full object-cover"
          />
          <button
            onClick={clearPreview}
            className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled}
      />
      
      <button
        onClick={openFileDialog}
        disabled={disabled}
        className={`p-3 rounded-lg transition-colors ${
          disabled 
            ? 'bg-gray-400 cursor-not-allowed' 
            : isDragOver 
              ? 'bg-blue-400 text-white' 
              : 'bg-purple-500 text-white hover:bg-purple-600'
        }`}
        title="Upload image"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <Image className="w-5 h-5" />
      </button>
      
      {/* Drag and drop overlay */}
      {isDragOver && (
        <div className="fixed inset-0 bg-blue-500 bg-opacity-20 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <Upload className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <p className="text-gray-700 font-medium">Drop image here</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;


