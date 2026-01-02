import api from './api';

/**
 * Upload Service
 * Handles file uploads to the API
 */

export interface UploadResult {
  id: string;
  url: string;
  filename: string;
  mimeType: string;
  size: number;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export type UploadProgressCallback = (progress: UploadProgress) => void;

/**
 * Upload a file to the server
 * @param file - The file to upload
 * @param onProgress - Optional progress callback
 * @returns Upload result with URL and metadata
 */
export async function uploadFile(
  file: File,
  onProgress?: UploadProgressCallback
): Promise<UploadResult> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post<{ success: boolean; data: UploadResult }>(
    '/uploads',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentage = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress({
            loaded: progressEvent.loaded,
            total: progressEvent.total,
            percentage,
          });
        }
      },
    }
  );

  return response.data.data;
}

/**
 * Upload an image file
 * Validates that the file is an image before uploading
 */
export async function uploadImage(
  file: File,
  onProgress?: UploadProgressCallback
): Promise<UploadResult> {
  const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

  if (!validImageTypes.includes(file.type)) {
    throw new Error('Invalid image type. Please upload a JPEG, PNG, GIF, or WebP image.');
  }

  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    throw new Error('Image is too large. Maximum size is 10MB.');
  }

  return uploadFile(file, onProgress);
}

/**
 * Upload a document/attachment file
 * Validates file type and size
 */
export async function uploadAttachment(
  file: File,
  onProgress?: UploadProgressCallback
): Promise<UploadResult> {
  const validTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv',
  ];

  if (!validTypes.includes(file.type)) {
    throw new Error('Invalid file type. Please upload a PDF, DOC, DOCX, XLS, XLSX, TXT, or CSV file.');
  }

  const maxSize = 25 * 1024 * 1024; // 25MB
  if (file.size > maxSize) {
    throw new Error('File is too large. Maximum size is 25MB.');
  }

  return uploadFile(file, onProgress);
}

/**
 * Delete an uploaded file
 */
export async function deleteUpload(id: string): Promise<void> {
  await api.delete(`/uploads/${id}`);
}

/**
 * Get file icon based on mime type
 */
export function getFileIcon(mimeType: string): string {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType === 'application/pdf') return 'file-text';
  if (mimeType.includes('word')) return 'file-text';
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'file-spreadsheet';
  if (mimeType.includes('text')) return 'file-text';
  return 'file';
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Create a local object URL for preview (before upload)
 */
export function createPreviewUrl(file: File): string {
  return URL.createObjectURL(file);
}

/**
 * Revoke a preview URL to free memory
 */
export function revokePreviewUrl(url: string): void {
  URL.revokeObjectURL(url);
}
