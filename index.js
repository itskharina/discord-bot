const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

require('dotenv').config();

app.get('/', (req, res) => {
	res.send('Bot is running!');
});

app.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});

// Create a new Collection to store bot commands
client.commands = new Collection();

// Set up paths for command folders
const foldersPath = path.join(__dirname, 'commands'); // Path to commands directory
const commandFolders = fs.readdirSync(foldersPath); // Read all folders in commands directory

// Load commands from command folders
for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder); // Path to specific command folder
	const commandFiles = fs
		.readdirSync(commandsPath) // Read all files in command folder
		.filter((file) => file.endsWith('.js')); // Filter for JavaScript files only

	// Process each command file
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file); // Full path to command file
		const command = require(filePath); // Load command module

		// Verify command has required properties
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command); // Add valid command to collection
		} else {
			console.log(
				`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`,
			);
		}
	}
}

// Set up path for event handlers
const eventsPath = path.join(__dirname, 'events'); // Path to events directory
const eventFiles = fs
	.readdirSync(eventsPath) // Read all files in events directory
	.filter((file) => file.endsWith('.js')); // Filter for JavaScript files only

// Load and register event handlers
for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file); // Full path to event file
	const event = require(filePath); // Load event module

	// Register event handlers based on their type (once or on)
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args)); // Register one-time event
	} else {
		client.on(event.name, (...args) => event.execute(...args)); // Register regular event
	}
}

// Log in to Discord with the bot token from environment variables
client.login(process.env.TOKEN);
