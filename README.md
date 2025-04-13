# OpenRouter CLI Tool

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A command-line interface (CLI) tool built with Node.js and TypeScript to manage OpenRouter API keys using the Provisioning Key and check the usage limits of individual keys.

## Features

*   **List Keys:** Lists all API keys associated with your Provisioning Key (with pagination).
*   **Get Details:** Fetches detailed information for a specific key using its Hash.
*   **Create Key:** Generates a new API key with a name, optional label, and optional credit limit (USD).
*   **Update Key:** Modifies the name, label, limit, or status (enabled/disabled) of an existing key by its Hash.
*   **Delete Key:** Permanently removes an API key by its Hash (with confirmation).
*   **Check Limits:** Queries the limits and current usage of a specific API key (using the key itself, usually configured in `.env`).
*   **Interactive Interface:** Provides an easy-to-use menu to perform all operations.

## Prerequisites

*   [Node.js](https://nodejs.org/) (version 18 or higher recommended)
*   [Yarn](https://yarnpkg.com/) or [npm](https://www.npmjs.com/) (Node.js package manager)
*   An OpenRouter **Provisioning Key** (obtained from your OpenRouter account settings).
*   At least one regular OpenRouter **API Key** (for the "Check Limits" functionality).

## Installation and Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/cantalupo555/openrouter-cli-tool.git
    cd openrouter-cli-tool
    ```

2.  **Install dependencies:**
    ```bash
    yarn install
    ```

3.  **Configure environment variables:**
    *   Copy the example file `.env-tmp` to a new file named `.env`:
        ```bash
        cp .env-tmp .env
        ```
    *   **Edit the `.env` file** and fill in your actual keys:
        *   `PROVISIONING_API_KEY`: Your OpenRouter provisioning key. **Required for most operations (list, create, update, delete, get details).**
        *   `OPENROUTER_API_KEY`: A *regular* OpenRouter API key. **Required only for the "Check Limits" operation of the key configured in `.env`.**
        *   `YOUR_SITE_URL` (Optional): Used in the test scripts (`tests/`). Default: `http://localhost`.
        *   `YOUR_SITE_NAME` (Optional): Used in the test scripts (`tests/`). Default: `Local Test`.

    **Important:** The `.env` file contains sensitive information and **should not** be committed to Git (it is already included in `.gitignore`).

## Usage

The main way to use the tool is through the interactive menu. Run the following command in the project root:

```bash
yarn run manage
```

This will start the application and present a menu with the available options:

```
OpenRouter API Key Manager
------------------------------------
? What would you like to do? (Use arrow keys)
❯ List API keys (via Provisioning Key)
  Get details of a specific key (by Hash)
  Create new API key
  Update API key (by Hash)
  Delete API key (by Hash)
  Check limits of the current API key (.env)
  Exit
```

Follow the on-screen instructions for each operation. The tool will prompt for necessary information (like key Hash, name, etc.) as needed.

## Available Scripts

The `package.json` file defines the following scripts:

*   `yarn run manage`: Starts the main interactive interface. This is the recommended way to use the tool.

## Tests

The scripts in `tests/` are basic examples of how to interact with the OpenRouter API using `node-fetch` and environment variables.

*   `yarn run test-input`: Tests sending a large amount of text.
*   `yarn run test-output`: Tests a simple request and prints the full response and message content.

Make sure `OPENROUTER_API_KEY` is configured in your `.env` to run these tests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
