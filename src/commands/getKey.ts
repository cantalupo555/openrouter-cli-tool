import { makeApiRequest, ApiError } from '../utils/apiClient';

/**
 * @description Retrieves details for a specific API key by its hash.
 *
 * @param {string} keyHash - The hash of the API key to retrieve.
 * @throws {Error} If the provisioning API key is not set or the hash is invalid.
 * @returns {Promise<void>} A promise that resolves when the key details are displayed or rejects on error.
 */
export async function getSpecificKeyDetails(keyHash: string): Promise<void> {
  // 1. Loads the provisioning API key from the environment inside the function
  const provisioningApiKey = process.env.PROVISIONING_API_KEY;

  // 2. Checks if the provisioning API key is available
  if (!provisioningApiKey) {
    console.error("ERROR: The environment variable PROVISIONING_API_KEY is not set.");
    // Throws an error instead of exiting, so the caller can handle it
    throw new Error("PROVISIONING_API_KEY not set.");
  }
  // 3. Checks if the target hash was provided and is valid
  if (!keyHash || typeof keyHash !== 'string' || keyHash.trim() === '') {
      console.error("ERROR: Invalid or missing key hash for getSpecificKeyDetails.");
      throw new Error("Invalid key hash.");
  }

  const targetUrlPath = `/keys/${keyHash.trim()}`; // Only the path
  console.log(`Fetching details for key with hash: ${keyHash}`);
  console.log(`Using endpoint: ${targetUrlPath}`);

  try {
    // Defines the expected response type (adjust if necessary)
    // TODO: Define specific key details type
    interface GetKeyResponse {
      data: {
        hash: string;
        name: string;
        // ... other key fields
      };
    }

    const result = await makeApiRequest<GetKeyResponse>(targetUrlPath, {
      method: 'GET',
      apiKey: provisioningApiKey,
    });

    console.log('Key details found:');
    // API might return data directly or nested under 'data'
    console.log(JSON.stringify(result.data || result, null, 2));

  } catch (error) {
    console.error('Error fetching the key:', (error as Error).message);
    // Re-throws the error
    throw error;
  }
}
