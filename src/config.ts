import { CommandInteraction, EmbedBuilder, ModalSubmitInteraction } from "discord.js";

export const config = {
    messages: {
        footerText: "For assistance or to report issues, please contact our support team.",
    },
    commands: {
        registerCommandTag: "</register:1160263671814045898>",
        profileCommandTag: "</profile:1160263750981529640>",
        mainCommandTag: "</main:1160515892803817482>",
    },
};

export const configProfileEmbed = (interaction: CommandInteraction | ModalSubmitInteraction, account: any) => {
    return new EmbedBuilder()
        .setColor('Blurple')
        .setAuthor({
            name: `${interaction.user.username}'s Profile`,
            iconURL: interaction.user.displayAvatarURL(),
        })
        .setTitle('Account Details')
        .setThumbnail(interaction.user.displayAvatarURL())
        .setDescription(`**Biography:**\n\`\`\`${account.bio}\`\`\`\nExplore more options by selecting from the menu below. To personalize your profile, select **Customize Profile**.`)
        .addFields(
            {
                name: 'Level',
                value: `${account.level}`,
                inline: true
            },
            {
                name: `Experience Points`,
                value: `${account.exp}/10000`,
                inline: true
            },
            {
                name: 'Token',
                value: `\`${account.token}\``,
                inline: true
            },
            {
                name: 'Golden Coins',
                value: `${account.goldenCoins}`,
                inline: true
            },
            {
                name: 'Stellar Crystals',
                value: `${account.stellarCrystals}`,
                inline: true
            },
        )
        .setFooter({
            text: `Protip: you can find others using their tokens!`,
        });
}