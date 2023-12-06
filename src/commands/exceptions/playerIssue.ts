import { CommandInteraction, EmbedBuilder } from "discord.js";
import { config } from "../../config";

export const playerIssue = (interaction: CommandInteraction) => {
    interaction.reply({
        embeds: [
            new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('⚠️ Uh-oh, Player Issue!')
                .setDescription(`We're sorry, but we either couldn't find the player you're looking for or the player isn't eligible for this action. The following players are not allowed:\n- Yourself\n- Bots\n- Unregistered players`)
                .setFooter({
                    text: config.messages.footerText,
                })
        ],
        ephemeral: true,
    });
};