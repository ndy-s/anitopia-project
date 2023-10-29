import { ActionRowBuilder, ApplicationCommandOptionType, ButtonBuilder, ButtonStyle, Client, CollectedInteraction, CommandInteraction, EmbedBuilder } from "discord.js";
import { CharaCollectionModel } from "../../models";
import { ICharacterModel } from "../../interfaces";
import { mapRarity } from "../../utils";
import collection from "./collection";
import { characterNF } from "../exceptions";

export default {
    name: 'info',
    description: 'Check your character details',
    cooldown: 5_000,
    options: [
        {
            name: 'character-id',
            description: "Enter your Character ID of the character you'd like to view",
            type: ApplicationCommandOptionType.String,
            min_length: 4,
            required: true,
        }
    ],
    deleted: false,

    // Optional
    devOnly: false,
    testOnly: false,
    botPermissions: [],
    permissionRequired: [],

    callback: async (client: Client, interaction: CommandInteraction | CollectedInteraction, charaIdInput: string | null = null) => {
        let characterIdOptionValue: string | null = charaIdInput;

        if (interaction instanceof CommandInteraction) {
            const optionValue = interaction.options.get('character-id')?.value;
            characterIdOptionValue = optionValue ? optionValue.toString().toUpperCase() : charaIdInput;
        }

        if (characterIdOptionValue && characterIdOptionValue.includes(' ')) {
            return characterNF(interaction, 'spaces');
        } else if (characterIdOptionValue && /[^a-zA-Z0-9]/.test(characterIdOptionValue)) {
            return characterNF(interaction, 'symbols');
        }

        const characterInfo = await CharaCollectionModel.findOne({ characterId: characterIdOptionValue }).populate('character');

        if (!characterInfo || !characterInfo.character) {
            return characterNF(interaction);
        }

        const rarity = mapRarity(Number(characterInfo.rarity));
        const character = characterInfo.character as ICharacterModel;

        const characterCount = await CharaCollectionModel.countDocuments({ 
            character: character._id, 
            rarity: characterInfo.rarity
        });

        const characterInfoEmbed = new EmbedBuilder()
            .setColor('Blurple')
            .setAuthor({
                name: `${interaction.user.username}'s Character Info`,
                iconURL: interaction.user.displayAvatarURL(),
            })
            .setTitle(`${character.name} (${character.fullname}) Lv. ${characterInfo.level}`)
            .setThumbnail('https://images-ext-1.discordapp.net/external/huMhSM-tW8IbG2kU1hR1Q-pI-A44b74PL_teDZ7nhVc/https/www.vhv.rs/dpng/d/28-280300_konosuba-megumin-explosion-megumin-chibi-png-transparent-png.png?width=566&height=671')
            .addFields(
                {
                    name: 'Character ID',
                    value: `\`${characterInfo.characterId}\``,
                    inline: true
                },
                {
                    name: 'EXP',
                    value: `200/200`,
                    inline: true,
                },
                {
                    name: `Rarity`,
                    value: `__**${rarity}**__`,
                    inline: true,
                },
                {
                    name: 'Series',
                    value: `${character.series}`,
                    inline: true
                },
                {
                    name: 'Element',
                    value: `${character.element}`,
                    inline: true, 
                },
                {
                    name: `Class`,
                    value: `${character.class}`,
                    inline: true
                },
                {
                    name: `Attributes`,
                    value: 
                        `❤️ **Health**: ${characterInfo.attributes.health} • ` +
                        `⚔️ **Attack**: ${characterInfo.attributes.attack} • ` +
                        `🛡️ **Defense**: ${characterInfo.attributes.defense} • ` +
                        `💨 **Speed**: ${characterInfo.attributes.speed}`,
                    inline: false,
                },
                // {
                //     name: `Health`,
                //     value: `${characterInfo.attributes.health}`,
                //     inline: false,
                // },
                // {
                //     name: `Attack`,
                //     value: `${characterInfo.attributes.attack}`,
                //     inline: true,
                // },
                // {
                //     name: `Defense`,
                //     value: `${characterInfo.attributes.defense}`,
                //     inline: false,
                // },
                // {
                //     name: `Speed`,
                //     value: `${characterInfo.attributes.speed}`,
                //     inline: true,
                // },
                {
                    name: `Passive Skill`,
                    value: `**${character.passiveSkill.name}**: ${character.passiveSkill.descriptions.get(rarity)}`
                },
                {
                    name: "Active Skill",
                    value: `**${character.activeSkill.name}**: ${character.activeSkill.descriptions.get(rarity)}`
                },
                {
                    name: "Catchphrase",
                    value: `_"${character.quotes}"_`
                }
            )
            .setFooter({
                iconURL: interaction.client.user.displayAvatarURL({ extension: 'png', size: 512}),
                text: `Guess what? There are ${characterCount} ${rarity} ${character.name} in existence!`
            });

        const backButton = new ButtonBuilder()
            .setCustomId('backCollection')
            .setLabel('Collection')
            .setStyle(ButtonStyle.Secondary);

        const charaInfoComponentRow = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                backButton,
            );
        
        const responseOptions = {
            embeds: [characterInfoEmbed],
            components: [charaInfoComponentRow],
            files: []
        };

        if ('deferUpdate' in interaction && charaIdInput) await interaction.deferUpdate();
        const response = charaIdInput ? await interaction.editReply(responseOptions): await interaction.reply(responseOptions);

        const collectorFilter = (i: { user: { id: string }}) => i.user.id === interaction.user.id;

        try {
            const confirmation = await response.awaitMessageComponent({
                filter: collectorFilter,
                time: 300_000
            });

            if (confirmation.customId === 'backCollection') {
                await collection.callback(client, confirmation, true);
            } 

        } catch (error) {
            if (error instanceof Error && error.message === "Collector received no interactions before ending with reason: time") {
                characterInfoEmbed.setFooter({
                    text: `⏱️ This command is only active for 5 minutes. To use it again, please type /info.`
                });

                await interaction.editReply({
                    embeds: [characterInfoEmbed],
                    components: []
                });
            } else {
                console.log(`Collection Command Error: ${error}`)
            }
        }

    }
}