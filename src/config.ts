import { CollectedInteraction, CommandInteraction, EmbedBuilder, ModalSubmitInteraction } from "discord.js";
import { mapRarity } from "./utils";

export const config = {
    messages: {
        footerText: "For assistance or to report issues, please contact our support team.",
    },
    commands: {
        registerCommandTag: "</register:1160263671814045898>",
        mainCommandTag: "</main:1160515892803817482>",
        profileCommandTag: "</profile:1160505037873754194>",
        summonCommandTag: "</summon:1160947915456512000>",
        collectionCommandTag: "</collection:1166709129792978964>",
    },
};

export const configProfileEmbed = (interaction: CommandInteraction | ModalSubmitInteraction, player: any) => {
    return new EmbedBuilder()
        .setColor('Blurple')
        .setAuthor({
            name: `${interaction.user.username}'s Profile`,
            iconURL: interaction.user.displayAvatarURL(),
        })
        .setTitle('Account Details')
        .setThumbnail(interaction.user.displayAvatarURL())
        .setDescription(`**Biography**\n\`\`\`${player.bio}\`\`\`\nExplore more options by selecting from the menu below. To personalize your profile, select **Customize Profile**.`)
        .addFields(
            {
                name: '📊 Level',
                value: `${player.experience.level}`,
                inline: true
            },
            {
                name: `⭐ EXP`,
                value: `${player.experience.exp}/10000`,
                inline: true
            },
            {
                name: '🔑 Player ID',
                value: `\`${player.playerId}\``,
                inline: true
            },
            {
                name: '💰 AniCoins',
                value: `${player.balance.aniCoin}`,
                inline: true
            },
            {
                name: '💎 AniCrystals',
                value: `${player.balance.aniCrystal}`,
                inline: true
            },
        )
        .setFooter({
            iconURL: interaction.client.user.displayAvatarURL({ extension: 'png', size: 512}),
            text: `Tip: Use Player ID to connect with other players!`,
        });
};

export const configCharacterSummonedEmbed = (interaction: CommandInteraction | CollectedInteraction, summonedCharacterData: any, characterId: string) => {
    const rarity = mapRarity(summonedCharacterData.rarity);

    return new EmbedBuilder()
        .setColor('Blurple')
        .setAuthor({
            name: interaction.user.username,
            iconURL: interaction.user.displayAvatarURL(),
        })
        .setTitle('Novice Scroll Summon')
        .setThumbnail('https://images-ext-1.discordapp.net/external/huMhSM-tW8IbG2kU1hR1Q-pI-A44b74PL_teDZ7nhVc/https/www.vhv.rs/dpng/d/28-280300_konosuba-megumin-explosion-megumin-chibi-png-transparent-png.png?width=566&height=671')
        .setDescription(`Congratulations! You've successfully summoned **${summonedCharacterData.character.name} (${summonedCharacterData.character.fullname})** with the Novice Scroll.`)
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