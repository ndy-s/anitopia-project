import { ActionRowBuilder, Attachment, AttachmentBuilder, ButtonBuilder, ButtonStyle, Client, CollectedInteraction, CommandInteraction, EmbedBuilder } from "discord.js";

import { getPlayer } from "../../utils";
import { ICharaCollectionModel, ICharacterModel } from "../../interfaces";
import { CharaCollectionModel } from "../../models";
import character from "./character";

export default {
    name: 'collection',
    description: 'See your collection',
    cooldown: 5_000,
    options: [],
    deleted: false,

    // Optional
    devOnly: false,
    testOnly: false,
    botPermissions: [],
    permissionRequired: [],

    callback: async (client: Client, interaction: CommandInteraction | CollectedInteraction, editReply = false) => {
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

        const charaCollectionComponentRow = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                backButton,
                prevButton,
                nextButton
            );

        const collectorFilter = (i: { user: { id: string }}) => i.user.id === interaction.user.id;

        async function handlePages(interaction: CommandInteraction | CollectedInteraction, editReply: boolean = false, currentPage: number = 0) {
            const charaCollectionEmbed = charaCollectionEmbedArray[currentPage].setFooter({
                text: `Page ${currentPage + 1} of ${charaCollectionEmbedArray.length}. Click the next or previous button to navigate.`
            });

            prevButton.setDisabled(currentPage < 1 ? true : false);
            nextButton.setDisabled(currentPage === (charaCollectionEmbedArray.length - 1) ? true : false);

            const responseOptions = {
                embeds: [charaCollectionEmbed],
                components: [charaCollectionComponentRow],
                files: [attachment]
            };

            let response;
            if (editReply && 'deferUpdate' in interaction) {
                await interaction.deferUpdate();
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
                    await handlePages(confirmation, true, currentPage - 1);
                } else if (confirmation.customId === 'next') {
                    await handlePages(confirmation, true, currentPage + 1);
                }
    
            } catch (error) {
                if (error instanceof Error && error.message === "Collector received no interactions before ending with reason: time") {
                } else {
                    console.log(`Collection Command Error: ${error}`)
                }
            }
        }
        await handlePages(interaction, editReply, 0);

    }
}