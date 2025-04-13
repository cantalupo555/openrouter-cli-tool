import { ApiError } from './apiClient';

/**
 * @description Handles API errors by logging a user-friendly message based on the status code and context.
 * Also logs generic errors.
 *
 * @param {unknown} error - The error object caught (can be ApiError or any other type).
 * @param {string} [operationContext] - Optional string describing the operation being performed (e.g., "listing keys", "creating key 'test'").
 */
export function handleApiError(error: unknown, operationContext?: string): void {
    let baseMessage = "\nError";
    if (operationContext) {
        baseMessage += ` while ${operationContext}`;
    }
    baseMessage += ":";

    if (error instanceof ApiError) {
        // It's an error originating from our API client
        console.error(`${baseMessage} API Error (${error.status}): ${error.message}`);

        // Add specific hints based on common status codes
        switch (error.status) {
            case 400:
                console.error("-> Bad Request. Please check the data you provided (e.g., name format, limit value).");
                if (error.errorData) {
                    console.error("   API Error Details:", JSON.stringify(error.errorData, null, 2));
                }
                break;
            case 401: // Unauthorized
            case 403: // Forbidden
                console.error("-> Authentication/Authorization failed. Please check if your API key (Provisioning or Regular) is correct, valid, and has the necessary permissions for this operation.");
                break;
            case 404: // Not Found
                console.error("-> The requested resource (e.g., key hash) was not found.");
                 if (error.errorData) { // Sometimes 404 might have extra info
                    console.error("   API Error Details:", JSON.stringify(error.errorData, null, 2));
                }
                break;
            case 429: // Too Many Requests
                console.error("-> Rate limit exceeded. Please wait a bit before trying again.");
                break;
            case 500: // Internal Server Error
            case 502: // Bad Gateway
            case 503: // Service Unavailable
            case 504: // Gateway Timeout
                console.error("-> The OpenRouter server encountered an error. Please try again later.");
                if (error.errorData) {
                    console.error("   API Error Details:", JSON.stringify(error.errorData, null, 2));
                }
                break;
            default:
                // Log error data for any other API error if available
                if (error.errorData) {
                    console.error("   API Error Details:", JSON.stringify(error.errorData, null, 2));
                }
                break;
        }
    } else if (error instanceof Error) {
        // It's a generic JavaScript error (network, programming error, etc.)
        console.error(`${baseMessage} Unexpected error: ${error.message}`);
        // Optionally log the stack trace for debugging non-API errors
        // console.error(error.stack);
    } else {
        // Unknown error type
        console.error(`${baseMessage} An unknown error occurred:`, error);
    }
}
