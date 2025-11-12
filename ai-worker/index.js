/**
 * Worker AI Multimodal Handler
 * * This worker processes an image and a text prompt using a multimodal
 * Large Language Model (LLM) to perform OCR and interpretation.
 * It is designed to be called from a Cloudflare Pages frontend.
 */

// Define the multimodal model for vision and text tasks
const MODEL = '@cf/meta/llama-3.2-11b-vision-instruct';

// Helper function to create a standard JSON response with CORS headers
function createCORSResponse(body, status, origin) {
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    };
    return new Response(JSON.stringify(body), { status, headers });
}

// Helper function for the OPTIONS (preflight) request
function handleOptions(request, origin) {
    const headers = {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400', // Cache preflight for 24 hours
    };
    return new Response(null, { status: 204, headers });
}

async function handleRequest(request, env) {
    const origin = env.ALLOWED_ORIGIN;
    const isCORS = request.headers.get('origin') === origin;

    // Handle CORS preflight request
    if (request.method === 'OPTIONS') {
        return handleOptions(request, origin);
    }

    if (request.method !== 'POST') {
        return new Response('Method Not Allowed', { status: 405 });
    }

    try {
        // 1. Parse the incoming FormData
        const formData = await request.formData();
        const imageFile = formData.get('image');

        if (!imageFile || !(imageFile instanceof File)) {
            return createCORSResponse({ error: 'Missing image file in request.' }, 400, origin);
        }

        if (imageFile.size === 0) {
            return createCORSResponse({ error: 'Image file is empty.' }, 400, origin);
        }

        // 2. Convert the image File object to a Uint8Array (array of integers)
        // The AI binding expects image data as an Array<number> (Uint8Array or similar)
        const imageBuffer = await imageFile.arrayBuffer();
        const imageArray = [...new Uint8Array(imageBuffer)];

        // 3. Call the Workers AI model
        const aiResponse = await env.AI.run(
            MODEL,
            {
                prompt: `Analyze this Ayurvedic recipe image and extract or deduce the following information:

1. Recipe Title - extract from image if visible, otherwise deduce from ingredients
2. Ingredients (with quantities if visible) - extract all ingredients you can identify
3. Preparation Steps (numbered or bulleted) - extract all visible steps
4. Primary Dosha (vata, pitta, or kapha) - the dosha this recipe is MOST beneficial for
   - If not explicitly stated: deduce from the ingredients' properties using Ayurvedic knowledge
   - Consider the tastes, thermal properties, and digestive qualities of the ingredients
5. Tastes Present (list any of: sweet, sour, salty, pungent, bitter, astringent)
   - If not explicitly listed: deduce the dominant tastes from the ingredients
6. Potency (hot or cold)
   - If not stated: deduce from the ingredients' thermal nature (e.g., ginger=hot, coconut=cool)
7. Best Seasons (spring, summer, monsoon, autumn, winter) - one or more
   - If not stated: deduce based on the recipe's potency and dosha properties
8. Brief explanation of why this recipe is beneficial for the primary dosha

IMPORTANT: Always provide values for ALL fields (1-8). If information is not visible in the image, 
use your Ayurvedic knowledge to intelligently deduce the values based on:
- The ingredients present and their known Ayurvedic properties
- Common Ayurvedic cooking principles
- The recipe's thermal and taste profile

Format your response EXACTLY as follows (one field per line):
TITLE: [recipe name]
INGREDIENTS:
[list each ingredient with quantity]
PREPARATION:
[list each step numbered]
PRIMARY_DOSHA: [vata|pitta|kapha]
TASTES: [comma-separated list from: sweet, sour, salty, pungent, bitter, astringent]
POTENCY: [hot|cold]
SEASONS: [comma-separated list from: spring, summer, monsoon, autumn, winter]
DOSHA_EXPLANATION: [brief explanation of why this benefits the primary dosha]`,
                image: imageArray,
            }
        );

        // 4. Return the result
        return createCORSResponse({ result: aiResponse.response }, 200, origin);

    } catch (error) {
        console.error('AI Worker Error:', error);
        return createCORSResponse({ error: 'Failed to process request with AI model.' }, 500, origin);
    }
}

export default {
    fetch: handleRequest
};