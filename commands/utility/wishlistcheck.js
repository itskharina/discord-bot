const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');
const { getWishlist } = require('../../database/queries');
const getGameAKSPrice = require('../../allkeyshop-scraper');
const getGameSteamPrice = require('../../steam-price-checker');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('wishlistcheck')
		.setDescription('Check your wishlist'),

	async execute(interaction) {
		// Defer reply since database query might take time
		await interaction.deferReply();

		try {
			// Extract user input
			const userId = interaction.user.id;
			const gameName = interaction.options.getString('game');

			// Fetch user's wishlist from database
			const data = await getWishlist(userId);

			// Handle empty wishlist
			if (!data || data.length === 0) {
				await interaction.editReply('Your wishlist is empty!');
				return;
			}

			// Create embed to display wishlist
			const embed = new EmbedBuilder()
				.setTitle('🎮 Games currently on your wishlist 🎮')
				.setColor('#7289DA')
				.setDescription(
					// Map through wishlist items and format them
					`${data
						.map((item, index) => {
							return `Game: ${item.game_name}
                    Current Price: ${item.current_price}
                    Target Price: ${item.target_price}\n`;
						})
						.join('\n')}`,
				)
				.setFooter({ text: 'Prices updated in real-time' });

			// Send the embed message as an edited reply to the interaction
			await interaction.editReply({
				embeds: [embed],
			});
		} catch (error) {
			console.error(error);
			await interaction.editReply({
				content: 'There was an error adding the game to your wishlist!',
				ephemeral: true,
			});
		}
	},
};
