
import { Recipe, FileWithPreview } from '../types';
import { sampleRecipe } from './mockData';
import { log, error as dbgError, warn as dbgWarn } from '@/lib/debug';

// This function now calls the Cloudflare Worker to extract/interpret
// the image using AI. If the worker fails, it falls back to sampleRecipe.
export const extractTextFromImage = async (file: FileWithPreview): Promise<Recipe> => {
  // Use Vite env variable (set VITE_WORKER_URL in .env) or default url from deployed worker AI
  const WORKER_URL = (import.meta as any).env?.VITE_WORKER_URL || 'https://multimodal-vision-ocr-worker.mikevandenhelder.workers.dev';

  log('🚀 Starting image extraction...');
  log(`📤 Worker URL: ${WORKER_URL}`);
  log(`📄 File: ${file.name} (${file.size} bytes)`);

  // Build the multipart form payload
  const form = new FormData();
  form.append('image', file, file.name);
  // Optional: a prompt can be included if the worker expects it
  form.append('prompt', 'Extract the recipe as structured text (title, ingredients, preparation, properties).');

  try {
    log('📡 Sending POST request to worker...');
    const resp = await fetch(WORKER_URL, {
      method: 'POST',
      body: form,
    });

    log(`📊 Worker response status: ${resp.status} ${resp.statusText}`);

    if (!resp.ok) {
      dbgError(`❌ Worker returned non-OK status: ${resp.status}`);
      const errorText = await resp.text();
      dbgError(`📋 Error response body: ${errorText}`);
      throw new Error(`Worker error: ${resp.status}`);
    }

    const json = await resp.json();
    log('✅ Worker response received:', json);

    // The worker returns { result: <string> } on success in current implementation
    const text = (json?.result) ? String(json.result) : String(json || '');

    if (!text) {
      dbgError('❌ Empty response from worker');
      throw new Error('Empty response from worker');
    }

    log('📝 Raw text from worker:', text);

    // Parse the structured response from the worker
    // Use a header-index approach: find the field label, then slice until the next field label.
    const parseField = (fieldName: string): string => {
      const headerRegex = new RegExp(`(?:\\*{1,2}\\s*)?${fieldName}\\s*:\\s*`, 'i');
      const headerMatch = headerRegex.exec(text);
      if (!headerMatch) return '';
      const startIndex = headerMatch.index + headerMatch[0].length;

      // Regex to find the next field header after the current header
      const nextHeaderRegex = /\n\s*(?:\*{1,2}\s*)?(TITLE|INGREDIENTS|PREPARATION|PRIMARY_DOSHA|TASTES|POTENCY|SEASONS|DOSHA_EXPLANATION|DOSHA EXPLANATION|DOSHAEXPLANATION)\s*:/ig;
      nextHeaderRegex.lastIndex = startIndex;
      const nextMatch = nextHeaderRegex.exec(text);
      const endIndex = nextMatch ? nextMatch.index : text.length;
      return text.slice(startIndex, endIndex).trim();
    };

    // Helper to clean leading markdown markers (e.g. "**" or "*") and whitespace
    const cleanField = (s?: string) => (s ? String(s).replace(/^[\*\s]+/, '').trim() : '');

    const title = cleanField(parseField('TITLE')) || 'Extracted Recipe';
    const ingredientsText = cleanField(parseField('INGREDIENTS'));
    const preparationText = cleanField(parseField('PREPARATION'));
    let primaryDoshaText = cleanField(parseField('PRIMARY_DOSHA')).toLowerCase().trim();
    let tastesText = cleanField(parseField('TASTES'));
    let potencyText = cleanField(parseField('POTENCY')).toLowerCase().trim();
    let seasonsText = cleanField(parseField('SEASONS'));
    // Try a few variations for the dosha explanation field (worker might use spaces or different naming)
    let doshaExplanationText = cleanField(parseField('DOSHA_EXPLANATION') || parseField('DOSHA EXPLANATION') || parseField('DOSHAEXPLANATION'));

    log('🔍 Raw parsed fields:', { primaryDoshaText, tastesText, potencyText, seasonsText, doshaExplanationText });

    // Parse ingredients: prefer newline-separated list and strip leading bullets/markers.
    const ingredientLines = ingredientsText
      .split(/\r?\n+/)
      .map(line => line.trim())
      .map(line => line.replace(/^[\u2022\*\-\s]+/, '')) // remove bullets like '*', '•', '-' and leading spaces
      .filter(Boolean);

    const ingredients = ingredientLines.map((line) => {
      // Try patterns in order: "name - qty", "name (qty)", "qty name", or fall back to full line
      let m = line.match(/^(.*?)\s*[-–—]\s*(.+)$/);
      if (m) return { name: m[1].trim(), quantity: m[2].trim() };

      m = line.match(/^(.*?)\s*\(([^)]+)\)$/);
      if (m) return { name: m[1].trim(), quantity: m[2].trim() };

      m = line.match(/^([\d\/\.\s]*?(?:g|kg|ml|l|cup|cups|tsp|tbsp|tablespoon|tablespoons|teaspoon|teaspoons|pinch|clove|cloves|slice|slices)\b)\s+(.+)$/i);
      if (m) return { name: m[2].trim(), quantity: m[1].trim() };

      // Fallback: entire line is the ingredient name (no quantity)
      return { name: line, quantity: '' };
    });

    // Parse preparation steps: split on blank lines or single newlines, preserve numbering order.
    const prepLines = preparationText
      .split(/\r?\n+/)
      .map(line => line.trim())
      .map(line => line.replace(/^[\u2022\*\-\s]+/, '')) // remove bullets
      .map(line => line.replace(/^\d+\.\s*/, '')) // remove leading numbering
      .filter(Boolean);

    const preparation = prepLines.map(line => line.replace(/\s{2,}/g, ' '));

    // Parse tastes - handle various formats
    const validTastes = ['sweet', 'sour', 'salty', 'pungent', 'bitter', 'astringent'];
    let tastes = tastesText
      .split(/[,;]|and/)
      .map(t => t.trim().toLowerCase())
      .filter(t => validTastes.includes(t)) as any[];

    // Parse dosha - normalize common variations
    const validDoshas = ['vata', 'pitta', 'kapha'];
    let primaryDosha = 'vata';
    for (const dosha of validDoshas) {
      if (primaryDoshaText.includes(dosha)) {
        primaryDosha = dosha;
        break;
      }
    }

    // Parse potency - normalize hot/cold and warm/cool
    let potency: 'hot' | 'cold' = 'hot';
    if (potencyText.includes('cold') || potencyText.includes('cool')) {
      potency = 'cold';
    } else if (potencyText.includes('hot') || potencyText.includes('warm')) {
      potency = 'hot';
    }

    // Parse seasons - handle various formats
    const validSeasons = ['spring', 'summer', 'monsoon', 'autumn', 'winter'];
    let seasons = seasonsText
      .split(/[,;]|and/)
      .map(s => s.trim().toLowerCase())
      .filter(s => validSeasons.includes(s)) as any[];

    // Intelligent fallback: if tastes are empty, try to deduce from ingredients
    if (tastes.length === 0) {
      log('⚠️  No tastes found, attempting to deduce from ingredients...');
      // Common ingredient taste mappings
      const ingredientTasteMap: { [key: string]: string[] } = {
        'sweet': ['rice', 'wheat', 'ghee', 'milk', 'honey', 'dates', 'coconut'],
        'bitter': ['turmeric', 'neem', 'bitter melon', 'fenugreek'],
        'pungent': ['chili', 'pepper', 'ginger', 'garlic', 'onion'],
        'salty': ['salt', 'seaweed'],
        'sour': ['lemon', 'lime', 'tamarind', 'yogurt', 'vinegar'],
        'astringent': ['tea', 'pomegranate', 'beans', 'lentils'],
      };

      const ingredientStr = ingredientsText.toLowerCase();
      Object.entries(ingredientTasteMap).forEach(([taste, ingredients]) => {
        if (ingredients.some(ing => ingredientStr.includes(ing)) && !tastes.includes(taste)) {
          tastes.push(taste);
        }
      });
    }

    // Intelligent fallback: if seasons are empty, deduce from potency
    if (seasons.length === 0) {
      log('⚠️  No seasons found, deducing from potency and dosha...');
      if (potency === 'hot') {
        seasons = ['spring', 'autumn', 'winter'];
      } else {
        seasons = ['summer', 'monsoon'];
      }
    }

    log('✨ Parsed recipe:', {
      title,
      ingredients: ingredients.length,
      preparation: preparation.length,
      primaryDosha,
      tastes: tastes.length > 0 ? tastes : '(deduced)',
      potency,
      seasons: seasons.length > 0 ? seasons : '(deduced)'
    });

    const recipe: Recipe = {
      id: String(Date.now()),
      title,
      originalText: text,
      ingredients,
      preparation,
      properties: {
        primaryDosha: primaryDosha as any,
        taste: tastes as any,
        potency: potency as 'hot' | 'cold',
        season: seasons as any,
        doshaExplanation: doshaExplanationText || undefined,
      },
    };

    log('🎉 Successfully extracted recipe from worker');
    return recipe;
  } catch (err) {
    dbgError('❌ Worker call failed:', err);
    dbgWarn('⚠️  Falling back to sampleRecipe (mock data)');
    // Keep the existing mock behavior as a fallback so the app stays usable
    return new Promise((resolve) => {
      setTimeout(() => {
        log('📦 Returning mock sampleRecipe as fallback');
        resolve(sampleRecipe);
      }, 500);
    });
  }
};
