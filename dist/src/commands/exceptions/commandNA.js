"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const config_1 = require("../../config");
exports.default = (interaction) => {
    interaction.reply({
        embeds: [
            new discord_js_1.EmbedBuilder()
                .setColor('Red')
                .setTitle('Command Not Allowed')
                .setDescription("This command can **only** be used **in a server**. Please run it within a server.")
                .setFooter({
                text: config_1.config.messages.footerText
            })
        ],
        ephemeral: true,
    });
};
