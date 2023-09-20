const { Client, Interaction, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');
const { footerText } = require('../../../config.json');

const Account = require('../../models/Account');
const accountCallback = require('./account');
const exploreCallback = require('../main/explore');
const registrationNotAllowed = require('../../exceptions/registrationNotAllowed');

module.exports = {
    /**
     *
     * @param {Client} client
     * @param {Interaction} interaction
     */

    callback: async (client, interaction) => {
        let account = await Account.findOne({
            accountId: interaction.member.id,
            guildId: interaction.guild.id
        });

        if (account) {
            registrationNotAllowed(interaction);
            return;
        }

        account = new Account({
            ...{
                accountId: interaction.member.id,
                guildId: interaction.guild.id,
                username: interaction.user.username
            }
        });

        const tutorialButtonRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('startTutorial')
                    .setLabel('Start Tutorial')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('skipTutorial')
                    .setLabel('Skip Tutorial')
                    .setStyle(ButtonStyle.Primary),
            );

        const response = await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor('DarkRed')
                    .setAuthor({
                        name: interaction.user.globalName,
                        iconURL: interaction.user.displayAvatarURL(),
                    })
                    .setTitle('Megumin')
                    .setThumbnail('https://www.vhv.rs/dpng/d/28-280300_konosuba-megumin-explosion-megumin-chibi-png-transparent-png.png')
                    .setDescription(`
                        EXPLOSION!! Ahem... Greetings, wanderer <@!${interaction.user.id}>!\nI am Megumin, the great Arch-Wizard of Anitopia, and I extend a warm welcome to our extraordinary realm.\n\nYou have gained access to this sacred land, where adventures and mysteries await. Enjoy your time in Anitopia, and may your adventures be as grand as the biggest explosion!\nIf you're new, click the **Start Tutorial** button to begin your journey. If you wish to skip the tutorial, simply click the **Skip Tutorial** button.
                    `)
                    .setFooter({
                        text: footerText
                    })
            ],
            components: [tutorialButtonRow],
        });
        const collectorFilter = i => i.user.id === interaction.user.id;

        try {
            const confirmation = await response.awaitMessageComponent({
                filter: collectorFilter,
                time: 300000
            });

            if (confirmation.customId === 'startTutorial') {
                await confirmation.deferUpdate();
                await account.save();

                await interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('DarkRed')
                            .setAuthor({
                                name: interaction.user.globalName,
                                iconURL: interaction.user.displayAvatarURL(),
                            })
                            .setTitle('TBA soon!')
                    ],
                    components: [],
                })
            } else if (confirmation.customId === 'skipTutorial') {
                await confirmation.deferUpdate();
                const exploreButton = new ButtonBuilder()
                    .setCustomId('explore')
                    .setLabel('Explore')
                    .setStyle(ButtonStyle.Primary);

                const accountButton = new ButtonBuilder()
                    .setCustomId('account')
                    .setLabel('Account')
                    .setStyle(ButtonStyle.Primary);

                await account.save();

                const confirmationResponse = await interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('DarkRed')
                            .setAuthor({
                                name: interaction.user.globalName,
                                iconURL: interaction.user.displayAvatarURL(),
                            })
                            .setTitle(`Welcome to Anitopia!`)
                            .setDescription(`
                                Congratulations  <@!${interaction.user.id}>, your citizenship has been officially registered in **Anitopia realm**.\n\nTo access your account information, **use the command** </account:1153540743038783508>. To embark on your journey, **type** </explore:1153593389091143690> and uncover the wonders that await you.\n\n🌟 **Enjoy your time in Anitopia and have fun!** 🌟
                            `)
                            .setFooter({
                                text: footerText
                            })
                    ],
                    components: [
                        new ActionRowBuilder()
                            .addComponents(
                                exploreButton,
                                accountButton
                            )
                    ]

                });

                try {
                    const confirmationResponse = await response.awaitMessageComponent({
                        filter: collectorFilter,
                        time: 300000
                    });

                    if (confirmationResponse.customId === 'explore') {
                        await confirmationResponse.deferUpdate();
                        await interaction.editReply({
                            components: []
                        });

                        await exploreCallback.callback(client, interaction, followUp = true);
                    } else if (confirmationResponse.customId === 'account') {
                        await confirmationResponse.deferUpdate();
                        await interaction.editReply({
                            components: []
                        });

                        await accountCallback.callback(client, interaction, followUp = true);
                    }
                } catch (error) {
                    console.log(`Success Register Command Error: ${error}`)
                    await interaction.editReply({
                        components: []
                    });
                }

            }
        } catch (error) {
            console.log(`Register Command Error: ${error}`)
            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('DarkRed')
                        .setAuthor({
                            name: interaction.user.globalName,
                            iconURL: interaction.user.displayAvatarURL(),
                        })
                        .setTitle('Megumin')
                        .setThumbnail('https://www.vhv.rs/dpng/d/28-280300_konosuba-megumin-explosion-megumin-chibi-png-transparent-png.png')
                        .setDescription(`
                            EXPLOSION!! Ahem... Greetings, wanderer <@!${interaction.user.id}>!\nI am Megumin, the great Arch-Wizard of Anitopia, and I extend a warm welcome to our extraordinary realm.\n\nYou have gained access to this sacred land, where adventures and mysteries await. Enjoy your time in Anitopia, and may your adventures be as grand as the biggest explosion!\n\n:hourglass_flowing_sand: **Command Timeout:** This command is __only active for 5 minutes__. To use it again, please run </register:1153581756713283614>.
                        `)
                        .setFooter({
                            text: footerText
                        })
                ],
                components: []
            });
        }

    },

    name: 'register',
    description: 'TBA soon!',
};