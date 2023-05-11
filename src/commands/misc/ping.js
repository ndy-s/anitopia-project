const User = require('../../models/User');
const exceptionCommand = require('../../exception/command');

module.exports = {
	name: 'ping',
	description: 'Replies with Pong!',
    // deleted: true,
	callback: async (client, interaction) => {
		await interaction.deferReply();
		const reply = await interaction.fetchReply();		
		const ping = reply.createdTimestamp - interaction.createdTimestamp;

		let user = await User.findOne({ userId: interaction.member.id, guildId: interaction.guild.id });
        if (user) {
			interaction.editReply(`🏓 Pong! Client: ${ping}ms | Websocket: ${client.ws.ping}ms`)
        } else {
			exceptionCommand(interaction, true);
			return;
		}

	}
};
