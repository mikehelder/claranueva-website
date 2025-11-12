# Cloudflare Worker Prompt Guide

## Updated Prompt Format

The Cloudflare Worker now requests structured recipe data from the AI model with explicit fields for:

1. **TITLE**: Recipe name
2. **INGREDIENTS**: List with quantities
3. **PREPARATION**: Numbered steps
4. **PRIMARY_DOSHA**: vata, pitta, or kapha
5. **TASTES**: Comma-separated list from (sweet, sour, salty, pungent, bitter, astringent)
6. **POTENCY**: hot or cold
7. **SEASONS**: Comma-separated list from (spring, summer, monsoon, autumn, winter)
8. **DOSHA_EXPLANATION**: Brief explanation

## Example Worker Response

```
TITLE: Digestive Turmeric Rice
INGREDIENTS:
- 1 cup basmati rice
- 2 teaspoons ghee
- 1/2 teaspoon turmeric powder
- 1 cup vegetable broth
- Salt to taste
PREPARATION:
1. Heat ghee in a saucepan
2. Add rice and stir for 2 minutes
3. Add turmeric and salt
4. Pour broth and bring to boil
5. Reduce heat and simmer for 15 minutes
6. Let cool for 5 minutes before serving
PRIMARY_DOSHA: pitta
TASTES: sweet, bitter
POTENCY: warm
SEASONS: spring, autumn
DOSHA_EXPLANATION: This recipe is beneficial for Pitta as turmeric aids digestion and ghee cools the system, while the warming spices prevent Vata imbalance.
```

## Frontend Parsing

The `textExtraction.ts` file now:
1. Parses each field using regex pattern matching
2. Validates dosha, tastes, potency, and seasons against allowed values
3. Populates the Recipe object with complete properties
4. Passes data to visualizations (Dosha Triangle, Taste Hexagon)

## Visualization Data Flow

- **Dosha Triangle** uses: `recipe.properties.primaryDosha`
- **Taste Hexagon** uses: `recipe.properties.taste` array

Both visualizations will now render correctly when the worker returns properly formatted data.

## Testing Locally

1. Set `VITE_DEBUG=DEBUG` in `.env.local` to see parsing logs
2. Upload a recipe image
3. Check browser console for:
   - Parsed fields
   - Extracted tastes
   - Primary dosha
4. Verify visualizations render with correct data

## Troubleshooting

- If visualizations are empty: Check if worker is returning structured format
- If parsing fails: Verify field names match (case-sensitive in regex)
- If dosha/taste values are wrong: Ensure worker response contains valid values
