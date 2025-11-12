
import React, { useState, useCallback } from 'react';
import { FileWithPreview } from '../types';
import { Button } from "@/components/ui/button";
import { Upload, Image, FileText } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

interface RecipeUploaderProps {
  onImageUploaded: (file: FileWithPreview) => void;
  isProcessing: boolean;
}

const RecipeUploader: React.FC<RecipeUploaderProps> = ({ onImageUploaded, isProcessing }) => {
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      handleFile(file);
    }
  }, [onImageUploaded]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      handleFile(file);
    }
  };

  const handleFile = (file: File) => {
    console.log('📌 [RecipeUploader] File selected:', file.name, file.type);
    // Check if the file is an image
    if (!file.type.match('image.*')) {
      console.warn('❌ [RecipeUploader] Invalid file type:', file.type);
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (JPEG, PNG, etc.).",
        variant: "destructive"
      });
      return;
    }

    // Add preview URL to the file
    const fileWithPreview = Object.assign(file, {
      preview: URL.createObjectURL(file)
    }) as FileWithPreview;

    console.log('✅ [RecipeUploader] Calling onImageUploaded with:', fileWithPreview.name);
    onImageUploaded(fileWithPreview);

    toast({
      title: "Image uploaded",
      description: "Your recipe image has been uploaded successfully.",
    });
  };

  return (
    <div className="my-8 max-w-2xl mx-auto">
      <div
        className={`drop-zone ${isDragging ? 'active' : ''} ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <div className="flex flex-col items-center justify-center">
          <Upload className="w-12 h-12 text-ayurveda-terra mb-4" />
          <h3 className="text-xl font-medium mb-2">Upload Your Ayurvedic Recipe</h3>
          <p className="text-center text-muted-foreground mb-6">
            Drag and drop your handwritten Sanskrit recipe, or click to browse
          </p>

          <div className="flex gap-4">
            <Button
              onClick={() => document.getElementById('file-upload')?.click()}
              className="bg-ayurveda-terra hover:bg-ayurveda-terra/80"
              disabled={isProcessing}
            >
              <FileText className="mr-2 h-4 w-4" /> Choose File
            </Button>

            <Button
              variant="outline"
              className="border-ayurveda-terra text-ayurveda-terra hover:bg-ayurveda-terra/10"
              disabled={isProcessing}
              onClick={() => document.getElementById('sample-image')?.click()}
            >
              <Image className="mr-2 h-4 w-4" /> Use Sample
            </Button>
          </div>

          <input
            type="file"
            id="file-upload"
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
            disabled={isProcessing}
          />

          <button
            id="sample-image"
            className="hidden"
            onClick={() => {
              // Create a mock file from a sample image
              fetch('/placeholder.svg')
                .then(response => response.blob())
                .then(blob => {
                  const file = new File([blob], "sample-recipe.png", { type: "image/png" });
                  handleFile(file);
                });
            }}
          />

          <div className="mt-4 text-sm text-muted-foreground">
            {isProcessing ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-ayurveda-terra mr-2"></div>
                Processing your recipe...
              </div>
            ) : (
              <p>Supported formats: JPEG, PNG, GIF</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeUploader;
