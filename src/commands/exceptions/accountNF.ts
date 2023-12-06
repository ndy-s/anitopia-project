import { CommandInteraction, EmbedBuilder } from "discord.js";
import { config } from "../../config";

export const accountNF = (interaction: CommandInteraction) => {
    interaction.reply({ embeds: [
        new EmbedBuilder()
            .setColor('#FF0000')
            .setAuthor({
                name: `${interaction.user.username}#${interaction.user.discriminator}`,
                iconURL: interaction.user.displayAvatarURL()
            })
            .setTitle("Anitopian Not Found❗")
            .setDescription(`Oh dear, it seems that you hasn't registered yet!`)
            .setFooter({
                text: config.messages.footerText
            })
    ]});
};