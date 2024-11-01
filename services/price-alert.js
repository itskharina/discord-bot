const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config();

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
	],
});

client.login(process.env.TOKEN);

const channelId = '1298114302888120352';

async function sendPriceAlert(userId, gameName, currentPrice) {
	try {
		const channel = await client.channels.fetch(channelId);
		await channel.send(
			`<@${userId}> Great news! The price of **${gameName}** has dropped to ${currentPrice}, which is at or below your target price!`,
		);
	} catch (error) {
		console.error('Error sending price alert:', error);
	}
}

module.exports = sendPriceAlert;
