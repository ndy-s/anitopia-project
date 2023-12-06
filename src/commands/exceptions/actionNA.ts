import { EmbedBuilder } from "discord.js";
import { config } from "../../config";

export const actionNA = (interaction: { 
    reply(arg0: { embeds: EmbedBuilder[]; ephemeral: boolean; }): unknown;               
    user: { username: string; };
}, authorizedUser: string) => {
    interaction.reply({
        embeds: [
            new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('🚫 Action Not Allowed')
                .setDescription(`Sorry, **${interaction.user.username}**! You are not authorized to perform this action. Currently, only **${authorizedUser}** has the permission to do so.`)
                .setFooter({
                    text: config.messages.footerText,
                })
        ],
        ephemeral: true,
    });
};