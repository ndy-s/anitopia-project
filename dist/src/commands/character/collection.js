"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const utils_1 = require("../../utils");
const exceptions_1 = require("../exceptions");
const models_1 = require("../../models");
const character_1 = require("./character");
exports.default = {
    name: 'collection',
    description: 'See your collection',
    cooldown: 5000,
    options: [
        {
            name: 'page',
            description: "Enter the page number of the collection you'd like to view",
            type: discord_js_1.ApplicationCommandOptionType.Integer,
            min_value: 1,
            required: false
        }
    ],
    deleted: false,
    // Optional
    devOnly: false,
    testOnly: false,
    botPermissions: [],
    permissionRequired: [],
    callback: async function callback(client, interaction, editReply = false, pageInput = 0) {
        const pageOptionValue = pageInput || (interaction instanceof discord_js_1.CommandInteraction ? Number(interaction.options?.get('page')?.value) : 1) || 1;
        const player = await (0, utils_1.getPlayer)(interaction);
        const PAGE_SIZE = 12;
        const totalDocuments = await models_1.CharaCollectionModel.countDocuments({ playerId: player._id });
        const maxPageNumber = Math.ceil(totalDocuments / PAGE_SIZE);
        if (totalDocuments < 1) {
            return (0, exceptions_1.pageNF)(interaction, maxPageNumber, { 'command': 'collection', 'data': 'character' }, 'empty');
        }
        else if (pageOptionValue > maxPageNumber) {
            return (0, exceptions_1.pageNF)(interaction, maxPageNumber, { 'command': 'collection', 'data': 'character' });
        }
        const charaCollection = await models_1.CharaCollectionModel
            .find({ playerId: player._id })
            .skip((pageOptionValue - 1) * PAGE_SIZE)
            .limit(PAGE_SIZE)
            .populate('character')
            .sort({ rarity: 1, level: -1, createdAt: -1 });
        const attachment = new discord_js_1.AttachmentBuilder('C:/Storage/Programming/Project Dev/Anitopia/src/public/wisp.jpg', { name: 'wisp.jpg' });
        const charaCollectionEmbed = new discord_js_1.EmbedBuilder()
            .setColor('Blurple')
            .setAuthor({
            name: `${interaction.user.username}'s Collection`,
            iconURL: interaction.user.displayAvatarURL(),
        })
            .setTitle(`Character Collection`)
            .setDescription("Welcome to your character collection! Each character has a unique ID that you can use to view more details about them. \n\nSimply click the **Info** button and input the **Character ID** to get more details.")
            .setThumbnail('attachment://wisp.jpg');
        for (const chara of charaCollection) {
            charaCollectionEmbed.addFields({
                name: `🔹 ${chara.character.name} Lv. ${chara.level}`,
                value: `ID: \`${chara.characterId}\`\nRarity: **${(0, utils_1.mapRarity)(Number(chara.rarity))}**`,
                inline: true
            });
        }
        charaCollectionEmbed.setFooter({
            text: `Page ${pageOptionValue} of ${maxPageNumber} • Characters ${(pageOptionValue - 1) * 12 + 1 + charaCollection.length - 1} of ${totalDocuments}`
        });
        const backButton = new discord_js_1.ButtonBuilder()
            .setCustomId('back')
            .setLabel('Back')
            .setStyle(discord_js_1.ButtonStyle.Secondary);
        const prevButton = new discord_js_1.ButtonBuilder()
            .setCustomId('prev')
            .setStyle(discord_js_1.ButtonStyle.Primary)
            .setEmoji('⬅️');
        const nextButton = new discord_js_1.ButtonBuilder()
            .setCustomId('next')
            .setStyle(discord_js_1.ButtonStyle.Primary)
            .setEmoji('➡️');
        const searchPageButton = new discord_js_1.ButtonBuilder()
            .setCustomId('searchPage')
            .setStyle(discord_js_1.ButtonStyle.Primary)
            .setLabel('⋯');
        const infoButton = new discord_js_1.ButtonBuilder()
            .setCustomId('info')
            .setLabel('Info')
            .setStyle(discord_js_1.ButtonStyle.Success);
        const charaCollectionComponentRow = new discord_js_1.ActionRowBuilder()
            .addComponents(backButton, prevButton, searchPageButton, nextButton, infoButton);
        prevButton.setDisabled(pageOptionValue < 2 ? true : false);
        nextButton.setDisabled(pageOptionValue === (maxPageNumber) ? true : false);
        searchPageButton.setDisabled(pageOptionValue === (maxPageNumber) && pageOptionValue < 2 ? true : false);
        const responseOptions = {
            embeds: [charaCollectionEmbed],
            components: [charaCollectionComponentRow],
            files: [attachment]
        };
        if ('deferUpdate' in interaction && editReply) {
            await interaction.deferUpdate();
        }
        const response = editReply ? await interaction.editReply(responseOptions) : await interaction.reply(responseOptions);
        const collectorFilter = (i) => i.user.id === interaction.user.id;
        try {
            const confirmation = await response.awaitMessageComponent({
                filter: collectorFilter,
                time: 300000
            });
            if (confirmation.customId === 'back') {
                await character_1.default.callback(client, confirmation, false, true);
            }
            else if (confirmation.customId === 'prev') {
                await callback(client, confirmation, true, pageOptionValue - 1);
            }
            else if (confirmation.customId === 'next') {
                await callback(client, confirmation, true, pageOptionValue + 1);
            }
            else if (confirmation.customId === 'searchPage') {
                await searchPage(confirmation);
            }
            else if (confirmation.customId === 'info') {
                await searchCharacterInfo(confirmation);
            }
            // Function section
            async function searchPage(confirmation) {
                const searchCollectionPageModal = new discord_js_1.ModalBuilder()
                    .setCustomId('searchCollectionPageModal')
                    .setTitle(`Search Collection Page`);
                const pageInput = new discord_js_1.TextInputBuilder()
                    .setCustomId('pageInput')
                    .setLabel('Enter Page Number')
                    .setPlaceholder(`Type a number from 1 to ${maxPageNumber}`)
                    .setStyle(discord_js_1.TextInputStyle.Short)
                    .setRequired(true);
                searchCollectionPageModal.addComponents(new discord_js_1.ActionRowBuilder().addComponents(pageInput));
                if (!(confirmation instanceof discord_js_1.ModalSubmitInteraction)) {
                    await confirmation.showModal(searchCollectionPageModal);
                }
                prevButton.setCustomId('prevModal');
                nextButton.setCustomId('nextModal');
                searchPageButton.setCustomId('searchPageModal');
                infoButton.setCustomId('infoModal');
                prevButton.setDisabled(pageOptionValue < 2 ? true : false);
                nextButton.setDisabled(pageOptionValue === (maxPageNumber) ? true : false);
                searchPageButton.setDisabled(pageOptionValue === (maxPageNumber) && pageOptionValue < 2 ? true : false);
                const response = await confirmation.editReply({
                    components: [new discord_js_1.ActionRowBuilder()
                            .addComponents(backButton, prevButton, searchPageButton, nextButton, infoButton)
                    ],
                });
                try {
                    const confirmation = await response.awaitMessageComponent({
                        filter: collectorFilter,
                        time: 300000,
                    });
                    if (confirmation.customId === 'back') {
                        await character_1.default.callback(client, confirmation, false, true);
                    }
                    else if (confirmation.customId === 'prevModal') {
                        await callback(client, confirmation, true, pageOptionValue - 1);
                    }
                    else if (confirmation.customId === 'nextModal') {
                        await callback(client, confirmation, true, pageOptionValue + 1);
                    }
                    else if (confirmation.customId === 'searchPageModal') {
                        await searchPage(confirmation);
                    }
                    else if (confirmation.customId === 'infoModal') {
                        await searchCharacterInfo(confirmation);
                    }
                }
                catch (error) {
                    if (error instanceof Error && error.message === "Collector received no interactions before ending with reason: time") {
                        charaCollectionEmbed.setFooter({
                            text: `⏱️ This command is only active for 5 minutes. To use it again, please type /collection.`
                        });
                        await interaction.editReply({
                            embeds: [charaCollectionEmbed],
                            components: []
                        });
                    }
                    else {
                        console.log(`Collection Command Error: ${error}`);
                    }
                }
            }
            async function searchCharacterInfo(confirmation) {
                const infoCharaModal = new discord_js_1.ModalBuilder()
                    .setCustomId('infoCharaModal')
                    .setTitle('Check Character Info');
                const charaIdInput = new discord_js_1.TextInputBuilder()
                    .setCustomId('charaIdInput')
                    .setLabel('Enter Your Character ID')
                    .setMinLength(4)
                    .setPlaceholder(`For example: ${charaCollection[0].characterId}`)
                    .setStyle(discord_js_1.TextInputStyle.Short)
                    .setRequired(true);
                infoCharaModal.addComponents(new discord_js_1.ActionRowBuilder().addComponents(charaIdInput));
                if (!(confirmation instanceof discord_js_1.ModalSubmitInteraction)) {
                    await confirmation.showModal(infoCharaModal);
                }
                prevButton.setCustomId('prevCharaModal');
                nextButton.setCustomId('nextCharaModal');
                searchPageButton.setCustomId('searchPageCharaModal');
                infoButton.setCustomId('infoCharaModal');
                prevButton.setDisabled(pageOptionValue < 2 ? true : false);
                nextButton.setDisabled(pageOptionValue === (maxPageNumber) ? true : false);
                searchPageButton.setDisabled(pageOptionValue === (maxPageNumber) && pageOptionValue < 2 ? true : false);
                const response = await confirmation.editReply({
                    components: [new discord_js_1.ActionRowBuilder()
                            .addComponents(backButton, prevButton, searchPageButton, nextButton, infoButton)
                    ],
                });
                try {
                    const confirmation = await response.awaitMessageComponent({
                        filter: collectorFilter,
                        time: 300000,
                    });
                    if (confirmation.customId === 'back') {
                        await character_1.default.callback(client, confirmation, false, true);
                    }
                    else if (confirmation.customId === 'prevCharaModal') {
                        await callback(client, confirmation, true, pageOptionValue - 1);
                    }
                    else if (confirmation.customId === 'nextCharaModal') {
                        await callback(client, confirmation, true, pageOptionValue + 1);
                    }
                    else if (confirmation.customId === 'searchPageCharaModal') {
                        await searchPage(confirmation);
                    }
                    else if (confirmation.customId === 'infoCharaModal') {
                        await searchCharacterInfo(confirmation);
                    }
                }
                catch (error) {
                    if (error instanceof Error && error.message === "Collector received no interactions before ending with reason: time") {
                        charaCollectionEmbed.setFooter({
                            text: `⏱️ This command is only active for 5 minutes. To use it again, please type /collection.`
                        });
                        await interaction.editReply({
                            embeds: [charaCollectionEmbed],
                            components: []
                        });
                    }
                    else {
                        console.log(`Collection Command Error: ${error}`);
                    }
                }
            }
        }
        catch (error) {
            if (error instanceof Error && error.message === "Collector received no interactions before ending with reason: time") {
                charaCollectionEmbed.setFooter({
                    text: `⏱️ This command is only active for 5 minutes. To use it again, please type /collection.`
                });
                await interaction.editReply({
                    embeds: [charaCollectionEmbed],
                    components: []
                });
            }
            else {
                console.log(`Collection Command Error: ${error}`);
            }
        }
    }
};
