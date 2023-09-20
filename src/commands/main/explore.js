const { Client, Interaction, EmbedBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder} = require('discord.js');
const { footerText } = require('../../../config.json');

module.exports = {
    /**
     *
     * @param {Client} client
     * @param {Interaction} interaction
     */

    callback: async (client, interaction, followUp = false) => {

        const exploreRouteSelect = new StringSelectMenuBuilder()
            .setCustomId('exploreRoute')
            .setPlaceholder('Click to select your destination!')
            .addOptions(
                new StringSelectMenuOptionBuilder()
                    .setLabel('Main Story')
                    .setDescription('TBA Soon!')
                    .setValue('story'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('My Account')
                    .setDescription('TBA Soon!')
                    .setValue('account'),
            );

        const embed=  new EmbedBuilder()
            .setColor('DarkRed')
            .setAuthor({
                name: interaction.user.globalName,
                iconURL: interaction.user.displayAvatarURL(),
            })
            .setTitle('Explore Route')
            .setImage('https://i.pinimg.com/736x/0c/c8/b9/0cc8b9ee6da6a77a5940a24cc9e040f6.jpg')
            .setFooter({
                text: footerText
            })

        if (followUp === true) {
            await interaction.followUp({
                embeds: [embed],
                components: [new ActionRowBuilder().addComponents(exploreRouteSelect)]
            });
        } else {
            await interaction.reply({
                embeds: [embed],
                components: [new ActionRowBuilder().addComponents(exploreRouteSelect)]
            });
        }
    },

    name: 'explore',
    description: 'TBA soon!',
};