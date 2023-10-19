import { CommandInteraction, EmbedBuilder, ModalSubmitInteraction } from "discord.js";

export const config = {
    messages: {
        footerText: "For assistance or to report issues, please contact our support team.",
    },
    commands: {
        registerCommandTag: "</register:1160263671814045898>",
        profileCommandTag: "</profile:1160505037873754194>",
        mainCommandTag: "</main:1160515892803817482>",
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
            text: `Tip: Use Player ID to connect with other players!`,
        });
}