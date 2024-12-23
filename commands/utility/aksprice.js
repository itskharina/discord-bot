const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');
const getGameAKSPrice = require('../../allkeyshop-scraper');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('aksprice')
		.setDescription('Shows AKS information for the requested game.')
		.addStringOption(
			(option) =>
				option
					.setName('game')
					.setDescription('The name of the game')
					.setRequired(true), // Make the parameter mandatory
		),

	async execute(interaction) {
		// Defer reply since API call might take time
		await interaction.deferReply();

		// Get the game name from the command input
		const gameName = interaction.options.getString('game');

		try {
			// Fetch the game's price information using the allkeyshop-scraper module
			// actualGameName is the game name written with the correct capitalisation
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
					// Map through the prices and format them
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

			// Send the embed message as an edited reply to the interaction
			await interaction.editReply({ embeds: [embed] });
		} catch (error) {
			console.error(error);
			await interaction.editReply(
				'There was an error while fetching the game prices.',
			);
		}
	},
};
