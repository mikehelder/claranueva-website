
import { Recipe, FileWithPreview } from '../types';
import { sampleRecipe } from './mockData';

// This is a mock function that simulates text extraction
// In a real application, this would use OCR technology
export const extractTextFromImage = async (file: FileWithPreview): Promise<Recipe> => {
  return new Promise((resolve) => {
    // Simulate processing time
    setTimeout(() => {
      console.log('Extracted text from image:', file.name);
      resolve(sampleRecipe);
    }, 2000);
  });
};
