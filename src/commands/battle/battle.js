const { Client, Interaction, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const User = require('../../models/User');

module.exports = {
    /**
     * 
     * @param {Client} client 
     * @param {Interaction} interaction 
     */
    callback: async (client, interaction) => {
        const confirm = new ButtonBuilder()
			.setCustomId('confirmBattle')
			.setLabel('Confirm')
			.setStyle(ButtonStyle.Primary);
        
        const cancel = new ButtonBuilder()
			.setCustomId('cancelBattle')
			.setLabel('Cancel')
			.setStyle(ButtonStyle.Secondary);

        const row = new ActionRowBuilder()
			.addComponents(confirm, cancel);

        const response = await interaction.reply({
			content: `Are you sure you want to battle?`,
			components: [row],
		});

        const collectorFilter = i => i.user.id === interaction.user.id;
        try {
            const confirmation = await response.awaitMessageComponent({ filter: collectorFilter, time: 60_000 });

            if (confirmation.customId === 'confirmBattle') {
                // await confirmation.update({ content: `${i}`, components: [] });
                let hpA = 1000;
                let defA = 60;
                let atkA = 90;
                let spdA = 120;

                let hpB = 900;
                let defB = 60;
                let atkB = 80;
                let spdB = 100;

                
                await confirmation.deferUpdate();
                await confirmation.editReply({ content: 'Initializing battle...', components: [] });
                let i = 1;
                let j = 1;

                let hpA1 = hpA;
                let hpB1 = hpB;
                while (hpA > 0 && hpB > 0) {
                    // setTimeout(async () => {
                    //     await confirmation.editReply({ content: `Turn ${i}`, components: [] });
                    // }, i * 1000);
                    console.log(i);
                    const attackA = async () => {
                        let ATK = (atkA * 1.21994);
                        let DEF = (defB * 1.21992);
                        let DMG = Math.round((ATK - ( ATK/2 ** (ATK/DEF) )) * 2);
                        return DMG;
                    };

                    const attackB = async () => {
                        let ATK = (atkB * 1.21994);
                        let DEF = (defA * 1.21992);
                        let DMG = Math.round((ATK - ( ATK/2 ** (ATK/DEF) )) * 2);
                        return DMG;
                    }   

                    if (spdA > spdB) {
                        let DMG = await attackA();
                        hpB -= DMG
                        setTimeout(async () => {
                            DMG = await attackA();
                            hpB1 -= DMG
                            await confirmation.editReply({ 
                                content: `Turn ${j}.\n Player A damage to B: ${DMG}.\n A Hp: ${Math.max(hpA1, 0)}.\n B Hp: ${Math.max(hpB1, 0)}.`, 
                                components: [] 
                            });
                        }, i * 1000);
                        i += 1.5;

                        DMG = await attackB();
                        hpA -= DMG
                        setTimeout(async () => {
                            DMG = await attackB();
                            hpA1 -= DMG
                            await confirmation.editReply({ 
                                content: `Turn ${j}.\n Player B damage to A: ${DMG}.\n A Hp: ${Math.max(hpA1, 0)}.\n B Hp: ${Math.max(hpB1, 0)}.`, 
                                components: [] 
                            });
                            j++;
                        }, i * 1000);
                    } else {
                        let DMG = await attackB();
                        hpA -= DMG
                        setTimeout(async () => {
                            DMG = await attackB();
                            hpA1 -= DMG
                            await confirmation.editReply({ 
                                content: `Turn ${j}.\n Player B damage to A: ${DMG}.\n A Hp: ${Math.max(hpA1, 0)}.\n B Hp: ${Math.max(hpB1, 0)}.`, 
                                components: [] 
                            });
                        }, i * 1000);
                        i += 1.5;

                        DMG = await attackA();
                        hpB -= DMG
                        setTimeout(async () => {
                            DMG = await attackA();
                            hpB1 -= DMG
                            await confirmation.editReply({ 
                                content: `Turn ${j}.\n Player A damage to B: ${DMG}.\n A Hp: ${Math.max(hpA1, 0)}.\n B Hp: ${Math.max(hpB1, 0)}.`, 
                                components: [] 
                            });

                            j++;
                        }, i * 1000);
                    }
                    i += 1.5;
                }
            } else if (confirmation.customId === 'cancelBattle') {
                await confirmation.update({ content: 'Action cancelled', components: [] });
            }
        } catch (e) {
            console.log(e);
            await interaction.editReply({ content: 'Confirmation not received within 1 minute, cancelling', components: [] });
        }
    },
    name: 'battle',
    description: 'test',
};