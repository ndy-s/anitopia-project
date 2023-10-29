"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.accountNF = void 0;
const discord_js_1 = require("discord.js");
const config_1 = require("../../config");
const accountNF = (interaction) => {
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
                iconURL: interaction.client.user.displayAvatarURL({ extension: 'png', size: 512 }),
                text: config_1.config.messages.footerText
            })
        ] });
};
exports.accountNF = accountNF;
