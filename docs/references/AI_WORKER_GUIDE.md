# Cloudflare AI Worker Guide

This guide documents what the Cloudflare Worker (`ai-worker/index.js`) does to process Ayurvedic recipe images.

## Overview

The worker receives an image upload from the frontend, sends it to Cloudflare's AI vision model (`@cf/meta/llama-3.2-11b-vision-instruct`), and returns structured recipe data with Ayurvedic metadata. The worker **explicitly instructs the AI to deduce missing information** using Ayurvedic knowledge principles.

## What the Worker Does

### 1. Handles CORS

The worker accepts POST requests from your frontend domain (configured in `wrangler.toml` via `ALLOWED_ORIGIN` environment variable) and handles preflight OPTIONS requests:

```javascript
// Only accepts requests from the allowed origin
const origin = env.ALLOWED_ORIGIN;
const isCORS = request.headers.get('origin') === origin;
```

### 2. Receives Image Data

The worker expects a FormData request with an image file:

```javascript
const formData = await request.formData();
const imageFile = formData.get('image');
```

### 3. Processes Image with AI Model

Converts the image to a byte array and sends it with a detailed prompt to the AI model:

```javascript
const imageBuffer = await imageFile.arrayBuffer();
const imageArray = [...new Uint8Array(imageBuffer)];

const aiResponse = await env.AI.run(MODEL, {
    prompt: [detailed prompt],
    image: imageArray,
});
```

### 4. AI Prompt - What the Model Extracts

The worker uses a structured prompt that requests **8 fields** from the recipe image:

#### Field 1: TITLE
- **Extract** if visible in image
- **Deduce** from ingredients if not visible (e.g., recognizing khichdi ingredients)

#### Field 2: INGREDIENTS
- Extract all ingredients with quantities if visible
- List ingredient names clearly for downstream parsing

#### Field 3: PREPARATION
- Extract numbered or bulleted steps
- List preparation instructions sequentially

#### Field 4: PRIMARY_DOSHA
The dosha this recipe is **most beneficial for** (vata, pitta, or kapha):
- **Extract** if explicitly stated
- **Deduce** using Ayurvedic knowledge:
  - Consider ingredient thermal properties (ginger = heating, coconut = cooling)
  - Analyze taste profile (sweet balances vata, bitter balances kapha)
  - Consider digestive qualities and common Ayurvedic cooking principles
  - Apply knowledge of recipe patterns (e.g., khichdi + ghee = vata-balancing)

#### Field 5: TASTES
List any present from: sweet, sour, salty, pungent, bitter, astringent
- **Extract** if explicitly listed
- **Deduce** from ingredients using Ayurvedic taste properties:
  - **Sweet**: rice, wheat, ghee, milk, honey, dates, coconut
  - **Bitter**: turmeric, neem, bitter melon, fenugreek
  - **Pungent**: chili, pepper, ginger, garlic, onion
  - **Sour**: lemon, lime, tamarind, yogurt, vinegar
  - **Astringent**: tea, pomegranate, beans, lentils

#### Field 6: POTENCY
Hot or cold thermal property:
- **Extract** if stated
- **Deduce** from ingredients' thermal nature:
  - HOT ingredients: ginger, black pepper, chili, cumin
  - COLD ingredients: coconut, milk, rose, jasmine
  - Consider cooking method (fried/sautéed = hotter)

#### Field 7: SEASONS
When the recipe is appropriate (one or more from: spring, summer, monsoon, autumn, winter):
- **Extract** if explicitly stated
- **Deduce** from potency and dosha:
  - HOT recipes → spring, autumn, winter (when warmth is beneficial)
  - COLD recipes → summer, monsoon (when cooling is beneficial)

#### Field 8: DOSHA_EXPLANATION
Brief explanation of why this recipe benefits the primary dosha

### 5. Response Format

The worker returns the AI model's response in a standardized format:

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
POTENCY: hot
SEASONS: spring, autumn, winter
DOSHA_EXPLANATION: This recipe is beneficial for Pitta because turmeric aids digestion and ghee cools the system, while warming spices prevent Vata imbalance.
```

### 6. Returns JSON Response with CORS Headers

```javascript
return createCORSResponse({ result: aiResponse.response }, 200, origin);
```

Response headers include:
- `Access-Control-Allow-Origin`: The frontend domain
- `Access-Control-Allow-Methods`: POST, OPTIONS
- `Access-Control-Allow-Headers`: Content-Type
- `Access-Control-Max-Age`: 86400 (24 hours for preflight caching)

## Key Design Decisions

### Why Deduce Information in the Worker?

1. **AI Context**: The AI model has access to the image and can make educated deductions based on visual cues
2. **Consistency**: Ensures all 8 fields are always populated, even for incomplete recipes
3. **Ayurvedic Knowledge**: The AI model's training includes Ayurvedic principles, allowing intelligent inferences
4. **Single Source of Truth**: Frontend receives complete data without fallback logic

### Why This Prompt Structure?

- **Explicit Instructions**: The prompt clearly states to deduce missing values using Ayurvedic knowledge
- **8 Required Fields**: Ensures every response has consistent structure for parsing
- **Validation Values**: Specifies allowed values (vata|pitta|kapha, sweet|sour|salty|pungent|bitter|astringent, etc.)
- **Example Format**: Shows exact formatting so the model produces parseable output

## Configuration

### wrangler.toml

```toml
name = "multimodal-vision-ocr-worker"
main = "index.js"
compatibility_date = "2024-11-07"

[ai]
binding = "AI"

[vars]
ALLOWED_ORIGIN = "https://www.claranueva.com"
```

**Important**: Update `ALLOWED_ORIGIN` to match your deployment:
- Local development: `http://localhost:5173`
- Production: `https://www.claranueva.com` or your custom domain

### Deploying the Worker

```bash
cd ai-worker
wrangler publish
```

## Error Handling

The worker handles several error cases:

1. **Invalid Request Method**: Returns 405 if not POST/OPTIONS
2. **Missing Image**: Returns 400 if no image file in FormData
3. **Empty Image**: Returns 400 if image file is 0 bytes
4. **AI Processing Error**: Returns 500 if model fails (logs error to console)
5. **CORS Mismatch**: Validates origin matches allowed origin before processing

## Frontend Integration

The frontend (`src/utils/textExtraction.ts`) receives the worker response and:

1. Parses each field using regex pattern matching
2. Validates dosha, tastes, potency, and seasons against allowed values
3. Populates the Recipe object with complete properties
4. Passes data to visualizations (Dosha Triangle, Taste Hexagon)

The frontend parser includes fallback logic to handle incomplete data, but the worker's deduction approach ensures complete responses.

## Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| CORS error | Origin doesn't match `ALLOWED_ORIGIN` | Update `wrangler.toml` with correct frontend URL |
| 400 Bad Request | Image missing or empty | Ensure frontend sends valid image file |
| 500 Internal Error | AI model failed | Check browser console logs, retry with clearer image |
| Malformed response | AI didn't follow format | Check worker logs via `wrangler tail` |
| Missing fields | AI didn't deduce properly | Try image with clearer, identifiable ingredients |

## Monitoring

View worker logs with:

```bash
wrangler tail --env production
```

The worker logs errors to the browser console when called, and to Cloudflare's dashboard when deployed.
