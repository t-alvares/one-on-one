import { useState, useCallback, useRef } from 'react';
import {
  uploadImage,
  uploadAttachment,
  createPreviewUrl,
  revokePreviewUrl,
  type UploadResult,
  type UploadProgress,
} from '../services/uploadService';

export interface UploadState {
  isUploading: boolean;
  progress: number;
  error: string | null;
  previewUrl: string | null;
  result: UploadResult | null;
}

export interface UseImageUploadOptions {
  onSuccess?: (result: UploadResult) => void;
  onError?: (error: string) => void;
  type?: 'image' | 'file';
}

export function useImageUpload(options: UseImageUploadOptions = {}) {
  const { onSuccess, onError, type = 'image' } = options;

  const [state, setState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    error: null,
    previewUrl: null,
    result: null,
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const previewUrlRef = useRef<string | null>(null);

  // Cleanup preview URL
  const cleanupPreview = useCallback(() => {
    if (previewUrlRef.current) {
      revokePreviewUrl(previewUrlRef.current);
      previewUrlRef.current = null;
    }
  }, []);

  // Reset state
  const reset = useCallback(() => {
    cleanupPreview();
    setState({
      isUploading: false,
      progress: 0,
      error: null,
      previewUrl: null,
      result: null,
    });
  }, [cleanupPreview]);

  // Handle progress updates
  const handleProgress = useCallback((progress: UploadProgress) => {
    setState((prev) => ({
      ...prev,
      progress: progress.percentage,
    }));
  }, []);

  // Upload a file
  const upload = useCallback(
    async (file: File): Promise<UploadResult | null> => {
      // Clean up any previous preview
      cleanupPreview();

      // Create preview URL for images
      if (file.type.startsWith('image/')) {
        const previewUrl = createPreviewUrl(file);
        previewUrlRef.current = previewUrl;
        setState((prev) => ({ ...prev, previewUrl }));
      }

      setState((prev) => ({
        ...prev,
        isUploading: true,
        progress: 0,
        error: null,
        result: null,
      }));

      try {
        const uploadFn = type === 'image' ? uploadImage : uploadAttachment;
        const result = await uploadFn(file, handleProgress);

        setState((prev) => ({
          ...prev,
          isUploading: false,
          progress: 100,
          result,
        }));

        onSuccess?.(result);
        return result;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Upload failed';

        setState((prev) => ({
          ...prev,
          isUploading: false,
          error: errorMessage,
        }));

        onError?.(errorMessage);
        return null;
      }
    },
    [type, cleanupPreview, handleProgress, onSuccess, onError]
  );

  // Handle file input change
  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        await upload(file);
      }
      // Reset input so same file can be selected again
      if (event.target) {
        event.target.value = '';
      }
    },
    [upload]
  );

  // Open file picker
  const openFilePicker = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  // Handle paste event (for clipboard images)
  const handlePaste = useCallback(
    async (event: ClipboardEvent): Promise<UploadResult | null> => {
      const items = event.clipboardData?.items;
      if (!items) return null;

      for (const item of items) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            event.preventDefault();
            return await upload(file);
          }
        }
      }
      return null;
    },
    [upload]
  );

  // Handle drop event (for drag & drop)
  const handleDrop = useCallback(
    async (event: DragEvent): Promise<UploadResult | null> => {
      const file = event.dataTransfer?.files[0];
      if (file) {
        const isImage = file.type.startsWith('image/');
        if ((type === 'image' && isImage) || type === 'file') {
          event.preventDefault();
          return await upload(file);
        }
      }
      return null;
    },
    [type, upload]
  );

  // Get accept attribute for file input
  const getAcceptAttribute = useCallback(() => {
    if (type === 'image') {
      return 'image/jpeg,image/png,image/gif,image/webp';
    }
    return '.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv';
  }, [type]);

  // Create file input element
  const createFileInput = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = getAcceptAttribute();
    input.style.display = 'none';
    input.addEventListener('change', async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        await upload(file);
      }
      input.remove();
    });
    document.body.appendChild(input);
    return input;
  }, [getAcceptAttribute, upload]);

  // Trigger file selection
  const selectFile = useCallback(() => {
    const input = createFileInput();
    input.click();
  }, [createFileInput]);

  return {
    ...state,
    upload,
    reset,
    selectFile,
    openFilePicker,
    handleFileChange,
    handlePaste,
    handleDrop,
    fileInputRef,
    getAcceptAttribute,
  };
}

export default useImageUpload;
