const { EmbedBuilder } = require('discord.js');
const { footerText } = require('../../config.json');

module.exports = (interaction) => {
    interaction.reply({
        embeds: [
            new EmbedBuilder()
                .setColor('Red')
                .setTitle('Command Not Allowed')
                .setDescription("This command can **only** be used **in a server**. Please run it within a server.")
                .setFooter({
                    text: footerText
                })
        ],
        ephemeral: true,
    });
};