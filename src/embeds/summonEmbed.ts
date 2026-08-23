import { AttachmentBuilder, CollectedInteraction, CommandInteraction, EmbedBuilder } from "discord.js";
import * as path from "path";
import { mapRarity, resolveSkillFlavorText } from "../utils";

const skillEffectsForRarity = (skillRef: any, rarity: string) => {
    const rarityEffects = skillRef.skill?.rarityEffects instanceof Map
        ? Object.fromEntries(skillRef.skill.rarityEffects)
        : (skillRef.skill?.rarityEffects ?? {});

    return rarityEffects[rarity]?.effects ?? [];
};

const RARITY_FRAME_FILE: Record<string, string> = {
    Common: 'rarity-common.png',
    Uncommon: 'rarity-uncommon.png',
    Rare: 'rarity-rare.png',
    Epic: 'rarity-epic.png',
    Legendary: 'rarity-legendary.png',
};

export const configCharacterSummonedEmbed = (interaction: CommandInteraction | CollectedInteraction, summonedCharacterData: any, characterId: string, scrollName: string = 'Novice') => {
    const rarity = mapRarity(summonedCharacterData.rarity);

    const rarityFrameFile = RARITY_FRAME_FILE[rarity] ?? RARITY_FRAME_FILE.Common;
    const rarityFrameAttachment = new AttachmentBuilder(
        path.join(__dirname, '..', 'public', 'icons', 'rarity', rarityFrameFile),
        { name: rarityFrameFile }
    );

    const embed = new EmbedBuilder()
        .setColor('Blurple')
        .setAuthor({
            name: interaction.user.username,
            iconURL: interaction.user.displayAvatarURL(),
        })
        .setTitle(`${scrollName} Scroll Summon`)
        .setThumbnail(`attachment://${rarityFrameFile}`)
        .setDescription(`Congratulations! You've successfully summoned **${summonedCharacterData.character.name} (${summonedCharacterData.character.fullname})** with the ${scrollName} Scroll.`)
        .addFields(
            {
                name: 'Character ID',
                value: `\`${characterId}\``,
                inline: true
            },
            {
                name: 'Series',
                value: `${summonedCharacterData.character.series}`,
                inline: true
            },
            {
                name: `Rarity`,
                value: `__**${rarity}**__`,
                inline: true,
            },
            {
                name: 'Element',
                value: `${summonedCharacterData.character.element}`,
                inline: true,
            },
            {
                name: `Class`,
                value: `${summonedCharacterData.character.class}`,
                inline: true
            },
            {
                name: `Health`,
                value: `${summonedCharacterData.character.attributes.health}`,
                inline: true,
            },
            {
                name: `Attack`,
                value: `${summonedCharacterData.character.attributes.attack}`,
                inline: true,
            },
            {
                name: `Defense`,
                value: `${summonedCharacterData.character.attributes.defense}`,
                inline: true,
            },
            {
                name: `Speed`,
                value: `${summonedCharacterData.character.attributes.speed}`,
                inline: true,
            },
            {
                name: `Passive Skill`,
                value: `**${summonedCharacterData.character.passiveSkill.name}**: ${resolveSkillFlavorText(summonedCharacterData.character.passiveSkill.flavorTemplate, skillEffectsForRarity(summonedCharacterData.character.passiveSkill, rarity))}`
            },
            {
                name: "Active Skill",
                value: `**${summonedCharacterData.character.activeSkill.name}**: ${resolveSkillFlavorText(summonedCharacterData.character.activeSkill.flavorTemplate, skillEffectsForRarity(summonedCharacterData.character.activeSkill, rarity))}`
            },
            {
                name: "Catchphrase",
                value: `_"${summonedCharacterData.character.quotes}"_`
            }
        );

    return { embed, files: [rarityFrameAttachment] };
};
