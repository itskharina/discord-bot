// Find lowest price using both steam and aks
const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');
const getGameAKSPrice = require('../../allkeyshop-scraper');
const getGameSteamPrice = require('../../steam-price-checker');

module.exports = {
	// Define the slash command structure
	data: new SlashCommandBuilder()
		.setName('lowestprice') // Command name that users will type
		.setDescription(
			'Shows lowest available price information for the requested game.',
		) // Command description shown in Discord
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
		const lowestAKSPriceInfo = AKSGameInfo.slice(0, 1);
		console.log(lowestAKSPriceInfo);
		const lowestAKSPrice = Number.parseFloat(lowestAKSPriceInfo[0].priceToSort);
		// Retrieve the Steam price
		const steamPrice = Number.parseFloat(
			steamGameInfo.finalPrice.replace('£', ''),
		);

		let description = '';
		const discount = lowestAKSPriceInfo[0].discountCode
			? ` (Code: ${lowestAKSPriceInfo[0].discountCode})`
			: '';

		if (lowestAKSPrice && steamGameInfo) {
			if (lowestAKSPrice < steamPrice) {
				description = `🏆 **Best Price Found on AllKeyShop**\n
                🏪 **Merchant:** ${lowestAKSPriceInfo[0].merchantTitle}
                💰 **Price:** ${lowestAKSPriceInfo[0].price} ${discount}\n
                🔄 **Steam Price:** ${steamGameInfo.finalPrice}
                💵 **You Save:** £${(steamPrice - lowestAKSPrice).toFixed(2)}\n
                [🛒 Buy from AllKeyShop](${lowestAKSPriceInfo[0].merchantLink})`;
			} else if (lowestAKSPrice === steamPrice) {
				description = `⚖️ **Prices Are Equal**\n
                💰 **Price:** ${steamGameInfo.finalPrice}
                ℹ️ *Recommended: Purchase from Steam for better security*\n
                [🛒 Buy on Steam](${steamGameInfo.link})`;
			} else {
				description = `🏆 **Best Price Found on Steam**\n
                💰 **Steam Price:** ${steamGameInfo.finalPrice}\n
                📊 **AllKeyShop Price:** ${lowestAKSPriceInfo[0].price}
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

		// Send the embed message as a reply to the interaction
		await interaction.reply({ embeds: [embed] });
	},
};
