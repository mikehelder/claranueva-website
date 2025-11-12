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
                prompt: `This is an ayurvedic recipe written in english. Convert to text and create an ayurvedic recipe with section for ingredients and for preparation method. Also explain for which dosha this recipe is beneficial and why.`,
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