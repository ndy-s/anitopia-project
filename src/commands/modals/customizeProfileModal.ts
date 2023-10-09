import { Client, EmbedBuilder, ModalSubmitInteraction } from "discord.js";
import PlayerModel from "../../models/Player";
import redis from "../../lib/redis";
import { config, configProfileEmbed } from "../../config";

export default {
    name: "customizeProfileModal",

    callback: async (client: Client, interaction: ModalSubmitInteraction) => {
        try {
            const bioInput = interaction.fields.getTextInputValue('bioInput');
            let player = await PlayerModel.findOneAndUpdate(
                { userId: interaction.member && 'id' in interaction.member ? interaction.member.id : undefined },
                { bio: bioInput },
                { new: true}
            );

            await redis.set(interaction.user.id, JSON.stringify(player), 'EX', 60);

            const profileEmbed = configProfileEmbed(interaction, player);

            await interaction.deferUpdate();
            await interaction.editReply({
                embeds: [profileEmbed],
            });

            await interaction.followUp({
                embeds: [
                    new EmbedBuilder()
                        .setColor('Blurple')
                        .setAuthor({
                            name: interaction.user.username,
                            iconURL: interaction.user.displayAvatarURL(),
                        })
                        .setTitle('Profile Updated Successfully 🎉')
                        .setDescription(`Great job, ${interaction.user.username}! Your **Biography** have been successfully updated. Your unique personality shines through your profile! 🌟\n\nNow, let's dive back into the world of Anitopia. Your adventure awaits! 🚀`)
                        .setFooter({
                            text: config.messages.footerText
                        })
                ],
                ephemeral: true
            })

        } catch (error) {
            console.log(`Handle Submit Modal customizeProfileModal Error: ${error}`);
        }
    }
};