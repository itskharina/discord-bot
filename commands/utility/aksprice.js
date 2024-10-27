const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');
const getGameAKSPrice = require('../../allkeyshop-scraper');

module.exports = {
	// Define the slash command structure
	data: new SlashCommandBuilder()
		.setName('aksprice') // Command name that users will type
		.setDescription('Shows AKS information for the requested game.') // Command description shown in Discord
		.addStringOption(
			(option) =>
				option
					.setName('game') // Parameter name
					.setDescription('The name of the game') // Parameter description
					.setRequired(true), // Make the parameter mandatory
		),

	// Command execution function
	async execute(interaction) {
		await interaction.deferReply();

		try {
			// Get the game name from the command input
			const gameName = interaction.options.getString('game');

			// Fetch the game's price information using the allkeyshop-scraper module
			const { actualGameName, AKSGameInfo } = await getGameAKSPrice(gameName);

			// If no price information is found, send an error message
			if (!AKSGameInfo) {
				await interaction.reply(
					`Could not find price information for ${gameName}.`,
				);
				return;
			}

			// Retrieve the 5 lowest prices from the array
			const firstFivePrices = AKSGameInfo.slice(0, 5);

			// Create a new Discord embed message
			const embed = new EmbedBuilder()
				.setTitle(`🎮 ${actualGameName} 🎮`)
				.setColor('#7289DA')
				.setDescription(
					// Format the first five prices into a readable list
					`Best prices from AllKeyShop:\n\n${firstFivePrices
						.map((item, index) => {
							// Check if there's a discount code available
							const discount = item.discountCode
								? ` (Code: ${item.discountCode})`
								: '';
							// Format each price entry with:
							// - Merchant name
							// - Price
							// - Discount code (if available)
							// - Purchase link
							return `${index + 1}. **${item.merchantTitle}**\n💰 ${item.price}${discount}\n[Buy Here](${item.merchantLink})\n`;
						})
						.join('\n')}`,
				)
				.setFooter({ text: 'Prices updated in real-time' });

			// Send the embed message as a reply to the interaction
			await interaction.reply({ embeds: [embed] });
		} catch (error) {
			console.error('Error in aksprice command:', error);
			await interaction.editReply(
				'An error occurred while fetching the game prices. Please try again later.',
			);
		}
	},
};
