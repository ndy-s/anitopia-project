const { Client, Interaction, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder
} = require('discord.js');
const Account = require('../../models/Account');
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
        } else {
            account = new Account({
                ...{
                    accountId: interaction.member.id,
                    guildId: interaction.guild.id
                }
            });
        }

        const startTutorialButton = new ButtonBuilder()
            .setCustomId('startTutorial')
            .setLabel('Start Tutorial')
            .setStyle(ButtonStyle.Success);

        const skipTutorialButton = new ButtonBuilder()
            .setCustomId('skipTutorial')
            .setLabel('Skip Tutorial')
            .setStyle(ButtonStyle.Primary);

        const row = new ActionRowBuilder()
            .addComponents(
                startTutorialButton,
                skipTutorialButton
            );


        // Interaction reply
        const response = await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor('DarkRed')
                    .setTitle('Megumin')
                    .setThumbnail('https://www.vhv.rs/dpng/d/28-280300_konosuba-megumin-explosion-megumin-chibi-png-transparent-png.png')
                    .setDescription(`
                        EXPLOSION!! Ahem... Greetings, wanderer <@!${interaction.user.id}>! 
                        I am Megumin, the great Arch-Wizard of Anitopia, and I extend a warm welcome to our extraordinary realm.
                                               
                        You have gained access to this sacred land, where adventures and mysteries await. Enjoy your time in Anitopia, and may your adventures be as grand as the biggest explosion!
                    
                        If you're new, click the **Start Tutorial** button to begin your journey. If you wish to skip the tutorial, simply click the **Skip Tutorial** button.

                    `)
                    .setFooter({
                        text: 'For assistance or to report issues, please contact our support.'
                    })
            ],
            components: [row],
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

                // await account.save();

                const confirmationResponse = await interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('DarkRed')
                            .setTitle(`Welcome to Anitopia!`)
                            .setDescription(`
                                Congratulations  <@!${interaction.user.id}>, your citizenship has been officially registered in **Anitopia realm**.
    
                                To access your account information, **use the command** </account:1153540743038783508>. To embark on your journey, **type** </explore:1153593389091143690> and uncover the wonders that await you.
    
                                🌟 **Enjoy your time in Anitopia and have fun!** 🌟
                            `)
                            .setFooter({
                                text: 'For assistance or to report issues, please contact our support.'
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

                const confirmationCollectorFilter = i => i.user.id === interaction.user.id;

                try {
                    const confirmationResponse = await response.awaitMessageComponent({
                        filter: confirmationCollectorFilter,
                        time: 300000
                    });

                    if (confirmationResponse.customId === 'explore') {
                        await confirmationResponse.deferUpdate();
                        const exploreMapSelect = new StringSelectMenuBuilder()
                            .setCustomId('exploreMap')
                            .setPlaceholder('Select your destination!')
                            .addOptions(
                                new StringSelectMenuOptionBuilder()
                                    .setLabel('Story')
                                    .setDescription('TBA Soon!')
                                    .setValue('story'),
                                new StringSelectMenuOptionBuilder()
                                    .setLabel('Quest')
                                    .setDescription('TBA Soon!')
                                    .setValue('quest')
                            );

                        await interaction.editReply({
                            components: []
                        });

                        await interaction.followUp({
                            embeds: [
                                new EmbedBuilder()
                                    .setColor('DarkRed')
                                    .setTitle('Explore Map')
                                    .setImage('https://i.pinimg.com/736x/0c/c8/b9/0cc8b9ee6da6a77a5940a24cc9e040f6.jpg')
                                    .setFooter({
                                        text: 'For assistance or to report issues, please contact our support.'
                                    })
                            ],
                            components: [
                                new ActionRowBuilder().addComponents(exploreMapSelect)
                            ]
                        });
                    } else if (confirmationResponse.customId === 'account') {
                        console.log('YES')
                    }
                } catch (error) {
                    console.log(`Next Register Command Error: ${error}`)
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
                        .setTitle('Megumin: Welcome to Anitopia!')
                        .setThumbnail('https://www.vhv.rs/dpng/d/28-280300_konosuba-megumin-explosion-megumin-chibi-png-transparent-png.png')
                        .setDescription(`
                            EXPLOSION!! Ahem... Greetings, wanderer <@!${interaction.user.id}>! 
                            I am Megumin, the great Arch-Wizard of Anitopia, and I extend a warm welcome to our extraordinary realm.
                    
                            You have gained access to this sacred land, where adventures and mysteries await. Enjoy your time in Anitopia, and may your adventures be as grand as the biggest explosion!
                        
                            :hourglass_flowing_sand: **Command Timeout:** This command is __only active for 5 minutes__. To use it again, please run </register:1153581756713283614>.
                        `)
                        .setFooter({
                            text: 'For assistance or to report issues, please contact our support.'
                        })
                ],
                components: []
            });
        }

    },
    name: 'register',
    description: 'TBA soon!',
};