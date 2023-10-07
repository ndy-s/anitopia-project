"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const config_1 = require("../../config");
exports.default = (interaction) => {
    interaction.reply({
        embeds: [
            new discord_js_1.EmbedBuilder()
                .setColor('Red')
                .setTitle('Registration Not Allowed')
                .setDescription("You've **already registered** and cannot register again. Please **type** </explore:1153593389091143690> to begin your journey.")
                .setFooter({
                text: config_1.config.messages.footerText
            })
        ],
        ephemeral: true,
    });
};
