'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';

interface PDFUploaderProps {
  userId?: string;
  onUploadComplete?: (data: { resourceId: string; url: string }) => void;
}

/** Drag-and-drop PDF upload component for RAG processing */
export default function PDFUploader({ userId = 'anonymous', onUploadComplete }: PDFUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];
      setUploading(true);
      setStatus('idle');
      setErrorMessage('');

      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('userId', userId);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.error ?? 'Upload failed');
        }

        setStatus('success');
        onUploadComplete?.(result.data);
      } catch (err: unknown) {
        setStatus('error');
        setErrorMessage(err instanceof Error ? err.message : 'Upload failed');
      } finally {
        setUploading(false);
      }
    },
    [userId, onUploadComplete],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    disabled: uploading,
  });

  return (
    <div className="w-full max-w-md mx-auto">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
          isDragActive
            ? 'border-pink-500 bg-pink-500/10'
            : 'border-white/20 hover:border-pink-500/50'
        } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto mb-3 text-white/60" size={32} />
        {isDragActive ? (
          <p className="text-pink-400">Drop your PDF here...</p>
        ) : (
          <div>
            <p className="text-white/70 mb-1">
              Drag & drop a PDF here, or click to browse
            </p>
            <p className="text-white/40 text-xs">PDF files only</p>
          </div>
        )}
      </div>

      {uploading && (
        <div className="mt-4 flex items-center gap-2 text-white/60">
          <FileText size={16} />
          <span className="text-sm">Uploading and processing...</span>
        </div>
      )}

      {status === 'success' && (
        <div className="mt-4 flex items-center gap-2 text-green-400">
          <CheckCircle size={16} />
          <span className="text-sm">Upload complete! Processing for AI search...</span>
        </div>
      )}

      {status === 'error' && (
        <div className="mt-4 flex items-center gap-2 text-red-400">
          <AlertCircle size={16} />
          <span className="text-sm">{errorMessage}</span>
        </div>
      )}
    </div>
  );
}
