'use client';

import { useCallback, useState } from 'react';
import { Upload, X, FileVideo, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { createVideo, startUpload } from '@/app/actions/video';

export default function VideoUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files[0];
    if (dropped && dropped.type.startsWith('video/')) {
      setFile(dropped);
      setError(null);
    } else {
      setError('Please drop a video file (MP4, MOV, AVI, MKV, WebM)');
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setError(null);
    }
  }, []);

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);
    setProgress(0);

    try {
      // Step 1: Create video record + get presigned URL
      const { videoId, presignedUrl, r2Key } = await startUpload(
        file.name,
        file.type
      );

      if (!videoId || !presignedUrl) {
        throw new Error('Failed to get upload URL');
      }

      // Step 2: Upload directly to R2 via presigned URL with progress tracking
      const xhr = new XMLHttpRequest();

      await new Promise<void>((resolve, reject) => {
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            setProgress(Math.round((e.loaded / e.total) * 100));
          }
        };

        xhr.onload = () => {
          if (xhr.status === 200) {
            resolve();
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        };

        xhr.onerror = () => reject(new Error('Upload failed'));

        xhr.open('PUT', presignedUrl);
        xhr.setRequestHeader('Content-Type', file.type);
        xhr.send(file);
      });

      // Step 3: Confirm upload and trigger AI processing
      await createVideo(videoId, r2Key, file.name);

      // Navigate to project page
      window.location.href = `/dashboard/project/${videoId}`;
    } catch (err) {
      console.error('[VideoUpload] Error:', err);
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className={cn(
          'relative flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed p-8 transition-colors',
          file
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-primary/50 hover:bg-muted/50'
        )}
      >
        {file ? (
          <div className="flex items-center gap-3">
            <FileVideo className="h-8 w-8 text-primary" />
            <div className="flex flex-col">
              <span className="font-medium text-sm">{file.name}</span>
              <span className="text-xs text-muted-foreground">
                {(file.size / (1024 * 1024)).toFixed(1)} MB
              </span>
            </div>
            {!uploading && (
              <button
                onClick={() => setFile(null)}
                className="ml-2 text-muted-foreground hover:text-destructive transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        ) : (
          <>
            <Upload className="h-10 w-10 text-muted-foreground" />
            <div className="text-center">
              <p className="font-medium">
                Drag & drop your video here
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                or click to browse — MP4, MOV, AVI, MKV, WebM
              </p>
            </div>
          </>
        )}

        <input
          type="file"
          accept="video/*"
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={uploading}
        />
      </div>

      {/* Progress Bar */}
      {uploading && (
        <div className="mt-4 w-full">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-muted-foreground">Uploading to Cloudflare R2...</span>
            <span className="font-mono text-primary">{progress}%</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="mt-3 text-sm text-destructive text-center">{error}</p>
      )}

      {/* Upload Button */}
      {file && !uploading && (
        <Button
          onClick={handleUpload}
          className="w-full mt-4 gap-2"
          size="lg"
        >
          <Upload className="h-4 w-4" />
          Upload & Start AI Analysis
        </Button>
      )}

      {uploading && (
        <Button disabled className="w-full mt-4 gap-2" size="lg">
          <Loader2 className="h-4 w-4 animate-spin" />
          Uploading... {progress}%
        </Button>
      )}
    </div>
  );
}
