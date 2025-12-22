"use client";

import { useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, X, Image as ImageIcon, Video, Music, File, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UploadedAsset {
  publicId: string;
  secureUrl: string;
  format: string;
  resourceType: string;
  bytes: number;
  width?: number;
  height?: number;
}

interface FileUploadProps {
  onUpload: (asset: UploadedAsset) => void;
  onRemove?: (publicId: string) => void;
  accept?: 'image' | 'video' | 'audio' | 'all';
  multiple?: boolean;
  maxFiles?: number;
  className?: string;
  folder?: string;
}

async function uploadToCloudinary(file: File, folder: string = 'tsdi-uploads'): Promise<UploadedAsset> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);

  const response = await fetch('/api/cloudinary', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Upload failed');
  }

  const data = await response.json();
  return {
    publicId: data.publicId,
    secureUrl: data.url,
    format: data.format || file.type.split('/')[1],
    resourceType: data.resourceType || file.type.split('/')[0],
    bytes: data.bytes || file.size,
    width: data.width,
    height: data.height,
  };
}

export function FileUpload({
  onUpload,
  onRemove,
  accept = 'all',
  multiple = false,
  maxFiles = 5,
  className,
  folder = 'tsdi-uploads',
}: FileUploadProps) {
  const [uploadedAssets, setUploadedAssets] = useState<UploadedAsset[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const getAcceptString = () => {
    switch (accept) {
      case 'image':
        return 'image/*';
      case 'video':
        return 'video/*';
      case 'audio':
        return 'audio/*';
      default:
        return 'image/*,video/*,audio/*';
    }
  };

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (uploadedAssets.length + files.length > maxFiles) {
      setError(`Maksimum ${maxFiles} ta fayl yuklash mumkin`);
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      for (const file of files) {
        if (file.size > 52428800) {
          setError('Fayl hajmi 50MB dan oshmasligi kerak');
          continue;
        }

        const asset = await uploadToCloudinary(file, folder);
        setUploadedAssets(prev => [...prev, asset]);
        onUpload(asset);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Yuklashda xatolik');
    } finally {
      setIsUploading(false);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  }, [folder, maxFiles, onUpload, uploadedAssets.length]);

  const handleRemove = useCallback((publicId: string) => {
    setUploadedAssets(prev => prev.filter(a => a.publicId !== publicId));
    onRemove?.(publicId);
  }, [onRemove]);

  const getFileIcon = (resourceType: string) => {
    switch (resourceType) {
      case 'image':
        return <ImageIcon className="h-8 w-8 text-blue-500" />;
      case 'video':
        return <Video className="h-8 w-8 text-purple-500" />;
      case 'audio':
        return <Music className="h-8 w-8 text-green-500" />;
      default:
        return <File className="h-8 w-8 text-gray-500" />;
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      <input
        ref={inputRef}
        type="file"
        accept={getAcceptString()}
        multiple={multiple}
        onChange={handleFileSelect}
        className="hidden"
        id="file-upload-input"
      />
      
      <Card 
        className={cn(
          "border-2 border-dashed cursor-pointer transition-all duration-300",
          "hover:border-primary/50 hover:bg-primary/5",
          isUploading && "opacity-50 pointer-events-none"
        )}
        onClick={() => inputRef.current?.click()}
      >
        <CardContent className="flex flex-col items-center justify-center py-8 px-4">
          {isUploading ? (
            <>
              <Loader2 className="h-10 w-10 text-primary animate-spin mb-3" />
              <p className="text-sm text-muted-foreground">Yuklanmoqda...</p>
            </>
          ) : (
            <>
              <Upload className="h-10 w-10 text-muted-foreground mb-3" />
              <p className="text-sm font-medium text-foreground mb-1">
                Fayl yuklash uchun bosing
              </p>
              <p className="text-xs text-muted-foreground">
                {accept === 'image' && 'JPG, PNG, GIF, WEBP'}
                {accept === 'video' && 'MP4, WEBM, MOV'}
                {accept === 'audio' && 'MP3, WAV, OGG'}
                {accept === 'all' && 'Rasm, Video, Audio'}
                {' • Max 50MB'}
              </p>
            </>
          )}
        </CardContent>
      </Card>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {/* Uploaded files preview */}
      {uploadedAssets.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {uploadedAssets.map((asset) => (
            <Card key={asset.publicId} className="relative overflow-hidden group">
              <CardContent className="p-3">
                <div className="flex items-center gap-3">
                  {asset.resourceType === 'image' ? (
                    <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-muted">
                      <img
                        src={asset.secureUrl}
                        alt="Uploaded"
                        className="object-cover w-full h-full"
                      />
                    </div>
                  ) : (
                    <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                      {getFileIcon(asset.resourceType)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">
                      {asset.publicId.split('/').pop()}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {(asset.bytes / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                
                {/* Remove button */}
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(asset.publicId);
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// Simple image upload button
interface ImageUploadButtonProps {
  onUpload: (url: string, publicId: string) => void;
  className?: string;
  children?: React.ReactNode;
}

export function ImageUploadButton({
  onUpload,
  className,
  children,
}: ImageUploadButtonProps) {
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const asset = await uploadToCloudinary(file, 'tsdi-uploads/images');
      onUpload(asset.secureUrl, asset.publicId);
    } catch (err) {
      console.error('Upload error:', err);
    } finally {
      setIsUploading(false);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      <Button
        type="button"
        variant="outline"
        className={className}
        onClick={() => inputRef.current?.click()}
        disabled={isUploading}
      >
        {isUploading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          children || (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Rasm yuklash
            </>
          )
        )}
      </Button>
    </>
  );
}
