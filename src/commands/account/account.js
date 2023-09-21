const { Client, Interaction, EmbedBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder,
    ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const { footerText, accountCommandTag } = require('../../../config.json');

const Account = require('../../models/Account');
// Import exceptions
const commandNotAllowed = require('../../exceptions/commandNotAllowed.js');

module.exports = {
    /**
     *
     * @param {Client} client
     * @param {Interaction} interaction
     * @param followUp
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
                .setTitle(`${account.username}'s Account`)
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
                        name: 'Account Code',
                        value: `\`${account.code}\``,
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
                try {
                    let confirmation = await response.awaitMessageComponent({
                        filter: collectorFilter,
                        time: 300_000
                    });

                    accountSelect.options.forEach(option => {
                        if (confirmation.values.includes(option.data.value)) {
                            option.setDefault(true);
                        }
                    });

                    if (confirmation.customId === 'accountSelect') {
                        if (confirmation.values.includes('customize')) {
                            const customizeProfileModal = new ModalBuilder()
                                .setCustomId('customizeProfileModal')
                                .setTitle('Customize Profile');

                            const usernameInput = new TextInputBuilder()
                                .setCustomId('usernameInput')
                                .setLabel("Username")
                                .setStyle(TextInputStyle.Short)
                                .setValue(account.username)
                                .setMinLength(2)
                                .setMaxLength(32)
                                .setRequired(true);

                            const bioInput = new TextInputBuilder()
                                .setCustomId('bioInput')
                                .setLabel("Biography")
                                .setStyle(TextInputStyle.Paragraph)
                                .setValue(account.bio)
                                .setMaxLength(100)
                                .setRequired(false);

                            customizeProfileModal.addComponents(
                                new ActionRowBuilder().addComponents(usernameInput),
                                new ActionRowBuilder().addComponents(bioInput),
                            );

                            await confirmation.showModal(customizeProfileModal);

                            if (followUp === true) {
                                response = await response.edit({
                                    components: [new ActionRowBuilder().addComponents(accountSelect)],
                                });
                            } else {
                                response = await interaction.editReply({
                                    components: [new ActionRowBuilder().addComponents(accountSelect)],
                                });
                            }
                        } else if (confirmation.values.includes('redeem')) {
                            await confirmation.deferUpdate();
                            await interaction.followUp({
                                content: "TBA SOON! BOS"
                            });
                        }
                    }
                } catch (error) {
                    console.log(`Account Selection Error: ${error}`);
                    embed.setDescription(`**Biography**\n\`\`\` ${account.bio} \`\`\`\n:hourglass_flowing_sand: **Command Timeout:** This command is __only active for 5 minutes__. To use it again, please **type** ${accountCommandTag}.`);
                    if (followUp === true) {
                        await response.edit({
                            embeds: [embed],
                            components: []
                        });
                    } else {
                        await interaction.editReply({
                            embeds: [embed],
                            components: []
                        });
                    }
                    break;
                }

            }
        } catch (error) {
            console.log(`Account Command Error: ${error}`);
        }
    },

    name: 'account',
    description: 'TBA soon!',
};