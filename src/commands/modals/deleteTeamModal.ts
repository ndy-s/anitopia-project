import { Client, EmbedBuilder, ModalSubmitInteraction } from "discord.js";
import { PlayerModel } from "../../models";
import redis from "../../lib/redis";
import team from "../character/team";
import { config } from "../../config";
import { getPlayer } from "../../utils";
import { ITeams } from "../../interfaces";

export default {
    name: "deleteTeamModal",
    callback: async (client: Client, interaction: ModalSubmitInteraction) => {
        try {
            const deleteTeamInput = interaction.fields.getTextInputValue('deleteTeamInput');

            let player = await getPlayer(interaction);
            const teamExists = player.teams.some((team: ITeams) => team.name === deleteTeamInput);

            if (!teamExists) {
                const noTeamEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('⚠️ Team Not Found')
                    .setDescription(`Hmm, it seems like the team **${deleteTeamInput}** doesn't exist. Please make sure you've entered the correct team name. Remember, team names are case-sensitive. So, 'TeamA' and 'teama' are considered different teams. Let's try again!`)
                    .setFooter({
                        iconURL: interaction.client.user.displayAvatarURL({ extension: 'png', size: 512}),
                        text: config.messages.footerText
                    });
            
                await interaction.deferUpdate();
                await interaction.followUp({
                    embeds: [noTeamEmbed],
                    ephemeral: true
                });
            } else {
                player = await PlayerModel.findOneAndUpdate(
                    { userId: interaction.user.id },
                    { $pull: { teams: { name: deleteTeamInput } } },
                    { new: true }
                );

                await redis.set(interaction.user.id, JSON.stringify(player), 'EX', 60);

                const deleteSuccessEmbed = new EmbedBuilder()
                    .setColor('Blurple')
                    .setTitle('🎉 Team Deletion Successful')
                    .setDescription(`Your team **${deleteTeamInput}**, has been successfully deleted. You can now create a new team or manage your existing teams. Remember, every end is a new beginning.`)
                    .setFooter({
                        iconURL: interaction.client.user.displayAvatarURL({ extension: 'png', size: 512}),
                        text: config.messages.footerText
                    });
    
                await interaction.deferUpdate();
                await interaction.followUp({
                    embeds: [deleteSuccessEmbed],
                    ephemeral: true
                });
                
                await team.callback(client, interaction, true, true);
            }
        } catch (error) {
            console.log(`Handle Submit Modal deleteTeamModal Error: ${error}`);
        }
    }
}