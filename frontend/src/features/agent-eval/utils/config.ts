let rawUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Handle Render's "host" property which might just be the slug (e.g. "my-app-slug")
if (!rawUrl.startsWith('http')) {
    if (!rawUrl.includes('.') && !rawUrl.includes(':')) {
        rawUrl += '.onrender.com';
    }
    rawUrl = `https://${rawUrl}`;
}

export const API_BASE_URL = `${rawUrl}/agent-eval`;
console.log("API_BASE_URL defined as:", API_BASE_URL);
