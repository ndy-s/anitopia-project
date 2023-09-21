const { Client, Interaction, EmbedBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder,
    ModalBuilder, TextInputBuilder, TextInputStyle, ButtonBuilder, ButtonStyle
} = require('discord.js');
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
                        .setLabel('Daily Rewards')
                        .setDescription('TBA Soon!')
                        .setValue('daily'),
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
                        } else if (confirmation.values.includes('daily')) {
                            await confirmation.deferUpdate();

                            const lastDailyDate = new Date(account.lastDaily);
                            const currentDate = new Date();

                            let dailyGoldPieces = 1000;
                            let dailyBonus = 0;
                            const dailyStarlightGems = 10;

                            const options = {
                                year: 'numeric',
                                month: 'numeric',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit',
                                hour12: false,
                                timeZoneName: 'short',
                            };

                            const formattedLastClaimDate = lastDailyDate.toLocaleString(undefined, options);

                            // Calculate the time remaining until the next claim cooldown
                            const nextClaimDate = new Date(lastDailyDate);
                            nextClaimDate.setHours(nextClaimDate.getHours() + 24); // Add 24 hours for the cooldown
                            const timeUntilNextClaim = nextClaimDate - currentDate; // Calculate the difference in milliseconds

                            const hoursUntilNextClaim = Math.max(0, Math.floor(timeUntilNextClaim / (60 * 60 * 1000)));
                            const minutesUntilNextClaim = Math.max(0, Math.floor((timeUntilNextClaim % (60 * 60 * 1000)) / (60 * 1000)));

                            const dailyRewardsEmbed = new EmbedBuilder()
                                .setColor('DarkRed')
                                .setAuthor({
                                    name: interaction.user.globalName,
                                    iconURL: interaction.user.displayAvatarURL(),
                                })
                                .setTitle(`${account.username}'s Daily Rewards`)
                                .setDescription(`Welcome to the Daily Rewards system! 🎉\n\nEvery day when you log in, you have the opportunity to claim exciting rewards that get better as you continue your journey in Anitopia.`)
                                .addFields(
                                    {
                                        name: 'Daily Streak',
                                        value: `\`${account.dailyStreak} ${account.dailyStreak === 1 ? 'streak' : 'streaks'}\``,
                                        inline: true
                                    },
                                    {
                                        name: 'Last Claim Date',
                                        value: `\`${formattedLastClaimDate}\``,
                                        inline: true
                                    },
                                    {
                                        name: 'Time Until Next Claim',
                                        value: `Cooldown: \`${hoursUntilNextClaim} hour${hoursUntilNextClaim !== 1 ? 's' : ''} ${minutesUntilNextClaim} minute${minutesUntilNextClaim !== 1 ? 's' : ''}\``,
                                        inline: true
                                    });

                            const backButton = new ButtonBuilder()
                                .setCustomId('backButton')
                                .setLabel('Back')
                                .setStyle(ButtonStyle.Secondary);

                            const claimButton = new ButtonBuilder()
                                .setCustomId('claimButton')
                                .setLabel('Claim')
                                .setStyle(ButtonStyle.Success)
                                .setDisabled(lastDailyDate.toDateString() === currentDate.toDateString());

                            const claimRow = new ActionRowBuilder()
                                .addComponents(
                                    backButton,
                                    claimButton
                                );

                            const claimResponse = await interaction.editReply({
                                embeds: [ dailyRewardsEmbed ],
                                components: [ claimRow ]
                            });

                            const claimConfirmation = await claimResponse.awaitMessageComponent({
                                filter: collectorFilter,
                                time: 300_000
                            });

                            if (claimConfirmation.customId === 'claimButton') {
                                await claimConfirmation.deferUpdate();

                                account.lastDaily = currentDate;
                                account.goldPieces += dailyGoldPieces;
                                account.starlightGems += dailyStarlightGems;

                                if (account.dailyStreak < 29) {
                                    const weeklyStreak = Math.min(Math.ceil(account.dailyStreak / 7), 4);
                                    for (let i = 1; i <= weeklyStreak; i++) {
                                        let dailyBonusCalc = 500;
                                        for (let j = 1; j < i; j++) {
                                            dailyBonusCalc *= j;
                                        }
                                        dailyBonus += dailyBonusCalc;
                                    }
                                    if (weeklyStreak === 3) dailyBonus += 500;
                                } else {
                                    dailyBonus += 5000;
                                }

                                account.goldPieces += dailyBonus;
                                const oneDay = 24 * 60 * 60 * 1000;
                                const daysDifference = Math.floor((currentDate - lastDailyDate) / oneDay);
                                account.dailyStreak = (daysDifference <= 1) ? account.dailyStreak + 1 : 1;
                                await account.save();

                                await interaction.editReply({
                                    embeds: [ dailyRewardsEmbed ],
                                    components: [ claimRow ]
                                });

                                await interaction.followUp({
                                    content: "Claim Success!",
                                    ephemeral: true
                                });
                            } else if (claimConfirmation.customId === 'backButton') {
                                console.log('lol');
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