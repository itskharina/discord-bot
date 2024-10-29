const { Events } = require('discord.js');
const priceChecker = require('../services/price-checker-service');

module.exports = {
	// Name of the event to listen for (when client is ready)
	name: Events.ClientReady,

	// Set to true since this event should only run once when bot starts
	once: true,

	// Event handler function that runs when bot is ready
	execute(client) {
		// Log a message showing the bot's username and discriminator
		console.log(`Ready! Logged in as ${client.user.tag}`);
		// Start the price checker function
		priceChecker.start();
	},
};
