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
 * Sends a simple test request to the OpenRouter API and prints the response.
 */
async function runTestOutput() {
    console.log("Sending simple test request...");
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
                "model": "qwen/qwen-32b-chat", // Example model, adjust if needed
                "max_tokens": 50, // Limit output tokens
                "temperature": 0.7, // Adjust creativity
                "messages": [
                {
                    "role": "user",
                    "content": "Tell me a short joke about programming."
                }
                ],
                // Optional: Specify provider preferences
                // "provider": {
                //   "order": [
                //     "Together"
                //   ],
                //   "allow_fallbacks": false
                // },
            })
        });

        const data = await response.json();
        console.log('API Response Status:', response.status);
        console.log('API Response Body:', data);

        if (data?.choices?.[0]?.message?.content) {
            console.log('\nMessage content:');
            console.log(data.choices[0].message.content);
        } else {
            console.log('\nNo message content found in response.');
        }

    } catch (error) {
        console.error('Request error:', error);
    }
}

runTestOutput();
