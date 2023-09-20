const { Client, Interaction, EmbedBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder,
    ModalBuilder, TextInputBuilder, TextInputStyle
} = require('discord.js');
const { footerText } = require('../../../config.json');

const Account = require('../../models/Account');
// Import exceptions
const commandNotAllowed = require('../../exceptions/commandNotAllowed.js');

module.exports = {
    /**
     *
     * @param {Client} client
     * @param {Interaction} interaction
     */

    callback: async (client, interaction, followUp = false) => {
        try {
            let account = await Account.findOne({
                accountId: interaction.member.id,
                guildId: interaction.guild.id
            });

            const accountSelect = new StringSelectMenuBuilder()
                .setCustomId('accountSelect')
                .setPlaceholder('Click to view more menu options!')
                .addOptions(
                    new StringSelectMenuOptionBuilder()
                        .setLabel('Customize Profile')
                        .setDescription('TBA Soon!')
                        .setValue('customize'),
                    new StringSelectMenuOptionBuilder()
                        .setLabel('Redeem Code')
                        .setDescription('TBA Soon!')
                        .setValue('redeem'),
                );

            const embed= new EmbedBuilder()
                .setColor('DarkRed')
                .setAuthor({
                    name: interaction.user.globalName,
                    iconURL: interaction.user.displayAvatarURL(),
                })
                .setTitle(`${interaction.user.globalName}'s Account`)
                .setThumbnail(interaction.user.displayAvatarURL())
                .setDescription(`**Biography**\n\`\`\` ${account.bio} \`\`\`\nExplore more options by selecting from the choices below. To personalize your profile, simply click on **Customize Profile** in the menu.`)
                .addFields(
                    {
                        name: '⭐ Level',
                        value: `${account.level}`,
                        inline: true
                    },
                    {
                        name: `Experience Points`,
                        value: `${account.exp}/10000`,
                        inline: true
                    },
                    {
                        name: 'Username',
                        value: `\`${account.username}\``,
                        inline: true
                    },
                    {
                        name: 'Gold Pieces',
                        value: `${account.goldPieces}`,
                        inline: true
                    },
                    {
                        name: 'Starlight Gems',
                        value: `${account.starlightGems}`,
                        inline: true
                    },
                )
                .setFooter({
                    text: footerText
                });

            const collectorFilter = i => i.user.id === interaction.user.id;

            const responseOptions = {
                embeds: [embed],
                components: [new ActionRowBuilder().addComponents(accountSelect)],
            };

            let response = followUp ? await interaction.followUp(responseOptions) : await interaction.reply(responseOptions);

            while (true) {
                let confirmation = await response.awaitMessageComponent({
                    filter: collectorFilter,
                    time: 300000
                });

                if (confirmation.customId === 'accountSelect') {
                    if (confirmation.values.includes('customize')) {
                        const customizeProfileModal = new ModalBuilder()
                            .setCustomId('customizeProfileModal')
                            .setTitle('Customize Profile');

                        const usernameInput = new TextInputBuilder()
                            .setCustomId('usernameInput')
                            .setLabel('Username')
                            .setStyle(TextInputStyle.Short)
                            .setValue(account.username);

                        const bioInput = new TextInputBuilder()
                            .setCustomId('bioInput')
                            .setLabel("Biography")
                            .setStyle(TextInputStyle.Paragraph)
                            .setValue(account.bio);

                        customizeProfileModal.addComponents(
                            new ActionRowBuilder().addComponents(usernameInput),
                            new ActionRowBuilder().addComponents(bioInput),
                        );

                        await confirmation.showModal(customizeProfileModal);

                        const submitted = await confirmation.awaitModalSubmit({
                            time: 60000,
                            filter: i => i.user.id === confirmation.user.id,
                        }).catch(error => {
                            console.error(error)
                            return null
                        });

                        if (submitted) {
                            await submitted.reply({
                                content: "Good Job, success!"
                            });

                            if (followUp === true) {
                                response = await response.edit({
                                    components: [new ActionRowBuilder().addComponents(accountSelect)],
                                });
                            } else {
                                response = await interaction.editReply({
                                    components: [new ActionRowBuilder().addComponents(accountSelect)],
                                });
                            }

                        }
                    } else {
                        console.log("Working too!");
                    }
                }
            }
        } catch (error) {
            console.log(`Account Command Error: ${error}`);
        }
    },

    name: 'account',
    description: 'TBA soon!',
};