const { EmbedBuilder } = require('discord.js');
const { SlashCommandBuilder } = require('discord.js');
const getGameSteamPrice = require('../../steam-price-checker');

module.exports = {
	// Define the slash command structure
	data: new SlashCommandBuilder()
		.setName('steamprice') // Command name that users will type
		.setDescription('Shows steam price information for the requested game.')
		.addStringOption((option) =>
			option
				.setName('game')
				.setDescription('The name of the game')
				.setRequired(true),
		),

	async execute(interaction) {
		try {
			// Get the game name from the command input
			const gameName = interaction.options.getString('game');

			// Fetch the game's price information using the steam-price-checker module
			const gamePrice = await getGameSteamPrice(gameName);

			// If no price information is found, send an error message
			if (!gamePrice) {
				await interaction.reply(
					`Could not find price information for ${gameName}.`,
				);
				return;
			}

			// Create a new Discord embed message
			const embed = new EmbedBuilder()
				.setTitle(`🎮 ${gamePrice.name} 🎮`)
				.setColor('#7289DA')
				.setDescription(
					gamePrice.discount
						? `💰 **Original Price:** ${gamePrice.initialPrice}
								🏷️ **Discount:** ${gamePrice.discount}% OFF
								✨ **Final Price:** ${gamePrice.finalPrice}\n
								[🛒 Click here to view on Steam](${gamePrice.link})`
						: `💰 **Price:** ${gamePrice.finalPrice}\n
								[🛒 Click here to view on Steam](${gamePrice.link})`,
				)
				.setFooter({ text: 'Prices updated in real-time' });

			// Send the embed message as a reply to the interaction
			await interaction.reply({ embeds: [embed] });
		} catch (error) {
			console.error(error);
			await interaction.reply(
				'There was an error while fetching the game price.',
			);
		}
	},
};
