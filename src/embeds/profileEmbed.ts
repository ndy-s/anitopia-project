import { CommandInteraction, EmbedBuilder, ModalSubmitInteraction } from "discord.js";

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
            text: `You can use player ID to connect with other players.`,
        });
};
