import { makeApiRequest, ApiError } from '../utils/apiClient';

/**
 * @description Checks the information and limits of an API key.
 * Optionally accepts an override key; otherwise, uses the one from .env.
 *
 * @param {string} [apiKeyOverride] - Optional API key to use instead of the one from .env.
 * @throws {Error} If no API key is available for checking.
 * @returns {Promise<void>} A promise that resolves when the key information is displayed or rejects on error.
 */
export async function checkApiKeyLimit(apiKeyOverride?: string): Promise<void> {
  // 1. Determines which key to use: the provided one or the one from .env
  const apiKeyToUse = apiKeyOverride || process.env.OPENROUTER_API_KEY;

  // 2. Checks if we have any key to use
  if (!apiKeyToUse) {
    console.error("ERROR: No API key provided and OPENROUTER_API_KEY is not set in .env.");
    throw new Error("API key not available for checking.");
  }

  const source = apiKeyOverride ? "provided" : "from .env";
  console.log(`\nChecking information and limits for the API key (${source})...`);
  try {
    // Defines the expected response type from the API
    // TODO: Be more specific if the structure is known
    interface KeyInfoResponse {
      data: any;
      // other fields if any
    }

    // Calls the apiClient
    const result = await makeApiRequest<KeyInfoResponse>('/auth/key', {
      method: 'GET',
      apiKey: apiKeyToUse,
    });

    // API might return data directly or nested under 'data'
    console.log('Key information and limits:', result.data || result);

  } catch (error) {
    // The error is already formatted by apiClient (if ApiError)
    console.error('Error checking the key:', (error as Error).message);
    // Re-throws the error so the caller can handle it
    throw error;
  }
}
