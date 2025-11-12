
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
    console.log('📌 [Index] Image upload triggered:', file.name);
    setUploadedImage(file);
    setIsProcessing(true);
    try {
      console.log('📌 [Index] Calling extractTextFromImage...');
      const extractedRecipe = await extractTextFromImage(file);
      console.log('📌 [Index] Extraction complete, setting recipe:', extractedRecipe.title);
      setRecipe(extractedRecipe);
    } catch (error) {
      console.error('Error extracting text:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-ayurveda-cream to-white bg-ayurveda-pattern flex flex-col">
      <Header />

      <main className="flex-1 w-full">
        <section className="container mx-auto px-6 py-12">
          {/* Hero */}
          <div className="max-w-4xl mx-auto text-center mb-10">
            <h1 className="text-5xl md:text-6xl font-bold text-ayurveda-terra leading-tight">आयुर्वेद पाकशास्त्र</h1>
            <p className="mt-4 text-lg md:text-xl text-ayurveda-wood/90">
              Convert handwritten Sanskrit Ayurvedic recipes into clean, searchable digital recipes with ingredient parsing and visual summaries.
            </p>
          </div>

          {/* Grid: uploader + preview / recipe */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-5">
              <div className="p-6 bg-white/70 dark:bg-black/40 backdrop-blur-sm rounded-2xl shadow-lg">
                <h2 className="text-2xl font-semibold text-ayurveda-terra mb-3">Upload a recipe</h2>
                <p className="text-sm text-ayurveda-wood mb-4">Snap or upload a photo of a handwritten recipe and let the scribe extract ingredients and steps.</p>
                <RecipeUploader onImageUploaded={handleImageUpload} isProcessing={isProcessing} />

                {uploadedImage && (
                  <div className="mt-6">
                    <div className="recipe-card overflow-hidden rounded-xl">
                      <div className="relative w-full h-56 bg-gray-50 dark:bg-gray-800">
                        <img src={uploadedImage.preview} alt="uploaded" className="w-full h-full object-cover" />
                        {isProcessing && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white" />
                          </div>
                        )}
                      </div>
                      <div className="p-4 text-sm text-ayurveda-wood">Preview — {uploadedImage.name}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="p-6 bg-white/80 dark:bg-black/40 backdrop-blur-sm rounded-2xl shadow-lg space-y-6">
                {!recipe.title ? (
                  <div className="text-center py-16">
                    <h3 className="text-xl font-medium text-ayurveda-terra">No recipe yet</h3>
                    <p className="mt-2 text-ayurveda-wood">Upload an image and the extracted recipe will appear here with visualizations.</p>
                  </div>
                ) : (
                  <>
                    <div>
                      <Separator className="mb-4 bg-ayurveda-terra/20" />
                      <RecipeDisplay recipe={recipe} />
                    </div>

                    <div>
                      <Visualization recipe={recipe} />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="w-full py-8">
        <div className="container mx-auto px-6 text-center text-sm text-ayurveda-wood/80">
          <p>© {new Date().getFullYear()} Ayurveda Recipe Scribe — Bringing ancient wisdom to modern tools</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
