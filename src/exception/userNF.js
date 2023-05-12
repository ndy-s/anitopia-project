const { EmbedBuilder } = require('discord.js');

module.exports = (interaction, mentionedUsername, defer = false) => {
    interaction[defer ? 'editReply' : 'reply']({ embeds: [
        new EmbedBuilder()
            .setColor('Red')
            .setAuthor({ name: `${interaction.user.username}#${interaction.user.discriminator}`, iconURL: interaction.user.displayAvatarURL() })
            .setTitle("Anitopian Not Found❗")
            .setDescription(`Oh dear, it seems that **${mentionedUsername}** hasn't registered yet!`)
            .setFooter({ text: 'For assistance, type /help for more info.' })
    ]});
};