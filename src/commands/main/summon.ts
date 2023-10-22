import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Client, CollectedInteraction, CommandInteraction, EmbedBuilder, MessageComponentInteraction } from "discord.js";
import redis from "../../lib/redis";
import PlayerModel from "../../models/Player";
import CharaCollectionModel from "../../models/CharaCollection";
import { configCharacterSummonedEmbed } from "../../config";

import { getAllCharacters } from "../../utils/getAllCharacters";
import { summonCharacters } from "../../utils/summonCharacters";
import { getPlayer } from "../../utils/getPlayer";
import generateUniqueID from "../../utils/generateUniqueID";

export default {
    name: 'summon',
    description: 'Bring your favorite characters into the game',
    cooldown: 5_000,
    options: [],
    deleted: false,
    
    // Optional
    devOnly: false,
    testOnly: false,
    botPermissions: [],
    permissionsRequired: [],

    callback: async function callback (client: Client, interaction: CommandInteraction | CollectedInteraction, followUp = false, back = false) {
        let player = await getPlayer(interaction);

        let lastClaimTimestamp = new Date(player.scrolls.novice.lastClaim).getTime();
        let currentDate = new Date().getTime();
        const cooldownDuration = 24 * 60 * 60 * 1000;

        function getRemainingTime(currentDate: number, lastClaimTimestamp: number, cooldownDuration: number) {
            const timeRemaining = cooldownDuration - (currentDate - lastClaimTimestamp);
            const hoursRemaining = Math.floor(timeRemaining / (60 * 60 * 1000));
            const minutesRemaining = Math.floor((timeRemaining % (60 * 60 * 1000)) / (60 * 1000));
          
            return `\`⏳${hoursRemaining}h ${minutesRemaining}m\``;
        }

        const callbackFunction = this;
        const summonEmbed = new EmbedBuilder()
            .setColor('Blurple')
            .setAuthor({
                name: interaction.user.username,
                iconURL: interaction.user.displayAvatarURL(),
            })
            .setTitle('Summoning Altar')
            .setThumbnail('https://images-ext-1.discordapp.net/external/huMhSM-tW8IbG2kU1hR1Q-pI-A44b74PL_teDZ7nhVc/https/www.vhv.rs/dpng/d/28-280300_konosuba-megumin-explosion-megumin-chibi-png-transparent-png.png?width=566&height=671')
            .setDescription(`Welcome to the Anitopia Summoning Altar! This is your go-to place to expand your collection of characters. We offer three types of scrolls, each summoning characters of different rarities.\n\n${(currentDate - lastClaimTimestamp >= cooldownDuration) ? 'Good news! You have a **free daily Novice Scroll** just waiting to be claimed!\n\n': ''}Enjoy your time at the Summoning Altar and may luck be with you!`)
            .addFields(
                {
                    name: 'Novice Scroll',
                    value: `${player.scrolls.novice.count} Scroll${player.scrolls.novice.count > 1 ? 's' : ''}`,
                    inline: true
                },
                {
                    name: 'Elite Scroll',
                    value: `${player.scrolls.elite.count} Scroll${player.scrolls.elite.count > 1 ? 's' : ''}`,
                    inline: true
                },
                {
                    name: 'Series Scroll',
                    value: `${player.scrolls.series.count} Scroll${player.scrolls.series.count > 1 ? 's' : ''}`,
                    inline: true
                },
            )
            .setFooter({
                text: `For more information, please click the button below.`
            });

        const noviceScrollButton = new ButtonBuilder()
            .setCustomId('novice')
            .setLabel((currentDate - lastClaimTimestamp >= cooldownDuration) ? 'Free' : 'Novice')
            .setStyle(ButtonStyle.Success)
            .setEmoji('🟢');

        const eliteScrollButton = new ButtonBuilder()
            .setCustomId('elite')
            .setLabel('Elite')
            .setStyle(ButtonStyle.Primary)
            .setEmoji('🔵');

        const seriesScrollButton = new ButtonBuilder()
            .setCustomId('series')
            .setLabel('Series')
            .setStyle(ButtonStyle.Danger)
            .setEmoji('🟣');
        
        const summonComponentRow: any = new ActionRowBuilder()
            .addComponents(
                noviceScrollButton,
                eliteScrollButton,
                seriesScrollButton
            );

        const responseOptions: any = {
            embeds: [summonEmbed],
            components: [summonComponentRow],
        };

        let summonResponse;
        if (back) {
            await (interaction as MessageComponentInteraction).deferUpdate();
            summonResponse = await interaction.editReply(responseOptions);
        } else {
            summonResponse = followUp ? await interaction.followUp(responseOptions) : await interaction.reply(responseOptions);
        }

        const collectorFilter = (i: { user: { id: string } }) => i.user.id === interaction.user.id;

        try {
            const summonConfirmation = await summonResponse.awaitMessageComponent({
                filter: collectorFilter,
                time: 300_000
            });

            if (summonConfirmation.customId === 'novice') {
                async function handleNovicePage(summonConfirmation: CollectedInteraction) {
                    lastClaimTimestamp = new Date(player.scrolls.novice.lastClaim).getTime();
                    currentDate = new Date().getTime();

                    const noviceScrollEmbed = new EmbedBuilder()
                        .setColor('Blurple')
                        .setAuthor({
                            name: interaction.user.username,
                            iconURL: interaction.user.displayAvatarURL(),
                        })
                        .setTitle('Summoning Altar • Novice Scroll')
                        .setThumbnail('https://images-ext-1.discordapp.net/external/huMhSM-tW8IbG2kU1hR1Q-pI-A44b74PL_teDZ7nhVc/https/www.vhv.rs/dpng/d/28-280300_konosuba-megumin-explosion-megumin-chibi-png-transparent-png.png?width=566&height=671')
                        .setDescription(`The **Novice Scroll** is quite affordable at just **2,000 AniCoins**, and you even get one free every day! This scroll gives you a chance to summon characters of various rarities.\n\nYou could find a **Common** character (**60% chance**), an **Uncommon** character (**24% chance**), a **Rare** character (**13% chance**), or if you're really lucky, an **Epic** character (**3% chance**).\n\nEvery summon is a step towards expanding your collection, bringing your favorite characters into battle.`)
                        .addFields(
                            {
                                name: 'Owned',
                                value: `${player.scrolls.novice.count} Novice Scroll${player.scrolls.novice.count > 1 ? 's' : ''}`,
                                inline: true
                            },
                            {
                                name: 'Free Summon',
                                value: (currentDate - lastClaimTimestamp >= cooldownDuration) ? 'Available' : getRemainingTime(currentDate, lastClaimTimestamp, cooldownDuration),
                                inline: true
                            },
                            {
                                name: 'Guaranted Epic',
                                value: player.scrolls.novice.guaranteed > 1 ? `${player.scrolls.novice.guaranteed} Summons Left` : player.scrolls.novice.guaranteed === 1 ? '1 Summon Left' : 'Available',
                                inline: true,
                            }
                        )
                        .setFooter({
                            text: `Tip: You can use a free Novice Scroll every 24 hours.`
                        });

                    const backButton = new ButtonBuilder()
                        .setCustomId('back')
                        .setLabel('Back')
                        .setStyle(ButtonStyle.Secondary);

                    const summonOneButton = new ButtonBuilder()
                        .setCustomId('summonOne')
                        .setLabel((currentDate - lastClaimTimestamp >= cooldownDuration) ? 'Free' : 'Summon 1')
                        .setStyle(ButtonStyle.Success)
                        .setEmoji('🟣')
                        .setDisabled(player.scrolls.novice.count < 1 && !(currentDate - lastClaimTimestamp >= cooldownDuration) ? true : false);

                    const summonTenButton = new ButtonBuilder()
                        .setCustomId('summonTen')
                        .setLabel('Summon 10')
                        .setStyle(ButtonStyle.Success)
                        .setEmoji('🟣')
                        .setDisabled(player.scrolls.novice.count < 10 ? true : false);

                    const noviceSummonComponentRow: any = new ActionRowBuilder()
                        .addComponents(
                            backButton,
                            summonOneButton,
                            summonTenButton
                        );


                    await summonConfirmation.deferUpdate();
                    const noviceSummonResponse = await summonConfirmation.editReply({
                        embeds: [noviceScrollEmbed],
                        components: [noviceSummonComponentRow]
                    });
            
                    try {
                        const noviceSummonConfirmation = await noviceSummonResponse.awaitMessageComponent({
                            filter: collectorFilter,
                            time: 300_000
                        });

                        if (noviceSummonConfirmation.customId === 'back') {
                            callbackFunction.callback(client, noviceSummonConfirmation, false, true);
                        } else if (noviceSummonConfirmation.customId === 'summonOne') {
                            async function handleSummonedCharacterPage(noviceSummonConfirmation: CollectedInteraction) {
                                lastClaimTimestamp = new Date(player.scrolls.novice.lastClaim).getTime();
                                currentDate = new Date().getTime();
                                const characters = await getAllCharacters();

                                const latestCharacter = await CharaCollectionModel.findOne().sort({ createdAt : -1 });
                                const characterId = generateUniqueID(latestCharacter?.characterId as string | null);
                            
                                const [summonedCharacterData] = await summonCharacters(
                                    characters, 
                                    {
                                        Common: 60,
                                        Uncommon: 24,
                                        Rare: 13,
                                        Epic: 3,
                                        Legendary: 0
                                    },
                                    player.scrolls.novice.guaranteed,
                                );                                

                                player = await PlayerModel.findOneAndUpdate(
                                    { userId: interaction.member && 'id' in interaction.member ? interaction.member.id : undefined },
                                    { 
                                        $inc: { 
                                            'scrolls.novice.count': (currentDate - lastClaimTimestamp >= cooldownDuration) ? 0 : -1, 
                                            'scrolls.novice.guaranteed': player.scrolls.novice.guaranteed === 0 ? 100 : -1 
                                        },
                                        $set: {
                                            'scrolls.novice.lastClaim': Date.now()
                                        }
                                    },
                                    { new: true}
                                );
                        
                                await redis.set(interaction.user.id, JSON.stringify(player), 'EX', 60);

                                const newCharaCollection = new CharaCollectionModel({
                                    playerId: player._id,
                                    characterId: characterId,
                                    character: summonedCharacterData.character._id,
                                    rarity: summonedCharacterData.rarity,
                                    attributes: {
                                        health: summonedCharacterData.character.attributes.health,
                                        attack: summonedCharacterData.character.attributes.attack,
                                        defense: summonedCharacterData.character.attributes.defense,
                                        speed: summonedCharacterData.character.attributes.speed,
                                    }
                                });

                                const characterSummonedEmbed = configCharacterSummonedEmbed(interaction, summonedCharacterData, characterId);
                                characterSummonedEmbed.setFooter({
                                    text: `New character added, see it with /collection. You've got ${player.scrolls.novice.count} Novice Scroll${player.scrolls.novice.count > 1 ? 's' : ''} left.`
                                });

                                const characterSummonedComponentRow: any = new ActionRowBuilder()
                                    .addComponents(
                                        backButton,
                                        summonOneButton
                                            .setLabel('Summon 1')
                                            .setDisabled(player.scrolls.novice.count < 1 ? true : false)
                                    );

                                await newCharaCollection.save();
                                await noviceSummonConfirmation.deferUpdate();
                                const noviceSummonedCharacterResponse = await noviceSummonConfirmation.editReply({
                                    embeds: [characterSummonedEmbed],
                                    components: [characterSummonedComponentRow]
                                });

                                try {
                                    const noviceSummonedCharacterConfirmation = await noviceSummonedCharacterResponse.awaitMessageComponent({
                                        filter: collectorFilter,
                                        time: 300_000
                                    });
                        
                                    if (noviceSummonedCharacterConfirmation.customId === 'back') {
                                        await handleNovicePage(noviceSummonedCharacterConfirmation);
                                    } else if (noviceSummonedCharacterConfirmation.customId === 'summonOne') {
                                        await handleSummonedCharacterPage(noviceSummonedCharacterConfirmation);
                                    }
                                } catch (error) {
                                    if (error instanceof Error) {
                                        if (error.message === "Collector received no interactions before ending with reason: time") {
                                            characterSummonedEmbed.setFooter({
                                                text: `⏱️ This command is only active for 5 minutes. To use it again, please type /summon.`
                                            });
                                            await noviceSummonConfirmation.editReply({
                                                embeds: [characterSummonedEmbed],
                                                components: []
                                            });
                                        }
                                    } else {
                                        console.log(`Novice Scroll Summon Error: ${error}`);
                                    }
                                }
                            }

                            await handleSummonedCharacterPage(noviceSummonConfirmation);
                        } else if (noviceSummonConfirmation.customId === 'summonTen') {
                            async function handleSummonedTenCharacterPage(noviceSummonConfirmation: CollectedInteraction) {
                                const characters = await getAllCharacters();
                            
                                const summonedCharacterDataArray = await summonCharacters(
                                    characters, 
                                    {
                                        Common: 60,
                                        Uncommon: 24,
                                        Rare: 13,
                                        Epic: 3,
                                        Legendary: 0
                                    },
                                    player.scrolls.novice.guaranteed,
                                    10
                                );

                                player = await PlayerModel.findOneAndUpdate(
                                    { userId: interaction.member && 'id' in interaction.member ? interaction.member.id : undefined },
                                    { 
                                        $inc: { 
                                            'scrolls.novice.count': -10, 
                                        },
                                        $set: {
                                            'scrolls.novice.guaranteed': player.scrolls.novice.guaranteed - 10 < 0 ? 100 - (10 - player.scrolls.novice.guaranteed) : player.scrolls.novice.guaranteed - 10,
                                        }
                                    },
                                    { new: true}
                                );
                        
                                await redis.set(interaction.user.id, JSON.stringify(player), 'EX', 60);

                                const characterSummonedTenEmbedArray = [
                                    new EmbedBuilder()
                                        .setColor('Blurple')
                                        .setAuthor({
                                            name: interaction.user.username,
                                            iconURL: interaction.user.displayAvatarURL(),
                                        })
                                        .setTitle('Novice Scroll Summon')
                                        .setThumbnail('https://images-ext-1.discordapp.net/external/huMhSM-tW8IbG2kU1hR1Q-pI-A44b74PL_teDZ7nhVc/https/www.vhv.rs/dpng/d/28-280300_konosuba-megumin-explosion-megumin-chibi-png-transparent-png.png?width=566&height=671')
                                        .setDescription(`Congratulations! You've successfully summoned 10 new characters. To view the details of each character, simply use the next and previous buttons to navigate through the pages.`)
                                ];

                                for (const summonedCharacterData of summonedCharacterDataArray) {
                                    const latestCharacter = await CharaCollectionModel.findOne().sort({ createdAt : -1 });
                                    const characterId = generateUniqueID(latestCharacter?.characterId as string | null);

                                    const newCharaCollection = new CharaCollectionModel({
                                        playerId: player._id,
                                        characterId: characterId,
                                        character: summonedCharacterData.character._id,
                                        rarity: summonedCharacterData.rarity,
                                        attributes: {
                                            health: summonedCharacterData.character.attributes.health,
                                            attack: summonedCharacterData.character.attributes.attack,
                                            defense: summonedCharacterData.character.attributes.defense,
                                            speed: summonedCharacterData.character.attributes.speed,
                                        }
                                    });
                                    await newCharaCollection.save();

                                    characterSummonedTenEmbedArray.push(configCharacterSummonedEmbed(interaction, summonedCharacterData, characterId));
                                    characterSummonedTenEmbedArray[0].addFields({
                                        name: `🔹 ${summonedCharacterData.character.name}`,
                                        value: `ID: \`${characterId}\`\nRarity: **${summonedCharacterData.rarity}**`,
                                        inline: true,
                                    });
                                }

                                characterSummonedTenEmbedArray[0].addFields({
                                    name: `New characters have joined your collection!`,
                                    value: `Check them out with /collection. You've got ${player.scrolls.novice.count} Novice Scroll${player.scrolls.novice.count > 1 ? 's' : ''} left.`,
                                    inline: false,
                                });
                                
                                async function handlePages(noviceSummonConfirmation: CollectedInteraction, currentPage: number = 0) {
                                        const characterSummonedTenEmbed = characterSummonedTenEmbedArray[currentPage]
                                        .setFooter({
                                            text: `Page ${currentPage + 1} of ${characterSummonedTenEmbedArray.length}. Click the next or previous button to navigate.`
                                        });

                                    const prevButton = new ButtonBuilder()
                                        .setCustomId('prev')
                                        .setStyle(ButtonStyle.Primary)
                                        .setEmoji('⬅️');

                                    const nextButton = new ButtonBuilder()
                                        .setCustomId('next')
                                        .setStyle(ButtonStyle.Primary)
                                        .setEmoji('➡️');

                                    const characterSummonedTenComponentRow: any = new ActionRowBuilder()
                                        .addComponents(
                                            backButton,
                                            prevButton,
                                            nextButton,
                                            summonTenButton
                                                .setLabel('Summon 10')
                                                .setDisabled(player.scrolls.novice.count < 1 ? true : false)
                                        );

                                    await noviceSummonConfirmation.deferUpdate();
                                    const noviceSummonedTenCharacterResponse = await noviceSummonConfirmation.editReply({
                                        embeds: [characterSummonedTenEmbed],
                                        components: [characterSummonedTenComponentRow],
                                    });

                                    try {
                                        const noviceSummonedTenCharacterConfirmation = await noviceSummonedTenCharacterResponse.awaitMessageComponent({
                                            filter: collectorFilter,
                                            time: 300_000
                                        });
                            
                                        if (noviceSummonedTenCharacterConfirmation.customId === 'back') {
                                            await handleNovicePage(noviceSummonedTenCharacterConfirmation);
                                        } else if (noviceSummonedTenCharacterConfirmation.customId === 'summonTen') {
                                            await handleSummonedTenCharacterPage(noviceSummonedTenCharacterConfirmation);
                                        } else if (noviceSummonedTenCharacterConfirmation.customId === 'prev') {
                                            await handlePages(noviceSummonedTenCharacterConfirmation, currentPage - 1);
                                        } else if (noviceSummonedTenCharacterConfirmation.customId === 'next') {
                                            await handlePages(noviceSummonedTenCharacterConfirmation, currentPage + 1);
                                        }
                                    } catch (error) {
                                        if (error instanceof Error) {
                                            if (error.message === "Collector received no interactions before ending with reason: time") {
                                                characterSummonedTenEmbed.setFooter({
                                                    text: `⏱️ This command is only active for 5 minutes. To use it again, please type /summon.`
                                                });
                                                await noviceSummonConfirmation.editReply({
                                                    embeds: [characterSummonedTenEmbed],
                                                    components: []
                                                });
                                            }
                                        } else {
                                            console.log(`Novice Scroll Summon Error: ${error}`);
                                        }
                                    }
                                }
                                handlePages(noviceSummonConfirmation);
                            }

                            await handleSummonedTenCharacterPage(noviceSummonConfirmation);
                        }
                    } catch (error) {
                        if (error instanceof Error) {
                            if (error.message === "Collector received no interactions before ending with reason: time") {
                                noviceScrollEmbed.setFooter({
                                    text: `⏱️ This command is only active for 5 minutes. To use it again, please type /summon.`
                                });
                                await summonConfirmation.editReply({
                                    embeds: [noviceScrollEmbed],
                                    components: []
                                });
                            }
                        } else {
                            console.log(`Summon Command - Novice Scroll Error: ${error}`);
                        }
                    }
                }
                await handleNovicePage(summonConfirmation);
            }
            
        } catch (error) {
            if (error instanceof Error) {
                if (error.message === "Collector received no interactions before ending with reason: time") {
                    summonEmbed.setFooter({
                        text: `⏱️ This command is only active for 5 minutes. To use it again, please type /summon.`
                    });
                    await interaction.editReply({
                        embeds: [summonEmbed],
                        components: []
                    });
                }
            } else {
                console.log(`Summon Command Error: ${error}`);
            }
        }
    }
}