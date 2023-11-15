import { ActionRowBuilder, Client, CollectedInteraction, EmbedBuilder, ModalBuilder, ModalSubmitInteraction, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import { closest } from "fastest-levenshtein";
import { getPlayer, hiddenValues, mapRarity } from "../../utils";
import { ICharaCollectionModel, ICharacterModel, ILineup, ITeams } from "../../interfaces";
import team from "../character/team";
import { CharacterModel, PlayerModel } from "../../models";
import redis from "../../lib/redis";
import { config } from "../../config";

export default {
    name: 'detailTeamModal',
    callback: async function callback(client: Client, interaction: ModalSubmitInteraction | CollectedInteraction, teamInput: string | null = null, doDeferUpdate: boolean = true) {
        try {
            let detailTeamInput = teamInput;
            if (teamInput === null && interaction.isModalSubmit()) {
                detailTeamInput = interaction.fields.getTextInputValue('detailTeamInput').toUpperCase();
            }

            let player = await getPlayer(interaction);
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

                const positions = closestTeam.size === 3 ? ['frontMiddle', 'backLeft', 'backRight'] : ['frontLeft', 'frontRight', 'backLeft', 'backMiddle', 'backRight'];
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

                const teamDetailEmbed = new EmbedBuilder()
                    .setColor('Blurple')
                    .setAuthor({
                        name: `${interaction.user.username}`,
                        iconURL: interaction.user.displayAvatarURL(),
                    })
                    .setTitle(`Team Formation • ${closestTeam.name}`)
                    .setDescription(`The team formation is based on the team size and the positions of the players. The team size is ${closestTeam.size}. The positions include front, back left, and back right.`)
                    .setFooter({
                        iconURL: interaction.client.user.displayAvatarURL({ extension: 'png', size: 512}),
                        text: 'Select an option from the menu bellow to manage your team details.',
                    });


                const totalAttributesValue = `❤️ **Health**: ${totalAttributes.health} • ⚔️ **Attack**: ${totalAttributes.attack} • 🛡️ **Defense**: ${totalAttributes.defense} • 💨 **Speed**: ${totalAttributes.speed}\n👊 **Power**: ${totalAttributes.health + totalAttributes.attack + totalAttributes.defense + totalAttributes.speed}`;
                    
                const teamDetailEmbedFields = positions.map((position, index) => ({
                    name: `Position ${index + 1}`,
                    value: formatEmbedValue(position),
                    inline: true
                }));
                    
                teamDetailEmbedFields.push({
                    name: 'Total Attributes',
                    value: totalAttributesValue,
                    inline: false
                });
                    
                teamDetailEmbed.addFields(...teamDetailEmbedFields);

                const teamField = closestTeam.size === 3 ? 'teamOfThree' : 'teamOfFive';
                const isTeamActive = player.activeTeams[teamField] === closestTeamName;
                const teamFormationOption = new StringSelectMenuBuilder()
                    .setCustomId('teamFormationOption')
                    .setPlaceholder('Select an action for your team formation')
                    .addOptions(
                        new StringSelectMenuOptionBuilder()
                            .setLabel('Back')
                            .setDescription('Return to the team menu')
                            .setValue('back')
                            .setEmoji('🔙'),
                        ...(isTeamActive ? [
                            new StringSelectMenuOptionBuilder()
                                .setLabel('Rest Team')
                                .setDescription('Deactivate your team to give them a rest!')
                                .setValue('deactivate')
                                .setEmoji('💤')
                        ] : [
                            new StringSelectMenuOptionBuilder()
                                .setLabel('Activate Team')
                                .setDescription('Prepare your team for the upcoming battles!')
                                .setValue('activate')
                                .setEmoji('🚀')
                        ]),
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
                    embeds: [teamDetailEmbed],
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
                        } else if (confirmation.values.includes('activate')) {
                            const teamSize = closestTeam.size === 3 ? 'Team of 3' : 'Team of 5';
                            
                            player = await PlayerModel.findOneAndUpdate(
                                { 
                                    userId: interaction.member && 'id' in interaction.member ? interaction.member.id : undefined,
                                },
                                { $set: { [`activeTeams.${teamField}`]: closestTeamName } },
                                { new: true }
                            ).populate('teams.lineup.character');
                            
                            await redis.set(interaction.user.id, JSON.stringify(player), 'EX', 60);
                            
                            const activationEmbed = new EmbedBuilder()
                                .setColor('Blurple')
                                .setTitle('✅ Team Activation Successful')
                                .setDescription(`Your **${teamSize}** named **${closestTeamName}** has been successfully activated.`)
                                .setFooter({
                                    iconURL: interaction.client.user.displayAvatarURL({ extension: 'png', size: 512}),
                                    text: `${config.messages.footerText}`
                                });
                            
                            await confirmation.deferUpdate();
                            await confirmation.followUp({
                                embeds: [activationEmbed],
                                ephemeral: true,
                            });
                            await callback(client, confirmation, closestTeamName, true);
                        } else if (confirmation.values.includes('deactivate')) {
                            const teamSize = closestTeam.size === 3 ? 'teamOfThree' : 'teamOfFive';
                        
                            player = await PlayerModel.findOneAndUpdate(
                                { 
                                    userId: interaction.member && 'id' in interaction.member ? interaction.member.id : undefined,
                                },
                                { $unset: { [`activeTeams.${teamSize}`]: "" } },
                                { new: true }
                            ).populate('teams.lineup.character');
                        
                            await redis.set(interaction.user.id, JSON.stringify(player), 'EX', 60);
                        
                            const deactivationEmbed = new EmbedBuilder()
                                .setColor('Blurple')
                                .setTitle('✅ Team Deactivation Successful')
                                .setDescription(`Your **${teamSize.replace('teamOf', 'team of ')}** named **${closestTeamName}** has been successfully deactivated.`)
                                .setFooter({
                                    iconURL: interaction.client.user.displayAvatarURL({ extension: 'png', size: 512}),
                                    text: `${config.messages.footerText}`
                                });
                        
                            await confirmation.deferUpdate();
                            await confirmation.followUp({
                                embeds: [deactivationEmbed],
                                ephemeral: true,
                            });
                            await callback(client, confirmation, closestTeamName, true);
                        } else if (confirmation.values.includes('editTeamFormation')) {
                            async function editTeamFormation(confirmation: CollectedInteraction | ModalSubmitInteraction) {
                                const editTeamFormationModal = new ModalBuilder()
                                    .setCustomId('editTeamFormationModal')
                                    .setTitle('Edit Team Formation');

                                const inputs = positions.map((position) => {
                                    const character = characters[position];
                                    const label = `Position ${positions.indexOf(position) + 1} ${character.character ? '• ' + character.character.fullname : ''}`;
                                    return new TextInputBuilder()
                                        .setCustomId(`${position}Input`)
                                        .setLabel(label)
                                        .setPlaceholder('Enter Character ID')
                                        .setValue(character.playerChara?.characterId ?? '')
                                        .setStyle(TextInputStyle.Short)
                                        .setRequired(false);
                                });

                                inputs.forEach((input) => {
                                    editTeamFormationModal.addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(input));
                                });

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
                                            await team.callback(client, confirmation);
                                        } else if (confirmation.values.includes('editTeamFormation')) {
                                            await editTeamFormation(confirmation);
                                        }
                                    }
                                } catch (error) {
                                    if (error instanceof Error && error.message === "Collector received no interactions before ending with reason: time") {
                                        teamDetailEmbed.setFooter({
                                            text: `⏱️ This command is only active for 5 minutes. To use it again, please type /team.`
                                        });
                        
                                        await interaction.editReply({
                                            embeds: [teamDetailEmbed],
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
                        teamDetailEmbed.setFooter({
                            text: `⏱️ This command is only active for 5 minutes. To use it again, please type /team.`
                        });
        
                        await interaction.editReply({
                            embeds: [teamDetailEmbed],
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