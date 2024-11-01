const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');
const getPriceInfo = require('../../utils/compare-prices');

const { addToWishlist } = require('../../database/queries');
const getGameAKSPrice = require('../../allkeyshop-scraper');
const getGameSteamPrice = require('../../steam-price-checker');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('wishlistadd')
		.setDescription('Add a game to your wishlist')
		// Optional target price parameter
		.addStringOption((option) =>
			option
				.setName('game')
				.setDescription('The name of the game')
				.setRequired(true),
		)
		// Optional target price parameter
		.addNumberOption((option) =>
			option
				.setName('target_price')
				.setDescription('Target price for alerts')
				.setRequired(false),
		),

	async execute(interaction) {
		// Defer reply since API call and database query might take time
		await interaction.deferReply();

		try {
			// Extract user input
			const userId = interaction.user.id;
			const gameName = interaction.options.getString('game');
			const targetPrice = interaction.options.getNumber('target_price');

			const { actualGameName, currentPrice } = await getPriceInfo(gameName);

			// Handle case where game isn't found
			if (!actualGameName || !currentPrice) {
				await interaction.editReply('Could not find the specified game.');
				return;
			}

			// Format target price with £ symbol and 2 decimal places
			const formattedTargetPrice = targetPrice
				? `£${targetPrice.toFixed(2)}`
				: null;

			const currentPriceAsNumber = Number.parseFloat(
				currentPrice.replace('£', ''),
			);

			// Add game to wishlist database
			await addToWishlist(
				userId,
				actualGameName,
				currentPrice,
				formattedTargetPrice,
			);

			// Create a new Discord embed message
			const embed = new EmbedBuilder()
				.setTitle('🎮 Added to Wishlist! 🎮')
				.setColor('#7289DA')
				.setDescription(
					`Game: ${actualGameName}
					 Current Price: ${currentPrice}
					 Target Price: ${targetPrice ? `${formattedTargetPrice}` : 'Not set'}`,
				)
				.setFooter({ text: 'Prices updated in real-time' });

			// Send the embed message as an edited reply to the interaction
			await interaction.editReply({
				embeds: [embed],
			});
			if (targetPrice && currentPriceAsNumber <= targetPrice) {
				// Send a second message if the current price is equal to or less than the target price
				await interaction.followUp(
					`The current price of **${actualGameName}** is now ${currentPrice}, which is at or below your target price of ${formattedTargetPrice}!`,
				);
			}
		} catch (error) {
			console.error(error);
			await interaction.editReply({
				content: 'There was an error adding the game to your wishlist!',
				ephemeral: true,
			});
		}
	},
};
