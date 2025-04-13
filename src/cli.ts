import inquirer from 'inquirer';
import * as dotenv from 'dotenv';

// Import refactored functions
import { getSpecificKeyDetails } from './commands/getKey';
import { listApiKeys } from './commands/listKeys';
import { checkApiKeyLimit } from './commands/checkKeyLimit';
import { createApiKey } from './commands/createKey';
import { updateApiKey } from './commands/updateKey';
import { deleteApiKey } from './commands/deleteKey';

// Load environment variables from .env ONCE at the start
dotenv.config();

// Define menu options
enum MenuChoice {
  ListKeys = 'List API keys (via Provisioning Key)',
  GetKeyDetails = 'Get details of a specific key (by Hash)',
  CreateKey = 'Create new API key',
  UpdateKey = 'Update API key (by Hash)',
  DeleteKey = 'Delete API key (by Hash)',
  CheckLimit = 'Check limits of the current API key (.env)',
  Exit = 'Exit',
}

/**
 * @description Main function to run the interactive CLI menu.
 * Handles user input, calls the appropriate command functions, and manages errors.
 * @returns {Promise<void>} A promise that resolves when the main loop exits or rejects on unhandled errors.
 */
async function main(): Promise<void> {
  console.log('\nOpenRouter API Key Manager');
  console.log('------------------------------------');

  try {
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: Object.values(MenuChoice), // Use enum values as choices
      },
    ]);

    switch (action) {
      case MenuChoice.GetKeyDetails:
        const { keyHash } = await inquirer.prompt([
          {
            type: 'input',
            name: 'keyHash',
            message: 'Enter the Hash of the key you want to query:',
            validate: (input) => input && input.trim() !== '' ? true : 'Hash cannot be empty.',
          },
        ]);
        // Call the imported function, handling potential errors
        try {
            await getSpecificKeyDetails(keyHash.trim());
        } catch (error: any) {
            console.error(`\nError getting key details: ${error.message}`);
        }
        break;

      // --- Casos para outras ações ---
      case MenuChoice.ListKeys:
        try {
            await listApiKeys();
        } catch (error: any) {
            console.error(`\nError listing keys: ${error.message}`);
        }
        break;

      case MenuChoice.CreateKey:
        try {
            const answers = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'name',
                    message: 'Enter the name for the new key (required):',
                    validate: (input) => input && input.trim() !== '' ? true : 'Name cannot be empty.',
                },
                {
                    type: 'input',
                    name: 'label',
                    message: 'Enter a label for the key (optional, leave blank for none):',
                    // No validation, allows empty
                },
                {
                    type: 'input',
                    name: 'limit',
                    message: 'Enter a credit limit in USD (optional, leave blank for unlimited):',
                    validate: (input) => { // Validate the input string
                        if (input.trim() === '') return true; // Empty is allowed
                        const num = parseFloat(input);
                        if (!isNaN(num) && num >= 0) return true; // Non-negative number is allowed
                        return 'Please enter a positive number, 0, or leave blank for unlimited.';
                    },
                    filter: (input) => { // Filter AFTER validation
                        if (input.trim() === '') return null;
                        // We know it's a valid number or empty here
                        return parseFloat(input); // Returns the number or null
                    }
                }
            ]);
            // Call the function with the collected data
            await createApiKey(
                answers.name.trim(),
                answers.label.trim() === '' ? null : answers.label.trim(), // Send null if empty
                answers.limit // The filter ensures it's either a number or null
            );
        } catch (error: any) {
             console.error(`\nError creating key: ${error.message}`);
        }
        break;

      case MenuChoice.UpdateKey:
        try {
            const { keyHashToUpdate } = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'keyHashToUpdate',
                    message: 'Enter the Hash of the key you want to UPDATE:',
                    validate: (input) => input && input.trim() !== '' ? true : 'Hash cannot be empty.',
                }
            ]);

            const { fieldsToUpdate } = await inquirer.prompt([
                {
                    type: 'checkbox',
                    name: 'fieldsToUpdate',
                    message: 'Which fields do you want to update? (Use space to select)',
                    choices: [
                        { name: 'Name', value: 'name' },
                        { name: 'Label', value: 'label' },
                        { name: 'Credit Limit (USD)', value: 'limit' },
                        { name: 'Status (Disable/Enable)', value: 'disabled' },
                    ],
                    validate: (answer) => answer.length > 0 ? true : 'Select at least one field to update.',
                }
            ]);

            const updates: { name?: string; label?: string | null; limit?: number | null; disabled?: boolean } = {};

            // Ask for new values for the selected fields
            if (fieldsToUpdate.includes('name')) {
                const { newName } = await inquirer.prompt([{
                    type: 'input', name: 'newName', message: 'New name:',
                    validate: (input) => input && input.trim() !== '' ? true : 'Name cannot be empty.',
                }]);
                updates.name = newName.trim();
            }
            if (fieldsToUpdate.includes('label')) {
                 const { newLabel } = await inquirer.prompt([{
                     type: 'input', name: 'newLabel', message: 'New label (leave blank to remove):'
                 }]);
                 updates.label = newLabel.trim() === '' ? null : newLabel.trim(); // null to remove
            }
            if (fieldsToUpdate.includes('limit')) {
                 const { newLimit } = await inquirer.prompt([{
                     type: 'input', name: 'newLimit', message: 'New limit (leave blank for unlimited):',
                     validate: (input) => {
                         if (input.trim() === '') return true;
                         const num = parseFloat(input);
                         if (!isNaN(num) && num >= 0) return true;
                         return 'Enter a positive number, 0, or leave blank.';
                     },
                     filter: (input) => input.trim() === '' ? null : parseFloat(input)
                 }]);
                 updates.limit = newLimit;
            }
            if (fieldsToUpdate.includes('disabled')) {
                 const { newDisabledStatus } = await inquirer.prompt([{
                     type: 'confirm', name: 'newDisabledStatus', message: 'Disable the key?', default: false
                 }]);
                 updates.disabled = newDisabledStatus;
            }

            // Call the update function
            await updateApiKey(keyHashToUpdate.trim(), updates);

        } catch (error: any) {
            console.error(`\nError updating key: ${error.message}`);
        }
        break;

      case MenuChoice.DeleteKey:
        try {
            const { keyHashToDelete } = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'keyHashToDelete',
                    message: 'Enter the Hash of the key you want to DELETE PERMANENTLY:',
                    validate: (input) => input && input.trim() !== '' ? true : 'Hash cannot be empty.',
                }
            ]);

            const { confirmDelete } = await inquirer.prompt([
                {
                    type: 'confirm',
                    name: 'confirmDelete',
                    // Add red color for emphasis using ANSI escape sequences (may not work on all terminals)
                    message: `\x1b[31mWARNING:\x1b[0m Are you SURE you want to delete the key with hash ${keyHashToDelete.trim()}? \x1b[1mTHIS ACTION IS IRREVERSIBLE!\x1b[0m`,
                    default: false, // Default is NOT to delete
                }
            ]);

            if (confirmDelete) {
                console.log("\nConfirmed. Proceeding with deletion...");
                await deleteApiKey(keyHashToDelete.trim());
            } else {
                console.log("\nDeletion cancelled by user.");
            }

        } catch (error: any) {
            console.error(`\nError deleting key: ${error.message}`);
        }
        break;

      case MenuChoice.CheckLimit:
        try {
            const { useSpecificKey } = await inquirer.prompt([
                {
                    type: 'confirm',
                    name: 'useSpecificKey',
                    message: 'Do you want to check a specific key (instead of the default from .env)?',
                    default: false,
                }
            ]);

            let apiKeyToCheck: string | undefined = undefined;

            if (useSpecificKey) {
                const { specificApiKey } = await inquirer.prompt([
                    {
                        type: 'password', // Mask the key input
                        name: 'specificApiKey',
                        message: 'Enter the API key (sk-or-v1-...) you want to check:',
                        mask: '*',
                        validate: (input) => {
                            if (!input || input.trim() === '') return 'Key cannot be empty.';
                            // Simple validation - can be improved if needed
                            if (!input.startsWith('sk-or-v1-')) return 'Invalid key format. Must start with sk-or-v1-';
                            return true;
                        }
                    }
                ]);
                apiKeyToCheck = specificApiKey.trim();
            }

            // Call the function, passing the specific key or undefined (to use the one from .env)
            await checkApiKeyLimit(apiKeyToCheck);

        } catch (error: any) {
            console.error(`\nError checking limits: ${error.message}`);
        }
        break;

      case MenuChoice.Exit:
        console.log('\nSaindo...');
        process.exit(0);
    }

    // Optional: Ask if the user wants to perform another action or exit
    // await promptContinue();

  } catch (error) {
    console.error('\nAn unexpected error occurred in the manager:', error);
    process.exit(1);
  }
}

// --- Run the Main Function ---
main();

/**
 * @description Optional helper function to prompt the user if they want to perform another operation.
 * If confirmed, it calls `main()` again; otherwise, it exits the process.
 * @returns {Promise<void>} A promise that resolves when the prompt is handled.
 */
async function promptContinue(): Promise<void> {
    const { continueAction } = await inquirer.prompt([
        {
            type: 'confirm',
            name: 'continueAction',
            message: 'Do you want to perform another operation?',
            default: true,
        }
    ]);
    if (continueAction) {
        await main(); // Call the menu again
    } else {
        console.log('\nExiting...');
        process.exit(0);
    }
}
