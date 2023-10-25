import { CollectedInteraction, CommandInteraction, EmbedBuilder } from "discord.js";
import { config } from "../../config";

export const pageNF = (interaction: CommandInteraction | CollectedInteraction, totalPages: number) => {
    interaction.reply({
        embeds: [
            new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('🔍 Page Not Found')
                .setDescription(`The page number you entered seems to be **out of range**. No worries, it happens to us sometimes! 😊 Please double-check and try again. Just to remind you, you have a total of **${totalPages} collection pages**. Happy browsing! 📚`)
                .setFooter({
                    text: config.messages.footerText
                })
        ],
        ephemeral: true,
    })
}