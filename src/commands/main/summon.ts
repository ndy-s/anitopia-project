import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Client, CollectedInteraction, CommandInteraction, EmbedBuilder, MessageComponentInteraction } from "discord.js";
import CharacterModel from "../../models/Character";
import { config } from "../../config";
import { summonCharacter } from "../../utils/summonCharacters";
import redis from "../../lib/redis";
import PlayerModel from "../../models/Player";
import generateUniqueID from "../../utils/generateUniqueID";
import CharaCollectionModel from "../../models/CharaCollection";

export default {
    name: 'summon',
    description: 'Bring your favorite characters into the game',
    cooldown: 5_000,
    options: [],
    deleted: false,
    
    // Optional
    devOnly: false,
    testOnly: false,
    botPermissions: [],
    permissionsRequired: [],

    callback: async function callback (client: Client, interaction: CommandInteraction | CollectedInteraction, followUp = false, back = false) {
        const callbackFunction = this;
        const summonEmbed = new EmbedBuilder()
            .setColor('Blurple')
            .setAuthor({
                name: interaction.user.username,
                iconURL: interaction.user.displayAvatarURL(),
            })
            .setTitle('Summoning Altar')
            .setThumbnail('https://images-ext-1.discordapp.net/external/huMhSM-tW8IbG2kU1hR1Q-pI-A44b74PL_teDZ7nhVc/https/www.vhv.rs/dpng/d/28-280300_konosuba-megumin-explosion-megumin-chibi-png-transparent-png.png?width=566&height=671')
            .setDescription(`Welcome to the Anitopia Summoning Altar! This is your go-to place to expand your collection of characters. We offer three types of scrolls, each summoning characters of different rarities.\n\n- **Novice Scroll**: You currently own **0** scroll(s).\n- **Elite Scroll**: You currently own **0** scroll(s).\n- **Featured Series Pack**: You currently own **0** pack(s).\n\nEnjoy your time at the Summoning Altar and may luck be with you!`)
            .setFooter({
                text: `For more information, please click the button below.`
            });

        const noviceScrollButton = new ButtonBuilder()
            .setCustomId('novice')
            .setLabel('Novice')
            .setStyle(ButtonStyle.Success)
            .setEmoji('🟢');

        const eliteScrollButton = new ButtonBuilder()
            .setCustomId('elite')
            .setLabel('Elite')
            .setStyle(ButtonStyle.Primary)
            .setEmoji('🔵');

        const featuredScrollButton = new ButtonBuilder()
            .setCustomId('featured')
            .setLabel('Featured')
            .setStyle(ButtonStyle.Danger)
            .setEmoji('🟣');
        
        const summonComponentRow: any = new ActionRowBuilder()
            .addComponents(
                noviceScrollButton,
                eliteScrollButton,
                featuredScrollButton
            );

        const responseOptions: any = {
            embeds: [summonEmbed],
            components: [summonComponentRow],
        };

        let summonResponse;
        if (back) {
            await (interaction as MessageComponentInteraction).deferUpdate();
            summonResponse = await interaction.editReply(responseOptions);
        } else {
            summonResponse = followUp ? await interaction.followUp(responseOptions) : await interaction.reply(responseOptions);
        }

        const collectorFilter = (i: { user: { id: string } }) => i.user.id === interaction.user.id;

        try {
            const summonConfirmation = await summonResponse.awaitMessageComponent({
                filter: collectorFilter,
                time: 300_000
            });

            if (summonConfirmation.customId === 'novice') {
                async function handleNovicePage(summonConfirmation: CollectedInteraction) {
                    const noviceScrollEmbed = new EmbedBuilder()
                        .setColor('Blurple')
                        .setAuthor({
                            name: interaction.user.username,
                            iconURL: interaction.user.displayAvatarURL(),
                        })
                        .setTitle('Summoning Altar - Novice Scroll')
                        .setThumbnail('https://images-ext-1.discordapp.net/external/huMhSM-tW8IbG2kU1hR1Q-pI-A44b74PL_teDZ7nhVc/https/www.vhv.rs/dpng/d/28-280300_konosuba-megumin-explosion-megumin-chibi-png-transparent-png.png?width=566&height=671')
                        .setDescription(`The **Novice Scroll** is quite affordable at just **1,000 coins**, and you even get one free every day! This scroll gives you a chance to summon characters of various rarities.\n\nYou could find a **Common** character (**60% chance**), an **Uncommon** character (**24% chance**), a **Rare** character (**13% chance**), or if you're really lucky, an **Epic** character (**3% chance**).\n\nEvery summon is a step towards expanding your collection, bringing your favorite characters into battle.`)
                        .addFields(
                            {
                                name: 'Owned',
                                value: `10 Novice Scrolls`,
                                inline: true
                            },
                            {
                                name: 'Free Summon',
                                value: `Available`,
                                inline: true
                            },
                            {
                                name: 'Guaranted',
                                value: `993 Summons Left`,
                                inline: true,
                            }
                        )
                        .setFooter({
                            text: `Tip: You can use a free Novice Scroll every 24 hours.`
                        });

                    const backButton = new ButtonBuilder()
                        .setCustomId('back')
                        .setLabel('Back')
                        .setStyle(ButtonStyle.Secondary);

                    const summonOneButton = new ButtonBuilder()
                        .setCustomId('summonOne')
                        .setLabel('Summon 1')
                        .setStyle(ButtonStyle.Primary)
                        .setEmoji('🟣');

                    const summonTenButton = new ButtonBuilder()
                        .setCustomId('summonTen')
                        .setLabel('Summon 10')
                        .setStyle(ButtonStyle.Primary)
                        .setEmoji('🟣');

                    const noviceSummonComponentRow: any = new ActionRowBuilder()
                        .addComponents(
                            backButton,
                            summonOneButton,
                            summonTenButton
                        );


                    await summonConfirmation.deferUpdate();
                    const noviceSummonResponse = await summonConfirmation.editReply({
                        embeds: [noviceScrollEmbed],
                        components: [noviceSummonComponentRow]
                    });
            
                    try {
                        const noviceSummonConfirmation = await noviceSummonResponse.awaitMessageComponent({
                            filter: collectorFilter,
                            time: 300_000
                        });
            
                        if (noviceSummonConfirmation.customId === 'back') {
                            callbackFunction.callback(client, noviceSummonConfirmation, false, true);
                        } else if (noviceSummonConfirmation.customId === 'summonOne') {
                            const characterResult = await redis.get('characters');

                            let characters;
                            if (characterResult) {
                                characters = JSON.parse(characterResult);
                            } else {
                                characters = await CharacterModel.find({}).lean();
                                await redis.set('characters', JSON.stringify(characters), 'EX', 60);
                            }
                        
                            const summonedCharacterData = summonCharacter(characters, {
                                Common: 60,
                                Uncommon: 24,
                                Rare: 13,
                                Epic: 3,
                                Legendary: 0
                            });

                            const latestCharacter = await CharaCollectionModel.findOne().sort({ createdAt : -1 });;
                            const result = await redis.get(interaction.user.id);
                            let player;
                    
                            if (result) {
                                player = JSON.parse(result);
                            } else {
                                player = await PlayerModel.findOne({
                                    userId: interaction.member && 'id' in interaction.member ? interaction.member.id : undefined,
                                });
                    
                                await redis.set(interaction.user.id, JSON.stringify(player), 'EX', 60);
                            }

                            const newCharaCollection = new CharaCollectionModel({
                                playerId: player._id,
                                characterId: generateUniqueID(latestCharacter?.characterId as string | null),
                                character: summonedCharacterData.character._id,
                                rarity: summonedCharacterData.rarity,
                                attributes: {
                                    health: summonedCharacterData.character.attributes.health,
                                    attack: summonedCharacterData.character.attributes.attack,
                                    defense: summonedCharacterData.character.attributes.defense,
                                    speed: summonedCharacterData.character.attributes.speed,
                                }
                            });

                            const characterSummonedEmbed = new EmbedBuilder()
                                .setColor('Blurple')
                                .setAuthor({
                                    name: interaction.user.username,
                                    iconURL: interaction.user.displayAvatarURL(),
                                })
                                .setTitle('Novice Scroll Summon')
                                .setThumbnail('https://images-ext-1.discordapp.net/external/huMhSM-tW8IbG2kU1hR1Q-pI-A44b74PL_teDZ7nhVc/https/www.vhv.rs/dpng/d/28-280300_konosuba-megumin-explosion-megumin-chibi-png-transparent-png.png?width=566&height=671')
                                .setDescription(`Congratulations! You've successfully summoned **${summonedCharacterData.character.name} (${summonedCharacterData.character.fullname})** with the Novice Scroll.`)
                                .addFields(
                                    {
                                        name: 'Character ID',
                                        value: `\`${newCharaCollection.characterId}\``,
                                        inline: true
                                    },
                                    {
                                        name: 'Series',
                                        value: `${summonedCharacterData.character.series}`,
                                        inline: true
                                    },
                                    {
                                        name: `Rarity`,
                                        value: `__${summonedCharacterData.rarity}__`,
                                        inline: true,
                                    },
                                    {
                                        name: 'Element',
                                        value: `${summonedCharacterData.character.element}`,
                                        inline: true, 
                                    },
                                    {
                                        name: `Class`,
                                        value: `${summonedCharacterData.character.class}`,
                                        inline: true
                                    },
                                    {
                                        name: `Health`,
                                        value: `${summonedCharacterData.character.attributes.health}`,
                                        inline: true,
                                    },
                                    {
                                        name: `Attack`,
                                        value: `${summonedCharacterData.character.attributes.attack}`,
                                        inline: true,
                                    },
                                    {
                                        name: `Defense`,
                                        value: `${summonedCharacterData.character.attributes.defense}`,
                                        inline: true,
                                    },
                                    {
                                        name: `Speed`,
                                        value: `${summonedCharacterData.character.attributes.speed}`,
                                        inline: true,
                                    },
                                    {
                                        name: `Passive Skill`,
                                        value: `**${summonedCharacterData.character.passiveSkill.name}**: ${summonedCharacterData.character.passiveSkill.descriptions[summonedCharacterData.rarity]}`
                                    },
                                    {
                                        name: 'Active Skill',
                                        value: `**${summonedCharacterData.character.activeSkill.name}**: ${summonedCharacterData.character.activeSkill.descriptions[summonedCharacterData.rarity]}`
                                    },
    
                                )
                                .setFooter({
                                    text: `You now have TOTAL_CHARACTERS characters.`
                                });

                            const backNoviceButton = new ButtonBuilder()
                                .setCustomId('backNovice')
                                .setLabel('Back')
                                .setStyle(ButtonStyle.Secondary);

                            const characterSummonedComponentRow: any = new ActionRowBuilder()
                                .addComponents(
                                    backNoviceButton,
                                );

                            await newCharaCollection.save();
                            await noviceSummonConfirmation.deferUpdate();
                            const noviceSummonedCharacterResponse = await noviceSummonConfirmation.editReply({
                                embeds: [characterSummonedEmbed],
                                components: [characterSummonedComponentRow]
                            });

                            try {
                                const noviceSummonedCharacterConfirmation = await noviceSummonedCharacterResponse.awaitMessageComponent({
                                    filter: collectorFilter,
                                    time: 300_000
                                });
                    
                                if (noviceSummonedCharacterConfirmation.customId === 'backNovice') {
                                    await handleNovicePage(noviceSummonedCharacterConfirmation);
                                }
                            } catch (error) {
                                console.log(error);
                            }
                        }
                    } catch (error) {
                        console.log(error);
                    }

                }
                await handleNovicePage(summonConfirmation);
            }
            
        } catch (error) {
            console.log(`Summon Command Error: ${error}`);
        }
    }
}