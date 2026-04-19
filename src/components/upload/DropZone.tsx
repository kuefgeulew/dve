import { Camera, FolderOpen, UploadCloud, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { ImageThumbnail } from './ImageThumbnail';
import { useDocumentStore } from '../../store/documentStore';
import { Button } from '../common/Button';
import { type DocumentType } from '../../types/document';

type ZoneState = 'IDLE' | 'DRAG_OVER' | 'FILE_SELECTED';

interface DropZoneProps {
  documentType: DocumentType;
}

const ALLOWED_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'heic', 'webp', 'svg']);
const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/heic', 'image/heif', 'image/webp', 'image/svg+xml']);

const MOCK_FILES = [
  { name: 'eastern-bank-cheque-dishonoured.png', path: '/assets/mock-documents/eastern-bank-cheque-dishonoured.png' },
  { name: 'real-loan-agreement.png', path: '/assets/mock-documents/real-loan-agreement.png' },
  { name: 'real-nid.png', path: '/assets/mock-documents/real-nid.png' },
  { name: 'cheque-sample.svg', path: '/assets/mock-documents/cheque-sample.svg' },
  { name: 'loan-form-sample.svg', path: '/assets/mock-documents/loan-form-sample.svg' },
  { name: 'nid-sample.svg', path: '/assets/mock-documents/nid-sample.svg' },
];

function validateFile(file: File): string | null {
  if (file.size > 10 * 1024 * 1024) return 'File exceeds 10MB limit.';

  const name = file.name.toLowerCase();
  const ext = name.includes('.') ? (name.split('.').pop() ?? '').toLowerCase() : '';
  const mime = file.type.toLowerCase();

  const okByExt = ext !== '' && ALLOWED_EXTENSIONS.has(ext);
  const okByMime = ALLOWED_MIME.has(mime);

  if (okByExt || okByMime) return null;
  return 'Unsupported file type. Please upload JPG, PNG, HEIC, WebP, or SVG.';
}

export function DropZone({ documentType }: DropZoneProps) {
  const navigate = useNavigate();
  
  const { selectedFile, imagePreviewUrl, setFile, clearDocument } = useDocumentStore();
  
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const zoneState: ZoneState = selectedFile ? 'FILE_SELECTED' : isDragOver ? 'DRAG_OVER' : 'IDLE';

  const prevent = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handlePickedFile = (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setFile(file);
    setIsDragOver(false);
  };

  const handleSelectMock = async (path: string, fileName: string) => {
    try {
      const res = await fetch(path);
      if (!res.ok) throw new Error('Failed to load');
      const blob = await res.blob();
      const file = new File([blob], fileName, { type: blob.type || 'image/png' });
      handlePickedFile(file);
      setShowPicker(false);
    } catch {
      setError('Could not load mock document');
    }
  };

  if (showPicker) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          minHeight: 200,
          borderRadius: 16,
          border: '1px solid var(--brand-border)',
          background: 'var(--brand-surface-2)',
          padding: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 12
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
           <h3 style={{ fontSize: 14, margin: 0, color: 'var(--text-heading)' }}>Select from mock-documents</h3>
           <button onClick={() => setShowPicker(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4, display: 'flex' }}>
             <X size={16} color="var(--text-muted)" />
           </button>
        </div>
        <div style={{ display: 'grid', gap: 6, maxHeight: 240, overflowY: 'auto', paddingRight: 4 }} className="phone-scroll-content">
          {MOCK_FILES.map(f => (
            <motion.button
              key={f.path}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSelectMock(f.path, f.name)}
              style={{
                 textAlign: 'left', padding: '12px 14px', background: 'var(--bg-card)', 
                 border: '1px solid var(--brand-border)', borderRadius: 10, cursor: 'pointer',
                 fontSize: 13, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 10,
                 fontFamily: 'var(--font-body)'
              }}
            >
              <FolderOpen size={16} color="var(--brand-primary)" />
              {f.name}
            </motion.button>
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <motion.div
        layoutId="upload-dropzone"
        onDragEnter={(e) => {
          prevent(e);
          setIsDragOver(true);
        }}
        onDragOver={(e) => {
          prevent(e);
          setIsDragOver(true);
        }}
        onDragLeave={(e) => {
          prevent(e);
          setIsDragOver(false);
        }}
        onDrop={(e) => {
          prevent(e);
          setIsDragOver(false);
          const file = e.dataTransfer.files?.[0];
          if (file) handlePickedFile(file);
        }}
        onClick={() => {
          if (zoneState !== 'FILE_SELECTED') setShowPicker(true);
        }}
        animate={{
          scale: zoneState === 'DRAG_OVER' ? 1.02 : 1,
          borderColor:
            zoneState === 'DRAG_OVER' ? 'var(--brand-primary)' : 'rgba(13, 43, 94, 0.22)',
          background:
            zoneState === 'DRAG_OVER' ? 'var(--brand-red-glow)' : 'var(--brand-surface-2)',
        }}
        transition={{ duration: 0.15 }}
        style={{
          position: 'relative',
          overflow: 'hidden',
          minHeight: 200,
          borderRadius: 16,
          border: '2px dashed rgba(13, 43, 94, 0.22)',
          padding: 16,
          display: 'grid',
          placeItems: 'center',
          cursor: 'pointer',
        }}
      >
        {zoneState === 'FILE_SELECTED' ? (
          <motion.div
            initial={false}
            animate={{
              borderColor: ['#16A34A', '#E2E8F0'],
              backgroundColor: ['#F0FDF4', '#FFFFFF'],
            }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
            style={{ position: 'absolute', inset: 0, borderRadius: 16, pointerEvents: 'none', zIndex: 0 }}
          />
        ) : null}
        {zoneState === 'FILE_SELECTED' && selectedFile ? (
          <div style={{ display: 'grid', justifyItems: 'center', gap: 8, position: 'relative', zIndex: 1, width: '100%' }}>
            <ImageThumbnail
              file={selectedFile}
              previewUrl={imagePreviewUrl}
              documentType={documentType}
              onClear={(e) => {
                e?.stopPropagation();
                clearDocument();
              }}
              onImageClick={() => setIsFullscreen(true)}
            />
            <div style={{ marginTop: 8, width: '100%' }}>
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={(e) => {
                  e?.stopPropagation();
                  navigate('/processing');
                }}
              >
                Analyze Document
              </Button>
            </div>
          </div>
        ) : zoneState === 'DRAG_OVER' ? (
          <span style={{ color: 'var(--text-primary)', fontSize: 16 }}>Drop to analyze</span>
        ) : (
          <div style={{ display: 'grid', justifyItems: 'center', gap: 10 }}>
            <UploadCloud size={40} color="var(--text-muted)" />
            <strong style={{ color: 'var(--text-primary)' }}>Upload Document</strong>
            <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>
              JPG, PNG, HEIC, WebP · Max 10MB
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button variant="secondary" size="sm" icon={<Camera size={14} />} onClick={(e) => { e?.stopPropagation(); setShowPicker(true); }}>
                Take Photo
              </Button>
              <Button variant="primary" size="sm" icon={<FolderOpen size={14} />} onClick={(e) => { e?.stopPropagation(); setShowPicker(true); }}>
                Choose File
              </Button>
            </div>
          </div>
        )}
      </motion.div>

      {error ? <span style={{ fontSize: 12, color: 'var(--text-heading)' }}>{error}</span> : null}

      {createPortal(
        <AnimatePresence>
          {isFullscreen && imagePreviewUrl && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFullscreen(false)}
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 99999,
                backgroundColor: 'rgba(0, 0, 0, 0.85)',
                display: 'grid',
                placeItems: 'center',
                padding: 16,
              }}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsFullscreen(false);
                }}
                style={{
                  position: 'absolute',
                  top: 24,
                  right: 24,
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  border: 'none',
                  color: 'white',
                  display: 'grid',
                  placeItems: 'center',
                  cursor: 'pointer',
                  zIndex: 100000,
                }}
              >
                <X size={24} />
              </button>
              <motion.img
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
                src={imagePreviewUrl}
                alt="Full screen preview"
                onClick={(e) => e.stopPropagation()}
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                  borderRadius: 12,
                  boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
