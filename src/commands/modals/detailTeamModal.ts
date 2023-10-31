import { ActionRowBuilder, Client, CollectedInteraction, EmbedBuilder, ModalBuilder, ModalSubmitInteraction, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import { closest } from "fastest-levenshtein";
import { getPlayer, hiddenValues } from "../../utils";
import { ILineup, ITeams } from "../../interfaces";
import team from "../character/team";
import { PlayerModel } from "../../models";

export default {
    name: 'detailTeamModal',
    callback: async function callback(client: Client, interaction: ModalSubmitInteraction | CollectedInteraction, teamInput: string | null = null) {
        try {
            let detailTeamInput = teamInput;
            if (interaction.isModalSubmit()) {
                detailTeamInput = interaction.fields.getTextInputValue('detailTeamInput').toLowerCase();
            }

            const player = await getPlayer(interaction);
            const teamNames = player.teams.map((team: ITeams) => team.name);
            
            if (detailTeamInput !== null) {
                const closestTeamName = closest(detailTeamInput, player.teams.map((team: ITeams) => team.name.toLowerCase()));
                const closestTeam = player.teams.find((team: ITeams) => team.name.toLowerCase() === closestTeamName);

                console.log(JSON.stringify(closestTeam, null, 2));

                const embed = new EmbedBuilder()
                    .setColor('Blurple')
                    .setAuthor({
                        name: `${interaction.user.username}`,
                        iconURL: interaction.user.displayAvatarURL(),
                    })
                    .setTitle(`Team __${closestTeam.name}__ Formation`)
                    .setDescription(`The team formation is based on the team size and the positions of the players. The team size is ${closestTeam.size}. The positions include front, back left, and back right.`)
                    .addFields(
                        {
                            name: 'Front Middle Position',
                            value: (() => {
                                const line = closestTeam?.lineup.find((line: ILineup) => line.position === 'frontMiddle');
                                if (line.character) {
                                    return `${line.character.character.name} **Lv**. ${line.character.level}\n**ID**: ${line.character.characterId} • __**${line.character.rarity}**__`;
                                } else {
                                    return 'None **Lv**. None\n**ID**: None • __**None**__';
                                }
                            })(),
                            inline: true
                        },
                        {
                            name: 'Back Left Position',
                            value: closestTeam.lineup.find((line: ILineup) => line.position === 'backLeft').name ?? 'None',
                            inline: true
                        },
                        {
                            name: 'Back Right Position',
                            value: closestTeam.lineup.find((line: ILineup) => line.position === 'backRight').name ?? 'None',
                            inline: true
                        },
                        {
                            name: 'Total Attributes',
                            value: 'None'
                        }
                    );

                const teamFormationOption = new StringSelectMenuBuilder()
                    .setCustomId('teamFormationOption')
                    .setPlaceholder('Select an action for your team formation')
                    .addOptions(
                        new StringSelectMenuOptionBuilder()
                            .setLabel('Back')
                            .setDescription('Return to the team menu')
                            .setValue('back')
                            .setEmoji('🔙'),
                        new StringSelectMenuOptionBuilder()
                            .setLabel('Edit Team Formation')
                            .setDescription('edit formation here')
                            .setValue('editTeamFormation')
                    );

                const teamFormationComponentRow = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(teamFormationOption);

                if (interaction.isModalSubmit()) {
                    await interaction.deferUpdate();
                }
                const response = await interaction.editReply({ 
                    embeds: [embed],
                    components: [teamFormationComponentRow]
                });

                const collectorFilter = (i: { user: { id: string }}) => i.user.id === interaction.user.id;

                try {
                    const confirmation = await response.awaitMessageComponent({
                        filter: collectorFilter,
                        time: 300_000
                    });

                    if (confirmation.customId === 'teamFormationOption' && 'values' in confirmation) {
                        if (confirmation.values.includes('back')) {
                            await team.callback(client, confirmation, true);
                        } else if (confirmation.values.includes('editTeamFormation')) {
                            const editTeamFormationModal = new ModalBuilder()
                                .setCustomId('editTeamFormationModal')
                                .setTitle('Edit Team Formation');

                            const frontMiddleInput = new TextInputBuilder()
                                .setCustomId('frontMiddleInput')
                                .setLabel('Front Middle Position')
                                .setPlaceholder('Enter Character ID')
                                .setStyle(TextInputStyle.Short);

                            const backLeftInput = new TextInputBuilder()
                                .setCustomId('backLeftInput')
                                .setLabel('Back Left Position')
                                .setPlaceholder('Enter Character ID')
                                .setStyle(TextInputStyle.Short);

                            const backRightInput = new TextInputBuilder()
                                .setCustomId('backRightInput')
                                .setLabel('Back Right Position')
                                .setPlaceholder('Enter Character ID')
                                .setStyle(TextInputStyle.Short);

                            editTeamFormationModal.addComponents(
                                new ActionRowBuilder<TextInputBuilder>().addComponents(frontMiddleInput),
                                new ActionRowBuilder<TextInputBuilder>().addComponents(backLeftInput),
                                new ActionRowBuilder<TextInputBuilder>().addComponents(backRightInput),
                            );

                            hiddenValues.set(interaction.user.id, closest(detailTeamInput, teamNames));
                            console.log(hiddenValues.get(interaction.user.id));


                            if (!(confirmation instanceof ModalSubmitInteraction)) {
                                await confirmation.showModal(editTeamFormationModal);
                            }

                            await callback(client, confirmation, closestTeamName);
                        }
                    }
                } catch (error) {
                    console.log(error);
                }
            }
        } catch (error) {
            console.log(`Handle Submit Modal detailTeamModal Error: ${error}`);
        }
    }
}