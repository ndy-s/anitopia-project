const { Client, Interaction, EmbedBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder} = require('discord.js');
const { footerText } = require('../../../config.json');

const accountCallback = require('../account/account');

module.exports = {
    /**
     *
     * @param {Client} client
     * @param {Interaction} interaction
     * @param followUp
     */
    callback: async (client, interaction, followUp = false) => {

        const exploreRouteSelect = new StringSelectMenuBuilder()
            .setCustomId('exploreRouteSelect')
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

        const responseOptions = {
            embeds: [ embed ],
            components: [new ActionRowBuilder().addComponents(exploreRouteSelect)]
        };

        const collectorFilter = i => i.user.id === interaction.user.id;
        let response = followUp ? await interaction.followUp(responseOptions) : await interaction.reply(responseOptions);

        try {
            let confirmation = await response.awaitMessageComponent({
                filter: collectorFilter,
                time: 300_000
            });

            if (confirmation.customId === 'exploreRouteSelect') {
                if (confirmation.values.includes('account')) {
                    await confirmation.deferUpdate();
                    await interaction.editReply({
                        components: []
                    });

                    await accountCallback.callback(client, interaction, followUp=true);
                }
            }
        } catch (error) {
            console.log(`Explore Command Error: ${error}`);
        }
    },

    name: 'explore',
    description: 'TBA soon!',
};