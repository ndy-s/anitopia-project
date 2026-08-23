import { ActionRowBuilder, ApplicationCommandOptionType, AttachmentBuilder, ButtonBuilder, ButtonStyle, Client, CollectedInteraction, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import * as path from "path";
import { CharaCollectionModel } from "../../models";
import { ICharacterModel } from "../../interfaces";
import { mapRarity, resolveSkillFlavorText, xpToNextLevel } from "../../utils";
import collection from "./collection";
import { actionNA, characterNF, handleCollectorTimeout } from "../exceptions";
import { IPlayerModel } from '../../interfaces';
import { resolveElementIconPath } from "../../battle/renderBattleScene";

export default {
    name: 'info',
    description: 'Check your character details',
    cooldown: 5_000,
    options: [
        {
            name: 'character-id',
            description: "Enter your Character ID of the character you'd like to view",
            type: ApplicationCommandOptionType.String,
            min_length: 4,
            required: true,
        }
    ],
    deleted: false,

    // Optional
    devOnly: false,
    testOnly: false,
    botPermissions: [],
    permissionRequired: [],

    callback: async (client: Client, interaction: ChatInputCommandInteraction | CollectedInteraction, charaIdInput: string | null = null) => {
        let characterIdOptionValue: string | null = charaIdInput;

        if (interaction instanceof ChatInputCommandInteraction) {
            const optionValue = interaction.options.get('character-id')?.value;
            characterIdOptionValue = optionValue ? optionValue.toString().toUpperCase() : charaIdInput;
        }

        if (characterIdOptionValue && characterIdOptionValue.includes(' ')) {
            return characterNF(interaction, 'spaces');
        } else if (characterIdOptionValue && /[^a-zA-Z0-9]/.test(characterIdOptionValue)) {
            return characterNF(interaction, 'symbols');
        }

        const characterInfo = await CharaCollectionModel.findOne({ characterId: characterIdOptionValue })
            .populate({
                path: 'character',
                populate: [
                    { path: 'passiveSkill.skill' },
                    { path: 'activeSkill.skill' }
                ]
            })
            .populate('playerId');

        if (!characterInfo || !characterInfo.character) {
            return characterNF(interaction);
        }

        const isIPlayerModel = (obj: any): obj is IPlayerModel => obj && typeof obj.userId === 'string';

        if (isIPlayerModel(characterInfo.playerId) && characterInfo.playerId.userId !== interaction.user.id) {
            return characterNF(interaction, 'notOwned');
        }

        const rarity = mapRarity(Number(characterInfo.rarity));
        const character = characterInfo.character as ICharacterModel;

        const characterCount = await CharaCollectionModel.countDocuments({ 
            character: character._id, 
            rarity: characterInfo.rarity
        });

        const portraitPath = resolveElementIconPath(character.element);
        const portraitFilename = path.basename(portraitPath);
        const portraitAttachment = new AttachmentBuilder(portraitPath, { name: portraitFilename });

        const passiveEffects = (character.passiveSkill.skill as any)?.rarityEffects?.get?.(rarity)?.effects ?? [];
        const activeEffects = (character.activeSkill.skill as any)?.rarityEffects?.get?.(rarity)?.effects ?? [];

        const characterInfoEmbed = new EmbedBuilder()
            .setColor('Blurple')
            .setAuthor({
                name: `${interaction.user.username}'s Character Info`,
                iconURL: interaction.user.displayAvatarURL(),
            })
            .setTitle(`${character.name} (${character.fullname}) Lv. ${characterInfo.level}`)
            .setThumbnail(`attachment://${portraitFilename}`)
            .addFields(
                {
                    name: 'Character ID',
                    value: `\`${characterInfo.characterId}\``,
                    inline: true
                },
                {
                    name: 'EXP',
                    value: `${characterInfo.experience}/${xpToNextLevel(characterInfo.level)}`,
                    inline: true,
                },
                {
                    name: `Rarity`,
                    value: `__**${rarity}**__`,
                    inline: true,
                },
                {
                    name: 'Series',
                    value: `${character.series}`,
                    inline: true
                },
                {
                    name: 'Element',
                    value: `${character.element}`,
                    inline: true, 
                },
                {
                    name: `Class`,
                    value: `${character.class}`,
                    inline: true
                },
                {
                    name: `Attributes`,
                    value: 
                        `❤️ **Health**: ${characterInfo.attributes.health} • ` +
                        `⚔️ **Attack**: ${characterInfo.attributes.attack} • ` +
                        `🛡️ **Defense**: ${characterInfo.attributes.defense} • ` +
                        `💨 **Speed**: ${characterInfo.attributes.speed}`,
                    inline: false,
                },
                {
                    name: `Passive Skill`,
                    value: `**${character.passiveSkill.name}**: ${resolveSkillFlavorText(character.passiveSkill.flavorTemplate, passiveEffects)}`
                },
                {
                    name: "Active Skill",
                    value: `**${character.activeSkill.name}**: ${resolveSkillFlavorText(character.activeSkill.flavorTemplate, activeEffects)}`
                },
                {
                    name: "Catchphrase",
                    value: `_"${character.quotes}"_`
                }
            )
            .setFooter({
                text: `Guess what? There are ${characterCount} ${rarity} ${character.name} in existence!`
            });

        const backButton = new ButtonBuilder()
            .setCustomId('backCollection')
            .setLabel('Collection')
            .setStyle(ButtonStyle.Secondary);

        const charaInfoComponentRow = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                backButton,
            );
        
        const responseOptions = {
            embeds: [characterInfoEmbed],
            components: [charaInfoComponentRow],
            files: [portraitAttachment]
        };

        if ('deferUpdate' in interaction && charaIdInput) await interaction.deferUpdate();
        const response = charaIdInput ? await interaction.editReply(responseOptions): await interaction.reply(responseOptions);

        const collectorFilter = (i: {
            reply(arg0: { embeds: EmbedBuilder[]; ephemeral: boolean; }): unknown;               
            user: { id: string; username: string; };
        }) => {
            if (i.user.id !== interaction.user.id) {
                actionNA(i, interaction.user.username);
                return false;
            }

            return true;
        };

        try {
            const confirmation = await response.awaitMessageComponent({
                filter: collectorFilter,
                time: 300_000
            });

            if (confirmation.customId === 'backCollection') {
                await collection.callback(client, confirmation, true);
            } 

        } catch (error) {
            await handleCollectorTimeout(error, interaction, characterInfoEmbed, '/info', 'Info Command');
        }

    }
}