// Cloudinary file upload utilities
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
  console.warn('[CLOUDINARY] Missing configuration. File upload features will not work.');
  console.warn('[CLOUDINARY] Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your environment variables.');
} else {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
}

/**
 * Upload result interface
 */
export interface UploadResult {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  resourceType: string;
}

/**
 * Upload options
 */
export interface UploadOptions {
  folder?: string;
  transformation?: any;
  resourceType?: 'image' | 'video' | 'raw' | 'auto';
  allowedFormats?: string[];
  maxFileSize?: number; // in bytes
}

/**
 * Upload a file to Cloudinary
 * @param file - Base64 encoded file or file path
 * @param options - Upload options
 */
export async function uploadFile(
  file: string,
  options: UploadOptions = {}
): Promise<UploadResult | null> {
  if (!cloudName || !apiKey || !apiSecret) {
    console.error('[CLOUDINARY] Cloudinary not configured. Cannot upload file.');
    return null;
  }

  try {
    const {
      folder = 'booking-platform',
      transformation,
      resourceType = 'auto',
      allowedFormats,
    } = options;

    const uploadOptions: any = {
      folder,
      resource_type: resourceType,
      transformation,
    };

    if (allowedFormats) {
      uploadOptions.allowed_formats = allowedFormats;
    }

    const result = await cloudinary.uploader.upload(file, uploadOptions);

    return {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      resourceType: result.resource_type,
    };
  } catch (error) {
    console.error('[CLOUDINARY] Error uploading file:', error);
    return null;
  }
}

/**
 * Upload an image with automatic optimization
 */
export async function uploadImage(
  file: string,
  folder: string = 'booking-platform/images'
): Promise<UploadResult | null> {
  return uploadFile(file, {
    folder,
    resourceType: 'image',
    allowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: {
      quality: 'auto',
      fetch_format: 'auto',
    },
  });
}

/**
 * Upload a user avatar
 */
export async function uploadAvatar(
  file: string,
  userId: string
): Promise<UploadResult | null> {
  return uploadFile(file, {
    folder: 'booking-platform/avatars',
    resourceType: 'image',
    allowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: {
      width: 400,
      height: 400,
      crop: 'fill',
      gravity: 'face',
      quality: 'auto',
      fetch_format: 'auto',
    },
  });
}

/**
 * Upload a property image
 */
export async function uploadPropertyImage(
  file: string,
  propertyId: string
): Promise<UploadResult | null> {
  return uploadFile(file, {
    folder: `booking-platform/properties/${propertyId}`,
    resourceType: 'image',
    allowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: {
      width: 1200,
      height: 800,
      crop: 'fill',
      quality: 'auto',
      fetch_format: 'auto',
    },
  });
}

/**
 * Upload a car image
 */
export async function uploadCarImage(
  file: string,
  carId: string
): Promise<UploadResult | null> {
  return uploadFile(file, {
    folder: `booking-platform/cars/${carId}`,
    resourceType: 'image',
    allowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: {
      width: 1200,
      height: 800,
      crop: 'fill',
      quality: 'auto',
      fetch_format: 'auto',
    },
  });
}

/**
 * Delete a file from Cloudinary
 */
export async function deleteFile(publicId: string): Promise<boolean> {
  if (!cloudName || !apiKey || !apiSecret) {
    console.error('[CLOUDINARY] Cloudinary not configured. Cannot delete file.');
    return false;
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === 'ok';
  } catch (error) {
    console.error('[CLOUDINARY] Error deleting file:', error);
    return false;
  }
}

/**
 * Delete multiple files from Cloudinary
 */
export async function deleteFiles(publicIds: string[]): Promise<boolean> {
  if (!cloudName || !apiKey || !apiSecret) {
    console.error('[CLOUDINARY] Cloudinary not configured. Cannot delete files.');
    return false;
  }

  try {
    const result = await cloudinary.api.delete_resources(publicIds);
    return result.deleted && Object.keys(result.deleted).length === publicIds.length;
  } catch (error) {
    console.error('[CLOUDINARY] Error deleting files:', error);
    return false;
  }
}

/**
 * Get file details from Cloudinary
 */
export async function getFileDetails(publicId: string): Promise<any | null> {
  if (!cloudName || !apiKey || !apiSecret) {
    console.error('[CLOUDINARY] Cloudinary not configured. Cannot get file details.');
    return null;
  }

  try {
    const result = await cloudinary.api.resource(publicId);
    return result;
  } catch (error) {
    console.error('[CLOUDINARY] Error getting file details:', error);
    return null;
  }
}

/**
 * Generate a signed upload URL for client-side uploads
 */
export function generateUploadSignature(
  folder: string = 'booking-platform',
  timestamp: number = Math.round(Date.now() / 1000)
): { signature: string; timestamp: number; apiKey: string; cloudName: string } | null {
  if (!cloudName || !apiKey || !apiSecret) {
    console.error('[CLOUDINARY] Cloudinary not configured. Cannot generate signature.');
    return null;
  }

  try {
    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp,
        folder,
      },
      apiSecret
    );

    return {
      signature,
      timestamp,
      apiKey,
      cloudName,
    };
  } catch (error) {
    console.error('[CLOUDINARY] Error generating signature:', error);
    return null;
  }
}

/**
 * Get optimized image URL with transformations
 */
export function getOptimizedImageUrl(
  publicId: string,
  options: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: string;
    format?: string;
  } = {}
): string {
  if (!cloudName) {
    console.error('[CLOUDINARY] Cloudinary not configured. Cannot generate URL.');
    return '';
  }

  const {
    width,
    height,
    crop = 'fill',
    quality = 'auto',
    format = 'auto',
  } = options;

  return cloudinary.url(publicId, {
    transformation: {
      width,
      height,
      crop,
      quality,
      fetch_format: format,
    },
    secure: true,
  });
}

