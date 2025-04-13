import * as dotenv from 'dotenv';

/**
 * Loads environment variables from the .env file into process.env.
 */
dotenv.config();

/**
 * Loads environment configuration for the test.
 */
const openrouterApiKey = process.env.OPENROUTER_API_KEY;
const yourSiteUrl = process.env.YOUR_SITE_URL || 'http://localhost'; // Default if not set in .env
const yourSiteName = process.env.YOUR_SITE_NAME || 'Local Test';     // Default if not set in .env

// Checks if the essential API key was loaded
if (!openrouterApiKey) {
  console.error("ERROR: The environment variable OPENROUTER_API_KEY is not set. Check your .env file.");
  process.exit(1);
}

/**
 * Sends a test request with a large input to the OpenRouter API.
 */
async function runTestInput() {
    console.log("Sending test request with large input...");
    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${openrouterApiKey}`, // Use variable loaded from .env
                "HTTP-Referer": yourSiteUrl,                   // Use variable loaded from .env (with fallback)
                "X-Title": yourSiteName,                       // Use variable loaded from .env (with fallback)
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "model": "deepseek/deepseek-chat", // Example model
                "max_tokens": 1, // Request minimal output
                "temperature": 0,
                "messages": [
                {
                    "role": "user",
                    "content": "Hello. ".repeat(5000) // ~16k tokens, adjust as needed
                },
                ],
                "provider": { // Optional: Specify provider preferences
                "order": [
                    "Together"
                ],
                "allow_fallbacks": false
                },
            })
        });

        const data = await response.json();
        console.log('API Response Status:', response.status);
        console.log('API Response Body:', data);
        // console.log('Message content:', data?.choices?.[0]?.message?.content); // Optional: log content if exists

    } catch (error) {
        console.error('Request error:', error);
    }
}

runTestInput();
