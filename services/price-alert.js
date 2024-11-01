const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config();

// Initialize Discord client with specified intents
const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
	],
});

// Log in to Discord with the bot token from environment variables
client.login(process.env.TOKEN);

// Function to send a price alert to a specific channel
async function sendPriceAlert(userId, gameName, currentPrice) {
	try {
		// Fetch the channel using the channel ID
		const channel = await client.channels.fetch(process.env.CHANNEL_ID);
		// Send a message in the channel, mentioning the user and including the price alert
		await channel.send(
			`<@${userId}> Great news! The price of **${gameName}** has dropped to ${currentPrice}, which is at or below your target price!`,
		);
	} catch (error) {
		console.error('Error sending price alert:', error);
	}
}

module.exports = sendPriceAlert;
