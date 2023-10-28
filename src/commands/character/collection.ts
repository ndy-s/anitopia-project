import { ActionRowBuilder, ApplicationCommandOptionType, Attachment, AttachmentBuilder, ButtonBuilder, ButtonStyle, Client, CollectedInteraction, CommandInteraction, EmbedBuilder, Interaction, InteractionCollector, InteractionResponse, ModalBuilder, ModalSubmitInteraction, TextInputBuilder, TextInputStyle } from "discord.js";

import { getPlayer, mapRarity } from "../../utils";
import { pageNF } from "../exceptions";
import { ICharaCollectionModel, ICharacterModel } from "../../interfaces";
import { CharaCollectionModel } from "../../models";

import character from "./character";
import { Collection } from "mongoose";

export default {
    name: 'collection',
    description: 'See your collection',
    cooldown: 5_000,
    options: [
        {
            name: 'page',
            description: "Enter the page number of the collection you'd like to view",
            type: ApplicationCommandOptionType.Integer,
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

    callback: async function callback(client: Client, interaction: CommandInteraction | CollectedInteraction, editReply = false, pageInput: number = 0) {
        const pageOptionValue: number = pageInput || (interaction instanceof CommandInteraction ? Number(interaction.options?.get('page')?.value) : 1) || 1;
        const player = await getPlayer(interaction);

        const PAGE_SIZE: number = 12;
        const totalDocuments: number = await CharaCollectionModel.countDocuments({ playerId: player._id });
        const maxPageNumber: number = Math.ceil(totalDocuments / PAGE_SIZE);

        if (totalDocuments < 1) {
            return pageNF(interaction, maxPageNumber, {'command': 'collection', 'data': 'character'}, 'empty');
        } else if (pageOptionValue > maxPageNumber) {
            return pageNF(interaction, maxPageNumber, {'command': 'collection', 'data': 'character'});
        }
    
        const charaCollection: ICharaCollectionModel[] = await CharaCollectionModel
            .find({ playerId: player._id })
            .skip((pageOptionValue - 1) * PAGE_SIZE)
            .limit(PAGE_SIZE)
            .populate('character')
            .sort({ rarity: 1, level: -1, createdAt: -1 });

        const attachment = new AttachmentBuilder('C:/Storage/Programming/Project Dev/Anitopia/src/public/wisp.jpg', { name: 'wisp.jpg' });

        const charaCollectionEmbed = new EmbedBuilder()
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
                name: `🔹 ${(<ICharacterModel>chara.character).name} Lv. ${chara.level}`,
                value: `ID: \`${chara.characterId}\`\nRarity: **${mapRarity(Number(chara.rarity))}**`,
                inline: true
            });
        }
    
        charaCollectionEmbed.setFooter({
            text: `Page ${pageOptionValue} of ${maxPageNumber} • Characters ${(pageOptionValue - 1) * 12 + 1 + charaCollection.length - 1} of ${totalDocuments}`
        });

        const backButton = new ButtonBuilder()
            .setCustomId('back')
            .setLabel('Back')
            .setStyle(ButtonStyle.Secondary);

        const prevButton = new ButtonBuilder()
            .setCustomId('prev')
            .setStyle(ButtonStyle.Primary)
            .setEmoji('⬅️');

        const nextButton = new ButtonBuilder()
            .setCustomId('next')
            .setStyle(ButtonStyle.Primary)
            .setEmoji('➡️');

        const searchPageButton = new ButtonBuilder()
            .setCustomId('searchPage')
            .setStyle(ButtonStyle.Primary)
            .setLabel('⋯');
        
        const infoButton = new ButtonBuilder()
            .setCustomId('info')
            .setLabel('Info')
            .setStyle(ButtonStyle.Success);

        const charaCollectionComponentRow = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                backButton,
                prevButton,
                searchPageButton,
                nextButton,
                infoButton
            );
    
        prevButton.setDisabled(pageOptionValue < 2 ? true : false);
        nextButton.setDisabled(pageOptionValue === (maxPageNumber) ? true : false);
        searchPageButton.setDisabled(pageOptionValue === (maxPageNumber) && pageOptionValue < 2 ? true : false );
    
        const responseOptions = {
            embeds: [charaCollectionEmbed],
            components: [charaCollectionComponentRow],
            files: [attachment]
        };


        if ('deferUpdate' in interaction && editReply) {
            await interaction.deferUpdate();
        }

        const response = editReply ? await interaction.editReply(responseOptions) : await interaction.reply(responseOptions);

        const collectorFilter = (i: { user: { id: string }}) => i.user.id === interaction.user.id;

        try {
            const confirmation = await response.awaitMessageComponent({
                filter: collectorFilter,
                time: 300_000
            });

            async function searchPage (confirmation: CollectedInteraction) {
                const searchCollectionPageModal = new ModalBuilder()
                    .setCustomId('searchCollectionPageModal')
                    .setTitle(`Search Collection Page`);
                
                const pageInput = new TextInputBuilder()
                    .setCustomId('pageInput')
                    .setLabel('Enter Page Number')
                    .setPlaceholder(`Type a number from 1 to ${maxPageNumber}`)
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true);
                
                searchCollectionPageModal.addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(pageInput));

                if (!(confirmation instanceof ModalSubmitInteraction)) {
                    await confirmation.showModal(searchCollectionPageModal);
                }

                prevButton.setCustomId('prevModal');
                nextButton.setCustomId('nextModal');
                searchPageButton.setCustomId('searchPageModal');
                infoButton.setCustomId('infoModal');

                prevButton.setDisabled(pageOptionValue < 2 ? true : false);
                nextButton.setDisabled(pageOptionValue === (maxPageNumber) ? true : false);
                searchPageButton.setDisabled(pageOptionValue === (maxPageNumber) && pageOptionValue < 2 ? true : false );  
        
                const response = await confirmation.editReply({
                    components: [new ActionRowBuilder<ButtonBuilder>()
                        .addComponents(
                            backButton,
                            prevButton,
                            searchPageButton,
                            nextButton,
                            infoButton
                        )
                    ],
                });

                try {
                    const confirmation = await response.awaitMessageComponent({ 
                        filter: collectorFilter,
                        time: 300_000,
                    });
                        
                    if (confirmation.customId === 'back') {
                        await character.callback(client, confirmation, false, true);
                    } else if (confirmation.customId === 'prevModal') {
                        await callback(client, confirmation, true, pageOptionValue - 1);
                    } else if (confirmation.customId === 'nextModal') {
                        await callback(client, confirmation, true, pageOptionValue + 1);
                    } else if (confirmation.customId === 'searchPageModal') {
                        await searchPage(confirmation);
                    } else if (confirmation.customId === 'infoModal') {
                        await searchCharacterInfo(confirmation);
                    }
                            
                } catch (error) {
                    if (error instanceof Error && error.message === "Collector received no interactions before ending with reason: time") {
                        charaCollectionEmbed.setFooter({
                            text: `⏱️ This command is only active for 5 minutes. To use it again, please type /collection.`
                        });
        
                        await interaction.editReply({
                            embeds: [charaCollectionEmbed],
                            components: []
                        });
                    } else {
                        console.log(`Collection Command Error: ${error}`)
                    }
                }
            }

            async function searchCharacterInfo (confirmation: CollectedInteraction) {
                const infoCharaModal = new ModalBuilder()
                    .setCustomId('infoCharaModal')
                    .setTitle('Check Character Info');

                const charaIdInput = new TextInputBuilder()
                    .setCustomId('charaIdInput')
                    .setLabel('Enter Your Character ID')
                    .setMinLength(4)
                    .setPlaceholder(`For example: ${charaCollection[0].characterId}`)
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true);

                infoCharaModal.addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(charaIdInput));

                if (!(confirmation instanceof ModalSubmitInteraction)) {
                    await confirmation.showModal(infoCharaModal);
                }

                prevButton.setCustomId('prevCharaModal');
                nextButton.setCustomId('nextCharaModal');
                searchPageButton.setCustomId('searchPageCharaModal');
                infoButton.setCustomId('infoCharaModal');

                prevButton.setDisabled(pageOptionValue < 2 ? true : false);
                nextButton.setDisabled(pageOptionValue === (maxPageNumber) ? true : false);
                searchPageButton.setDisabled(pageOptionValue === (maxPageNumber) && pageOptionValue < 2 ? true : false );

                const response = await confirmation.editReply({
                    components: [new ActionRowBuilder<ButtonBuilder>()
                        .addComponents(
                            backButton,
                            prevButton,
                            searchPageButton,
                            nextButton,
                            infoButton
                        )
                    ],
                });

                try {
                    const confirmation = await response.awaitMessageComponent({ 
                        filter: collectorFilter,
                        time: 300_000,
                    });
                        
                    if (confirmation.customId === 'back') {
                        await character.callback(client, confirmation, false, true);
                    } else if (confirmation.customId === 'prevCharaModal') {
                        await callback(client, confirmation, true, pageOptionValue - 1);
                    } else if (confirmation.customId === 'nextCharaModal') {
                        await callback(client, confirmation, true, pageOptionValue + 1);
                    } else if (confirmation.customId === 'searchPageCharaModal') {
                        await searchPage(confirmation);
                    } else if (confirmation.customId === 'infoCharaModal') {
                        await searchCharacterInfo(confirmation);
                    }
                            
                } catch (error) {
                    if (error instanceof Error && error.message === "Collector received no interactions before ending with reason: time") {
                        charaCollectionEmbed.setFooter({
                            text: `⏱️ This command is only active for 5 minutes. To use it again, please type /collection.`
                        });
        
                        await interaction.editReply({
                            embeds: [charaCollectionEmbed],
                            components: []
                        });
                    } else {
                        console.log(`Collection Command Error: ${error}`)
                    }
                }
            }


            if (confirmation.customId === 'back') {
                await character.callback(client, confirmation, false, true);
            } else if (confirmation.customId === 'prev') {
                await callback(client, confirmation, true, pageOptionValue - 1);
            } else if (confirmation.customId === 'next') {
                await callback(client, confirmation, true, pageOptionValue + 1);
            } else if (confirmation.customId === 'searchPage') {
                await searchPage(confirmation);
            } else if (confirmation.customId === 'info') {
                await searchCharacterInfo(confirmation);
            }

        } catch (error) {
            if (error instanceof Error && error.message === "Collector received no interactions before ending with reason: time") {
                charaCollectionEmbed.setFooter({
                    text: `⏱️ This command is only active for 5 minutes. To use it again, please type /collection.`
                });

                await interaction.editReply({
                    embeds: [charaCollectionEmbed],
                    components: []
                });
            } else {
                console.log(`Collection Command Error: ${error}`)
            }
        }
    }
}