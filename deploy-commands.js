const { REST, Routes } = require('discord.js');
require('dotenv').config(); // Load environment variables from .env file
const fs = require('node:fs'); // File system module
const path = require('node:path'); // Path manipulation module

// Initialize an empty array to store command data
const commands = [];
// Define the path to the commands directory
const foldersPath = path.join(__dirname, 'commands');
// Get all folder names from the commands directory
const commandFolders = fs.readdirSync(foldersPath);

// Iterate through each folder in the commands directory
for (const folder of commandFolders) {
	// Get the path to the current command folder
	const commandsPath = path.join(foldersPath, folder);
	// Get all JavaScript files from the current command folder
	const commandFiles = fs
		.readdirSync(commandsPath)
		.filter((file) => file.endsWith('.js'));

	// Iterate through each command file
	for (const file of commandFiles) {
		// Get the full path to the command file
		const filePath = path.join(commandsPath, file);
		// Import the command module
		const command = require(filePath);

		// Verify that the command has both 'data' and 'execute' properties
		if ('data' in command && 'execute' in command) {
			// Convert command data to JSON and add to commands array
			commands.push(command.data.toJSON());
		} else {
			// Log warning if command is missing required properties
			console.log(
				`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`,
			);
		}
	}
}

// Create a new REST instance and set the bot token
const rest = new REST().setToken(process.env.TOKEN);

// Self-executing async function to deploy commands
(async () => {
	try {
		// Log the start of the deployment process
		console.log(
			`Started refreshing ${commands.length} application (/) commands.`,
		);

		// Deploy commands to the specified guild (server)
		// Routes.applicationGuildCommands() creates the URL for the REST endpoint
		const data = await rest.put(
			Routes.applicationGuildCommands(
				process.env.CLIENT_ID, // Bot's client ID
				process.env.GUILD_ID, // Target server ID
			),
			{ body: commands }, // Command data to be deployed
		);

		// Log successful deployment
		console.log(
			`Successfully reloaded ${data.length} application (/) commands.`,
		);
	} catch (error) {
		// Log any errors that occur during deployment
		console.error(error);
	}
})();
