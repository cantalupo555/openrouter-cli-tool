import { makeApiRequest } from '../utils/apiClient';
import { handleApiError } from '../utils/errorHandler';

/**
 * @description Asynchronously deletes an API key by its hash.
 * Confirmation must be handled by the caller.
 * The API may return 204 (no content) or 200 (with content). The result is logged accordingly.
 *
 * @param {string} keyHash - The hash of the API key to delete.
 * @throws {Error} If the provisioning API key is not set or the hash is invalid.
 * @returns {Promise<void>} A promise that resolves when the key is deleted or rejects on error.
 */
export async function deleteApiKey(keyHash: string): Promise<void> {
  // 1. Loads the provisioning API key from the environment inside the function
  const provisioningApiKey = process.env.PROVISIONING_API_KEY;

  // 2. Checks if the provisioning API key is available
  if (!provisioningApiKey) {
    console.error("ERROR: The environment variable PROVISIONING_API_KEY is not set.");
    throw new Error("PROVISIONING_API_KEY not set.");
  }
  // 3. Checks if the hash was provided
  if (!keyHash || typeof keyHash !== 'string' || keyHash.trim() === '') {
    console.error("ERROR: Invalid or missing key hash for deleteApiKey.");
    throw new Error("Invalid key hash.");
  }

  const targetUrlPath = `/keys/${keyHash.trim()}`; // Only the endpoint path
  console.log(`\nSending DELETE request for key with hash: ${keyHash.trim()}`);
  console.log(`Using endpoint: ${targetUrlPath}`);

  try {
    // DELETE may return 204 (no content) or 200 (with content)
    // The return type must accommodate this. We use 'any' for simplicity here,
    // or you can create a more specific type like { data?: DeletedKeyInfo } | null
    const result = await makeApiRequest<any>(targetUrlPath, {
      method: 'DELETE',
      apiKey: provisioningApiKey,
    });

    console.log(`\nDELETE request sent successfully for hash ${keyHash.trim()}.`);

    // Checks if any data was returned (in case of 200 OK)
    if (result && (result.data || Object.keys(result).length > 0)) {
         console.log('Deleted key details (if returned by the API):');
         console.log(JSON.stringify(result.data || result, null, 2));
    } else {
         // 204 No Content status handled inside apiClient
         console.log("(Status 204 No Content or empty response)");
    }

  } catch (error) {
    handleApiError(error, `deleting key hash "${keyHash.trim()}"`);
    // Re-throws the error so the caller (cli.ts) knows it failed
    throw error;
  }
}
