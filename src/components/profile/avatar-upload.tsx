"use client";

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Camera, Loader2, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface AvatarUploadProps {
  currentAvatar?: string;
  userName: string;
  onUploadComplete?: (url: string) => void;
  className?: string;
}

export function AvatarUpload({ currentAvatar, userName, onUploadComplete, className }: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file (JPG, PNG, or WebP).",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    setIsUploading(true);

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onloadend = async () => {
        const base64String = reader.result as string;

        // Upload to server
        const response = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            file: base64String,
            type: 'avatar',
          }),
        });

        if (!response.ok) {
          throw new Error('Upload failed');
        }

        const data = await response.json();

        toast({
          title: "Avatar updated!",
          description: "Your profile picture has been updated successfully.",
        });

        // Call callback with new URL
        if (onUploadComplete) {
          onUploadComplete(data.url);
        }

        setIsUploading(false);
      };

      reader.onerror = () => {
        throw new Error('Failed to read file');
      };
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload avatar. Please try again.",
        variant: "destructive",
      });
      setPreviewUrl(null);
      setIsUploading(false);
    }
  };

  const handleRemovePreview = () => {
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const displayAvatar = previewUrl || currentAvatar;
  const initials = userName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      <div className="relative group">
        <Avatar className="h-32 w-32 border-4 border-background shadow-lg">
          <AvatarImage src={displayAvatar} alt={userName} />
          <AvatarFallback className="text-3xl font-semibold bg-gradient-to-br from-primary to-primary/60 text-primary-foreground">
            {initials}
          </AvatarFallback>
        </Avatar>

        {/* Upload overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <Camera className="h-6 w-6" />
            )}
          </Button>
        </div>

        {/* Remove preview button */}
        {previewUrl && !isUploading && (
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute -top-2 -right-2 h-8 w-8 rounded-full shadow-lg"
            onClick={handleRemovePreview}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="flex flex-col items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="gap-2"
        >
          {isUploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              Change Avatar
            </>
          )}
        </Button>
        <p className="text-xs text-muted-foreground text-center">
          JPG, PNG or WebP. Max 5MB.
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}

