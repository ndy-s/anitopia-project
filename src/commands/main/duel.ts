import { ActionRowBuilder, ApplicationCommandOptionType, Attachment, AttachmentBuilder, ButtonBuilder, ButtonStyle, Client, CommandInteraction, EmbedBuilder } from "discord.js";
import { createCanvas, loadImage } from "@napi-rs/canvas";
import { Character } from "../../classes/Character";
import { Team } from "../../classes/Team";
import { getPlayer, mapRarity } from "../../utils";
import { IPlayerModel, ISkillModel, ITeams } from "../../interfaces";
import { PlayerModel, SkillModel } from "../../models";
import { config } from "../../config";
import { actionNA, playerIssue } from "../exceptions";

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

    callback: async (client: Client, interaction: CommandInteraction) => {
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

                    if (confirmation.customId === 'accept') {
                        // const megumin = await loadImage('C:/Storage/Programming/Project Dev/Anitopia/src/public/megumin.png');
                        // const chainsawman = await loadImage('C:/Storage/Programming/Project Dev/Anitopia/src/public/chainsawman.png');
                        // const background = await loadImage('C:/Storage/Programming/Project Dev/Anitopia/src/public/background.png');
                        
                        // // Adjust the canvas dimensions to make it landscape
                        // const canvas = createCanvas(1920, 1080);
                        // const ctx = canvas.getContext('2d');
                        
                        // ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
                        
                        // // Calculate the desired height for the characters (e.g., half of the canvas height)
                        // const characterHeight = canvas.height / 2;
                        // const meguminScale = characterHeight / megumin.height;
                        // const chainsawmanScale = characterHeight / chainsawman.height;
                        
                        // ctx.save();
                        // ctx.scale(-meguminScale, meguminScale); // Scale the context before drawing Megumin
                        // ctx.drawImage(megumin, -megumin.width * meguminScale * 2, canvas.height - megumin.height * meguminScale / 1.5); // Draw Megumin at the bottom
                        // ctx.restore();
                        
                        // // Draw Chainsaw Man at the scaled size on the right side of the canvas
                        // ctx.drawImage(chainsawman, canvas.width - chainsawman.width * chainsawmanScale, canvas.height - chainsawman.height * chainsawmanScale * 1.3, chainsawman.width * chainsawmanScale, canvas.height - chainsawman.height * chainsawmanScale);
                        
                        // const buffer = canvas.toBuffer('image/png');
                        
                        // const attachment = new AttachmentBuilder(buffer, {name: 'image.png'})

                        // console.log(PlayerSkill?.rarityEffects.get(mapRarity(activeTeamOfThree.lineup[0].character.rarity)));
                        
        
                        const characterDataPlayerA = activeTeamOfThree.lineup.map((characterObject: any) => {
                            if (characterObject && characterObject.character) {
                                return new Character(
                                    characterObject.character.character.name,
                                    (characterObject.character.attributes.health) * 10,
                                    characterObject.character.attributes.attack,
                                    characterObject.character.attributes.defense,    
                                    characterObject.character.attributes.speed,
                                    characterObject.character.level,
                                    characterObject.character.rarity,
                                    characterObject.character.character.element,
                                    characterObject.character.character.passiveSkill.skill,
                                    characterObject.character.character.passiveSkill.skill.rarityEffects[mapRarity(characterObject.character.rarity)],
                                    characterObject.character.character.activeSkill.skill,
                                    characterObject.character.character.activeSkill.skill.rarityEffects[mapRarity(characterObject.character.rarity)]
                                );
                            }
                            return null;
                        }).filter((character: Character | null) => character !== null) as Character[];


                        const characterDataPlayerB = opponentActiveTeamOfThree.lineup.map((characterObject: any) => {
                            if (characterObject && characterObject.character) {
                                return new Character(
                                    characterObject.character.character.name,
                                    (characterObject.character.attributes.health) * 10,
                                    characterObject.character.attributes.attack,
                                    characterObject.character.attributes.defense,
                                    characterObject.character.attributes.speed,
                                    characterObject.character.level,
                                    characterObject.character.rarity,
                                    characterObject.character.character.element,
                                    characterObject.character.character.passiveSkill.skill,
                                    characterObject.character.character.passiveSkill.skill.rarityEffects[mapRarity(characterObject.character.rarity)],
                                    characterObject.character.character.activeSkill.skill,
                                    characterObject.character.character.activeSkill.skill.rarityEffects.get(mapRarity(characterObject.character.rarity))
                                );
                            }
                            return null;
                        }).filter((character: Character | null) => character !== null) as Character[];

                        let teamA = new Team(characterDataPlayerA);
                        let teamB = new Team(characterDataPlayerB);
        
                        // TODO: Solve this "any" problem.
                        let allCharacters: any[] = [...characterDataPlayerA, ...characterDataPlayerB];
        
                        await confirmation.deferUpdate();
                        await confirmation.editReply({
                            content: null,
                            embeds: [
                                new EmbedBuilder()
                                    .setColor('Blurple')
                                    .setTitle("Fight")
                                    .addFields(
                                        {
                                            name: `Intializing Battle`,
                                            value: `Player A vs Player B`
                                        },
                                        {
                                            name: `Player A Team`,
                                            value: characterDataPlayerA
                                                .map((character: { name: string; health: number; maxHealth: number; }) => `${character.name}: ${Math.max(character.health, 0)}/${character.maxHealth}`)
                                                .join('\n'),
                                            inline: true
                                        },
                                        {
                                            name: `Player B Team`,
                                            value: characterDataPlayerB
                                                .map((character: { name: string; health: number; maxHealth: number; }) => `${character.name}: ${Math.max(character.health, 0)}/${character.maxHealth}`)
                                                .join('\n'),
                                            inline: true
                                        },
                                    )
                            ],
                            components: []
                        });
        
                        const delay = (ms: number) => {
                            return new Promise(resolve => setTimeout(resolve, ms));
                        };
                        
                        let turn = 0;
        
                        while (!teamA.isDefeated() && !teamB.isDefeated()) {
                            turn++;
                            console.log(`This is Turn: ${turn}`);
        
                            allCharacters.sort((a, b) => {
                                if (a.speed === b.speed) {
                                    return 0.5 - Math.random();
                                }
                                return b.speed - a.speed;
                            });

                            for (let character of allCharacters) {
                                if (character.health > 0) {
                                    character.status = character.status.filter((stat: {
                                        type: string,
                                        attribute: string,
                                        value: number,
                                        duration: number,
                                    }) => {
                                        if (stat.duration === 0) {
                                            const attribute = stat.attribute.toLowerCase();

                                            character[attribute] += (stat.type === 'Debuff') ? stat.value : -stat.value;
                                            character[attribute] = +character[attribute].toFixed(3);
                                            
                                            console.log(`Debuff over: ${attribute} restore back by ${stat.value}`);
                                            return false;
                                        } else if (stat.duration > 0) {
                                            stat.duration--;
                                        }
                                        return true;
                                    });
                                    
                                    let allies = teamA.hasMember(character) ? [...characterDataPlayerA] : [...characterDataPlayerB];
                                    let enemies = teamA.hasMember(character) ? [...characterDataPlayerB] : [...characterDataPlayerA];
        
                                    for (let enemy of enemies) {
                                        if (enemy.health > 0) {
                                            await delay(1000);
                                            console.log(`${teamA.hasMember(character) ? 'Player A' : 'Player B'} Character ${character.name} Attacking!`);
                                            character.attackCalculation(enemy, enemies, character, allies);
        
                                                await confirmation.editReply({
                                                    content: null,
                                                    embeds: [
                                                        new EmbedBuilder()
                                                            .setColor('Blurple')
                                                            .setTitle("Fight")
                                                            .setDescription(`**[Turn ${turn}]**\n${character.name} attack ${enemy.name} with ${character.displayDamage}`)
                                                            .addFields(
                                                                {
                                                                    name: `In-Game Battle`,
                                                                    value: `Turn ${turn}`
                                                                },
                                                                {
                                                                    name: `Player A Team`,
                                                                    value: characterDataPlayerA
                                                                        .map((character: { name: string; health: number; maxHealth: number; }) => `${character.name}: ${Math.max(character.health, 0)}/${character.maxHealth}`)
                                                                        .join('\n'),
                                                                    inline: true
                                                                },
                                                                {
                                                                    name: `Player B Team`,
                                                                    value: characterDataPlayerB
                                                                        .map((character: { name: string; health: number; maxHealth: number; }) => `${character.name}: ${Math.max(character.health, 0)}/${character.maxHealth}`)
                                                                        .join('\n'),
                                                                    inline: true
                                                                },
                                                            )
                                                    ],
                                                    components: []
                                                });
                                            break;
                                        }
                                    }
                                }
                            }
                        }
        
                        if (teamA.isDefeated()) {
                            console.log("Team B has won the battle!");
                        } else if (teamB.isDefeated()) {
                            console.log("Team A has won the battle!");
                        } else {
                            console.log("The battle ended in a draw.");
                        }
        
                    }

                } catch (error) {
                    console.log(error);
                }

            }
        } catch (error) {
            console.log(error);
            
        }
    }
};