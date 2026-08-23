import { ActionRowBuilder, ApplicationCommandOptionType, ButtonBuilder, ButtonStyle, Client, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { Character } from "../../classes/Character";
import { Team } from "../../classes/Team";
import { getPlayer, mapRarity, applyLevelGrowth } from "../../utils";
import { IPlayerModel, ITeams } from "../../interfaces";
import { PlayerModel } from "../../models";
import { config } from "../../config";
import { actionNA, playerIssue, handleCollectorTimeout } from "../exceptions";
import { runBattle, snapshotTeam } from "../../battle/runBattle";
import { presentBattleReplay } from "../../battle/battleReplay";
import { awardBattleExperience } from "../../battle/awardExperience";
import { buildBattleIntroEmbed, buildBattleTurnEmbed } from "../../embeds/battleEmbed";

export default {
    name: 'duel',
    description: 'Challenge another player to a team battle',
    cooldown: 5_000,
    options: [
        {
            name: 'user',
            description: 'Mention the player you want to duel with',
            type: ApplicationCommandOptionType.User,
            required: true,
        }
    ],
    deleted: false,
    
    // Optional
    devOnly: false,
    testOnly: false,
    botPermissions: [],
    permissionsRequired: [],

    callback: async (client: Client, interaction: ChatInputCommandInteraction) => {
        const userOptionValue: string = String(interaction.options.get('user')?.value);

        const opponentUser = await client.users.fetch(userOptionValue);
        const getOpponentUser = await PlayerModel.findOne({ 
            userId: userOptionValue 
        }).populate({
            path: 'teams.lineup.character',
            populate: {
                path: 'character',
                populate: [
                    { path: 'activeSkill.skill' },
                    { path: 'passiveSkill.skill' }
                ]
            },
        });

        if (getOpponentUser == null || opponentUser.id == interaction.user.id) {
            playerIssue(interaction);
            return;
        }

        const player = await getPlayer(interaction);

        const duelEmbed = new EmbedBuilder()
            .setColor('Blurple')
            .setAuthor({
                name: interaction.user.username,
                iconURL: interaction.user.displayAvatarURL(),
            })
            .setTitle('Duel Options')
            .setDescription(`You're challenging **${opponentUser.username} (${getOpponentUser?.playerId})** to a friendly duel. Choose the duel type:\n - **Team of 3**\n- **Team of 5**`)
            .setFooter({
                text: 'Select an option below for your duel type.',
            });
    
        const teamOf3Button = new ButtonBuilder()
            .setCustomId('teamOf3')
            .setLabel('Team of 3')
            .setStyle(ButtonStyle.Primary);

        const teamOf5Button = new ButtonBuilder()
            .setCustomId('teamOf5')
            .setLabel('Team of 5')
            .setDisabled(true)
            .setStyle(ButtonStyle.Primary);

        const duelComponentRow = new ActionRowBuilder<ButtonBuilder>().addComponents(teamOf3Button, teamOf5Button);
        const response = await interaction.reply({
            embeds: [duelEmbed],
            components: [duelComponentRow],
        });

        const collectorFilter = (i: {
            reply(arg0: { embeds: EmbedBuilder[]; ephemeral: boolean; }): unknown;               
            user: { id: string; username: string; };
        }) => {
            if (i.user.id !== interaction.user.id) {
                actionNA(i, interaction.user.username);
                return false;
            }
            return true;
        };

        try {
            const confirmation = await response.awaitMessageComponent({
                filter: collectorFilter,
                time: 60_000
            });

            if (confirmation.customId === 'teamOf3') {
                let timeLeft = 30;
            
                const findTeam = (player: IPlayerModel, teamName: string): ITeams => player.teams.find(team => team.name === teamName)!;
                
                const activeTeamOfThree: ITeams = findTeam(player, player.activeTeams.teamOfThree);
                const opponentActiveTeamOfThree: ITeams = findTeam(getOpponentUser, getOpponentUser?.activeTeams?.teamOfThree ?? '');

                const teamHasCharacters = (team: ITeams): boolean => team?.lineup.some(member => member.character !== null) ?? false;
                
                const duelRequestEmbed = new EmbedBuilder()
                    .setColor('Blurple')
                    .setAuthor({
                        name: interaction.user.username,
                        iconURL: interaction.user.displayAvatarURL(),
                    });

                if (!teamHasCharacters(activeTeamOfThree)) {
                    duelRequestEmbed.setTitle(`⚠️ Duel Request Failed`);
                    duelRequestEmbed.setDescription(`**<@!${interaction.user.id}>**, you haven't set up an active team yet or your team doesn't have any characters. Unfortunately, this **Team of 3** duel can't start until you set up an active team with characters.`);
                    duelRequestEmbed.setFooter({
                        text: `⏳ This command will be automatically deleted in ${timeLeft} second${timeLeft > 1 ? 's' : ''}.`,
                    });
                } else if (!teamHasCharacters(opponentActiveTeamOfThree)) {
                    duelRequestEmbed.setTitle(`⚠️ Duel Request Failed`);
                    duelRequestEmbed.setDescription(`**${opponentUser.username} (Opponent)** hasn't set up an active team yet or their team doesn't have any characters. Unfortunately, this **Team of 3** duel can't start until the opponent sets up an active team with characters.`);
                    duelRequestEmbed.setFooter({
                        text: `⏳ This command will be automatically deleted in ${timeLeft} second${timeLeft > 1 ? 's' : ''}.`,
                    });
                } else {
                    const calculatePower = (team: ITeams) => {
                        let power = 0;
                        team.lineup.forEach(character => {
                            if (character.character && 'attributes' in character.character) {
                              power += Object.values(character.character.attributes).reduce((sum, attribute) => sum + attribute, 0);
                            }
                        });
                        return power;
                    };

                    duelRequestEmbed.setTitle('Duel Request');
                    duelRequestEmbed.setDescription(`Hello **${opponentUser}**! You've been invited by **${interaction.user.username} (${player.playerId})** for a friendly **Team of 3** duel! Are you ready for the challenge?`);
                    duelRequestEmbed.addFields(
                        {
                            name: `${interaction.user.username} (Challenger)`,
                            value: `**Team Name**: ${player.activeTeams.teamOfThree}\n**Power**: ${calculatePower(activeTeamOfThree)}`,
                            inline: true,
                        },
                        {
                            name: `${opponentUser.username} (Opponent)`,
                            value: `**Team Name**: ${getOpponentUser.activeTeams.teamOfThree ?? '_None_'}\n**Power**: ${calculatePower(opponentActiveTeamOfThree)}`,
                            inline: true,
                        }
                    )
                    duelRequestEmbed.setFooter({
                        text: 'Click the accept button to start the duel.',
                    });
                }

                const acceptButton = new ButtonBuilder()
                    .setCustomId('accept')
                    .setLabel('Accept')
                    .setStyle(ButtonStyle.Success)
                    .setDisabled(!teamHasCharacters(activeTeamOfThree) || !teamHasCharacters(opponentActiveTeamOfThree) ? true : false);
            
                const declineButton = new ButtonBuilder()
                    .setCustomId('decline')
                    .setLabel('Decline')
                    .setStyle(ButtonStyle.Danger)
                    .setDisabled(!teamHasCharacters(activeTeamOfThree) || !teamHasCharacters(opponentActiveTeamOfThree) ? true : false);

                const duelRequestComponentRow = new ActionRowBuilder<ButtonBuilder>()
                    .addComponents(acceptButton, declineButton);

                await confirmation.deferUpdate();
                const response = await confirmation.editReply({
                    embeds: [duelRequestEmbed],
                    components: [duelRequestComponentRow],
                })

                const cancelEmbed = new EmbedBuilder()
                    .setColor('Red')
                    .setAuthor({
                        name: `${interaction.user.username}`,
                        iconURL: interaction.user.displayAvatarURL(),
                    })
                    .setTitle(`⛔ Duel Request Cancelled`)
                    .setFooter({
                        text: config.messages.footerText,
                    });

                if (!teamHasCharacters(activeTeamOfThree) || !teamHasCharacters(opponentActiveTeamOfThree)) {
                    const intervalId = setInterval(async () => {
                        timeLeft--;
                        duelRequestEmbed.setFooter({
                            text: `⏳ This command will be automatically deleted in ${timeLeft} second${timeLeft > 1 ? 's' : ''}.`,
                        });

                        await interaction.editReply({
                            embeds: [duelRequestEmbed],
                        });

                        if (timeLeft === 0) {
                            clearInterval(intervalId);

                            if (!teamHasCharacters(activeTeamOfThree)) {
                                cancelEmbed.setDescription(`Hey **<@!${interaction.user.id}>**, quick update! Your duel request didn't go through because you need to set up an active team first or your team doesn't have any characters.\n\nCould you kindly set up an active team with characters using the ${config.commands.teamCommandTag} command? Once that's done, you're all set for an exciting duel!`);
                            } else if (!teamHasCharacters(opponentActiveTeamOfThree)) {
                                cancelEmbed.setDescription(`Hey **${interaction.user.username}**, quick update! Your duel request didn't go through because **${opponentUser.username} (Opponent)** either hasn't set up an active team yet or their team doesn't have any characters.\n\nCould you kindly remind your opponent to set up an active team with characters using the ${config.commands.teamCommandTag} command? Once that's done, you're all set for an exciting duel!`);
                            }                            

                            await interaction.deleteReply();
                            await interaction.followUp({
                                embeds: [cancelEmbed],
                                ephemeral: true
                            });
                        }
                    }, 1000);
                }

                const collectorFilter = (interaction: {
                    reply(arg0: { embeds: EmbedBuilder[]; ephemeral: boolean; }): unknown;               
                    user: { id: string; username: string; };
                }) => {
                    if (interaction.user.id !== opponentUser.id) {
                        actionNA(interaction, opponentUser.username);
                        return false;
                    }
                    return true;
                };

                try {
                    const confirmation = await response.awaitMessageComponent({
                        filter: collectorFilter,
                        time: 300_000
                    });

                    if (confirmation.customId === 'decline') {
                        await confirmation.deferUpdate();
                        await confirmation.editReply({
                            embeds: [
                                new EmbedBuilder()
                                    .setColor('Red')
                                    .setAuthor({
                                        name: interaction.user.username,
                                        iconURL: interaction.user.displayAvatarURL(),
                                    })
                                    .setTitle('⛔ Duel Request Declined')
                                    .setDescription(`**${opponentUser.username}** declined the duel request.`)
                                    .setFooter({
                                        text: config.messages.footerText,
                                    })
                            ],
                            components: []
                        });
                    } else if (confirmation.customId === 'accept') {
                        const convertMapToObject = (mapOrObject: Map<string, any> | { [key: string]: any }): { [key: string]: any } => {
                            if (mapOrObject instanceof Map) {
                              return Object.fromEntries(mapOrObject);
                            }
                          
                            return { ...mapOrObject };
                        };

                        const characterDataPlayerA = activeTeamOfThree.lineup.map((characterObject: any) => {
                            if (characterObject && characterObject.character) {
                                const level = characterObject.character.level;
                                return new Character(
                                    characterObject.character.character.name,
                                    applyLevelGrowth(characterObject.character.attributes.health, level) * 10,
                                    applyLevelGrowth(characterObject.character.attributes.attack, level),
                                    applyLevelGrowth(characterObject.character.attributes.defense, level),
                                    applyLevelGrowth(characterObject.character.attributes.speed, level),
                                    level,
                                    characterObject.character.rarity,
                                    characterObject.character.character.element,
                                    characterObject.character.character.class,
                                    characterObject.character.character.passiveSkill.name,
                                    characterObject.character.character.passiveSkill.skill,
                                    convertMapToObject(characterObject.character.character.passiveSkill.skill.rarityEffects)[mapRarity(characterObject.character.rarity)],
                                    characterObject.character.character.activeSkill.name,
                                    characterObject.character.character.activeSkill.skill,
                                    convertMapToObject(characterObject.character.character.activeSkill.skill.rarityEffects)[mapRarity(characterObject.character.rarity)]
                                );
                            }
                            return null;
                        }).filter((character: Character | null) => character !== null) as Character[];

                        const characterDataPlayerB = opponentActiveTeamOfThree.lineup.map((characterObject: any) => {
                            if (characterObject && characterObject.character) {
                                const level = characterObject.character.level;
                                return new Character(
                                    characterObject.character.character.name,
                                    applyLevelGrowth(characterObject.character.attributes.health, level) * 10,
                                    applyLevelGrowth(characterObject.character.attributes.attack, level),
                                    applyLevelGrowth(characterObject.character.attributes.defense, level),
                                    applyLevelGrowth(characterObject.character.attributes.speed, level),
                                    level,
                                    characterObject.character.rarity,
                                    characterObject.character.character.element,
                                    characterObject.character.character.class,
                                    characterObject.character.character.passiveSkill.name,
                                    characterObject.character.character.passiveSkill.skill,
                                    convertMapToObject(characterObject.character.character.passiveSkill.skill.rarityEffects)[mapRarity(characterObject.character.rarity)],
                                    characterObject.character.character.activeSkill.name,
                                    characterObject.character.character.activeSkill.skill,
                                    convertMapToObject(characterObject.character.character.activeSkill.skill.rarityEffects)[mapRarity(characterObject.character.rarity)]
                                );
                            }
                            return null;
                        }).filter((character: Character | null) => character !== null) as Character[];

                        const teamA = new Team(characterDataPlayerA);
                        const teamB = new Team(characterDataPlayerB);

                        const sideALabel = activeTeamOfThree.name;
                        const sideBLabel = opponentActiveTeamOfThree.name;

                        const introTeamA = snapshotTeam(characterDataPlayerA);
                        const introTeamB = snapshotTeam(characterDataPlayerB);

                        await confirmation.deferUpdate();
                        const intro = await buildBattleIntroEmbed(introTeamA, introTeamB, sideALabel, sideBLabel);
                        await confirmation.editReply({
                            embeds: [intro.embed],
                            files: intro.files,
                            components: []
                        });

                        const outcome = await runBattle(teamA, teamB, async (event) => {
                            const turnScene = await buildBattleTurnEmbed(event, sideALabel, sideBLabel);
                            await confirmation.editReply({
                                embeds: [turnScene.embed],
                                files: turnScene.files,
                                components: []
                            });
                        });

                        await Promise.all([
                            awardBattleExperience(activeTeamOfThree.lineup, outcome.result === 'A'),
                            awardBattleExperience(opponentActiveTeamOfThree.lineup, outcome.result === 'B'),
                        ]);

                        await presentBattleReplay(confirmation, interaction.user.id, outcome, introTeamA, introTeamB, sideALabel, sideBLabel);
                    }

                } catch (error) {
                    await handleCollectorTimeout(error, interaction, duelRequestEmbed, '/duel', 'Duel Request');
                }

            }
        } catch (error) {
            await handleCollectorTimeout(error, interaction, duelEmbed, '/duel', 'Duel Command');
        }
    }
};