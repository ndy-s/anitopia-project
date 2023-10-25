import { ActionRowBuilder, ApplicationCommandOptionType, Attachment, AttachmentBuilder, ButtonBuilder, ButtonStyle, Client, CollectedInteraction, CommandInteraction, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";

import { getPlayer } from "../../utils";
import { pageNF } from "../exceptions";
import { ICharaCollectionModel, ICharacterModel } from "../../interfaces";
import { CharaCollectionModel } from "../../models";

import character from "./character";

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

    callback: async (client: Client, interaction: CommandInteraction | CollectedInteraction, editReply = false) => {
        let desiredPage: number = 1;
        if ('options' in interaction) {
            desiredPage = Number(interaction.options.get('page')?.value ?? 1);
        }
        
        let player = await getPlayer(interaction);

        const charaCollection: ICharaCollectionModel[] = await CharaCollectionModel.find({ playerId: player._id }).populate('character');

        const charaCollectionArray = [];
        for (let i = 0; i < charaCollection.length; i += 12) {
            charaCollectionArray.push(charaCollection.slice(i, i + 12));
        }

        const attachment = new AttachmentBuilder('C:/Storage/Programming/Project Dev/Anitopia/src/public/wisp.jpg', { name: 'wisp.jpg' });

        const charaCollectionEmbedArray = await Promise.all(charaCollectionArray.map(async (charas) => {
            const charaCollectionEmbed = new EmbedBuilder()
                .setColor('Blurple')
                .setAuthor({
                    name: `${interaction.user.username}'s Collection`,
                    iconURL: interaction.user.displayAvatarURL(),
                })
                .setTitle(`Character Collection`)
                .setDescription("Here's a glimpse of your unique character collection. Each character has its own level and ID. Keep exploring to level up your characters!")
                .setThumbnail('attachment://wisp.jpg');

            charas.forEach((chara) => {
                if ((<ICharacterModel>chara.character).name) {
                    charaCollectionEmbed.addFields({
                        name: `🔹 ${(<ICharacterModel>chara.character).name} Lv. ${chara.level}`,
                        value: `ID: \`${chara.characterId}\`\nRarity: **${chara.rarity}**`,
                        inline: true
                    });
                }
            });

            return charaCollectionEmbed;
        }));

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

        const charaCollectionComponentRow = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                backButton,
                prevButton,
                searchPageButton,
                nextButton
            );

        const collectorFilter = (i: { user: { id: string }}) => i.user.id === interaction.user.id;

        async function handlePages(interaction: CommandInteraction | CollectedInteraction, deferUpdate: boolean = false, editReply: boolean = false, currentPage: number = 1) {
            if (currentPage > charaCollectionArray.length) {
                return pageNF(interaction, charaCollectionEmbedArray.length);
            }

            const charaCollectionEmbed = charaCollectionEmbedArray[currentPage - 1].setFooter({
                text: `Page ${currentPage} of ${charaCollectionEmbedArray.length}. Click the next or previous button to navigate.`
            });

            prevButton.setDisabled(currentPage < 2 ? true : false);
            nextButton.setDisabled(currentPage === (charaCollectionEmbedArray.length) ? true : false);

            const responseOptions = {
                embeds: [charaCollectionEmbed],
                components: [charaCollectionComponentRow],
                files: [attachment]
            };

                let response;
                if (deferUpdate && 'deferUpdate' in interaction) {
                    await interaction.deferUpdate();
                }
                if (editReply) {
                    response = await interaction.editReply(responseOptions);
                } else {
                    response = await interaction.reply(responseOptions);
                }
    
            try {
                const confirmation = await response.awaitMessageComponent({
                    filter: collectorFilter,
                    time: 300_000
                });

                if (confirmation.customId === 'back') {
                    await character.callback(client, confirmation, false, true);
                } else if (confirmation.customId === 'prev') {
                    await handlePages(confirmation, true, true, currentPage - 1);
                } else if (confirmation.customId === 'next') {
                    await handlePages(confirmation, true, true, currentPage + 1);
                } else if (confirmation.customId === 'searchPage') {
                    const searchCollectionPageModal = new ModalBuilder()
                        .setCustomId('searchCollectionPageModal')
                        .setTitle(`Search Collection Page`);
                    
                    const pageInput = new TextInputBuilder()
                        .setCustomId('pageInput')
                        .setLabel('Enter Page Number')
                        .setPlaceholder(`Type a number from 1 to ${charaCollectionEmbedArray.length}`)
                        .setStyle(TextInputStyle.Short)
                        .setRequired(true);
                    
                    searchCollectionPageModal.addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(pageInput));
                    await confirmation.showModal(searchCollectionPageModal);

                    await handlePages(confirmation, false, true, currentPage);
                }
    
            } catch (error) {
                if (error instanceof Error && error.message === "Collector received no interactions before ending with reason: time") {
                } else {
                    console.log(`Collection Command Error: ${error}`)
                }
            }
        }
        await handlePages(interaction, editReply, editReply, desiredPage);

    }
}