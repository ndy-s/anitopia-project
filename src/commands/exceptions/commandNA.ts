import { CommandInteraction, EmbedBuilder } from "discord.js";
import { config } from "../../config";

export default (interaction: CommandInteraction) => {
    interaction.reply({
        embeds: [
            new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('⚠️ Command Not Available')
                .setDescription("Sorry, this command is **server-specific** and cannot be used in direct messages. Please use this command within a server.")
                .setFooter({
                    text: config.messages.footerText
                })
        ],
        ephemeral: true,
    });
}