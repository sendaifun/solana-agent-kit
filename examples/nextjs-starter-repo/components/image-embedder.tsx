"use client";

import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "./ui/button";
import { ImageIcon } from "lucide-react";

interface MultiImagePickerProps {
  onImagesPick: (base64Images: string[]) => void;
  disabled: boolean
}

const MultiImagePicker: React.FC<MultiImagePickerProps> = ({ onImagesPick, disabled }) => {
  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      try {
        const base64Images = await Promise.all(acceptedFiles.map(convertToBase64));
        onImagesPick(base64Images);
      } catch (error) {
        console.error("Error converting images to base64:", error);
      }
    },
    [onImagesPick]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    multiple: true, // Allow multiple file selection
    maxSize: 10485760, // 10 MB per file
  });

  return (
    <div {...getRootProps()} className="cursor-pointer">
      <input disabled={disabled} {...getInputProps()} />
      <Button disabled={disabled} type="button" variant="ghost" size="icon" className="rounded-full shrink-0">
        <ImageIcon className="w-5 h-5" />
        {isDragActive && <span className="sr-only">Drop the images here</span>}
      </Button>
    </div>
  );
};

export default MultiImagePicker;