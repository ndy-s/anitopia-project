const { Client, Interaction, ActionRowBuilder, ButtonBuilder, EmbedBuilder, ButtonStyle } = require('discord.js');
const User = require('../../models/User');

module.exports = {
    /**
     * 
     * @param {Client} client 
     * @param {Interaction} interaction 
     */
    callback: async (client, interaction) => {
        const confirm = new ButtonBuilder()
			.setCustomId('confirmPVP')
			.setLabel('Confirm')
			.setStyle(ButtonStyle.Primary);
        
        const cancel = new ButtonBuilder()
			.setCustomId('cancelPVP')
			.setLabel('Cancel')
			.setStyle(ButtonStyle.Secondary);

        const row = new ActionRowBuilder()
			.addComponents(confirm, cancel);

        const response = await interaction.reply({
			content: `Are you sure you want to PVP?`,
			components: [row],
		});

        const collectorFilter = i => i.user.id === interaction.user.id;
        try {
            const confirmation = await response.awaitMessageComponent({ filter: collectorFilter, time: 60_000 });

            const emojiGG0 = client.guilds.cache.get("1105456989108178984").emojis.cache.find((emoji) => emoji.name === "GG0").id;
            const emojiGG1 = client.guilds.cache.get("1105456989108178984").emojis.cache.find((emoji) => emoji.name === "GG1").id;
            const emojiGG2 = client.guilds.cache.get("1105456989108178984").emojis.cache.find((emoji) => emoji.name === "GG2").id;
            const emojiGG3 = client.guilds.cache.get("1105456989108178984").emojis.cache.find((emoji) => emoji.name === "GG3").id;
            const emojiGG4 = client.guilds.cache.get("1105456989108178984").emojis.cache.find((emoji) => emoji.name === "GG4").id;
            const emojiStar = client.guilds.cache.get("1105456989108178984").emojis.cache.find((emoji) => emoji.name === "star").id;
            const emojiLife = client.guilds.cache.get("1105456989108178984").emojis.cache.find((emoji) => emoji.name === "hp").id;
            const emojiG10 = client.guilds.cache.get("1105456989108178984").emojis.cache.find((emoji) => emoji.name === "G10").id;
            const emojiG15 = client.guilds.cache.get("1105456989108178984").emojis.cache.find((emoji) => emoji.name === "G15").id;
            const emojiG20 = client.guilds.cache.get("1105456989108178984").emojis.cache.find((emoji) => emoji.name === "G20").id;
            const emojiG25 = client.guilds.cache.get("1105456989108178984").emojis.cache.find((emoji) => emoji.name === "G25").id;
            const emojiG30 = client.guilds.cache.get("1105456989108178984").emojis.cache.find((emoji) => emoji.name === "G30").id;
            const emojiE10 = client.guilds.cache.get("1105456989108178984").emojis.cache.find((emoji) => emoji.name === "E10").id;
            const emojiE20 = client.guilds.cache.get("1105456989108178984").emojis.cache.find((emoji) => emoji.name === "E20").id;
            const emojiE30 = client.guilds.cache.get("1105456989108178984").emojis.cache.find((emoji) => emoji.name === "E30").id;
            const emojiY10 = client.guilds.cache.get("1105456989108178984").emojis.cache.find((emoji) => emoji.name === "Y10").id;
            const emojiY15 = client.guilds.cache.get("1105456989108178984").emojis.cache.find((emoji) => emoji.name === "Y15").id;
            const emojiY20 = client.guilds.cache.get("1105456989108178984").emojis.cache.find((emoji) => emoji.name === "Y20").id;
            const emojiR05 = client.guilds.cache.get("1105456989108178984").emojis.cache.find((emoji) => emoji.name === "R05").id;
            const emojiR10 = client.guilds.cache.get("1105456989108178984").emojis.cache.find((emoji) => emoji.name === "R10").id;
            const emojiR15 = client.guilds.cache.get("1105456989108178984").emojis.cache.find((emoji) => emoji.name === "R15").id;

            const emojiID = async (emoji, num, gif = false) => {
                return gif 
                    ? Array(num).fill(`<a:1:${emoji}>`).join('')
                    : Array(num).fill(`<:1:${emoji}>`).join('');
            };

            if (confirmation.customId === 'confirmPVP') {
                // await confirmation.update({ content: `${i}`, components: [] });
                const playerA = {
                    name: 'Taradora',
                    hp: 10000,
                    maxHp: 10000,
                    def: 60,
                    atk: 90,
                    spd: 30,
                    lvl: 100,
                    str: 5,
                    elm: '🔥',
                };
                  
                const playerB = {
                    name: 'Nanashi',
                    hp: 9000,
                    maxHp: 9000,
                    def: 60,
                    atk: 80,
                    spd: 100,
                    lvl: 100,
                    str: 5,
                    elm: '🌙',
                };

                let i = 1;
                let j = 1;

                let hpA1 = playerA.hp;
                let hpB1 = playerB.hp;

                let gaugeA = 0;
                let gaugeA1 = 0;
                let gaugeB = 0;
                let gaugeB1 = 0;

                let playerAChance = [];
                let playerBChance = [];

                const attackCalc = async (atk, def, spd, playerB = false) => {
                    let ATK = (atk * 1.21994);
                    let DEF = (def * 1.21992);
                    let dmg = Math.round((ATK - ( ATK/2 ** (ATK/DEF) )) * 2);
                    let desc = 'normal';

                    let crit = Math.random();
                    let eva = Math.random();
                    
                    if (crit <= 0.05) {
                        dmg *= 1.5;
                        desc = '**CRITICAL**';
                    }

                    if (eva <= 0.01 + (spd * 0.001)) {
                        dmg = 0;
                        desc = '**EVADE**';
                    }

                    if (playerB) {
                        playerBChance.push({
                            dmg,
                            desc,
                            crit,
                            eva,
                        });
                    } else if (!playerB) {
                        playerAChance.push({
                            dmg,
                            desc,
                            crit,
                            eva,
                        });
                    }

                    return dmg;
                };

                const hpBar = async (hp, maxHp, gauge) => {
                    let percent = hp / maxHp * 100;

                    let emojiString =
                        percent > 95 ? await emojiID(emojiG10, 1) + await emojiID(emojiG20, 8) + await emojiID(emojiG30, 1) :
                        percent > 90 ? await emojiID(emojiG10, 1) + await emojiID(emojiG20, 8) + await emojiID(emojiG25, 1) :
                        percent > 85 ? await emojiID(emojiG10, 1) + await emojiID(emojiG20, 8) + await emojiID(emojiE30, 1) :
                        percent > 80 ? await emojiID(emojiG10, 1) + await emojiID(emojiG20, 7) + await emojiID(emojiG15, 1) + await emojiID(emojiE30, 1) :
                        percent > 75 ? await emojiID(emojiG10, 1) + await emojiID(emojiG20, 7) + await emojiID(emojiE20, 1) + await emojiID(emojiE30, 1) :
                        percent > 70 ? await emojiID(emojiG10, 1) + await emojiID(emojiG20, 6) + await emojiID(emojiG15, 1) + await emojiID(emojiE20, 1) + await emojiID(emojiE30, 1) :
                        percent > 65 ? await emojiID(emojiG10, 1) + await emojiID(emojiG20, 6) + await emojiID(emojiE20, 2) + await emojiID(emojiE30, 1) :
                        percent > 60 ? await emojiID(emojiG10, 1) + await emojiID(emojiG20, 5) + await emojiID(emojiG15, 1) + await emojiID(emojiE20, 2) + await emojiID(emojiE30, 1) :
                        percent > 55 ? await emojiID(emojiG10, 1) + await emojiID(emojiG20, 5) + await emojiID(emojiE20, 3) + await emojiID(emojiE30, 1) :
                        percent > 50 ? await emojiID(emojiG10, 1) + await emojiID(emojiG20, 4) + await emojiID(emojiG15, 1) + await emojiID(emojiE20, 3) + await emojiID(emojiE30, 1) :
                        percent > 45 ? await emojiID(emojiY10, 1) + await emojiID(emojiY20, 4) + await emojiID(emojiE20, 4) + await emojiID(emojiE30, 1) :
                        percent > 40 ? await emojiID(emojiY10, 1) + await emojiID(emojiY20, 3) + await emojiID(emojiY15, 1) + await emojiID(emojiE20, 4) + await emojiID(emojiE30, 1) :
                        percent > 35 ? await emojiID(emojiY10, 1) + await emojiID(emojiY20, 3) + await emojiID(emojiE20, 5) + await emojiID(emojiE30, 1) :
                        percent > 30 ? await emojiID(emojiY10, 1) + await emojiID(emojiY20, 2) + await emojiID(emojiY15, 1) + await emojiID(emojiE20, 5) + await emojiID(emojiE30, 1) :
                        percent > 25 ? await emojiID(emojiY10, 1) + await emojiID(emojiY20, 2) + await emojiID(emojiE20, 6) + await emojiID(emojiE30, 1) :
                        percent > 20 ? await emojiID(emojiY10, 1) + await emojiID(emojiY20, 1) + await emojiID(emojiY15, 1) + await emojiID(emojiE20, 6) + await emojiID(emojiE30, 1) :
                        percent > 15 ? await emojiID(emojiY10, 1) + await emojiID(emojiY20, 1) + await emojiID(emojiE20, 7) + await emojiID(emojiE30, 1) :
                        percent > 10 ? await emojiID(emojiR10, 1) + await emojiID(emojiR15, 1) + await emojiID(emojiE20, 7) + await emojiID(emojiE30, 1) :
                        percent > 5 ? await emojiID(emojiR10, 1) + await emojiID(emojiE20, 8) + await emojiID(emojiE30, 1) :
                        percent > 0 ? await emojiID(emojiR05, 1) + await emojiID(emojiE20, 8) + await emojiID(emojiE30, 1) :
                        await emojiID(emojiE10, 1) + await emojiID(emojiE20, 8) + await emojiID(emojiE30, 1);
                  
                    
                    let emojiGauge =
                        gauge == 1 ? await emojiID(emojiGG1, 1) :
                        gauge == 2 ? await emojiID(emojiGG2, 1) :
                        gauge == 3 ? await emojiID(emojiGG3, 1) :
                        gauge == 4 ? await emojiID(emojiGG4, 1) :
                        await emojiID(emojiGG0, 1);

                       
                    return `${emojiString}\n**Cooldown:** ${emojiGauge}`;
                };

                
                await confirmation.deferUpdate();
                await confirmation.editReply({ 
                    content: null,
                    embeds: [
                        new EmbedBuilder()
                            .setColor('Blue')
                            .setTitle("Fight")
                            .addFields(
                                { name: `Initializing PVP...`, value: 'Player A and Player B appeared in PVP Field.'},
                                { name: 'Player A', value: `**${Math.max(playerA.hp, 0)}/${playerA.maxHp}** <:1:${emojiLife}>\n ${await hpBar(hpA1, playerA.maxHp, gaugeA1)}`, inline: true },
                                { name: 'Player B', value: `**${Math.max(playerB.hp, 0)}/${playerB.maxHp}** <:1:${emojiLife}>\n ${await hpBar(hpB1, playerB.maxHp, gaugeB1)}`, inline: true },
                            )
                            .setImage('https://media.discordapp.net/attachments/1105456989775081495/1106939400597815327/Illustration.png')
                    ], 
                    components: [] 
                });

                while (playerA.hp > 0 && playerB.hp > 0) {
                    if (playerA.spd > playerB.spd) {
                        let dmg = await attackCalc(playerA.atk, playerB.def, playerB.spd);
                        playerB.hp -= dmg;
                        if (gaugeA < 4) {
                            gaugeA += 1;
                        }
                        setTimeout(async () => {
                            dmg = playerAChance[j-1].dmg
                            hpB1 -= dmg
                            if (gaugeA1 < 4) {
                                gaugeA1 += 1;
                            }
                            await confirmation.editReply({ 
                                content: `Turn ${j}.\n Player A damage to B: ${dmg}.\n A Hp: ${Math.max(hpA1, 0)}.\n B Hp: ${Math.max(hpB1, 0)}.`, 
                                components: [] 
                            });
                        }, i * 1000);
                        i += 1.5;

                        if (playerB.hp > 0) {
                            dmg = await attackCalc(playerB.atk, playerA.def, playerA.spd, true);
                            playerA.hp -= dmg;
                            if (gaugeB < 4) {
                                gaugeB += 1;
                            }
                            setTimeout(async () => {
                                dmg = playerBChance[j-1].dmg
                                hpA1 -= dmg
                                if (gaugeB1 < 4) {
                                    gaugeB1 += 1;
                                }
                                await confirmation.editReply({ 
                                    content: `Turn ${j}.\n Player B damage to A: ${dmg}.\n A Hp: ${Math.max(hpA1, 0)}.\n B Hp: ${Math.max(hpB1, 0)}.`, 
                                    components: [] 
                                });
                                j++;
                            }, i * 1000);
                        }
                    } else {
                        if (gaugeB == 4) {
                            let dmg = 1000;
                            playerA.hp -= dmg;
                            gaugeB = 0;

                            setTimeout(async () => {
                                dmg = 1000
                                desc = "**ULTIMATE**"
                                hpA1 -= dmg
                                gaugeB1 = 0;
                                await confirmation.editReply({ 
                                    content: null,
                                    embeds: [
                                        new EmbedBuilder()
                                            .setColor('Blue')
                                            .setTitle("Fight")
                                            .addFields(
                                                { name: `**[Turn ${j}]**`, value: `Player B damage to A: ${dmg} - ${desc}`},
                                                { name: `Player A\n${playerA.name} ${playerA.elm}\nLevel: ${playerA.lvl}\n${await emojiID(emojiStar, playerA.str, true)}`, value: `**${Math.max(hpA1, 0)} / ${playerA.maxHp}** <:1:${emojiLife}>\n ${await hpBar(hpA1, playerA.maxHp, gaugeA1)}`, inline: true },
                                                { name: `Player B\n${playerB.name} ${playerB.elm}\nLevel: ${playerB.lvl}\n${await emojiID(emojiStar, playerB.str, true)}`, value: `**${Math.max(hpB1, 0)} / ${playerB.maxHp}** <:1:${emojiLife}>\n ${await hpBar(hpB1, playerB.maxHp, gaugeB1)}`, inline: true },
                                            )
                                            .setImage('https://media.discordapp.net/attachments/1105456989775081495/1106939400597815327/Illustration.png')
                                    ], 
                                    components: [] 
                                });
                                
                            }, i * 1000);
                            i += 1.5;
                        }

                        if (playerA.hp > 0) {
                            let dmg = await attackCalc(playerB.atk, playerA.def, playerA.spd, true);
                            playerA.hp -= dmg;
                            if (gaugeB < 4) {
                                gaugeB += 1;
                            }
                            setTimeout(async () => {
                                dmg = playerBChance[j-1].dmg
                                desc = playerBChance[j-1].desc
                                hpA1 -= dmg
                                if (gaugeB1 < 4) {
                                    gaugeB1 += 1;
                                }
                                await confirmation.editReply({ 
                                    content: null,
                                    embeds: [
                                        new EmbedBuilder()
                                            .setColor('Blue')
                                            .setTitle("Fight")
                                            .addFields(
                                                { name: `**[Turn ${j}]**`, value: `Player B damage to A: ${dmg} - ${desc}`},
                                                { name: `Player A\n${playerA.name} ${playerA.elm}\nLevel: ${playerA.lvl}\n${await emojiID(emojiStar, playerA.str, true)}`, value: `**${Math.max(hpA1, 0)} / ${playerA.maxHp}** <:1:${emojiLife}>\n ${await hpBar(hpA1, playerA.maxHp, gaugeA1)}`, inline: true },
                                                { name: `Player B\n${playerB.name} ${playerB.elm}\nLevel: ${playerB.lvl}\n${await emojiID(emojiStar, playerB.str, true)}`, value: `**${Math.max(hpB1, 0)} / ${playerB.maxHp}** <:1:${emojiLife}>\n ${await hpBar(hpB1, playerB.maxHp, gaugeB1)}`, inline: true },
                                            )
                                            .setImage('https://media.discordapp.net/attachments/1105456989775081495/1106939400597815327/Illustration.png')
                                    ], 
                                    components: [] 
                                });
                                
                            }, i * 1000);
                            i += 1.5;
                        }

                        if (playerA.hp > 0) {
                            if (gaugeA == 4) {
                                dmg = 1000;
                                playerB.hp -= dmg
                                gaugeA = 0;
                                setTimeout(async () => {
                                    dmg = 1000;
                                    desc = '**ULTIMATE**'
                                    hpB1 -= dmg
                                    gaugeA1 = 0;
                                    await confirmation.editReply({ 
                                        content: null,
                                        embeds: [
                                            new EmbedBuilder()
                                                .setColor('Blue')
                                                .setTitle("Fight")
                                                .addFields(
                                                    { name: `**[Turn ${j}]**`, value: `Player A damage to B: ${dmg} - ${desc}`},
                                                    { name: `Player A\n${playerA.name} ${playerA.elm}\nLevel: ${playerA.lvl}\n${await emojiID(emojiStar, playerA.str, true)}`, value: `**${Math.max(hpA1, 0)} / ${playerA.maxHp}** <:1:${emojiLife}>\n ${await hpBar(hpA1, playerA.maxHp, gaugeA1)}` , inline: true},
                                                    { name: `Player B\n${playerB.name} ${playerB.elm}\nLevel: ${playerB.lvl}\n${await emojiID(emojiStar, playerB.str, true)}`, value: `**${Math.max(hpB1, 0)} / ${playerB.maxHp}** <:1:${emojiLife}>\n ${await hpBar(hpB1, playerB.maxHp, gaugeB1)}`, inline: true},
                                                )
                                                .setImage('https://media.discordapp.net/attachments/1105456989775081495/1106939400597815327/Illustration.png')
                                        ], 
                                        components: [] 
                                    });    
                                }, i * 1000);
                                i += 1.5;
                            }

                            if (playerB.hp > 0) {
                                dmg = await attackCalc(playerA.atk, playerB.def, playerB.spd);
                                playerB.hp -= dmg
                                if (gaugeA < 4) {
                                    gaugeA += 1;
                                }
                                setTimeout(async () => {
                                    dmg = playerAChance[j-1].dmg
                                    desc = playerAChance[j-1].desc
                                    hpB1 -= dmg
                                    if (gaugeA1 < 4) {
                                        gaugeA1 += 1;
                                    }
                                    await confirmation.editReply({ 
                                        content: null,
                                        embeds: [
                                            new EmbedBuilder()
                                                .setColor('Blue')
                                                .setTitle("Fight")
                                                .addFields(
                                                    { name: `**[Turn ${j}]**`, value: `Player A damage to B: ${dmg} - ${desc}`},
                                                    { name: `Player A\n${playerA.name} ${playerA.elm}\nLevel: ${playerA.lvl}\n${await emojiID(emojiStar, playerA.str, true)}`, value: `**${Math.max(hpA1, 0)} / ${playerA.maxHp}** <:1:${emojiLife}>\n ${await hpBar(hpA1, playerA.maxHp, gaugeA1)}` , inline: true},
                                                    { name: `Player B\n${playerB.name} ${playerB.elm}\nLevel: ${playerB.lvl}\n${await emojiID(emojiStar, playerB.str, true)}`, value: `**${Math.max(hpB1, 0)} / ${playerB.maxHp}** <:1:${emojiLife}>\n ${await hpBar(hpB1, playerB.maxHp, gaugeB1)}`, inline: true},
                                                )
                                                .setImage('https://media.discordapp.net/attachments/1105456989775081495/1106939400597815327/Illustration.png')
                                        ], 
                                        components: [] 
                                    });

                                    j++;
                                }, i * 1000);
                            }
                        }
                    }
                    i += 1.5;
                }
            } else if (confirmation.customId === 'cancelPVP') {
                await confirmation.update({ content: 'Action cancelled', components: [] });
            }
        } catch (e) {
            console.log(e);
            await interaction.editReply({ content: 'Confirmation not received within 1 minute, cancelling', components: [] });
        }
    },
    name: 'pvp',
    description: 'Initiate a player versus player (PvP) battle with another user.',
};