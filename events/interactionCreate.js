const { Events } = require('discord.js');

module.exports = {
	// Register event handler for InteractionCreate event
	name: Events.InteractionCreate,
	async execute(interaction) {
		// Ignore if the interaction is not a chat command
		if (!interaction.isChatInputCommand()) return;

		// Get the command from the client's commands collection
		const command = interaction.client.commands.get(interaction.commandName);

		// If command doesn't exist, log error and return
		if (!command) {
			console.error(
				`No command matching ${interaction.commandName} was found.`,
			);
			return;
		}

		try {
			// Attempt to execute the command
			await command.execute(interaction);
		} catch (error) {
			// Log any errors that occur during command execution
			console.error(error);

			// Handle error response based on interaction state
			if (interaction.replied || interaction.deferred) {
				await interaction.followUp({
					content: 'There was an error while executing this command!',
					ephemeral: true, // Only visible to command user
				});
			} else {
				// If no prior response, send initial reply
				await interaction.reply({
					content: 'There was an error while executing this command!',
					ephemeral: true,
				});
			}
		}
	},
};
