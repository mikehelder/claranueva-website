
export interface Recipe {
  id: string;
  title: string;
  originalText: string;
  ingredients: Ingredient[];
  preparation: string[];
  properties: RecipeProperties;
}

export interface Ingredient {
  name: string;
  quantity: string;
  doshaEffect?: DoshaEffect;
}

export interface RecipeProperties {
  primaryDosha: Dosha;
  taste: Taste[];
  potency: 'hot' | 'cold';
  season: Season[];
}

export type Dosha = 'vata' | 'pitta' | 'kapha';
export type DoshaEffect = 'increases' | 'decreases' | 'balances';
export type Taste = 'sweet' | 'sour' | 'salty' | 'pungent' | 'bitter' | 'astringent';
export type Season = 'spring' | 'summer' | 'monsoon' | 'autumn' | 'winter';

export interface FileWithPreview extends File {
  preview?: string;
}
