import { Client, CommandInteraction, EmbedBuilder } from "discord.js";

export default {
    name: 'ping',
    description: 'Measures and displays the latency between the bot and the server',
    cooldown: 5_000,
    options: [],
    deleted: false,
    
    // Optional
    devOnly: false,
    testOnly: false,
    botPermissions: [],
    permissionsRequired: [],

    callback: async (client: Client, interaction: CommandInteraction) => {
        const sent = await interaction.reply({ 
            content: '🏓 Pinging server...', 
            fetchReply: true 
        });

        const pingEmbed = new EmbedBuilder()
            .setColor('Blurple')
            .setTitle(`Latency Check for ${interaction.user.globalName} (${interaction.user.username})`)
            .setDescription(`🌐 **Websocket Heartbeat**: ${client.ws.ping} ms\nThis is the time taken for a message to travel from the bot to the Discord server and back, indicating the health of the connection.\n\n⏱️ **Roundtrip Latency**: ${sent.createdTimestamp - interaction.createdTimestamp}ms\nThis is the time taken for a message to travel from the bot to the Discord server, then to your client, and back. It includes both network latency and processing time.`)
            .setFooter({
                text: `Requested by ${interaction.user.tag}`,
                iconURL: interaction.user.displayAvatarURL({ extension: 'png', size: 512}),
            });

        interaction.editReply({
            content: '',
            embeds: [pingEmbed],
        });
    },
};