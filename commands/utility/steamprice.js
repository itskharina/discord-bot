const { SlashCommandBuilder } = require('discord.js');
const getGameSteamPrice = require('../../steam-price-checker');

module.exports = {
	// Define the slash command structure
	data: new SlashCommandBuilder()
		.setName('steamprice') // Command name that users will type
		.setDescription('Shows price information for the requested game') // Command description shown in Discord
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
		// console.log(gameName);

		// Fetch the game's price information using the steam-price-checker module
		const gamePrice = await getGameSteamPrice(gameName);

		// If no price information is found, send an error message
		if (!gamePrice) {
			await interaction.reply(
				`Could not find price information for ${gameName}.`,
			);
			return;
		}

		// Construct the price information message
		// If there's a discount, show both original and discounted prices
		// If no discount, show only the current price
		const priceInfo = gamePrice.discount
			? `${gamePrice.name}\nPrice: The game is currently on a ${gamePrice.discount}% discount, going from ${gamePrice.initialPrice} down to ${gamePrice.finalPrice}\nLink: ${gamePrice.link}`
			: `${gamePrice.name}\nPrice: ${gamePrice.finalPrice}\nLink: ${gamePrice.link}`;

		// Send the price information as a reply to the interaction
		await interaction.reply(priceInfo);
	},
};
