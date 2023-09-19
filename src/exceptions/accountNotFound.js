const { EmbedBuilder } = require('discord.js');

module.exports = (interaction) => {
    interaction.reply({ embeds: [
        new EmbedBuilder()
            .setColor('Red')
            .setAuthor({
                name: `${interaction.user.username}#${interaction.user.discriminator}`,
                iconURL: interaction.user.displayAvatarURL()
            })
            .setTitle("Anitopian Not Found❗")
            .setDescription(`Oh dear, it seems that you hasn't registered yet!`)
            .setFooter({
                text: 'For assistance, type /help for more info.'
            })
    ]});
};