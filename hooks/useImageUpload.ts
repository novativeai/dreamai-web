"use client";

import { useState, useCallback } from "react";

interface UseImageUploadReturn {
  selectedImage: File | null;
  imagePreview: string | null;
  handleImageSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  clearImage: () => void;
  isValidImage: boolean;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export function useImageUpload(): UseImageUploadReturn {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      alert("Please select a valid image file (JPEG, PNG, or WebP)");
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      alert("Image size must be less than 10MB");
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    setSelectedImage(file);
  }, []);

  const clearImage = useCallback(() => {
    setSelectedImage(null);
    setImagePreview(null);
  }, []);

  const isValidImage = selectedImage !== null;

  return {
    selectedImage,
    imagePreview,
    handleImageSelect,
    clearImage,
    isValidImage,
  };
}
