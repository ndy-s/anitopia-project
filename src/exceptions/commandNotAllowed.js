const { EmbedBuilder } = require('discord.js');

module.exports = (interaction) => {
    interaction.reply({
        embeds: [
            new EmbedBuilder()
                .setColor('Red')
                .setTitle('Command Not Allowed')
                .setDescription("This command can **only** be used **in a server**. Please run it within a server.")
                .setFooter({
                    text: 'For assistance or to report issues, please contact our support.'
                })
        ],
        ephemeral: true,
    });
};