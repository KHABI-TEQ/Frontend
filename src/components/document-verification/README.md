# Document Iframe Preview Component

A comprehensive document preview component that provides iframe-based preview functionality for various file types in the document verification system.

## Features

### 🖼️ Multi-Format Support
- **PDF Files**: Full iframe preview with native browser controls
- **Images**: PNG, JPG, JPEG, GIF, BMP, WebP, SVG with zoom and rotation
- **Documents**: DOC, DOCX, TXT, RTF with file information display
- **Fallback**: Generic preview for unsupported formats

### 🎛️ Interactive Controls
- **Zoom**: 50% to 200% with +/- buttons
- **Rotation**: 90-degree increments 
- **Fullscreen**: Toggle fullscreen mode
- **Download**: Direct file download
- **Reset**: Return to default zoom and rotation

### ⌨️ Keyboard Shortcuts
- `Esc` - Close preview
- `Ctrl/Cmd + Plus` - Zoom in
- `Ctrl/Cmd + Minus` - Zoom out  
- `Ctrl/Cmd + R` - Rotate document
- `Ctrl/Cmd + F` - Toggle fullscreen
- `Ctrl/Cmd + D` - Download file
- `Ctrl/Cmd + 0` - Reset view

### 📱 Responsive Design
- Mobile-optimized interface
- Touch-friendly controls
- Adaptive layout for different screen sizes
- Hidden keyboard shortcuts info on mobile

## Usage

```tsx
import { DocumentIframePreview } from '@/components/document-verification';

function MyComponent() {
  const [showPreview, setShowPreview] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  return (
    <>
      <button onClick={() => setShowPreview(true)}>
        Preview Document
      </button>
      
      {selectedFile && (
        <DocumentIframePreview
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
          file={selectedFile}
          documentName="Certificate of Occupancy"
        />
      )}
    </>
  );
}
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `isOpen` | boolean | ✅ | Controls modal visibility |
| `onClose` | () => void | ✅ | Called when modal should close |
| `file` | File | ✅ | The file to preview |
| `documentName` | string | ✅ | Display name for the document |

## File Type Handling

### PDF Files
- Embedded iframe with native browser PDF viewer
- Supports zoom parameter in URL
- Full navigation controls
- Print and download functionality

### Image Files
- Direct image display with `<img>` tag
- Zoom and rotation transforms
- Smooth transitions
- Error handling for failed loads

### Document Files (DOC, DOCX, TXT)
- Informational display with file metadata
- Download prompt for native application viewing
- File size, type, and modification date
- Clear instructions for users

### Unsupported Files
- Generic file icon display
- Basic file information
- Download option
- User-friendly error messaging

## Accessibility

- **Keyboard Navigation**: Full keyboard support for all functions
- **ARIA Labels**: Proper labeling for screen readers
- **Focus Management**: Automatic focus handling
- **Escape Handling**: ESC key closes modal
- **High Contrast**: Clear visual hierarchy

## Error Handling

- **File Loading Errors**: Graceful error states with retry options
- **Corrupted Files**: User-friendly error messages
- **Network Issues**: Fallback to download option
- **Browser Compatibility**: Progressive enhancement

## Browser Support

- Modern browsers with File API support
- PDF preview requires browser PDF plugin
- Image formats depend on browser support
- Keyboard shortcuts work in all major browsers

## Testing

A demo component is available at `/test-document-preview` for testing the iframe preview functionality with various file types.

## Implementation Notes

- Uses `URL.createObjectURL()` for file URLs
- Proper cleanup with `URL.revokeObjectURL()`
- Prevents body scroll when modal is open
- Responsive breakpoints for mobile optimization
- Optimized for performance with lazy loading
