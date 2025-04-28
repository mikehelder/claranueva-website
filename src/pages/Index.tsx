
import React, { useState } from 'react';
import Header from '@/components/Header';
import RecipeUploader from '@/components/RecipeUploader';
import RecipeDisplay from '@/components/RecipeDisplay';
import Visualization from '@/components/Visualization';
import { FileWithPreview, Recipe } from '@/types';
import { extractTextFromImage } from '@/utils/textExtraction';
import { emptyRecipe } from '@/utils/mockData';
import { Separator } from "@/components/ui/separator";

const Index = () => {
  const [uploadedImage, setUploadedImage] = useState<FileWithPreview | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recipe, setRecipe] = useState<Recipe>(emptyRecipe);

  const handleImageUpload = async (file: FileWithPreview) => {
    setUploadedImage(file);
    setIsProcessing(true);
    
    try {
      const extractedRecipe = await extractTextFromImage(file);
      setRecipe(extractedRecipe);
    } catch (error) {
      console.error('Error extracting text:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-ayurveda-cream to-white bg-ayurveda-pattern">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h1 className="text-4xl font-bold text-ayurveda-terra mb-4">Ayurveda Recipe Scribe</h1>
          <p className="text-lg text-ayurveda-wood">
            Transform your handwritten Sanskrit Ayurvedic recipes into 
            digital format with ingredients, preparation steps, and visualizations.
          </p>
        </div>
        
        <RecipeUploader 
          onImageUploaded={handleImageUpload}
          isProcessing={isProcessing}
        />
        
        {uploadedImage && (
          <div className="mt-8 flex justify-center">
            <div className="relative w-64 h-64 rounded-lg overflow-hidden shadow-lg border-4 border-white">
              <img 
                src={uploadedImage.preview} 
                alt="Uploaded recipe" 
                className="w-full h-full object-cover"
              />
              {isProcessing && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                </div>
              )}
            </div>
          </div>
        )}
        
        {recipe.title && (
          <>
            <Separator className="my-12 bg-ayurveda-terra/20" />
            <RecipeDisplay recipe={recipe} />
            <Visualization recipe={recipe} />
          </>
        )}
      </main>
      
      <footer className="container mx-auto px-4 py-8 text-center text-ayurveda-wood">
        <p>© {new Date().getFullYear()} Ayurveda Recipe Scribe • Bringing ancient wisdom to digital form</p>
      </footer>
    </div>
  );
};

export default Index;
