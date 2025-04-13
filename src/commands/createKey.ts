import { makeApiRequest } from '../utils/apiClient';
import { handleApiError } from '../utils/errorHandler';

/**
 * @description Creates a new API key.
 *
 * @param {string} name - The name for the new API key (required).
 * @param {string | null} [label] - An optional label for the key.
 * @param {number | null} [limit] - An optional credit limit in USD for the key.
 * @throws {Error} If the provisioning API key is not set or the name is invalid.
 * @returns {Promise<void>} A promise that resolves when the key is created and details displayed, or rejects on error.
 */
export async function createApiKey(name: string, label?: string | null, limit?: number | null): Promise<void> {
  // 1. Loads the provisioning API key from the environment inside the function
  const provisioningApiKey = process.env.PROVISIONING_API_KEY;

  // 2. Checks if the provisioning API key is available
  if (!provisioningApiKey) {
    console.error("ERROR: The environment variable PROVISIONING_API_KEY is not set.");
    throw new Error("PROVISIONING_API_KEY not set.");
  }
  // 3. Validate the name (already checked by inquirer, but good practice)
  if (!name || typeof name !== 'string' || name.trim() === '') {
    console.error("ERROR: Invalid or missing key name for createApiKey.");
    throw new Error("Invalid key name.");
  }

  console.log(`\nCreating new API key with name: "${name}"`);

  // Builds the request body using the parameters
  const requestBody: { name: string; label?: string | null; limit?: number | null } = {
    name: name.trim(),
  };
  // Adds label if provided and not undefined
  if (label !== undefined) {
    requestBody.label = label;
    console.log(`Setting label: ${label === null || label === '' ? '(empty/null)' : `"${label}"`}`);
  }
  // Adds limit if provided and not undefined
  if (limit !== undefined) {
    if (limit === null) {
        requestBody.limit = null;
        console.log("Setting credit limit: Unlimited");
    } else {
        const limitValue = Number(limit);
        if (!isNaN(limitValue) && limitValue >= 0) {
            requestBody.limit = limitValue;
            console.log(`Setting credit limit: $${limitValue.toFixed(2)}`);
        } else {
            // If invalid, do not set the limit (will be unlimited by default in the API)
            console.warn(`WARNING: Invalid limit value ('${limit}'). Limit will be unlimited. Use a positive number or 0.`);
        }
    }
  } else {
      console.log("Setting credit limit: Unlimited (default)");
  }

  try {
    // Defines the expected response type (adjust as per the API)
    interface CreateKeyResponse {
      key: string; // The actual API key
      data: { // Details of the created key
        hash: string;
        name: string;
        label: string | null;
        limit: number | null;
        usage: number;
        disabled: boolean;
        created_at: string;
        // other fields...
      };
    }

    const result = await makeApiRequest<CreateKeyResponse>('/keys', {
      method: 'POST',
      apiKey: provisioningApiKey,
      body: requestBody,
    });

    console.log('API key created successfully!');
    console.log('Details of the new key:');
    console.log(JSON.stringify(result.data, null, 2));

    // IMPORTANT: The creation response includes the actual API key!
    if (result && result.key) {
        console.log("\n**********************************************************************");
        console.log("ATTENTION: Your new API key is:");
        console.log(result.key);
        console.log("Store this key in a safe place. It will not be shown again.");
        console.log("**********************************************************************");
    } else {
        console.warn("\nWARNING: API key not found in the response. Check the API response structure.");
        console.log("Full response:", result);
    }

  } catch (error) {
    handleApiError(error, `creating key "${name.trim()}"`);
    // Re-throws the error so the caller (cli.ts) knows it failed
    throw error;
  }
}
