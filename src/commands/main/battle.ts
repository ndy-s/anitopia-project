import { ActionRowBuilder, Attachment, AttachmentBuilder, ButtonBuilder, ButtonStyle, Client, CommandInteraction, EmbedBuilder } from "discord.js";
import { createCanvas, loadImage } from "@napi-rs/canvas";
import { Character } from "../../classes/Character";
import { Team } from "../../classes/Team";
import { getPlayer } from "../../utils";
import { ITeams } from "../../interfaces";

export default {
    name: 'battle',
    description: 'bt | temp.',
    cooldown: 5_000,
    options: [],
    deleted: false,
    
    // Optional
    devOnly: false,
    testOnly: false,
    botPermissions: [],
    permissionsRequired: [],

    callback: async (client: Client, interaction: CommandInteraction, followUp = false) => {
        const confirmButton = new ButtonBuilder()
            .setCustomId('confirmPVP')
            .setLabel('Confirm')
            .setStyle(ButtonStyle.Primary);
    
        const cancelButton = new ButtonBuilder()
            .setCustomId('cancelPVP')
            .setLabel('Cancel')
            .setStyle(ButtonStyle.Secondary);

        const battleRow = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(confirmButton, cancelButton);

        const response = await interaction.reply({
            content: `Are you sure you want to PVP?`,
            components: [battleRow],
        });

        const collectorFilter = (i: { user: { id: string; }; }) => i.user.id === interaction.user.id;

        try {
            const confirmation = await response.awaitMessageComponent({
                filter: collectorFilter,
                time: 60_000
            });

            if (confirmation.customId === 'confirmPVP') {
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


                const player = await getPlayer(interaction);
                const activeTeamOfThree = player.teams.find((team: ITeams) => team.name === player.activeTeams.teamOfThree);

                const characterDataPlayerA = activeTeamOfThree.lineup.map((characterObject: any) => {
                    return new Character(
                        characterObject.character.character.name,
                        characterObject.character.attributes.health * 10,
                        characterObject.character.attributes.attack,
                        characterObject.character.attributes.defense,    
                        characterObject.character.attributes.speed,
                        characterObject.character.level,
                        characterObject.character.rarity,
                        characterObject.character.character.element,
                        3
                    );
                });

                let PlayerB1 = new Character(
                    'Goblin', // name
                    1000, // health
                    50, // attack
                    60, // defense
                    30, // speed
                    100, // level
                    'Common', // rarity
                    'Shade', // element
                    3, // cooldown
                );

                let PlayerB2 = new Character(
                    'Mob', // name
                    1000, // health
                    50, // attack
                    60, // defense
                    10, // speed
                    100, // level
                    'Common', // rarity
                    'Pyro', // element
                    3, // cooldown
                );

                let PlayerB3 = new Character(
                    'Troll', // name
                    1000, // health
                    50, // attack
                    60, // defense
                    10, // speed
                    100, // level
                    'Common', // rarity
                    'Shade', // element
                    3, // cooldown
                );

                let teamA = new Team(characterDataPlayerA);
                let teamB = new Team([PlayerB1, PlayerB2, PlayerB3]);

                let allCharacters = [...characterDataPlayerA, PlayerB1, PlayerB2, PlayerB3];

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
                                        .map((character: { name: string; health: number; maxHealth: number; }) => `${character.name}: ${character.health}/${character.maxHealth}`)
                                        .join('\n'),
                                    inline: true
                                },
                                {
                                    name: `Player B Team`,
                                    value: `${PlayerB1.name}:${PlayerB1.health}/${PlayerB1.maxHealth} \n${PlayerB2.name}: ${PlayerB2.health}/${PlayerB2.maxHealth} \n${PlayerB3.name}: ${PlayerB3.health}/${PlayerB3.maxHealth}`,
                                    inline: true
                                }
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
                            let enemyTeamPlayers = teamA.hasMember(character) ? [PlayerB1, PlayerB2, PlayerB3] : [...characterDataPlayerA];

                            for (let enemy of enemyTeamPlayers) {
                                if (enemy.health > 0) {
                                    await delay(1000);
                                    console.log(`Character ${character.name} Attacking!`);
                                    character.attackCalculation(enemy);

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
                                                                .map((character: { name: string; health: number; maxHealth: number; }) => `${character.name}: ${character.health}/${character.maxHealth}`)
                                                                .join('\n'),
                                                            inline: true
                                                        },
                                                        {
                                                            name: `Player B Team`,
                                                            value: `${PlayerB1.name}:${PlayerB1.health}/${PlayerB1.maxHealth} \n${PlayerB2.name}: ${PlayerB2.health}/${PlayerB2.maxHealth} \n${PlayerB3.name}: ${PlayerB3.health}/${PlayerB3.maxHealth}`,
                                                            inline: true
                                                        }
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
};