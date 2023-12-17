import { CommandInteraction, EmbedBuilder } from "discord.js";
import { config } from "../../config";

export const teamNF = (interaction: CommandInteraction) => {
    interaction.reply({
        embeds: [
            new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('⚠️ **Team Not Found**')
                .setDescription(`It seems like you don\'t have an active team yet. To challenge others to a duel, you first need to create a team and set it as active. \n\nYou can do this by using the ${config.commands.teamCommandTag} command. Once your team is set and active, you will be all set to engage in a duel.`)
                .setFooter({
                    text: config.messages.footerText,
                })
        ],
        ephemeral: true,
    });
};
