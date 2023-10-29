"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registrationNA = void 0;
const discord_js_1 = require("discord.js");
const config_1 = require("../../config");
const registrationNA = (interaction) => {
    interaction.reply({
        embeds: [
            new discord_js_1.EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('🚫 Registration Not Allowed')
                .setDescription(`Oops! It seems like you've **already registered**. No worries, you're all set to start your journey! Please **type** ${config_1.config.commands.mainCommandTag} to begin. Happy exploring! 🚀`)
                .setFooter({
                iconURL: interaction.client.user.displayAvatarURL({ extension: 'png', size: 512 }),
                text: config_1.config.messages.footerText
            })
        ],
        ephemeral: true,
    });
};
exports.registrationNA = registrationNA;
