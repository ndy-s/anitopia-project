import { Client, CommandInteraction, EmbedBuilder, PermissionFlagsBits } from "discord.js";
import { config } from "../../config";

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
            .setTitle(`🏓 Pong! Latency Details`)
            .addFields(
                { 
                    name: '👤 User', 
                    value: `${interaction.user.globalName} (${interaction.user.username})`, 
                    inline: true
                },
                {
                    name: '🌐 Websocket Heartbeat',
                    value: `${client.ws.ping} ms`,
                    inline: true,
                },
                {
                    name: '⏱️ Roundtrip Latency',
                    value: `${sent.createdTimestamp - interaction.createdTimestamp} ms`,
                    inline: true,
                }
            )
            .setDescription(`The **Websocket Heartbeat** is the time taken for a message to travel from the bot to the Discord server and back, indicating the health of the connection.\n\nThe **Roundtrip Latency** is the time taken for a message to travel from the bot to the Discord server, then to your client, and back. It includes both network latency and processing time.`)
            .setFooter({
                iconURL: interaction.user.displayAvatarURL({ extension: 'png', size: 512}),
                text: config.messages.footerText,
            });

        interaction.editReply({
            embeds: [pingEmbed],
        });
    },
};