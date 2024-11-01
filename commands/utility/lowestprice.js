// Find lowest price using both steam and aks
const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');
const getGameAKSPrice = require('../../allkeyshop-scraper');
const getGameSteamPrice = require('../../steam-price-checker');

module.exports = {
	// Define the slash command structure
	data: new SlashCommandBuilder()
		.setName('lowestprice')
		.setDescription(
			'Shows lowest available price information for the requested game.',
		)
		.addStringOption(
			(option) =>
				option
					.setName('game')
					.setDescription('The name of the game')
					.setRequired(true), // Make the parameter mandatory
		),

	async execute(interaction) {
		try {
			// Defer reply since API call might take time
			await interaction.deferReply();

			// Get the game name from the command input
			const gameName = interaction.options.getString('game');

			// Fetch the game's price information using the allkeyshop-scraper module
			const { actualGameName, AKSGameInfo } = await getGameAKSPrice(gameName);
			const steamGameInfo = await getGameSteamPrice(gameName);

			// If no price information is found, send an error message
			if (!AKSGameInfo) {
				await interaction.reply(
					`Could not find price information for ${gameName} on AllKeyShop.`,
				);
				return;
			}

			if (!steamGameInfo) {
				await interaction.reply(
					`Could not find price information for ${gameName} on Steam.`,
				);
			}

			// Retrieve the lowest price from the AKS array
			const lowestAKSPriceInfo = AKSGameInfo[0];
			const lowestAKSPrice = Number.parseFloat(lowestAKSPriceInfo.priceToSort);

			// Retrieve the Steam price
			const steamPrice = Number.parseFloat(
				steamGameInfo.finalPrice.replace('£', ''),
			);

			let description = '';
			// Edit the embed description based on which source has the lowest price
			const discount = lowestAKSPriceInfo.discountCode
				? ` (Code: ${lowestAKSPriceInfo.discountCode})`
				: '';

			if (lowestAKSPrice && steamGameInfo) {
				if (lowestAKSPrice < steamPrice) {
					description = `🏆 **Best Price Found on AllKeyShop**\n
					🏪 **Merchant:** ${lowestAKSPriceInfo.merchantTitle}
					💰 **Price:** ${lowestAKSPriceInfo.price} ${discount}\n
					🔄 **Steam Price:** ${steamGameInfo.finalPrice}
					💵 **You Save:** £${(steamPrice - lowestAKSPrice).toFixed(2)}\n
					[🛒 Buy from AllKeyShop](${lowestAKSPriceInfo.merchantLink})`;
				} else if (lowestAKSPrice === steamPrice) {
					description = `⚖️ **Prices Are Equal**\n
					💰 **Price:** ${steamGameInfo.finalPrice}
					ℹ️ *Recommended: Purchase from Steam for better security*\n
					[🛒 Buy on Steam](${steamGameInfo.link})`;
				} else {
					description = `🏆 **Best Price Found on Steam**\n
					💰 **Steam Price:** ${steamGameInfo.finalPrice}\n
					📊 **AllKeyShop Price:** ${lowestAKSPriceInfo.price}
					💵 **You Save:** £${(lowestAKSPrice - steamPrice).toFixed(2)}\n
					[🛒 Buy on Steam](${steamGameInfo.link})`;
				}
			} else if (steamGameInfo && !lowestAKSPrice) {
				description = `ℹ️ **Only Available on Steam**\n
				💰 **Steam Price:** ${steamGameInfo.finalPrice}\n
				[🛒 Buy on Steam](${steamGameInfo.link})`;
			}

			// Create a new Discord embed message
			const embed = new EmbedBuilder()
				.setTitle(`🎮 ${actualGameName} 🎮`)
				.setColor('#7289DA')
				.setDescription(description)
				.setFooter({ text: 'Prices updated in real-time' });

			// Send the embed message as an edited reply to the interaction
			await interaction.editReply({ embeds: [embed] });
		} catch (error) {
			console.error(error);
			await interaction.editReply(
				'There was an error while comparing game prices.',
			);
		}
	},
};
