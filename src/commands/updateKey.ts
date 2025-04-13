import { makeApiRequest, ApiError } from '../utils/apiClient';

/**
 * @interface KeyUpdatePayload
 * @description Interface for the update payload object for an API key.
 */
interface KeyUpdatePayload {
    name?: string;
    label?: string | null;
    limit?: number | null;
    disabled?: boolean;
}

/**
 * @description Updates an API key by its hash with the provided fields.
 * If no fields are provided in `updates`, the function returns early without making an API call.
 *
 * @param {string} keyHash - The hash of the API key to update.
 * @param {KeyUpdatePayload} updates - An object containing the fields to update.
 * @throws {Error} If the provisioning API key is not set or the hash is invalid.
 * @returns {Promise<void>} A promise that resolves when the key is updated and details displayed,
 *                          or resolves immediately if no updates were provided, or rejects on error.
 */
export async function updateApiKey(keyHash: string, updates: KeyUpdatePayload): Promise<void> {
  // 1. Loads the provisioning API key from the environment inside the function
  const provisioningApiKey = process.env.PROVISIONING_API_KEY;

  // 2. Checks if the provisioning API key is available
  if (!provisioningApiKey) {
    console.error("ERROR: The environment variable PROVISIONING_API_KEY is not set.");
    throw new Error("PROVISIONING_API_KEY not set.");
  }
  // 3. Checks if the hash was provided
  if (!keyHash || typeof keyHash !== 'string' || keyHash.trim() === '') {
    console.error("ERROR: Invalid or missing key hash for updateApiKey.");
    throw new Error("Invalid key hash.");
  }
  // 4. Checks if there is anything to update
  if (Object.keys(updates).length === 0) {
      console.log("\nNo fields were provided for update.");
      return; // Do nothing if the updates object is empty
  }

  // The 'updates' object already contains the fields to be sent
  const requestBody = updates;

  const targetUrlPath = `/keys/${keyHash.trim()}`; // Only the path
  console.log(`\nUpdating key with hash: ${keyHash.trim()}`);
  console.log(`Using endpoint: ${targetUrlPath}`);

  try {
    // Defines the expected response type (adjust if necessary)
    // TODO: Define specific updated key details type
    interface UpdateKeyResponse {
      data: {
         hash: string;
         name: string;
         // ... other updated key fields
      };
    }

    const result = await makeApiRequest<UpdateKeyResponse>(targetUrlPath, {
      method: 'PATCH',
      apiKey: provisioningApiKey,
      body: requestBody,
    });

    console.log('\nAPI key updated successfully!');
    console.log('Details of the updated key:');
    // API might return data directly or nested under 'data'
    console.log(JSON.stringify(result.data || result, null, 2));

  } catch (error) {
    console.error('\nError updating the key:', (error as Error).message);
    // Re-throws the error
    throw error;
  }
}
