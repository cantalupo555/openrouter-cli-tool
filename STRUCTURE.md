
## Project Structure Diagram

```
Project Root
│
├── src/
│   ├── commands/
│   │   ├── checkKeyLimit.ts    # Usage limit check
│   │   ├── createKey.ts     # New key creation
│   │   ├── deleteKey.ts     # Key deletion
│   │   ├── getKey.ts   # Specific key details
│   │   ├── listKeys.ts      # Lists all API keys
│   │   └── updateKey.ts     # Existing key update
│   ├── utils/
│   │   └── apiClient.ts      # Central HTTP client for the OpenRouter API
│   └── cli.ts                # Main interactive menu (entry point)
│
├── tests/
│   ├── testInput.ts   # Test sending large text to the API
│   └── testOutput.ts  # Test simple request and response
│
├── .env-tmp                # Example environment variables
├── .gitignore
├── LICENSE
├── package.json
├── README.md
├── STRUCTURE.md
└── yarn.lock
```

---

## Description of Main Files and Folders

- **src/cli.ts**
  CLI entry point. Displays the interactive menu and directs to commands.

- **src/commands/**
  Functions for each main CLI operation (list, create, update, delete, etc.).

- **src/utils/apiClient.ts**
  Centralizes HTTP requests to the OpenRouter API and error handling.

- **tests/**
  Test scripts to interact directly with the API.

- **.env-tmp**
  Example environment variable configuration.

- **package.json**
  Project metadata, dependencies, and scripts.

- **README.md**
  Main usage and installation documentation.

---
