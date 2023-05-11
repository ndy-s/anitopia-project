const { EmbedBuilder } = require('discord.js');

module.exports = (interaction, defer = false) => {
    interaction[defer ? 'editReply' : 'reply']({ embeds: [
        new EmbedBuilder()
            .setColor('Red')
            .setAuthor({ name: `${interaction.user.username}#${interaction.user.discriminator}`, iconURL: interaction.user.displayAvatarURL() })
            .setTitle("Command Exception❗")
            .setDescription("Ah, my dear adventurer, it seems you haven't started your journey in the land of Anitopia yet. Type ``/register`` and join the exciting adventure filled with boundless wonders!")
            .setFooter({ text: 'For assistance, type /help for more info.' })
    ]});
};