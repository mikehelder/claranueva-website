# Ayurvedic Recipe Analysis - Intelligent Deduction Guide

## Overview

When analyzing Ayurvedic recipes, the system now intelligently deduces missing information using Ayurvedic knowledge principles and ingredient analysis. This ensures visualizations and recipe properties are always populated even when the image doesn't explicitly show all details.

## Deduction Strategy

### 1. **Primary Dosha Deduction**
The AI model deduces the primary dosha based on:
- **Ingredient thermal properties**: Hot ingredients (ginger, chili, black pepper) indicate Pitta/Vata balance; cool ingredients (coconut, milk, ghee) indicate Kapha/Pitta balance
- **Taste profile**: Sweet (balances Vata), Bitter (balances Kapha), Pungent (balances Kapha)
- **Digestive qualities**: Heating spices suggest benefits for Vata-dominant constitution
- **Common recipe patterns**: Rice-based with cooling spices typically benefits Pitta

### 2. **Tastes Deduction**
If tastes are not explicitly listed, the frontend analyzes ingredient names:

| Ingredient | Tastes |
|-----------|--------|
| Rice, Wheat, Ghee, Milk, Honey | Sweet |
| Turmeric, Neem, Bitter Melon | Bitter |
| Chili, Pepper, Ginger, Garlic, Onion | Pungent |
| Lemon, Lime, Tamarind, Yogurt | Sour |
| Tea, Pomegranate, Beans, Lentils | Astringent |

**Frontend Fallback Logic**: If the worker doesn't return tastes, the parser scans ingredient text for known taste mappings and builds the taste array automatically.

### 3. **Potency Deduction**
The model deduces hot/cold from:
- **Individual ingredients**: Ginger, black pepper, chili = HOT; Coconut milk, rose, jasmine = COLD
- **Cooking method**: If fried or cooked with heating spices = HOT; if raw, chilled, or with cooling ingredients = COLD
- **Recipe type**: Soups and stews with root vegetables = often HOT

**Frontend Normalization**: Accepts "warm" as HOT, "cool" as COLD for flexibility.

### 4. **Seasons Deduction**
If seasons are not explicit:

| Potency | Best Seasons |
|---------|--------------|
| HOT | Spring, Autumn, Winter (when warmth is beneficial) |
| COLD | Summer, Monsoon (when cooling is beneficial) |

This ensures recipes are appropriate for the seasons that match their thermal profile.

## Example Workflow

**Scenario**: Image shows "Khichdi with vegetables" (title visible) but no explicit dosha/taste/season info.

### Worker Analysis:
```
Ingredients identified: rice, mung beans, turmeric, ghee, cumin, ginger
AI deduction:
- PRIMARY_DOSHA: Vata (because khichdi + ghee is known as Vata balancing)
- TASTES: sweet (rice, ghee, mung beans), pungent (ginger, cumin)
- POTENCY: warm (ghee + ginger = heating)
- SEASONS: autumn, winter, spring (warm recipe for cooler times)
```

### Frontend Enhancement (if worker data incomplete):
1. If TASTES was empty, parser finds: rice → sweet, ginger → pungent
2. If SEASONS was empty, parser deduces: potency=warm → spring, autumn, winter
3. Visualizations render with complete data

## Testing the Deduction System

### Local Testing with Debug Mode:

```bash
# Set in .env.local
VITE_DEBUG=DEBUG

# Upload a recipe with incomplete information
# Check browser console for:
# - "⚠️ No tastes found, attempting to deduce from ingredients..."
# - "⚠️ No seasons found, deducing from potency and dosha..."
# - Complete parsed recipe with all fields
```

### Expected Console Output:

```
🔍 Raw parsed fields: { 
  primaryDoshaText: 'vata',
  tastesText: '',  // Empty
  potencyText: 'warm',
  seasonsText: ''  // Empty
}
⚠️ No tastes found, attempting to deduce from ingredients...
⚠️ No seasons found, deducing from potency and dosha...
✨ Parsed recipe: { 
  title: 'Khichdi',
  ingredients: 6,
  preparation: 5,
  primaryDosha: 'vata',
  tastes: '(deduced)',
  potency: 'hot',
  seasons: '(deduced)'
}
🎉 Successfully extracted recipe from worker
```

## Limitations & Recommendations

1. **Ingredient Recognition**: The system works best when ingredients are clearly visible or legible in the image
2. **Complex Recipes**: Multi-dish recipes may confuse the model; provide clearest single-recipe images
3. **Regional Variations**: Different regions may use different ingredients; Ayurvedic principles are applied generally
4. **Manual Refinement**: Users can manually edit extracted recipes if deductions seem incorrect

## Future Enhancements

- Store user corrections to improve model fine-tuning
- Add ingredient dictionary with pre-mapped Ayurvedic properties
- Support seasonal recipe recommendations based on current date
- ML model to classify recipe complexity and confidence scores
