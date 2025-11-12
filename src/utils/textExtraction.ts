
import { Recipe, FileWithPreview } from '../types';
import { sampleRecipe } from './mockData';

// This function now calls the Cloudflare Worker to extract/interpret
// the image using AI. If the worker fails, it falls back to sampleRecipe.
export const extractTextFromImage = async (file: FileWithPreview): Promise<Recipe> => {
  // Use Vite env variable (set VITE_WORKER_URL in .env) or default to local dev worker
  const WORKER_URL = (import.meta as any).env?.VITE_WORKER_URL || 'http://127.0.0.1:8787';

  console.log('🚀 Starting image extraction...');
  console.log(`📤 Worker URL: ${WORKER_URL}`);
  console.log(`📄 File: ${file.name} (${file.size} bytes)`);

  // Build the multipart form payload
  const form = new FormData();
  form.append('image', file, file.name);
  // Optional: a prompt can be included if the worker expects it
  form.append('prompt', 'Extract the recipe as structured text (title, ingredients, preparation, properties).');

  try {
    console.log('📡 Sending POST request to worker...');
    const resp = await fetch(WORKER_URL, {
      method: 'POST',
      body: form,
    });

    console.log(`📊 Worker response status: ${resp.status} ${resp.statusText}`);

    if (!resp.ok) {
      console.error(`❌ Worker returned non-OK status: ${resp.status}`);
      const errorText = await resp.text();
      console.error(`📋 Error response body: ${errorText}`);
      throw new Error(`Worker error: ${resp.status}`);
    }

    const json = await resp.json();
    console.log('✅ Worker response received:', json);

    // The worker returns { result: <string> } on success in current implementation
    const text = (json?.result) ? String(json.result) : String(json || '');

    if (!text) {
      console.error('❌ Empty response from worker');
      throw new Error('Empty response from worker');
    }

    console.log('📝 Raw text from worker:', text);

    // Very small, defensive parser to fill the Recipe shape so the UI can render.
    //  - title: first non-empty line
    //  - originalText: full returned text
    //  - ingredients: lines that look like ingredients (simple heuristic)
    //  - preparation: numbered lines or lines after keywords like "Preparation" or "Method"
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    const title = lines.length > 0 ? lines[0] : 'Extracted Recipe';

    // Ingredients heuristic: lines that contain measurements or commas
    const ingredientCandidates = lines.filter(l => /\b(cup|tsp|tbsp|tablespoon|teaspoon|gram|g|kg|ml|ounce|oz|pinch)\b|[,()]/i.test(l));

    const ingredients = ingredientCandidates.map((line, idx) => ({
      name: line,
      quantity: '',
    }));

    // Preparation heuristic: lines that start with digits or common verbs
    const preparationCandidates = lines.filter(l => /^\d+\.|^step\b|^(mix|heat|boil|cook|simmer|stir)\b/i.test(l));
    const preparation = preparationCandidates.length > 0 ? preparationCandidates : [];

    console.log('✨ Parsed recipe:', { title, ingredients: ingredients.length, preparation: preparation.length });

    const recipe: Recipe = {
      id: String(Date.now()),
      title,
      originalText: text,
      ingredients,
      preparation,
      properties: {
        primaryDosha: 'vata',
        taste: [],
        potency: 'hot',
        season: [],
      },
    };

    console.log('🎉 Successfully extracted recipe from worker');
    return recipe;
  } catch (err) {
    console.error('❌ Worker call failed:', err);
    console.warn('⚠️  Falling back to sampleRecipe (mock data)');
    // Keep the existing mock behavior as a fallback so the app stays usable
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('📦 Returning mock sampleRecipe as fallback');
        resolve(sampleRecipe);
      }, 500);
    });
  }
};
