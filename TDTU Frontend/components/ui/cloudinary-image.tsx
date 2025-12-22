"use client";

import Image from 'next/image';
import { cn } from '@/lib/utils';

// Cloudinary cloud name from environment variable only
const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

// Helper function to check if it's a local/relative URL
function isLocalUrl(src: string): boolean {
  return src.startsWith('/') || src.startsWith('./') || src.startsWith('../');
}

// Helper to build Cloudinary URL
function buildCloudinaryUrl(
  src: string,
  options: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: string | number;
    format?: string;
  } = {}
): string {
  const { width, height, crop = 'fill', quality = 'auto', format = 'auto' } = options;
  
  // If already a full URL, return as is
  if (src.startsWith('http://') || src.startsWith('https://')) {
    return src;
  }
  
  // Build transformation string
  const transforms = [
    width && `w_${width}`,
    height && `h_${height}`,
    `c_${crop}`,
    `q_${quality}`,
    `f_${format}`,
  ].filter(Boolean).join(',');

  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transforms}/${src}`;
}

interface CloudinaryImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  crop?: 'fill' | 'scale' | 'fit' | 'pad' | 'thumb' | 'crop';
  quality?: 'auto' | number;
  format?: 'auto' | 'webp' | 'avif' | 'png' | 'jpg';
  priority?: boolean;
}

export function CloudinaryImage({
  src,
  alt,
  width,
  height,
  className,
  crop = 'fill',
  quality = 'auto',
  format = 'auto',
  priority = false,
}: CloudinaryImageProps) {
  // If it's a local URL, use next/image directly
  if (isLocalUrl(src)) {
    return (
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={cn('object-cover', className)}
        priority={priority}
      />
    );
  }

  // Build optimized Cloudinary URL
  const imageUrl = buildCloudinaryUrl(src, { width, height, crop, quality, format });

  return (
    <Image
      src={imageUrl}
      alt={alt}
      width={width}
      height={height}
      className={cn('object-cover', className)}
      priority={priority}
      unoptimized
    />
  );
}

interface CloudinaryAvatarProps {
  src: string;
  alt: string;
  size?: number;
  className?: string;
}

export function CloudinaryAvatar({
  src,
  alt,
  size = 40,
  className,
}: CloudinaryAvatarProps) {
  return (
    <CloudinaryImage
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={cn('rounded-full', className)}
      crop="fill"
    />
  );
}

interface CloudinaryThumbnailProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
}

export function CloudinaryThumbnail({
  src,
  alt,
  width = 200,
  height = 200,
  className,
}: CloudinaryThumbnailProps) {
  return (
    <CloudinaryImage
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={cn('rounded-lg', className)}
      crop="fill"
    />
  );
}

// Video component
interface CloudinaryVideoProps {
  src: string;
  width?: number;
  height?: number;
  className?: string;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  controls?: boolean;
  poster?: string;
}

export function CloudinaryVideo({
  src,
  width = 640,
  height = 360,
  className,
  autoPlay = false,
  loop = false,
  muted = true,
  controls = true,
  poster,
}: CloudinaryVideoProps) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dm4byivx7';
  
  // Build video URL
  const videoUrl = src.includes('cloudinary.com')
    ? src
    : `https://res.cloudinary.com/${cloudName}/video/upload/q_auto,f_auto/${src}`;

  // Build poster URL if public_id provided
  const posterUrl = poster
    ? `https://res.cloudinary.com/${cloudName}/video/upload/w_${width},h_${height},c_fill,q_auto,f_jpg,so_0/${poster}`
    : undefined;

  return (
    <video
      src={videoUrl}
      width={width}
      height={height}
      className={cn('rounded-lg', className)}
      autoPlay={autoPlay}
      loop={loop}
      muted={muted}
      controls={controls}
      poster={posterUrl}
      playsInline
    >
      Your browser does not support the video tag.
    </video>
  );
}

// Helper to get optimized URL
export function getCloudinaryUrl(
  publicId: string,
  options: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: string | number;
    format?: string;
    resourceType?: 'image' | 'video';
  } = {}
): string {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dm4byivx7';
  const { 
    width, 
    height, 
    crop = 'auto', 
    quality = 'auto', 
    format = 'auto',
    resourceType = 'image'
  } = options;

  const transformations = [
    width && `w_${width}`,
    height && `h_${height}`,
    `c_${crop}`,
    `q_${quality}`,
    `f_${format}`,
    'g_auto',
  ].filter(Boolean).join(',');

  return `https://res.cloudinary.com/${cloudName}/${resourceType}/upload/${transformations}/${publicId}`;
}
