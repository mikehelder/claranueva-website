# Cloudflare Worker AI Setup and Testing Guide

This guide details how to set up, test, and deploy the Multimodal Vision Worker (`ai-worker/index.js`) to Cloudflare. This Worker will serve as the backend API for your Cloudflare Pages application.

## Prerequisites

- **Node.js and npm**: Installed on your system
- **Cloudflare Account**: You must have an active Cloudflare account
- **Wrangler CLI**: The official command-line tool for Cloudflare Workers
  ```bash
  npm install -g wrangler
  ```

### Cloudflare Credentials

Log in with Wrangler:
```bash
wrangler login
```

## 1. Local Testing

Testing locally is crucial to ensure the Worker handles the request format correctly before deployment.

### A. Start the Worker Locally

Navigate to the ai-worker directory (where `wrangler.toml` is located) and run the local development server:

```bash
cd ai-worker
npm start
# or if you installed globally:
wrangler dev
```

This will run the worker, typically at `http://127.0.0.1:8787`.

### B. Test with a Local Image

The Worker expects a POST request with a `multipart/form-data` body containing two fields:
- `image` (the file data)
- `prompt` (the instruction text)

#### i. Using cURL (Linux/macOS/Git Bash)

Use the `-F` flag for form-data and specify the file path using `@`:

```bash
# Ensure the worker is running locally at 8787
curl -X POST \
  -F "image=@/path/to/your/document.png" \
  -F "prompt=What is the date and total cost displayed in this image?" \
  http://127.0.0.1:8787
```

#### ii. Using Postman or Insomnia

1. Set the request method to POST
2. Set the request URL to `http://127.0.0.1:8787`
3. Go to the Body tab and select form-data
4. Add a key named `image`
   - In the dropdown next to the key, change the type from Text to File
   - Select your local image file
5. Add a second key named `prompt`
   - Keep the type as Text
   - Enter your interpretation query (e.g., "Summarize the key points of the receipt.")
6. Click Send

**Recommended Test**: Use the frontend code provided in the index.html file below, but change the `WORKER_URL` to `http://127.0.0.1:8787` for local testing.

## 2. Deployment

### A. Update Configuration

Before deploying, make sure you update the `ALLOWED_ORIGIN` variable in `ai-worker/wrangler.toml` to your actual Cloudflare Pages domain to ensure CORS works correctly:

```toml
[vars]
# Example: If your Pages site is at 'my-ocr-app.pages.dev'
ALLOWED_ORIGIN = "https://my-ocr-app.pages.dev"
```

### B. Deploy the Worker

Run the deployment command from the ai-worker directory:
```bash
wrangler deploy
```

Wrangler will deploy the worker and give you a public URL (e.g., `multimodal-vision-ocr-worker.username.workers.dev`). Note this URL, as you will use it in your frontend code.

### C. Configure Worker Route (Optional but Recommended)

If you want the Worker to run on a custom path of your Pages domain (e.g., `yourdomain.com/ai`), you can configure a Route in the Cloudflare Dashboard under your Pages project's settings:

1. Go to your Pages Project in the Cloudflare Dashboard
2. Navigate to Settings -> Functions -> Worker Integration
3. Select the deployed Worker (multimodal-vision-ocr-worker)
4. Add a route like `yourdomain.com/api/ai-vision/*` (where `yourdomain.com` is your custom domain)

**Alternatively**: Just use the provided public Worker URL (`*.workers.dev`) directly in your frontend and ensure your `wrangler.toml`'s `ALLOWED_ORIGIN` covers your Pages domain.

Once deployed, update your `index.html` file's `WORKER_URL` constant.