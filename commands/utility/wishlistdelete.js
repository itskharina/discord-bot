const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');
const { removeFromWishlist, getWishlist } = require('../../database/queries');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('wishlistdelete')
		.setDescription('Remove a game from your wishlist')
		.addStringOption((option) =>
			option
				.setName('game')
				.setDescription('The name of the game')
				.setRequired(true),
		),

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

			// Find the game to delete
			const gameToDelete = data.find(
				(item) => item.game_name.toLowerCase() === gameName.toLowerCase(),
			);

			// Send an error message to user if game isn't in their wishlist
			if (!gameToDelete) {
				await interaction.editReply("This game isn't in your wishlist!");
				return;
			}

			// Remove specified game from wishlist
			await removeFromWishlist(userId, gameName);

			const embed = new EmbedBuilder()
				.setTitle('Deletion successful!')
				.setColor('#7289DA')
				.setDescription(
					`**${gameToDelete.game_name}** has successfully been removed from your wishlist!`,
				);

			// Send the embed message as an edited reply to the interaction
			await interaction.editReply({ embeds: [embed] });
		} catch (error) {
			console.error(error);
			await interaction.editReply({
				content: 'There was an error removing the game from your wishlist!',
				ephemeral: true,
			});
		}
	},
};
