import { X } from 'lucide-react';
import { motion } from 'framer-motion';
import type { DocumentType } from '../../types';
import { MockDocumentPlaceholder } from './MockDocumentPlaceholder';

interface ImageThumbnailProps {
  file: File | null;
  previewUrl: string | null;
  documentType: DocumentType;
  onClear: (e?: React.MouseEvent) => void;
  onImageClick?: () => void;
}

function formatFileSize(file: File | null): string {
  if (!file) return 'No file selected';
  const kb = file.size / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(2)} MB`;
}

function truncateFileName(name: string): string {
  if (name.length <= 24) return name;
  return `${name.slice(0, 21)}...`;
}

export function ImageThumbnail({ file, previewUrl, documentType, onClear, onImageClick }: ImageThumbnailProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      style={{
        position: 'relative',
        borderRadius: 14,
        border: '1px solid var(--brand-border)',
        background: 'var(--brand-surface-2)',
        padding: 10,
        width: 'fit-content',
      }}
    >
      <button
        onClick={onClear}
        style={{
          position: 'absolute',
          top: 6,
          right: 6,
          width: 24,
          height: 24,
          borderRadius: '50%',
          border: '1px solid var(--brand-border)',
          background: 'var(--brand-surface-3)',
          color: 'var(--text-secondary)',
          display: 'grid',
          placeItems: 'center',
          cursor: 'pointer',
          zIndex: 2,
        }}
      >
        <X size={12} />
      </button>

      <div 
        style={{ borderRadius: 10, overflow: 'hidden', cursor: onImageClick ? 'pointer' : 'default' }}
        onClick={(e) => {
          if (onImageClick) {
            e.stopPropagation();
            onImageClick();
          }
        }}
      >
        {previewUrl ? (
          <img
            src={previewUrl}
            alt={file?.name ?? 'Document preview'}
            style={{ width: 160, height: 100, objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <MockDocumentPlaceholder documentType={documentType} size="thumbnail" />
        )}
      </div>

      <div style={{ marginTop: 8, display: 'grid', gap: 2 }}>
        <span style={{ fontSize: 12, color: 'var(--text-primary)' }}>
          {truncateFileName(file?.name ?? `${documentType.toLowerCase()}-placeholder`)}
        </span>
        <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{formatFileSize(file)}</span>
      </div>
    </motion.div>
  );
}
