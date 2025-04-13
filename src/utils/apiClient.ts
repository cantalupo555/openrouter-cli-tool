import fetch, { Response } from 'node-fetch'; // Import Response type

/**
 * The base URL for the OpenRouter API.
 * @internal
 */
const BASE_URL = 'https://openrouter.ai/api/v1';

/**
 * @class ApiError
 * @extends Error
 * @description Custom error class for API-specific errors, containing status code and potential error data.
 */
export class ApiError extends Error {
  status: number;
  errorData: any;

  /**
   * Constructs a new ApiError.
   * @param {string} message - The error message.
   * @param {number} status - The HTTP status code.
   * @param {any} [errorData=null] - Optional error data from the API response.
   */
  constructor(message: string, status: number, errorData: any = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errorData = errorData;
    // Maintains proper stack trace (for V8/Node)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }
}

/**
 * @interface RequestOptions
 * @description Options for making an API request using `makeApiRequest`.
 */
interface RequestOptions {
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  apiKey: string;
  body?: Record<string, any> | null;
  params?: Record<string, string | number | undefined | null>;
}

/**
 * @description Makes an HTTP request to the OpenRouter API.
 * Handles request setup, response parsing, and error handling.
 *
 * @template T - The expected type of the successful JSON response body.
 * @param {string} endpoint - The API endpoint path (e.g., "/keys").
 * @param {RequestOptions} options - The request options, including method, apiKey, body, and params.
 * @throws {ApiError} If the API returns an HTTP error status (>= 400).
 * @throws {Error} For network issues or other unexpected errors during the fetch process.
 * @returns {Promise<T>} A promise that resolves with the parsed JSON response body of type T.
 *                       For 204 No Content responses, resolves with an empty object `{}` cast to T.
 */
export async function makeApiRequest<T>(endpoint: string, options: RequestOptions): Promise<T> {
  const { method, apiKey, body = null, params = {} } = options;

  // Build the URL with query parameters, if any
  const url = new URL(`${BASE_URL}${endpoint}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, String(value));
    }
  });

  const headers: Record<string, string> = {
    'Authorization': `Bearer ${apiKey}`,
  };
  if (body) {
    headers['Content-Type'] = 'application/json';
  }

  console.log(`\n[API Client] Request: ${method} ${url.toString()}`);
  if (body) {
    console.log(`[API Client] Body: ${JSON.stringify(body)}`);
  }

  let response: Response;
  try {
    response = await fetch(url.toString(), {
      method: method,
      headers: headers,
      body: body ? JSON.stringify(body) : undefined,
    });

  } catch (error) {
    // Handle network errors or other fetch-related issues
    console.error('[API Client] Unexpected fetch error:', error);
    throw new Error(`Network or fetch error: ${(error as Error).message}`);
  }

  // Check if the response status indicates an error
  if (!response.ok) {
    let errorData: any = null;
    let errorMessage = `HTTP Error ${response.status}: ${response.statusText}`;
    try {
      // Try to parse the error body as JSON for more details
      errorData = await response.json();
      // Extract a more specific error message if available in standard formats
      if (errorData?.error?.message) {
        errorMessage = `API Error (${response.status}): ${errorData.error.message}`;
      } else if (errorData?.message) {
        errorMessage = `API Error (${response.status}): ${errorData.message}`;
      }
    } catch (parseError) {
      // If parsing fails, use the basic HTTP status text
      console.warn("[API Client] Could not parse error response as JSON.");
    }
    console.error(`[API Client] Request failed: ${errorMessage}`, errorData || '');
    // Throw the custom ApiError
    throw new ApiError(errorMessage, response.status, errorData);
  }

  // Handle successful responses

  // For DELETE with 204 No Content, there is no JSON body
  if (response.status === 204) {
    console.log(`[API Client] Response: ${response.status} No Content`);
    // Return an empty object typed as T; the caller should be aware of this possibility for 204 responses.
    return {} as T;
  }

  // For successful responses with a body (e.g., 200 OK, 201 Created)
  try {
    const result = await response.json();
    console.log(`[API Client] Response: ${response.status} OK`);
    return result as T;
  } catch (jsonError) {
    // Handle cases where JSON parsing fails even on a successful status code
    console.error('[API Client] Error parsing JSON response:', jsonError);
    throw new Error(`Failed to parse successful response JSON: ${(jsonError as Error).message}`);
  }
}
