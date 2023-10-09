import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Client, CommandInteraction, EmbedBuilder } from "discord.js";

export default {
    name: 'summon',
    description: 'Summon you characters | temp.',
    cooldown: 5_000,
    options: [],
    deleted: false,
    
    // Optional
    devOnly: false,
    testOnly: false,
    botPermissions: [],
    permissionsRequired: [],

    callback: async (client: Client, interaction: CommandInteraction, followUp = false) => {
        const summonEmbed = new EmbedBuilder()
            .setColor('Blurple')
            .setAuthor({
                name: interaction.user.username,
                iconURL: interaction.user.displayAvatarURL(),
            })
            .setTitle('SUMMON')
            .setDescription('lets summon here!')
            .addFields(
                {
                    name: 'normal summon',
                    value: 'free sumon',
                    inline: true
                }
            )
        
        const summonButton: any = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('summon')
                    .setLabel('DO ssummon here')
                    .setStyle(ButtonStyle.Primary)
            );

        
        const responseOptions: any = {
            embeds: [summonEmbed],
            components: [summonButton],
        };
        let response = followUp ? await interaction.followUp(responseOptions) : await interaction.reply(responseOptions);
    }
}