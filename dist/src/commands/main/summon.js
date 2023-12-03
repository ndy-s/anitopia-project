"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const redis_1 = require("../../lib/redis");
const utils_1 = require("../../utils");
const config_1 = require("../../config");
const models_1 = require("../../models");
exports.default = {
    name: 'summon',
    description: 'Bring your favorite characters into the game',
    cooldown: 5000,
    options: [],
    deleted: false,
    // Optional
    devOnly: false,
    testOnly: false,
    botPermissions: [],
    permissionsRequired: [],
    callback: async function callback(client, interaction, followUp = false, back = false) {
        let player = await (0, utils_1.getPlayer)(interaction);
        let lastClaimTimestamp = new Date(player.scrolls.novice.lastClaim).getTime();
        let currentDate = new Date().getTime();
        const cooldownDuration = 24 * 60 * 60 * 1000;
        function getRemainingTime(currentDate, lastClaimTimestamp, cooldownDuration) {
            const timeRemaining = cooldownDuration - (currentDate - lastClaimTimestamp);
            const hoursRemaining = Math.floor(timeRemaining / (60 * 60 * 1000));
            const minutesRemaining = Math.floor((timeRemaining % (60 * 60 * 1000)) / (60 * 1000));
            return `\`⏳${hoursRemaining}h ${minutesRemaining}m\``;
        }
        const callbackFunction = this;
        const summonEmbed = new discord_js_1.EmbedBuilder()
            .setColor('Blurple')
            .setAuthor({
            name: interaction.user.username,
            iconURL: interaction.user.displayAvatarURL(),
        })
            .setTitle('Summoning Altar')
            .setThumbnail('https://images-ext-1.discordapp.net/external/huMhSM-tW8IbG2kU1hR1Q-pI-A44b74PL_teDZ7nhVc/https/www.vhv.rs/dpng/d/28-280300_konosuba-megumin-explosion-megumin-chibi-png-transparent-png.png?width=566&height=671')
            .setDescription(`Welcome to the Anitopia Summoning Altar! This is your go-to place to expand your collection of characters. We offer three types of scrolls, each summoning characters of different rarities.\n\n${(currentDate - lastClaimTimestamp >= cooldownDuration) ? 'Good news! You have a **free daily Novice Scroll** just waiting to be claimed!\n\n' : ''}Enjoy your time at the Summoning Altar and may luck be with you!`)
            .addFields({
            name: 'Novice Scroll',
            value: `${player.scrolls.novice.count} Scroll${player.scrolls.novice.count > 1 ? 's' : ''}`,
            inline: true
        }, {
            name: 'Elite Scroll',
            value: `${player.scrolls.elite.count} Scroll${player.scrolls.elite.count > 1 ? 's' : ''}`,
            inline: true
        }, {
            name: 'Series Scroll',
            value: `${player.scrolls.series.count} Scroll${player.scrolls.series.count > 1 ? 's' : ''}`,
            inline: true
        })
            .setFooter({
            iconURL: interaction.client.user.displayAvatarURL({ extension: 'png', size: 512 }),
            text: `For more information, please click the button below.`
        });
        const noviceScrollButton = new discord_js_1.ButtonBuilder()
            .setCustomId('novice')
            .setLabel((currentDate - lastClaimTimestamp >= cooldownDuration) ? 'Free' : 'Novice')
            .setStyle(discord_js_1.ButtonStyle.Success)
            .setEmoji('🟢');
        const eliteScrollButton = new discord_js_1.ButtonBuilder()
            .setCustomId('elite')
            .setLabel('Elite')
            .setStyle(discord_js_1.ButtonStyle.Primary)
            .setEmoji('🔵');
        const seriesScrollButton = new discord_js_1.ButtonBuilder()
            .setCustomId('series')
            .setLabel('Series')
            .setStyle(discord_js_1.ButtonStyle.Danger)
            .setEmoji('🟣');
        const summonComponentRow = new discord_js_1.ActionRowBuilder()
            .addComponents(noviceScrollButton, eliteScrollButton, seriesScrollButton);
        const responseOptions = {
            embeds: [summonEmbed],
            components: [summonComponentRow],
        };
        let response;
        if (back) {
            await interaction.deferUpdate();
            response = await interaction.editReply(responseOptions);
        }
        else {
            response = followUp ? await interaction.followUp(responseOptions) : await interaction.reply(responseOptions);
        }
        const collectorFilter = (i) => i.user.id === interaction.user.id;
        try {
            const confirmation = await response.awaitMessageComponent({
                filter: collectorFilter,
                time: 300000
            });
            if (confirmation.customId === 'novice') {
                async function handleNovicePage(confirmation) {
                    lastClaimTimestamp = new Date(player.scrolls.novice.lastClaim).getTime();
                    currentDate = new Date().getTime();
                    const noviceScrollEmbed = new discord_js_1.EmbedBuilder()
                        .setColor('Blurple')
                        .setAuthor({
                        name: interaction.user.username,
                        iconURL: interaction.user.displayAvatarURL(),
                    })
                        .setTitle('Summoning Altar • Novice Scroll')
                        .setThumbnail('https://images-ext-1.discordapp.net/external/huMhSM-tW8IbG2kU1hR1Q-pI-A44b74PL_teDZ7nhVc/https/www.vhv.rs/dpng/d/28-280300_konosuba-megumin-explosion-megumin-chibi-png-transparent-png.png?width=566&height=671')
                        .setDescription(`The **Novice Scroll** is quite affordable at just **2,000 AniCoins**, and you even get one free every day! This scroll gives you a chance to summon characters of various rarities.\n\nYou could find a **Common** character (**60% chance**), an **Uncommon** character (**24% chance**), a **Rare** character (**13% chance**), or if you're really lucky, an **Epic** character (**3% chance**).\n\nEvery summon is a step towards expanding your collection, bringing your favorite characters into battle.`)
                        .addFields({
                        name: 'Owned',
                        value: `${player.scrolls.novice.count} Novice Scroll${player.scrolls.novice.count > 1 ? 's' : ''}`,
                        inline: true
                    }, {
                        name: 'Free Summon',
                        value: (currentDate - lastClaimTimestamp >= cooldownDuration) ? 'Available' : getRemainingTime(currentDate, lastClaimTimestamp, cooldownDuration),
                        inline: true
                    }, {
                        name: 'Guaranted Epic',
                        value: player.scrolls.novice.guaranteed > 1 ? `${player.scrolls.novice.guaranteed} Summons Left` : player.scrolls.novice.guaranteed === 1 ? '1 Summon Left' : 'Available',
                        inline: true,
                    })
                        .setFooter({
                        text: `Tip: You can use a free Novice Scroll every 24 hours.`
                    });
                    const backButton = new discord_js_1.ButtonBuilder()
                        .setCustomId('back')
                        .setLabel('Back')
                        .setStyle(discord_js_1.ButtonStyle.Secondary);
                    const summonOneButton = new discord_js_1.ButtonBuilder()
                        .setCustomId('summonOne')
                        .setLabel((currentDate - lastClaimTimestamp >= cooldownDuration) ? 'Free' : 'Summon 1')
                        .setStyle(discord_js_1.ButtonStyle.Success)
                        .setEmoji('🟣')
                        .setDisabled(player.scrolls.novice.count < 1 && !(currentDate - lastClaimTimestamp >= cooldownDuration) ? true : false);
                    const summonTenButton = new discord_js_1.ButtonBuilder()
                        .setCustomId('summonTen')
                        .setLabel('Summon 10')
                        .setStyle(discord_js_1.ButtonStyle.Success)
                        .setEmoji('🟣')
                        .setDisabled(player.scrolls.novice.count < 10 ? true : false);
                    const noviceSummonComponentRow = new discord_js_1.ActionRowBuilder()
                        .addComponents(backButton, summonOneButton, summonTenButton);
                    await confirmation.deferUpdate();
                    const response = await confirmation.editReply({
                        embeds: [noviceScrollEmbed],
                        components: [noviceSummonComponentRow]
                    });
                    try {
                        const confirmation = await response.awaitMessageComponent({
                            filter: collectorFilter,
                            time: 300000
                        });
                        if (confirmation.customId === 'back') {
                            callbackFunction.callback(client, confirmation, false, true);
                        }
                        else if (confirmation.customId === 'summonOne') {
                            async function handleSummonedCharacterPage(confirmation) {
                                lastClaimTimestamp = new Date(player.scrolls.novice.lastClaim).getTime();
                                currentDate = new Date().getTime();
                                const characters = await (0, utils_1.getAllCharacters)();
                                const latestCharacter = await models_1.CharaCollectionModel.findOne().sort({ createdAt: -1 });
                                const characterId = (0, utils_1.generateUniqueID)(latestCharacter?.characterId);
                                const [summonedCharacterData] = await (0, utils_1.summonCharacters)(characters, {
                                    5: 60,
                                    4: 24,
                                    3: 13,
                                    2: 3,
                                    1: 0 // Legendary
                                }, player.scrolls.novice.guaranteed);
                                player = await models_1.PlayerModel.findOneAndUpdate({ userId: interaction.member && 'id' in interaction.member ? interaction.member.id : undefined }, {
                                    $inc: {
                                        'scrolls.novice.count': (currentDate - lastClaimTimestamp >= cooldownDuration) ? 0 : -1,
                                        'scrolls.novice.guaranteed': player.scrolls.novice.guaranteed === 0 ? 100 : -1
                                    },
                                    $set: {
                                        'scrolls.novice.lastClaim': (currentDate - lastClaimTimestamp >= cooldownDuration) ? Date.now() : lastClaimTimestamp
                                    }
                                }, { new: true }).populate('teams.lineup.character');
                                await redis_1.default.set(interaction.user.id, JSON.stringify(player), 'EX', 60);
                                const newCharaCollection = new models_1.CharaCollectionModel({
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
                                const characterSummonedEmbed = (0, config_1.configCharacterSummonedEmbed)(interaction, summonedCharacterData, characterId);
                                characterSummonedEmbed.setFooter({
                                    text: `New character added, see it with /collection. You've got ${player.scrolls.novice.count} Novice Scroll${player.scrolls.novice.count > 1 ? 's' : ''} left.`
                                });
                                const characterSummonedComponentRow = new discord_js_1.ActionRowBuilder()
                                    .addComponents(backButton, summonOneButton
                                    .setLabel('Summon 1')
                                    .setDisabled(player.scrolls.novice.count < 1 ? true : false));
                                await newCharaCollection.save();
                                await confirmation.deferUpdate();
                                const response = await confirmation.editReply({
                                    embeds: [characterSummonedEmbed],
                                    components: [characterSummonedComponentRow]
                                });
                                try {
                                    const confirmation = await response.awaitMessageComponent({
                                        filter: collectorFilter,
                                        time: 300000
                                    });
                                    if (confirmation.customId === 'back') {
                                        await handleNovicePage(confirmation);
                                    }
                                    else if (confirmation.customId === 'summonOne') {
                                        await handleSummonedCharacterPage(confirmation);
                                    }
                                }
                                catch (error) {
                                    if (error instanceof Error && error.message === "Collector received no interactions before ending with reason: time") {
                                        characterSummonedEmbed.setFooter({
                                            text: `⏱️ This command is only active for 5 minutes. To use it again, please type /summon.`
                                        });
                                        await confirmation.editReply({
                                            embeds: [characterSummonedEmbed],
                                            components: []
                                        });
                                    }
                                    else {
                                        console.log(`Novice Scroll Summon Error: ${error}`);
                                    }
                                }
                            }
                            await handleSummonedCharacterPage(confirmation);
                        }
                        else if (confirmation.customId === 'summonTen') {
                            async function handleSummonedTenCharacterPage(confirmation) {
                                const characters = await (0, utils_1.getAllCharacters)();
                                const summonedCharacterDataArray = await (0, utils_1.summonCharacters)(characters, {
                                    5: 60,
                                    4: 24,
                                    3: 13,
                                    2: 3,
                                    1: 0 // Legendary
                                }, player.scrolls.novice.guaranteed, 10);
                                player = await models_1.PlayerModel.findOneAndUpdate({ userId: interaction.member && 'id' in interaction.member ? interaction.member.id : undefined }, {
                                    $inc: {
                                        'scrolls.novice.count': -10,
                                    },
                                    $set: {
                                        'scrolls.novice.guaranteed': player.scrolls.novice.guaranteed - 10 < 0 ? 100 - (10 - player.scrolls.novice.guaranteed) : player.scrolls.novice.guaranteed - 10,
                                    }
                                }, { new: true }).populate('teams.lineup.character');
                                await redis_1.default.set(interaction.user.id, JSON.stringify(player), 'EX', 60);
                                const characterSummonedTenEmbedArray = [
                                    new discord_js_1.EmbedBuilder()
                                        .setColor('Blurple')
                                        .setAuthor({
                                        name: interaction.user.username,
                                        iconURL: interaction.user.displayAvatarURL(),
                                    })
                                        .setTitle('Novice Scroll Summon')
                                        .setThumbnail('https://images-ext-1.discordapp.net/external/huMhSM-tW8IbG2kU1hR1Q-pI-A44b74PL_teDZ7nhVc/https/www.vhv.rs/dpng/d/28-280300_konosuba-megumin-explosion-megumin-chibi-png-transparent-png.png?width=566&height=671')
                                        .setDescription(`Congratulations! You've successfully summoned 10 new characters. Each page reveals their unique details. Enjoy the discovery!`)
                                ];
                                for (const summonedCharacterData of summonedCharacterDataArray) {
                                    const latestCharacter = await models_1.CharaCollectionModel.findOne().sort({ createdAt: -1 });
                                    const characterId = (0, utils_1.generateUniqueID)(latestCharacter?.characterId);
                                    const newCharaCollection = new models_1.CharaCollectionModel({
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
                                    characterSummonedTenEmbedArray.push((0, config_1.configCharacterSummonedEmbed)(interaction, summonedCharacterData, characterId));
                                    characterSummonedTenEmbedArray[0].addFields({
                                        name: `🔹 ${summonedCharacterData.character.name}`,
                                        value: `${summonedCharacterData.character.fullname}\n\`${characterId}\` • __**${(0, utils_1.mapRarity)(summonedCharacterData.rarity)}**__`,
                                        inline: true,
                                    });
                                }
                                characterSummonedTenEmbedArray[0].addFields({
                                    name: `New characters have joined your collection!`,
                                    value: `Check them out with ${config_1.config.commands.collectionCommandTag}. You've got ${player.scrolls.novice.count} Novice Scroll${player.scrolls.novice.count > 1 ? 's' : ''} left.`,
                                    inline: false,
                                });
                                const prevButton = new discord_js_1.ButtonBuilder()
                                    .setCustomId('prev')
                                    .setStyle(discord_js_1.ButtonStyle.Primary)
                                    .setEmoji('⬅️');
                                const nextButton = new discord_js_1.ButtonBuilder()
                                    .setCustomId('next')
                                    .setStyle(discord_js_1.ButtonStyle.Primary)
                                    .setEmoji('➡️');
                                const characterSummonedTenComponentRow = new discord_js_1.ActionRowBuilder()
                                    .addComponents(backButton, prevButton, nextButton, summonTenButton
                                    .setLabel('Summon 10')
                                    .setDisabled(player.scrolls.novice.count < 10 ? true : false));
                                async function handlePages(confirmation, currentPage = 0) {
                                    const characterSummonedTenEmbed = characterSummonedTenEmbedArray[currentPage]
                                        .setFooter({
                                        text: `Page ${currentPage + 1} of ${characterSummonedTenEmbedArray.length} • Click the ⬅️ or ➡️ button to navigate.`
                                    });
                                    prevButton.setDisabled(currentPage < 1 ? true : false);
                                    nextButton.setDisabled(currentPage === (characterSummonedTenEmbedArray.length - 1) ? true : false);
                                    await confirmation.deferUpdate();
                                    const response = await confirmation.editReply({
                                        embeds: [characterSummonedTenEmbed],
                                        components: [characterSummonedTenComponentRow],
                                    });
                                    try {
                                        const confirmation = await response.awaitMessageComponent({
                                            filter: collectorFilter,
                                            time: 300000
                                        });
                                        if (confirmation.customId === 'back') {
                                            await handleNovicePage(confirmation);
                                        }
                                        else if (confirmation.customId === 'summonTen') {
                                            await handleSummonedTenCharacterPage(confirmation);
                                        }
                                        else if (confirmation.customId === 'prev') {
                                            await handlePages(confirmation, currentPage - 1);
                                        }
                                        else if (confirmation.customId === 'next') {
                                            await handlePages(confirmation, currentPage + 1);
                                        }
                                    }
                                    catch (error) {
                                        if (error instanceof Error && error.message === "Collector received no interactions before ending with reason: time") {
                                            characterSummonedTenEmbed.setFooter({
                                                text: `⏱️ This command is only active for 5 minutes. To use it again, please type /summon.`
                                            });
                                            await confirmation.editReply({
                                                embeds: [characterSummonedTenEmbed],
                                                components: []
                                            });
                                        }
                                        else {
                                            console.log(`Multiple Novice Scroll Summon Error: ${error}`);
                                        }
                                    }
                                }
                                await handlePages(confirmation);
                            }
                            await handleSummonedTenCharacterPage(confirmation);
                        }
                    }
                    catch (error) {
                        if (error instanceof Error && error.message === "Collector received no interactions before ending with reason: time") {
                            noviceScrollEmbed.setFooter({
                                text: `⏱️ This command is only active for 5 minutes. To use it again, please type /summon.`
                            });
                            await confirmation.editReply({
                                embeds: [noviceScrollEmbed],
                                components: []
                            });
                        }
                        else {
                            console.log(`Summon Command - Novice Scroll Error: ${error}`);
                        }
                    }
                }
                await handleNovicePage(confirmation);
            }
            else if (confirmation.customId === 'elite') {
                async function handleElitePage(confirmation) {
                    const eliteScrollEmbed = new discord_js_1.EmbedBuilder()
                        .setColor('Blurple')
                        .setAuthor({
                        name: interaction.user.username,
                        iconURL: interaction.user.displayAvatarURL(),
                    })
                        .setTitle('Summoning Altar • Elite Scroll')
                        .setThumbnail('https://images-ext-1.discordapp.net/external/huMhSM-tW8IbG2kU1hR1Q-pI-A44b74PL_teDZ7nhVc/https/www.vhv.rs/dpng/d/28-280300_konosuba-megumin-explosion-megumin-chibi-png-transparent-png.png?width=566&height=671')
                        .setDescription(`Step right up and try your luck with the **Elite Scroll**! For just **5,000 AniCoins**, you can summon a character to join your team. Who knows who you might meet?\n\nYou have a **50% chance** to summon an **Uncommon** character, a **42% chance** for a **Rare** one, a **7.5% chance** to get an **Epic** character, and if luck is really on your side, a **0.5% chance** to summon a **Legendary** character!`)
                        .addFields({
                        name: 'Owned',
                        value: `${player.scrolls.elite.count} Elite Scroll${player.scrolls.elite.count > 1 ? 's' : ''}`,
                        inline: true
                    }, {
                        name: 'Guaranteed Legendary',
                        value: player.scrolls.elite.guaranteed > 1 ? `${player.scrolls.elite.guaranteed} Summons Left` : player.scrolls.elite.guaranteed === 1 ? '1 Summon Left' : 'Available',
                        inline: true,
                    })
                        .setFooter({
                        text: `Tip: .`
                    });
                    const backButton = new discord_js_1.ButtonBuilder()
                        .setCustomId('back')
                        .setLabel('Back')
                        .setStyle(discord_js_1.ButtonStyle.Secondary);
                    const summonOneButton = new discord_js_1.ButtonBuilder()
                        .setCustomId('summonOne')
                        .setLabel('Summon 1')
                        .setStyle(discord_js_1.ButtonStyle.Primary)
                        .setEmoji('🟣')
                        .setDisabled(player.scrolls.elite.count < 1 ? true : false);
                    const summonTenButton = new discord_js_1.ButtonBuilder()
                        .setCustomId('summonTen')
                        .setLabel('Summon 10')
                        .setStyle(discord_js_1.ButtonStyle.Primary)
                        .setEmoji('🟣')
                        .setDisabled(player.scrolls.elite.count < 10 ? true : false);
                    const eliteSummonComponentRow = new discord_js_1.ActionRowBuilder()
                        .addComponents(backButton, summonOneButton, summonTenButton);
                    await confirmation.deferUpdate();
                    const response = await confirmation.editReply({
                        embeds: [eliteScrollEmbed],
                        components: [eliteSummonComponentRow]
                    });
                    try {
                        const confirmation = await response.awaitMessageComponent({
                            filter: collectorFilter,
                            time: 300000
                        });
                        if (confirmation.customId === 'back') {
                            callbackFunction.callback(client, confirmation, false, true);
                        }
                        else if (confirmation.customId === 'summonOne') {
                            async function handleSummonedCharacterPage(confirmation) {
                                const characters = await (0, utils_1.getAllCharacters)();
                                const latestCharacter = await models_1.CharaCollectionModel.findOne().sort({ createdAt: -1 });
                                const characterId = (0, utils_1.generateUniqueID)(latestCharacter?.characterId);
                                const [summonedCharacterData] = await (0, utils_1.summonCharacters)(characters, {
                                    5: 0,
                                    4: 50,
                                    3: 42,
                                    2: 7.5,
                                    1: 0.5 // Legendary
                                }, player.scrolls.elite.guaranteed, 1, 'legendary');
                                player = await models_1.PlayerModel.findOneAndUpdate({ userId: interaction.member && 'id' in interaction.member ? interaction.member.id : undefined }, {
                                    $inc: {
                                        'scrolls.elite.count': -1,
                                        'scrolls.elite.guaranteed': player.scrolls.elite.guaranteed === 0 ? 100 : -1
                                    },
                                }, { new: true }).populate('teams.lineup.character');
                                await redis_1.default.set(interaction.user.id, JSON.stringify(player), 'EX', 60);
                                const newCharaCollection = new models_1.CharaCollectionModel({
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
                                const characterSummonedEmbed = (0, config_1.configCharacterSummonedEmbed)(interaction, summonedCharacterData, characterId, 'Elite');
                                characterSummonedEmbed.setFooter({
                                    text: `New character added, see it with /collection. You've got ${player.scrolls.elite.count} Elite Scroll${player.scrolls.elite.count > 1 ? 's' : ''} left.`
                                });
                                const characterSummonedComponentRow = new discord_js_1.ActionRowBuilder()
                                    .addComponents(backButton, summonOneButton
                                    .setLabel('Summon 1')
                                    .setDisabled(player.scrolls.elite.count < 1 ? true : false));
                                await newCharaCollection.save();
                                await confirmation.deferUpdate();
                                const response = await confirmation.editReply({
                                    embeds: [characterSummonedEmbed],
                                    components: [characterSummonedComponentRow]
                                });
                                try {
                                    const confirmation = await response.awaitMessageComponent({
                                        filter: collectorFilter,
                                        time: 300000
                                    });
                                    if (confirmation.customId === 'back') {
                                        await handleElitePage(confirmation);
                                    }
                                    else if (confirmation.customId === 'summonOne') {
                                        await handleSummonedCharacterPage(confirmation);
                                    }
                                }
                                catch (error) {
                                    if (error instanceof Error && error.message === "Collector received no interactions before ending with reason: time") {
                                        characterSummonedEmbed.setFooter({
                                            text: `⏱️ This command is only active for 5 minutes. To use it again, please type /summon.`
                                        });
                                        await confirmation.editReply({
                                            embeds: [characterSummonedEmbed],
                                            components: []
                                        });
                                    }
                                    else {
                                        console.log(`Elite Scroll Summon Error: ${error}`);
                                    }
                                }
                            }
                            await handleSummonedCharacterPage(confirmation);
                        }
                        else if (confirmation.customId === 'summonTen') {
                            async function handleSummonedTenCharacterPage(confirmation) {
                                const characters = await (0, utils_1.getAllCharacters)();
                                const summonedCharacterDataArray = await (0, utils_1.summonCharacters)(characters, {
                                    5: 0,
                                    4: 50,
                                    3: 42,
                                    2: 7.5,
                                    1: 0.5 // Legendary
                                }, player.scrolls.elite.guaranteed, 10, 'legendary');
                                player = await models_1.PlayerModel.findOneAndUpdate({ userId: interaction.member && 'id' in interaction.member ? interaction.member.id : undefined }, {
                                    $inc: {
                                        'scrolls.elite.count': -10,
                                    },
                                    $set: {
                                        'scrolls.elite.guaranteed': player.scrolls.elite.guaranteed - 10 < 0 ? 100 - (10 - player.scrolls.elite.guaranteed) : player.scrolls.elite.guaranteed - 10,
                                    }
                                }, { new: true }).populate('teams.lineup.character');
                                await redis_1.default.set(interaction.user.id, JSON.stringify(player), 'EX', 60);
                                const characterSummonedTenEmbedArray = [
                                    new discord_js_1.EmbedBuilder()
                                        .setColor('Blurple')
                                        .setAuthor({
                                        name: interaction.user.username,
                                        iconURL: interaction.user.displayAvatarURL(),
                                    })
                                        .setTitle('Elite Scroll Summon')
                                        .setThumbnail('https://images-ext-1.discordapp.net/external/huMhSM-tW8IbG2kU1hR1Q-pI-A44b74PL_teDZ7nhVc/https/www.vhv.rs/dpng/d/28-280300_konosuba-megumin-explosion-megumin-chibi-png-transparent-png.png?width=566&height=671')
                                        .setDescription(`Congratulations! You've successfully summoned 10 new characters. Each page reveals their unique details. Enjoy the discovery!`)
                                ];
                                for (const summonedCharacterData of summonedCharacterDataArray) {
                                    const latestCharacter = await models_1.CharaCollectionModel.findOne().sort({ createdAt: -1 });
                                    const characterId = (0, utils_1.generateUniqueID)(latestCharacter?.characterId);
                                    const newCharaCollection = new models_1.CharaCollectionModel({
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
                                    characterSummonedTenEmbedArray.push((0, config_1.configCharacterSummonedEmbed)(interaction, summonedCharacterData, characterId, 'Elite'));
                                    characterSummonedTenEmbedArray[0].addFields({
                                        name: `🔹 ${summonedCharacterData.character.name}`,
                                        value: `${summonedCharacterData.character.fullname}\n\`${characterId}\` • __**${(0, utils_1.mapRarity)(summonedCharacterData.rarity)}**__`,
                                        inline: true,
                                    });
                                }
                                characterSummonedTenEmbedArray[0].addFields({
                                    name: `New characters have joined your collection!`,
                                    value: `Check them out with ${config_1.config.commands.collectionCommandTag}. You've got ${player.scrolls.elite.count} Elite Scroll${player.scrolls.elite.count > 1 ? 's' : ''} left.`,
                                    inline: false,
                                });
                                const prevButton = new discord_js_1.ButtonBuilder()
                                    .setCustomId('prev')
                                    .setStyle(discord_js_1.ButtonStyle.Primary)
                                    .setEmoji('⬅️');
                                const nextButton = new discord_js_1.ButtonBuilder()
                                    .setCustomId('next')
                                    .setStyle(discord_js_1.ButtonStyle.Primary)
                                    .setEmoji('➡️');
                                const characterSummonedTenComponentRow = new discord_js_1.ActionRowBuilder()
                                    .addComponents(backButton, prevButton, nextButton, summonTenButton
                                    .setLabel('Summon 10')
                                    .setDisabled(player.scrolls.elite.count < 10 ? true : false));
                                async function handlePages(confirmation, currentPage = 0) {
                                    const characterSummonedTenEmbed = characterSummonedTenEmbedArray[currentPage]
                                        .setFooter({
                                        text: `Page ${currentPage + 1} of ${characterSummonedTenEmbedArray.length} • Click the ⬅️ or ➡️ button to navigate.`
                                    });
                                    prevButton.setDisabled(currentPage < 1 ? true : false);
                                    nextButton.setDisabled(currentPage === (characterSummonedTenEmbedArray.length - 1) ? true : false);
                                    await confirmation.deferUpdate();
                                    const response = await confirmation.editReply({
                                        embeds: [characterSummonedTenEmbed],
                                        components: [characterSummonedTenComponentRow],
                                    });
                                    try {
                                        const confirmation = await response.awaitMessageComponent({
                                            filter: collectorFilter,
                                            time: 300000
                                        });
                                        if (confirmation.customId === 'back') {
                                            await handleElitePage(confirmation);
                                        }
                                        else if (confirmation.customId === 'summonTen') {
                                            await handleSummonedTenCharacterPage(confirmation);
                                        }
                                        else if (confirmation.customId === 'prev') {
                                            await handlePages(confirmation, currentPage - 1);
                                        }
                                        else if (confirmation.customId === 'next') {
                                            await handlePages(confirmation, currentPage + 1);
                                        }
                                    }
                                    catch (error) {
                                        if (error instanceof Error && error.message === "Collector received no interactions before ending with reason: time") {
                                            characterSummonedTenEmbed.setFooter({
                                                text: `⏱️ This command is only active for 5 minutes. To use it again, please type /summon.`
                                            });
                                            await confirmation.editReply({
                                                embeds: [characterSummonedTenEmbed],
                                                components: []
                                            });
                                        }
                                        else {
                                            console.log(`Multiple Elite Scroll Summon Error: ${error}`);
                                        }
                                    }
                                }
                                await handlePages(confirmation);
                            }
                            await handleSummonedTenCharacterPage(confirmation);
                        }
                    }
                    catch (error) {
                    }
                }
                await handleElitePage(confirmation);
            }
            else if (confirmation.customId === 'series') {
                async function handleSeriesPage(confirmation) {
                    const seriesScrollEmbed = new discord_js_1.EmbedBuilder()
                        .setColor('Blurple')
                        .setAuthor({
                        name: interaction.user.username,
                        iconURL: interaction.user.displayAvatarURL(),
                    })
                        .setTitle('Summoning Altar • Series Scroll')
                        .setThumbnail('https://images-ext-1.discordapp.net/external/huMhSM-tW8IbG2kU1hR1Q-pI-A44b74PL_teDZ7nhVc/https/www.vhv.rs/dpng/d/28-280300_konosuba-megumin-explosion-megumin-chibi-png-transparent-png.png?width=566&height=671')
                        .setDescription(`Welcome to the Summoning Altar! This week, we're offering **Series Scroll**. For just **50,000 AniCoins**, you can summon character from a specific anime series to join your team. But hurry, this offer is only available for a week!\n\nHere's the rarity breakdown for the character in the scroll:\n- **Rare**: 53%\n- **Epic**: 43%\n- **Legendary**: 4%\n\nGood luck, and may the odds be ever in your favor!`)
                        .addFields({
                        name: 'Owned',
                        value: `${player.scrolls.series.count} Series Scroll${player.scrolls.series.count > 1 ? 's' : ''}`,
                        inline: true
                    }, {
                        name: 'Current Series',
                        value: 'This week only!',
                        inline: true,
                    })
                        .setFooter({
                        text: `Tip: Don't miss out on these limited-time packs!`
                    });
                    const backButton = new discord_js_1.ButtonBuilder()
                        .setCustomId('back')
                        .setLabel('Back')
                        .setStyle(discord_js_1.ButtonStyle.Secondary);
                    const summonOneButton = new discord_js_1.ButtonBuilder()
                        .setCustomId('summonOne')
                        .setLabel('Summon 1')
                        .setStyle(discord_js_1.ButtonStyle.Primary)
                        .setEmoji('🟣')
                        .setDisabled(player.scrolls.series.count < 1 ? true : false);
                    const summonTenButton = new discord_js_1.ButtonBuilder()
                        .setCustomId('summonTen')
                        .setLabel('Summon 10')
                        .setStyle(discord_js_1.ButtonStyle.Primary)
                        .setEmoji('🟣')
                        .setDisabled(player.scrolls.series.count < 10 ? true : false);
                    const seriesSummonComponentRow = new discord_js_1.ActionRowBuilder()
                        .addComponents(backButton, summonOneButton, summonTenButton);
                    await confirmation.deferUpdate();
                    const response = await confirmation.editReply({
                        embeds: [seriesScrollEmbed],
                        components: [seriesSummonComponentRow]
                    });
                    try {
                        const confirmation = await response.awaitMessageComponent({
                            filter: collectorFilter,
                            time: 300000
                        });
                        if (confirmation.customId === 'back') {
                            callbackFunction.callback(client, confirmation, false, true);
                        }
                        else if (confirmation.customId === 'summonOne') {
                            async function handleSummonedCharacterPage(confirmation) {
                            }
                        }
                    }
                    catch (eror) {
                    }
                }
                await handleSeriesPage(confirmation);
            }
        }
        catch (error) {
            if (error instanceof Error && error.message === "Collector received no interactions before ending with reason: time") {
                summonEmbed.setFooter({
                    text: `⏱️ This command is only active for 5 minutes. To use it again, please type /summon.`
                });
                await interaction.editReply({
                    embeds: [summonEmbed],
                    components: []
                });
            }
            else {
                console.log(`Summon Command Error: ${error}`);
            }
        }
    }
};
