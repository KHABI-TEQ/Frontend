"use client"
import React, { useState, useEffect } from 'react';
import { X, Download, RotateCw, ZoomIn, ZoomOut, Maximize2, File } from 'lucide-react';

type DocumentIframePreviewProps = {
  isOpen: boolean;
  onClose: () => void;
  file: File;
  documentName: string;
};

const DocumentIframePreview: React.FC<DocumentIframePreviewProps> = ({
  isOpen,
  onClose,
  file,
  documentName
}) => {
  const [fileUrl, setFileUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (file && isOpen) {
      try {
        const url = URL.createObjectURL(file);
        setFileUrl(url);
        setIsLoading(false);
        setHasError(false);

        return () => {
          URL.revokeObjectURL(url);
        };
      } catch (error) {
        console.error('Error creating object URL:', error);
        setHasError(true);
        setIsLoading(false);
      }
    }
  }, [file, isOpen]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      switch (event.key) {
        case 'Escape':
          onClose();
          break;
        case '+':
        case '=':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            handleZoomIn();
          }
          break;
        case '-':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            handleZoomOut();
          }
          break;
        case 'r':
        case 'R':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            handleRotate();
          }
          break;
        case 'f':
        case 'F':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            toggleFullscreen();
          }
          break;
        case 'd':
        case 'D':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            handleDownload();
          }
          break;
        case '0':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            resetView();
          }
          break;
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = fileUrl;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 50));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const resetView = () => {
    setZoom(100);
    setRotation(0);
  };

  const getFileType = () => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    return extension;
  };

  const renderFilePreview = () => {
    const fileType = getFileType();

    if (['pdf'].includes(fileType || '')) {
      return (
        <div className="h-full bg-gray-100">
          <iframe
            src={`${fileUrl}#toolbar=1&navpanes=1&scrollbar=1&view=FitH&zoom=${zoom}`}
            className="w-full h-full border-0"
            style={{
              transform: `rotate(${rotation}deg)`,
              transformOrigin: 'center center',
              minHeight: '500px'
            }}
            title={`Preview of ${documentName}`}
            loading="lazy"
            allow="fullscreen"
          />
        </div>
      );
    }

    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(fileType || '')) {
      return (
        <div className="flex items-center justify-center h-full bg-gray-100 overflow-auto">
          <div className="relative">
            <img
              src={fileUrl}
              alt={documentName}
              className="max-w-full max-h-full object-contain transition-transform duration-200"
              style={{
                transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                transformOrigin: 'center center'
              }}
              onLoad={() => setIsLoading(false)}
              onError={() => setIsLoading(false)}
            />
          </div>
        </div>
      );
    }

    if (['doc', 'docx', 'txt', 'rtf'].includes(fileType || '')) {
      return (
        <div className="flex flex-col items-center justify-center h-full bg-gray-50">
          <div className="text-center p-8 max-w-md">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <File className="w-10 h-10 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Document Ready for Review
            </h3>
            <p className="text-gray-500 mb-6">
              {fileType?.toUpperCase()} files are best viewed in their native application or downloaded for full functionality.
            </p>
            <div className="space-y-3 text-left bg-white p-4 rounded-lg border">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">File Name:</span>
                <span className="text-sm text-gray-800 truncate ml-2">{file.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">Size:</span>
                <span className="text-sm text-gray-800">{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">Type:</span>
                <span className="text-sm text-gray-800">{fileType?.toUpperCase()} Document</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">Last Modified:</span>
                <span className="text-sm text-gray-800">
                  {new Date(file.lastModified).toLocaleDateString()}
                </span>
              </div>
            </div>
            <button
              onClick={handleDownload}
              className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center mx-auto shadow-md"
            >
              <Download className="w-4 h-4 mr-2" />
              Download to Open
            </button>
            <p className="text-xs text-gray-500 mt-3">
              Downloaded files can be opened in Word, Google Docs, or other compatible applications
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <div className="text-center p-8 max-w-md">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <File className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            File Format Not Supported
          </h3>
          <p className="text-gray-500 mb-4">
            Preview is not available for this file type in the browser.
          </p>
          <div className="bg-white p-4 rounded-lg border mb-4">
            <p className="text-sm text-gray-600">
              <strong>File:</strong> {file.name}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Type:</strong> {fileType?.toUpperCase() || 'Unknown'}
            </p>
          </div>
          <button
            onClick={handleDownload}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center mx-auto"
          >
            <Download className="w-4 h-4 mr-2" />
            Download File
          </button>
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <div 
        className={`bg-white rounded-lg shadow-2xl overflow-hidden transition-all duration-300 ${
          isFullscreen 
            ? 'w-full h-full max-w-none max-h-none rounded-none' 
            : 'w-[95vw] h-[95vh] max-w-6xl max-h-[90vh]'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-800 truncate">
              {documentName}
            </h2>
            <p className="text-sm text-gray-500">
              {file.name} • {(file.size / (1024 * 1024)).toFixed(2)} MB
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-2">
            {['pdf', 'jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(getFileType() || '') && (
              <>
                <button
                  onClick={handleZoomOut}
                  className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                
                <span className="text-sm text-gray-600 px-2">
                  {zoom}%
                </span>
                
                <button
                  onClick={handleZoomIn}
                  className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>

                <button
                  onClick={handleRotate}
                  className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                  title="Rotate"
                >
                  <RotateCw className="w-4 h-4" />
                </button>

                <div className="h-4 border-l border-gray-300 mx-2"></div>
              </>
            )}

            <button
              onClick={toggleFullscreen}
              className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              <Maximize2 className="w-4 h-4" />
            </button>

            <button
              onClick={handleDownload}
              className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
              title="Download"
            >
              <Download className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="relative h-[calc(100%-80px)] overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading preview...</p>
              </div>
            </div>
          ) : hasError ? (
            <div className="flex items-center justify-center h-full bg-red-50">
              <div className="text-center p-8">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <X className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-red-700 mb-2">
                  Preview Error
                </h3>
                <p className="text-red-600 mb-4">
                  Unable to load the document preview. The file might be corrupted or in an unsupported format.
                </p>
                <button
                  onClick={handleDownload}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Download className="w-4 h-4 mr-2 inline" />
                  Download File Instead
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full overflow-auto">
              {renderFilePreview()}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-3 border-t border-gray-200 bg-gray-50">
          <div className="text-xs text-gray-500">
            <span className="hidden sm:inline">
              Keyboard shortcuts: Esc (close), Ctrl+/- (zoom), Ctrl+R (rotate), Ctrl+F (fullscreen), Ctrl+D (download)
            </span>
            <span className="sm:hidden">
              Use controls above to zoom, rotate, or download
            </span>
          </div>

          {['pdf', 'jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(getFileType() || '') && (
            <button
              onClick={resetView}
              className="text-xs text-blue-600 hover:text-blue-700 px-2 py-1 rounded transition-colors"
              title="Reset zoom and rotation (Ctrl+0)"
            >
              Reset View
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentIframePreview;
