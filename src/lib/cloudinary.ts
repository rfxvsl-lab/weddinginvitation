/**
 * Cloudinary Upload Utility
 * Upload foto, audio, dan bukti transfer ke Cloudinary
 * Preset: rfx_wedding (terpisah dari rfx_porto)
 */

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.VITE_CLOUDINARY_CLOUD_NAME || 'dxklmdbjv';
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || process.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'rfx_wedding';

export type UploadResourceType = 'image' | 'video' | 'raw' | 'auto';

interface UploadOptions {
  /** Folder di Cloudinary (e.g., 'wedding/photos', 'wedding/proof') */
  folder?: string;
  /** Resource type (default: 'auto') */
  resourceType?: UploadResourceType;
  /** Callback progress 0-100 */
  onProgress?: (percent: number) => void;
  /** Max file size in bytes (default: 10MB for images, 50MB for audio) */
  maxSize?: number;
}

interface UploadResult {
  url: string;
  secureUrl: string;
  publicId: string;
  format: string;
  width?: number;
  height?: number;
  bytes: number;
  resourceType: string;
}

/**
 * Upload a file to Cloudinary
 */
export function uploadToCloudinary(
  file: File | Blob,
  options: UploadOptions = {}
): Promise<UploadResult> {
  const {
    folder = 'wedding',
    resourceType = 'auto',
    onProgress,
    maxSize = 10 * 1024 * 1024, // 10MB default
  } = options;

  return new Promise((resolve, reject) => {
    if (!file) return reject(new Error('Tidak ada file untuk diupload'));

    if (file.size > maxSize) {
      const sizeMB = Math.round(maxSize / 1024 / 1024);
      return reject(new Error(`File melebihi batas ${sizeMB}MB`));
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    if (folder) formData.append('folder', folder);

    const xhr = new XMLHttpRequest();

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      try {
        const res = JSON.parse(xhr.responseText);
        if (xhr.status === 200) {
          resolve({
            url: res.url,
            secureUrl: res.secure_url,
            publicId: res.public_id,
            format: res.format,
            width: res.width,
            height: res.height,
            bytes: res.bytes,
            resourceType: res.resource_type,
          });
        } else {
          reject(new Error(res.error?.message || 'Upload gagal'));
        }
      } catch {
        reject(new Error('Gagal memproses respons upload'));
      }
    };

    xhr.onerror = () => reject(new Error('Network error saat upload'));

    const endpoint = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`;
    xhr.open('POST', endpoint);
    xhr.send(formData);
  });
}

// ============================================
// Convenience functions
// ============================================

/** Upload foto undangan (profil, galeri, love story, OG, BG) */
export function uploadWeddingPhoto(file: File, onProgress?: (p: number) => void) {
  return uploadToCloudinary(file, {
    folder: 'wedding/photos',
    resourceType: 'image',
    onProgress,
    maxSize: 10 * 1024 * 1024, // 10MB
  });
}

/** Upload bukti transfer pembayaran */
export function uploadProofTransfer(file: File, onProgress?: (p: number) => void) {
  return uploadToCloudinary(file, {
    folder: 'wedding/proof',
    resourceType: 'image',
    onProgress,
    maxSize: 5 * 1024 * 1024, // 5MB
  });
}

/** Upload musik/audio pengiring undangan */
export function uploadWeddingAudio(file: File, onProgress?: (p: number) => void) {
  return uploadToCloudinary(file, {
    folder: 'wedding/audio',
    resourceType: 'video', // Cloudinary treats audio as 'video' resource type
    onProgress,
    maxSize: 50 * 1024 * 1024, // 50MB
  });
}

/**
 * Convert File to base64 data URL (untuk preview lokal sebelum upload)
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Gagal membaca file'));
    reader.readAsDataURL(file);
  });
}
