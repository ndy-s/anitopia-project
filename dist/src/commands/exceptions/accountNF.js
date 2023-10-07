"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const config_1 = require("../../config");
exports.default = (interaction) => {
    interaction.reply({ embeds: [
            new discord_js_1.EmbedBuilder()
                .setColor('#FF0000')
                .setAuthor({
                name: `${interaction.user.username}#${interaction.user.discriminator}`,
                iconURL: interaction.user.displayAvatarURL()
            })
                .setTitle("Anitopian Not Found❗")
                .setDescription(`Oh dear, it seems that you hasn't registered yet!`)
                .setFooter({
                text: config_1.config.messages.footerText
            })
        ] });
};
