const { EmbedBuilder } = require('discord.js');
const { SlashCommandBuilder } = require('discord.js');
const getGameSteamPrice = require('../../steam-price-checker');

module.exports = {
	// Define the slash command structure
	data: new SlashCommandBuilder()
		.setName('steamprice') // Command name that users will type
		.setDescription('Shows steam price information for the requested game.') // Command description shown in Discord
		.addStringOption(
			(option) =>
				option
					.setName('game') // Parameter name
					.setDescription('The name of the game') // Parameter description
					.setRequired(true), // Make the parameter mandatory
		),

	// Command execution function
	async execute(interaction) {
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

		const embed = new EmbedBuilder()
			.setTitle(`🎮 ${gamePrice.name} 🎮`)
			.setColor('#7289DA')
			.setDescription(
				gamePrice.discount
					? `💰 **Original Price:** ${gamePrice.initialPrice}\n` +
							`🏷️ **Discount:** ${gamePrice.discount}% OFF\n` +
							`✨ **Final Price:** ${gamePrice.finalPrice}\n\n` +
							`[🛒 Click here to view on Steam](${gamePrice.link})`
					: `💰 **Price:** ${gamePrice.finalPrice}\n\n` +
							`[🛒 Click here to view on Steam](${gamePrice.link})`,
			)
			.setFooter({ text: 'Prices updated in real-time' });

		// Send the price information as a reply to the interaction
		await interaction.reply({ embeds: [embed] });
	},
};
