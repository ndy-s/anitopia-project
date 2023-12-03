"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const config_1 = require("../../config");
exports.default = {
    name: 'ping',
    description: 'Measures your ping time',
    cooldown: 5000,
    options: [],
    deleted: false,
    // Optional
    devOnly: false,
    testOnly: false,
    botPermissions: [],
    permissionsRequired: [],
    callback: async (client, interaction) => {
        const pingEmbed = new discord_js_1.EmbedBuilder()
            .setColor('Blurple')
            .setTitle(`🏓 Pinging server...`);
        const sent = await interaction.reply({
            embeds: [pingEmbed],
            fetchReply: true
        });
        pingEmbed.setTitle(`🏓 Pong! Latency Details`)
            .addFields({
            name: '👤 User',
            value: `${interaction.user.globalName} (${interaction.user.username})`,
            inline: true
        }, {
            name: '🌐 Websocket Heartbeat',
            value: `${client.ws.ping} ms`,
            inline: true,
        }, {
            name: '⏱️ Roundtrip Latency',
            value: `${sent.createdTimestamp - interaction.createdTimestamp} ms`,
            inline: true,
        })
            .setDescription(`The **Websocket Heartbeat** is the time taken for a message to travel from the bot to the Discord server and back, indicating the health of the connection.\n\nThe **Roundtrip Latency** is the time taken for a message to travel from the bot to the Discord server, then to your client, and back. It includes both network latency and processing time.`)
            .setFooter({
            iconURL: interaction.client.user.displayAvatarURL({ extension: 'png', size: 512 }),
            text: config_1.config.messages.footerText,
        });
        await interaction.editReply({
            embeds: [pingEmbed],
        });
    },
};
