import { ActionRowBuilder, Client, CollectedInteraction, EmbedBuilder, ModalBuilder, ModalSubmitInteraction, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import { closest } from "fastest-levenshtein";
import { getPlayer, hiddenValues, mapRarity } from "../../utils";
import { ICharaCollectionModel, ICharacterModel, ILineup, ITeams } from "../../interfaces";
import team from "../character/team";
import { CharacterModel } from "../../models";

export default {
    name: 'detailTeamModal',
    callback: async function callback(client: Client, interaction: ModalSubmitInteraction | CollectedInteraction, teamInput: string | null = null, doDeferUpdate: boolean = true) {
        try {
            let detailTeamInput = teamInput;
            if (teamInput === null && interaction.isModalSubmit()) {
                detailTeamInput = interaction.fields.getTextInputValue('detailTeamInput').toUpperCase();
            }

            const player = await getPlayer(interaction);
            const teamNames = player.teams.map((team: ITeams) => team.name);
            
            if (detailTeamInput !== null) {
                const closestTeamName = closest(detailTeamInput, teamNames);
                const closestTeam = player.teams.find((team: ITeams) => team.name === closestTeamName);

                // const positions = ['frontMiddle', 'backLeft', 'backRight'];
                // const characterIds: string[] = [];
                
                // const lines = positions.map(position => closestTeam?.lineup.find((line: ILineup) => line.position === position));
                
                // const characters: Record<string, any> = {};
                // lines.filter(line => line).forEach(line => {
                //     characterIds.push(line?.character?.character);
                //     characters[line.position] = { playerChara: line?.character };
                // });

                // const charactersData = await CharacterModel.find({ '_id': { $in: characterIds } });
                // const charactersDataMap = charactersData.reduce((map: Record<string, ICharacterModel>, characterData) => {
                //     map[characterData._id] = characterData;
                //     return map;
                // }, {});

                // Object.keys(characters).forEach(position => {
                //     const id = characters[position].playerChara?.character;
                //     characters[position].character = charactersDataMap[id] || null;
                // });

                const positions = ['frontMiddle', 'backLeft', 'backRight'];
                const characters: Record<string, any> = {};
                const characterPromises: Promise<ICharacterModel>[] = [];

                positions.forEach(position => {
                    const line = closestTeam?.lineup.find((line: ILineup) => line.position === position);
                    if (line) {
                        characters[position] = { playerChara: line?.character };
                        characterPromises.push(CharacterModel.findOne({ '_id': line?.character?.character }) as Promise<ICharacterModel>);
                    }
                });

                const charactersData = await Promise.all(characterPromises);

                charactersData.forEach((characterData, index) => {
                    characters[positions[index]].character = characterData;
                });

                let totalAttributes = {
                    health: 0,
                    attack: 0,
                    defense: 0,
                    speed: 0
                };
                
                Object.values(characters).forEach(character => {
                    if (character.character) {
                        totalAttributes.health += character.character.attributes.health;
                        totalAttributes.attack += character.character.attributes.attack;
                        totalAttributes.defense += character.character.attributes.defense;
                        totalAttributes.speed += character.character.attributes.speed;
                    }
                });

                const formatEmbedValue = (position: string) => {
                    if (!characters[position].character) {
                        return '🔸_**Empty Slot**_\n_None_\n_None_ • _None_';
                    }
                
                    const character = characters[position].character;
                    const playerChara = characters[position].playerChara;
                
                    return `🔹 **${character.name} Lv. ${playerChara.level}**\n${character.fullname}\n\`${playerChara.characterId}\` • __**${mapRarity(playerChara.rarity)}**__`;
                };

                const embed = new EmbedBuilder()
                    .setColor('Blurple')
                    .setAuthor({
                        name: `${interaction.user.username}`,
                        iconURL: interaction.user.displayAvatarURL(),
                    })
                    .setTitle(`Team Formation • ${closestTeam.name}`)
                    .setDescription(`The team formation is based on the team size and the positions of the players. The team size is ${closestTeam.size}. The positions include front, back left, and back right.`)
                    .addFields(
                        {
                            name: 'Position 1',
                            value: formatEmbedValue('frontMiddle'),
                            inline: true
                        }, 
                        {
                            name: 'Position 2',
                            value: formatEmbedValue('backLeft'),
                            inline: true
                        }, 
                        {
                            name: 'Position 3',
                            value: formatEmbedValue('backRight'),
                            inline: true
                        },
                        {
                            name: 'Total Attributes',
                            value: `❤️ **Health**: ${totalAttributes.health} • ⚔️ **Attack**: ${totalAttributes.attack} • 🛡️ **Defense**: ${totalAttributes.defense} • 💨 **Speed**: ${totalAttributes.speed}\n👊 **Power**: ${totalAttributes.health + totalAttributes.attack + totalAttributes.defense + totalAttributes.speed}`
                        },
                    )
                    .setFooter({
                        iconURL: interaction.client.user.displayAvatarURL({ extension: 'png', size: 512}),
                        text: 'Select an option from the menu bellow to manage your team details.',
                    });

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
                            .setLabel('Activate Team')
                            .setDescription('Activate this team for your upcoming battles!')
                            .setValue('active')
                            .setEmoji('🚀'),
                        new StringSelectMenuOptionBuilder()
                            .setLabel('Edit Formation')
                            .setDescription('Click here to modify your team formation')
                            .setValue('editTeamFormation')
                            .setEmoji('🔄')
                    );

                const teamFormationComponentRow = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(teamFormationOption);

                if (interaction.isModalSubmit() && doDeferUpdate) {
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
                            async function editTeamFormation(confirmation: CollectedInteraction | ModalSubmitInteraction) {
                                const editTeamFormationModal = new ModalBuilder()
                                    .setCustomId('editTeamFormationModal')
                                    .setTitle('Edit Team Formation');

                                const frontMiddleInput = new TextInputBuilder()
                                    .setCustomId('frontMiddleInput')
                                    .setLabel(`Position 1 ${characters['frontMiddle'].character ? '• ' + characters['frontMiddle'].character.fullname : ''}`)
                                    .setPlaceholder('Enter Character ID')
                                    .setValue(characters['frontMiddle'].playerChara?.characterId ?? '')
                                    .setStyle(TextInputStyle.Short)
                                    .setRequired(false);

                                const backLeftInput = new TextInputBuilder()
                                    .setCustomId('backLeftInput')
                                    .setLabel(`Position 2 ${characters['backLeft'].character ? '• ' + characters['backLeft'].character.fullname : ''}`)
                                    .setPlaceholder('Enter Character ID')
                                    .setValue(characters['backLeft'].playerChara?.characterId ?? '')
                                    .setStyle(TextInputStyle.Short)
                                    .setRequired(false);

                                const backRightInput = new TextInputBuilder()
                                    .setCustomId('backRightInput')
                                    .setLabel(`Position 3 ${characters['backRight'].character ? '• ' + characters['backRight'].character.fullname : ''}`)
                                    .setPlaceholder('Enter Character ID')
                                    .setValue(characters['backRight'].playerChara?.characterId ?? '')
                                    .setStyle(TextInputStyle.Short)
                                    .setRequired(false);

                                editTeamFormationModal.addComponents(
                                    new ActionRowBuilder<TextInputBuilder>().addComponents(frontMiddleInput),
                                    new ActionRowBuilder<TextInputBuilder>().addComponents(backLeftInput),
                                    new ActionRowBuilder<TextInputBuilder>().addComponents(backRightInput),
                                );

                                if (!(confirmation instanceof ModalSubmitInteraction)) {
                                    await confirmation.showModal(editTeamFormationModal);
                                }

                                hiddenValues.set(interaction.user.id, closestTeamName);

                                teamFormationOption.setCustomId('teamFormationOptionModal');

                                const response = await confirmation.editReply({
                                    components: [new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(teamFormationOption)]
                                });

                                try {
                                    const confirmation = await response.awaitMessageComponent({
                                        filter: collectorFilter,
                                        time: 300_000
                                    });

                                    if (confirmation.customId === 'teamFormationOptionModal' && 'values' in confirmation) {
                                        if (confirmation.values.includes('back')) {
                                            await team.callback(client, confirmation, true);
                                        } else if (confirmation.values.includes('editTeamFormation')) {
                                            await editTeamFormation(confirmation);
                                        }
                                    }
                                } catch (error) {
                                    if (error instanceof Error && error.message === "Collector received no interactions before ending with reason: time") {
                                        embed.setFooter({
                                            text: `⏱️ This command is only active for 5 minutes. To use it again, please type /team.`
                                        });
                        
                                        await interaction.editReply({
                                            embeds: [embed],
                                            components: []
                                        });
                                    } else {
                                        console.log(`Detail Team Command Error: ${error}`)
                                    }
                                }
                            }
                            await editTeamFormation(confirmation);
                        }
                    }
                } catch (error) {
                    if (error instanceof Error && error.message === "Collector received no interactions before ending with reason: time") {
                        embed.setFooter({
                            text: `⏱️ This command is only active for 5 minutes. To use it again, please type /team.`
                        });
        
                        await interaction.editReply({
                            embeds: [embed],
                            components: []
                        });
                    } else {
                        console.log(`Detail Team Command Error: ${error}`)
                    }
                }
            }
        } catch (error) {
            console.log(`Handle Submit Modal detailTeamModal Error: ${error}`);
        }
    }
}