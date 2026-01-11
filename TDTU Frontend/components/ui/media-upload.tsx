"use client";

import { useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, X, Image as ImageIcon, Video, Music, File, Loader2, FileText, FileArchive } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UploadedMedia {
  id: string;
  url: string;
  publicId: string;
  type: 'image' | 'video' | 'audio' | 'file';
  name: string;
  size: number;
}

interface MediaUploadProps {
  value: UploadedMedia[];
  onChange: (media: UploadedMedia[]) => void;
  accept?: 'image' | 'video' | 'audio' | 'file' | 'all' | 'media';
  multiple?: boolean;
  maxFiles?: number;
  maxSize?: number; // in MB
  className?: string;
  disabled?: boolean;
  placeholder?: string;
}

async function uploadFile(file: File, folder: string = 'tsdi-uploads'): Promise<UploadedMedia> {
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
  
  // Determine type from resourceType or mimetype
  let type: 'image' | 'video' | 'audio' | 'file' = 'file';
  if (data.resourceType === 'image' || file.type.startsWith('image/')) {
    type = 'image';
  } else if (data.resourceType === 'video' || file.type.startsWith('video/')) {
    type = 'video';
  } else if (file.type.startsWith('audio/')) {
    type = 'audio';
  }
  
  return {
    id: data.publicId,
    url: data.url,
    publicId: data.publicId,
    type,
    name: file.name,
    size: data.bytes || file.size,
  };
}

export function MediaUpload({
  value = [],
  onChange,
  accept = 'all',
  multiple = true,
  maxFiles = 10,
  maxSize = 50, // 50MB default
  className,
  disabled = false,
  placeholder,
}: MediaUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  const getAcceptString = () => {
    switch (accept) {
      case 'image':
        return 'image/jpeg,image/png,image/gif,image/webp';
      case 'video':
        return 'video/mp4,video/webm,video/quicktime';
      case 'audio':
        return 'audio/mpeg,audio/wav,audio/ogg';
      case 'file':
        return '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar';
      case 'media':
        return 'image/*,video/*,audio/*';
      default:
        return 'image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar';
    }
  };

  const getPlaceholder = () => {
    if (placeholder) return placeholder;
    switch (accept) {
      case 'image':
        return 'JPG, PNG, GIF, WEBP';
      case 'video':
        return 'MP4, WEBM, MOV';
      case 'audio':
        return 'MP3, WAV, OGG';
      case 'file':
        return 'PDF, DOC, XLS, PPT, TXT, ZIP';
      case 'media':
        return 'Rasm, Video, Audio';
      default:
        return 'Rasm, Video, Audio, Fayllar';
    }
  };

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (value.length + files.length > maxFiles) {
      setError(`Maksimum ${maxFiles} ta fayl yuklash mumkin`);
      return;
    }

    setIsUploading(true);
    setError(null);
    const newMedia: UploadedMedia[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadProgress(`${i + 1}/${files.length}: ${file.name}`);
        
        // Check file size
        if (file.size > maxSize * 1024 * 1024) {
          setError(`"${file.name}" hajmi ${maxSize}MB dan oshmasligi kerak`);
          continue;
        }

        const media = await uploadFile(file, `tsdi-uploads/${accept === 'image' ? 'images' : accept === 'video' ? 'videos' : 'files'}`);
        newMedia.push(media);
      }
      
      onChange([...value, ...newMedia]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Yuklashda xatolik');
    } finally {
      setIsUploading(false);
      setUploadProgress('');
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  }, [accept, maxFiles, maxSize, onChange, value]);

  const handleRemove = useCallback((id: string) => {
    onChange(value.filter(m => m.id !== id));
  }, [onChange, value]);

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <ImageIcon className="h-6 w-6 text-blue-500" />;
      case 'video':
        return <Video className="h-6 w-6 text-purple-500" />;
      case 'audio':
        return <Music className="h-6 w-6 text-green-500" />;
      default:
        return <FileText className="h-6 w-6 text-gray-500" />;
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className={cn('space-y-3', className)}>
      <input
        ref={inputRef}
        type="file"
        accept={getAcceptString()}
        multiple={multiple}
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || isUploading}
      />
      
      {/* Upload Area */}
      <Card 
        className={cn(
          "border-2 border-dashed cursor-pointer transition-all duration-300",
          "hover:border-primary/50 hover:bg-primary/5",
          (isUploading || disabled) && "opacity-50 pointer-events-none"
        )}
        onClick={() => inputRef.current?.click()}
      >
        <CardContent className="flex flex-col items-center justify-center py-6 px-4">
          {isUploading ? (
            <>
              <Loader2 className="h-8 w-8 text-primary animate-spin mb-2" />
              <p className="text-xs text-muted-foreground">Yuklanmoqda...</p>
              {uploadProgress && (
                <p className="text-[10px] text-primary mt-1">{uploadProgress}</p>
              )}
            </>
          ) : (
            <>
              <Upload className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-xs font-medium text-foreground mb-0.5">
                Fayl yuklash uchun bosing
              </p>
              <p className="text-[10px] text-muted-foreground">
                {getPlaceholder()} • Max {maxSize}MB
              </p>
            </>
          )}
        </CardContent>
      </Card>

      {/* Error */}
      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}

      {/* Uploaded files preview */}
      {value.length > 0 && (
        <div className="space-y-2">
          {value.map((media) => (
            <div 
              key={media.id} 
              className="flex items-center gap-3 p-2 rounded-lg bg-muted/50 border border-border/50"
            >
              {/* Preview or Icon */}
              {media.type === 'image' ? (
                <div className="h-10 w-10 rounded-lg overflow-hidden bg-muted shrink-0">
                  <img
                    src={media.url}
                    alt={media.name}
                    className="object-cover w-full h-full"
                  />
                </div>
              ) : media.type === 'video' ? (
                <div className="h-10 w-10 rounded-lg overflow-hidden bg-muted shrink-0 relative">
                  <video
                    src={media.url}
                    className="object-cover w-full h-full"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <Video className="h-4 w-4 text-white" />
                  </div>
                </div>
              ) : (
                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  {getFileIcon(media.type)}
                </div>
              )}
              
              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{media.name}</p>
                <p className="text-[10px] text-muted-foreground">
                  {formatSize(media.size)}
                </p>
              </div>
              
              {/* Remove button */}
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive hover:text-destructive shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(media.id);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Simple image-only upload for contacts
interface ImageUploadProps {
  value?: string;
  onChange: (url: string | undefined) => void;
  className?: string;
  disabled?: boolean;
}

export function ImageUpload({
  value,
  onChange,
  className,
  disabled = false,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (5MB max for images)
    if (file.size > 5 * 1024 * 1024) {
      setError('Rasm hajmi 5MB dan oshmasligi kerak');
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      setError('Faqat rasm yuklash mumkin');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const media = await uploadFile(file, 'tsdi-uploads/avatars');
      onChange(media.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Yuklashda xatolik');
    } finally {
      setIsUploading(false);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || isUploading}
      />
      
      <div className="flex items-center gap-3">
        {/* Preview */}
        <div 
          className={cn(
            "h-16 w-16 rounded-full overflow-hidden bg-muted border-2 border-dashed border-border cursor-pointer transition-all hover:border-primary/50",
            (isUploading || disabled) && "opacity-50 pointer-events-none"
          )}
          onClick={() => inputRef.current?.click()}
        >
          {isUploading ? (
            <div className="h-full w-full flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : value ? (
            <img src={value} alt="Avatar" className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full flex items-center justify-center">
              <ImageIcon className="h-6 w-6 text-muted-foreground" />
            </div>
          )}
        </div>
        
        <div className="flex-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 text-xs"
            onClick={() => inputRef.current?.click()}
            disabled={disabled || isUploading}
          >
            {value ? "Rasmni o'zgartirish" : "Rasm yuklash"}
          </Button>
          {value && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 text-xs text-destructive ml-2"
              onClick={() => onChange(undefined)}
              disabled={disabled}
            >
              O'chirish
            </Button>
          )}
          <p className="text-[10px] text-muted-foreground mt-1">
            JPG, PNG, GIF, WEBP • Max 5MB
          </p>
        </div>
      </div>
      
      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
    </div>
  );
}
