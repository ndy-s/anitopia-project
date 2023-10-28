import { CommandInteraction, EmbedBuilder } from "discord.js";
import { config } from "../../config";

export const registrationNA = (interaction: CommandInteraction) => {
    interaction.reply({
        embeds: [
            new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('🚫 Registration Not Allowed')
                .setDescription(`Oops! It seems like you've **already registered**. No worries, you're all set to start your journey! Please **type** ${config.commands.mainCommandTag} to begin. Happy exploring! 🚀`)
                .setFooter({
                    iconURL: interaction.client.user.displayAvatarURL({ extension: 'png', size: 512}),
                    text: config.messages.footerText
                })
        ],
        ephemeral: true,
    });
};