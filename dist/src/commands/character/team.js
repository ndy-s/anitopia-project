"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const character_1 = require("./character");
const utils_1 = require("../../utils");
const config_1 = require("../../config");
exports.default = {
    name: 'team',
    description: 'Create your team',
    cooldown: 5000,
    options: [],
    deleted: false,
    // Optional
    devOnly: false,
    testOnly: false,
    botPermissions: [],
    permissionRequired: [],
    callback: async function callback(client, interaction, editReply = false, resetComponents = false) {
        const player = await (0, utils_1.getPlayer)(interaction);
        let teamFields = [];
        for (let i = 0; i < player.teams.length; i++) {
            let isActive = '';
            if (player.activeTeams.teamOfThree === player.teams[i].name || player.activeTeams.teamOfFive === player.teams[i].name) {
                isActive = '• __Active__';
            }
            teamFields.push({
                name: `🔹 ${player.teams[i].name} ${isActive}`,
                value: `Team of ${player.teams[i].size}`,
                inline: true
            });
        }
        for (let i = player.teams.length; i < 6; i++) {
            teamFields.push({
                name: `🔸_Empty Slot_`,
                value: '_Available for a new team_',
                inline: true
            });
        }
        const teamEmbed = new discord_js_1.EmbedBuilder()
            .setColor('Blurple')
            .setAuthor({
            name: `${interaction.user.username}'s Teams`,
            iconURL: interaction.user.displayAvatarURL(),
        })
            .setTitle(`Team Management`)
            .setDescription(`This is your current lineup of teams for battles. You can have one **Active Team of 3** and one **Active Team of 5** selected for battles at any time. The other teams are available for selection.`)
            .addFields(...teamFields)
            .setFooter({
            iconURL: interaction.client.user.displayAvatarURL({ extension: 'png', size: 512 }),
            text: 'Select an option from the menu bellow to manage your team.',
        });
        const teamOption = new discord_js_1.StringSelectMenuBuilder()
            .setCustomId('teamOption')
            .setPlaceholder('Select an action for you team')
            .addOptions(new discord_js_1.StringSelectMenuOptionBuilder()
            .setLabel('Back')
            .setDescription('Return to the character menu')
            .setValue('back')
            .setEmoji('🔙'), new discord_js_1.StringSelectMenuOptionBuilder()
            .setLabel('Create Team')
            .setDescription('Create a new team')
            .setValue('create')
            .setEmoji('🆕'), new discord_js_1.StringSelectMenuOptionBuilder()
            .setLabel('View or Update Team')
            .setDescription('View or update your team details')
            .setValue('viewOrUpdate')
            .setEmoji('🔍'), new discord_js_1.StringSelectMenuOptionBuilder()
            .setLabel('Delete Team')
            .setDescription('Remove your team')
            .setValue('delete')
            .setEmoji('🗑️'));
        const teamComponentRow = new discord_js_1.ActionRowBuilder().addComponents(teamOption);
        const responseOptions = {
            embeds: [teamEmbed],
            components: [teamComponentRow],
            files: []
        };
        if ('deferUpdate' in interaction && editReply && !resetComponents) {
            await interaction.deferUpdate();
        }
        const response = editReply ? await interaction.editReply(responseOptions) : await interaction.reply(responseOptions);
        const collectorFilter = (i) => i.user.id === interaction.user.id;
        try {
            const confirmation = await response.awaitMessageComponent({
                filter: collectorFilter,
                time: 300000
            });
            if (confirmation.customId === 'teamOption' && 'values' in confirmation) {
                if (confirmation.values.includes('back')) {
                    await character_1.default.callback(client, confirmation, false, true);
                }
                else if (confirmation.values.includes('create')) {
                    if (player.teams.length < 6) {
                        const createTeamModal = new discord_js_1.ModalBuilder()
                            .setCustomId('createTeamModal')
                            .setTitle('Create a New Team');
                        const createTeamInput = new discord_js_1.TextInputBuilder()
                            .setCustomId('createTeamInput')
                            .setLabel('Team Name')
                            .setPlaceholder('Enter a unique alphanumeric team name')
                            .setStyle(discord_js_1.TextInputStyle.Short)
                            .setRequired(true);
                        createTeamModal.addComponents(new discord_js_1.ActionRowBuilder().addComponents(createTeamInput));
                        if (!(confirmation instanceof discord_js_1.ModalSubmitInteraction)) {
                            await confirmation.showModal(createTeamModal);
                        }
                    }
                    else {
                        const teamFullEmbed = new discord_js_1.EmbedBuilder()
                            .setColor('#FF0000')
                            .setTitle('🚫 Team Limit Reached')
                            .setDescription(`Uh-oh! 🚦 It seems you've reached your team limit. You currently have **6 teams**, which is the maximum allowed. But don't worry, there's a solution! 🛠️\n\nIf you're eager to create a new team, you'll need to **remove one of your existing teams first**. This might seem like a tough decision, but it's also an opportunity to strategize and optimize your teams. 🧠💡\n\nWe appreciate your understanding and cooperation. Happy team building! 😊🎉`)
                            .setFooter({
                            iconURL: interaction.client.user.displayAvatarURL({ extension: 'png', size: 512 }),
                            text: config_1.config.messages.footerText
                        });
                        await confirmation.deferUpdate();
                        await confirmation.followUp({
                            embeds: [teamFullEmbed],
                            ephemeral: true
                        });
                    }
                    await callback(client, confirmation, true, true);
                }
                else if (confirmation.values.includes('viewOrUpdate')) {
                    const detailTeamModal = new discord_js_1.ModalBuilder()
                        .setCustomId('detailTeamModal')
                        .setTitle('Team Details');
                    const detailTeamInput = new discord_js_1.TextInputBuilder()
                        .setCustomId('detailTeamInput')
                        .setLabel('Team Name')
                        .setPlaceholder('Enter the team name you wish to view or edit')
                        .setStyle(discord_js_1.TextInputStyle.Short)
                        .setRequired(true);
                    detailTeamModal.addComponents(new discord_js_1.ActionRowBuilder().addComponents(detailTeamInput));
                    if (!(confirmation instanceof discord_js_1.ModalSubmitInteraction)) {
                        await confirmation.showModal(detailTeamModal);
                    }
                    await callback(client, confirmation, true, true);
                }
                else if (confirmation.values.includes('delete')) {
                    if (player.teams.length > 0) {
                        const deleteTeamModal = new discord_js_1.ModalBuilder()
                            .setCustomId('deleteTeamModal')
                            .setTitle('Delete a Team');
                        const deleteTeamInput = new discord_js_1.TextInputBuilder()
                            .setCustomId('deleteTeamInput')
                            .setLabel('Team Name')
                            .setPlaceholder('Enter the name of the team you wish to delete')
                            .setStyle(discord_js_1.TextInputStyle.Short)
                            .setRequired(true);
                        deleteTeamModal.addComponents(new discord_js_1.ActionRowBuilder().addComponents(deleteTeamInput));
                        if (!(confirmation instanceof discord_js_1.ModalSubmitInteraction)) {
                            await confirmation.showModal(deleteTeamModal);
                        }
                    }
                    else {
                        const noTeamEmbed = new discord_js_1.EmbedBuilder()
                            .setColor('#0099ff')
                            .setTitle('🔍 No Teams Found')
                            .setDescription(`It seems you don't have any teams yet. But don't worry, creating your first team is a great step towards exciting battles and quests! 🚀\n\nTo get started, you can use the **Create Team** option. This will allow you to form a new team and start your journey.`)
                            .setFooter({
                            iconURL: interaction.client.user.displayAvatarURL({ extension: 'png', size: 512 }),
                            text: config_1.config.messages.footerText
                        });
                        await confirmation.deferUpdate();
                        await confirmation.followUp({
                            embeds: [noTeamEmbed],
                            ephemeral: true
                        });
                    }
                    await callback(client, confirmation, true, true);
                }
            }
        }
        catch (error) {
            if (error instanceof Error && error.message === "Collector received no interactions before ending with reason: time") {
                teamEmbed.setFooter({
                    text: `⏱️ This command is only active for 5 minutes. To use it again, please type /team.`
                });
                await interaction.editReply({
                    embeds: [teamEmbed],
                    components: []
                });
            }
            else {
                console.log(`Team Command Error: ${error}`);
            }
        }
    }
};
