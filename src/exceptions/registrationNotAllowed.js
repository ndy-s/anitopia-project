const { EmbedBuilder } = require('discord.js');
const { footerText } = require('../../config.json');

module.exports = (interaction) => {
    interaction.reply({
        embeds: [
            new EmbedBuilder()
                .setColor('Red')
                .setTitle('Registration Not Allowed')
                .setDescription("You've **already registered** and cannot register again. Please **type** </explore:1153593389091143690> to begin your journey.")
                .setFooter({
                    text: footerText
                })
        ],
        ephemeral: true,
    });
};