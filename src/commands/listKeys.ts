import { makeApiRequest } from '../utils/apiClient';
import { handleApiError } from '../utils/errorHandler';

// TODO: Define a specific type for the key object returned by the API
type ApiKeyObject = {
    hash: string;
    name: string | null;
    created_at: string | null;
    limit: number | null;
    disabled: boolean;
    usage: number;
    label?: string | null;
    // Add other fields if known
};

/**
 * @description Lists all API keys associated with the provisioning key, handling pagination.
 *
 * @throws {Error} If the provisioning API key is not set.
 * @returns {Promise<void>} A promise that resolves when all keys are listed and displayed, or rejects on error.
 */
export async function listApiKeys(): Promise<void> {
  // 1. Loads the provisioning API key from the environment inside the function
  const provisioningApiKey = process.env.PROVISIONING_API_KEY;

  // 2. Checks if the provisioning API key is available
  if (!provisioningApiKey) {
    console.error("ERROR: The environment variable PROVISIONING_API_KEY is not set.");
    throw new Error("PROVISIONING_API_KEY not set.");
  }

  console.log(`\nFetching complete list of API keys (with pagination)...`);

  const allKeys: ApiKeyObject[] = []; // Array to store all keys
  let offset = 0;
  const limit = 100; // Number of keys per page (adjust if the API has a different limit)
  let currentPage = 1;
  let keepFetching = true;

  try {
    while (keepFetching) {
      console.log(`Fetching page ${currentPage} (offset: ${offset}, limit: ${limit})...`);

      // Defines the expected response type for the listing
      interface ListKeysResponse {
        data: ApiKeyObject[]; // Array of key objects
        // TODO: The API may include other pagination fields if necessary
      }

      const result = await makeApiRequest<ListKeysResponse>('/keys', {
        method: 'GET',
        apiKey: provisioningApiKey,
        params: { offset, limit }, // Pass query parameters
      });

      if (result.data && Array.isArray(result.data)) {
        const fetchedCount = result.data.length;
        console.log(`Page ${currentPage} returned ${fetchedCount} keys.`);

        if (fetchedCount > 0) {
          allKeys.push(...result.data);
        }

        // Stop fetching if the last page returned fewer keys than the limit
        if (fetchedCount < limit) {
          keepFetching = false;
          console.log("Last page reached.");
        } else {
          offset += limit;
          currentPage++;
        }
      } else {
        console.warn(`Unexpected API response or no data on page ${currentPage}. Stopping fetch.`, result);
        keepFetching = false;
      }
    } // End of while

    // Displays the consolidated results
    if (allKeys.length === 0) {
      console.log("\nNo API keys found in your account.");
    } else {
      // Maps the data to the desired format for the table
      console.log(`\nTotal of ${allKeys.length} API keys found.\n`);
      const tableData = allKeys.map((key, index) => {
        // Format date for better readability (e.g., locale-specific)
        const createdAt = key.created_at ? new Date(key.created_at).toLocaleString('en-US') : 'N/A';
        // Format the limit
        const limitDisplay = key.limit === null ? 'Unlimited' : `$${Number(key.limit).toFixed(2)}`;
        // Format the disabled status
        const disabledDisplay = key.disabled ? 'Yes' : 'No';
        // Format usage with fixed decimal places
        const usageDisplay = Number(key.usage).toFixed(6);

        return {
          '#': index + 1, // Index
          'Name': key.name || '(no name)',
          'Hash': key.hash,
          'Limit': limitDisplay,
          'Usage (USD)': usageDisplay,
          'Disabled': disabledDisplay,
          'Created at': createdAt,
          // 'Label': key.label || '(no label)', // Optional: uncomment if you want to include
        };
      });

      // Display data using console.table()
      console.table(tableData);

    }

  } catch (error) {
    // Pass context, including the page number if the error happened mid-fetch
    const context = `listing keys (around page ${currentPage})`;
    handleApiError(error, context);
    // Re-throws the error so the caller (cli.ts) knows it failed
    throw error;
  }
}
