import { FileTypeResult, fileTypeFromBuffer } from 'file-type';

/**
 * File validation utilities for secure file upload handling.
 * 
 * SECURITY NOTES:
 * - Always validate both MIME type and magic bytes
 * - Don't trust file extensions; they can be spoofed
 * - Validate file size before processing
 */

/**
 * Allowed file types with their magic bytes and MIME types.
 */
export const ALLOWED_FILE_TYPES = {
  // Images
  'image/jpeg': { extensions: ['jpg', 'jpeg'], category: 'image' },
  'image/png': { extensions: ['png'], category: 'image' },
  'image/gif': { extensions: ['gif'], category: 'image' },
  'image/webp': { extensions: ['webp'], category: 'image' },
  
  // Videos
  'video/mp4': { extensions: ['mp4'], category: 'video' },
  'video/webm': { extensions: ['webm'], category: 'video' },
  
  // Audio
  'audio/mpeg': { extensions: ['mp3'], category: 'audio' },
  'audio/ogg': { extensions: ['ogg'], category: 'audio' },
} as const;

export type AllowedMimeType = keyof typeof ALLOWED_FILE_TYPES;
export type FileCategory = 'image' | 'video' | 'audio';

export interface FileValidationResult {
  isValid: boolean;
  mimeType: string | null;
  category: FileCategory | null;
  error?: string;
}

/**
 * Validate file by checking magic bytes (file signature).
 * More secure than trusting MIME type header.
 */
export async function validateFileByMagicBytes(
  buffer: Buffer,
  allowedMimeTypes: string[]
): Promise<FileValidationResult> {
  try {
    const fileType: FileTypeResult | undefined = await fileTypeFromBuffer(buffer);
    
    if (!fileType) {
      return {
        isValid: false,
        mimeType: null,
        category: null,
        error: 'Unable to determine file type from content',
      };
    }

    const { mime } = fileType;

    if (!allowedMimeTypes.includes(mime)) {
      return {
        isValid: false,
        mimeType: mime,
        category: null,
        error: `File type '${mime}' is not allowed`,
      };
    }

    const typeInfo = ALLOWED_FILE_TYPES[mime as AllowedMimeType];
    const category = typeInfo?.category || null;

    return {
      isValid: true,
      mimeType: mime,
      category: category as FileCategory,
    };
  } catch (error) {
    return {
      isValid: false,
      mimeType: null,
      category: null,
      error: 'Error validating file type',
    };
  }
}

/**
 * Validate file size.
 */
export function validateFileSize(size: number, maxSize: number): boolean {
  return size > 0 && size <= maxSize;
}

/**
 * Generate a safe filename by removing special characters.
 */
export function sanitizeFilename(filename: string): string {
  // Remove path traversal attempts
  const basename = filename.replace(/^.*[\\/]/, '');
  
  // Remove special characters, keep only alphanumeric, dash, underscore, dot
  const sanitized = basename.replace(/[^a-zA-Z0-9._-]/g, '_');
  
  // Prevent hidden files
  const noHidden = sanitized.replace(/^\.+/, '');
  
  // Limit length
  const limited = noHidden.substring(0, 200);
  
  return limited || 'file';
}

/**
 * Generate a unique storage key for a file.
 */
export function generateStorageKey(
  category: FileCategory,
  originalFilename: string,
  uuid: string
): string {
  const sanitized = sanitizeFilename(originalFilename);
  const extension = sanitized.split('.').pop() || '';
  const timestamp = Date.now();
  
  return `${category}/${timestamp}_${uuid}.${extension}`;
}
