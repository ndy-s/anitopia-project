"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const config_1 = require("../../config");
exports.default = (interaction) => {
    interaction.reply({
        embeds: [
            new discord_js_1.EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('🚫 Registration Not Allowed')
                .setDescription("Oops! It seems like you've **already registered**. No worries, you're all set to start your journey! Please **type** </explore:1153593389091143690> to begin. Happy exploring! 🚀")
                .setFooter({
                text: config_1.config.messages.footerText
            })
        ],
        ephemeral: true,
    });
};
