"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const models_1 = require("../../models");
const redis_1 = require("../../lib/redis");
const team_1 = require("../character/team");
const config_1 = require("../../config");
const utils_1 = require("../../utils");
exports.default = {
    name: "deleteTeamModal",
    callback: async (client, interaction) => {
        try {
            const deleteTeamInput = interaction.fields.getTextInputValue('deleteTeamInput');
            let player = await (0, utils_1.getPlayer)(interaction);
            const teamExists = player.teams.some((team) => team.name === deleteTeamInput);
            if (!teamExists) {
                const noTeamEmbed = new discord_js_1.EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('⚠️ Team Not Found')
                    .setDescription(`Hmm, it seems like the team **${deleteTeamInput}** doesn't exist. Please make sure you've entered the correct team name. Remember, team names are case-sensitive. So, 'TeamA' and 'teama' are considered different teams. Let's try again!`)
                    .setFooter({
                    iconURL: interaction.client.user.displayAvatarURL({ extension: 'png', size: 512 }),
                    text: config_1.config.messages.footerText
                });
                await interaction.deferUpdate();
                await interaction.followUp({
                    embeds: [noTeamEmbed],
                    ephemeral: true
                });
            }
            else {
                player = await models_1.PlayerModel.findOneAndUpdate({ userId: interaction.user.id }, { $pull: { teams: { name: deleteTeamInput } } }, { new: true });
                await redis_1.default.set(interaction.user.id, JSON.stringify(player), 'EX', 60);
                const deleteSuccessEmbed = new discord_js_1.EmbedBuilder()
                    .setColor('Blurple')
                    .setTitle('🎉 Team Deletion Successful')
                    .setDescription(`Your team **${deleteTeamInput}**, has been successfully deleted. You can now create a new team or manage your existing teams. Remember, every end is a new beginning.`)
                    .setFooter({
                    iconURL: interaction.client.user.displayAvatarURL({ extension: 'png', size: 512 }),
                    text: config_1.config.messages.footerText
                });
                await interaction.deferUpdate();
                await interaction.followUp({
                    embeds: [deleteSuccessEmbed],
                    ephemeral: true
                });
                await team_1.default.callback(client, interaction, true, true);
            }
        }
        catch (error) {
            console.log(`Handle Submit Modal deleteTeamModal Error: ${error}`);
        }
    }
};
