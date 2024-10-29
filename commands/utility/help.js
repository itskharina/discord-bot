const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('Provides information about available commands.'),
	async execute(interaction) {
		const embed = new EmbedBuilder()
			.setTitle('All available commands!')
			.setColor('#7289DA')
			.setDescription(
				`**/aksprice** \`<text>\`: Retrieves detailed game information and price comparisons from AllKeyShop for the specified game.\n
					**/steamprice** \`<text>\`: Provides the latest Steam game details and pricing for the specified game.\n
					**/lowestprice \`<text>\`**: Retrieves the lowest game price for the specified game across both Steam and AllKeyShop.\n
					**/wishlistadd \`<text>\` \`<number>\`**: Allows the user to add a game and a target price to a wishlist for easier tracking.\n
					**/wishlistcheck**: Allows the user to see all of the games on their wishlist, along with the current price and their target price.`,
			);

		// Send the embed message as a reply to the interaction
		await interaction.reply({ embeds: [embed] });
	},
};
