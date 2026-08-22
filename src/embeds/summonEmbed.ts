import { CollectedInteraction, CommandInteraction, EmbedBuilder } from "discord.js";
import { mapRarity } from "../utils";

export const configCharacterSummonedEmbed = (interaction: CommandInteraction | CollectedInteraction, summonedCharacterData: any, characterId: string, scrollName: string = 'Novice') => {
    const rarity = mapRarity(summonedCharacterData.rarity);

    return new EmbedBuilder()
        .setColor('Blurple')
        .setAuthor({
            name: interaction.user.username,
            iconURL: interaction.user.displayAvatarURL(),
        })
        .setTitle(`${scrollName} Scroll Summon`)
        .setThumbnail('https://images-ext-1.discordapp.net/external/huMhSM-tW8IbG2kU1hR1Q-pI-A44b74PL_teDZ7nhVc/https/www.vhv.rs/dpng/d/28-280300_konosuba-megumin-explosion-megumin-chibi-png-transparent-png.png?width=566&height=671')
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
                value: `**${summonedCharacterData.character.passiveSkill.name}**: ${summonedCharacterData.character.passiveSkill.descriptions[rarity]}`
            },
            {
                name: "Active Skill",
                value: `**${summonedCharacterData.character.activeSkill.name}**: ${summonedCharacterData.character.activeSkill.descriptions[rarity]}`
            },
            {
                name: "Catchphrase",
                value: `_"${summonedCharacterData.character.quotes}"_`
            }
        );
};
