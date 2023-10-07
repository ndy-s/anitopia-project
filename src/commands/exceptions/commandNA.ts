import { CommandInteraction, EmbedBuilder } from "discord.js";
import { config } from "../../config";

export default (interaction: CommandInteraction) => {
    interaction.reply({
        embeds: [
            new EmbedBuilder()
                .setColor('Red')
                .setTitle('Command Not Allowed')
                .setDescription("This command can **only** be used **in a server**. Please run it within a server.")
                .setFooter({
                    text: config.messages.footerText
                })
        ],
        ephemeral: true,
    });
}