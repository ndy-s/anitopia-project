"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const models_1 = require("../../models");
const utils_1 = require("../../utils");
const collection_1 = require("./collection");
const exceptions_1 = require("../exceptions");
exports.default = {
    name: 'info',
    description: 'Check your character details',
    cooldown: 5000,
    options: [
        {
            name: 'character-id',
            description: "Enter your Character ID of the character you'd like to view",
            type: discord_js_1.ApplicationCommandOptionType.String,
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
    callback: async (client, interaction, charaIdInput = null) => {
        let characterIdOptionValue = charaIdInput;
        if (interaction instanceof discord_js_1.CommandInteraction) {
            const optionValue = interaction.options.get('character-id')?.value;
            characterIdOptionValue = optionValue ? optionValue.toString().toUpperCase() : charaIdInput;
        }
        if (characterIdOptionValue && characterIdOptionValue.includes(' ')) {
            return (0, exceptions_1.characterNF)(interaction, 'spaces');
        }
        else if (characterIdOptionValue && /[^a-zA-Z0-9]/.test(characterIdOptionValue)) {
            return (0, exceptions_1.characterNF)(interaction, 'symbols');
        }
        const characterInfo = await models_1.CharaCollectionModel.findOne({ characterId: characterIdOptionValue }).populate('character');
        if (!characterInfo || !characterInfo.character) {
            return (0, exceptions_1.characterNF)(interaction);
        }
        const rarity = (0, utils_1.mapRarity)(Number(characterInfo.rarity));
        const character = characterInfo.character;
        const characterCount = await models_1.CharaCollectionModel.countDocuments({
            character: character._id,
            rarity: characterInfo.rarity
        });
        const characterInfoEmbed = new discord_js_1.EmbedBuilder()
            .setColor('Blurple')
            .setAuthor({
            name: `${interaction.user.username}'s Character Info`,
            iconURL: interaction.user.displayAvatarURL(),
        })
            .setTitle(`${character.name} (${character.fullname})`)
            .setThumbnail('https://images-ext-1.discordapp.net/external/huMhSM-tW8IbG2kU1hR1Q-pI-A44b74PL_teDZ7nhVc/https/www.vhv.rs/dpng/d/28-280300_konosuba-megumin-explosion-megumin-chibi-png-transparent-png.png?width=566&height=671')
            .addFields({
            name: 'Character ID',
            value: `\`${characterInfo.characterId}\``,
            inline: true
        }, {
            name: 'Series',
            value: `${character.series}`,
            inline: true
        }, {
            name: `Rarity`,
            value: `__**${rarity}**__`,
            inline: true,
        }, {
            name: 'Element',
            value: `${character.element}`,
            inline: true,
        }, {
            name: `Class`,
            value: `${character.class}`,
            inline: true
        }, {
            name: `Health`,
            value: `${character.attributes.health}`,
            inline: true,
        }, {
            name: `Attack`,
            value: `${character.attributes.attack}`,
            inline: true,
        }, {
            name: `Defense`,
            value: `${character.attributes.defense}`,
            inline: true,
        }, {
            name: `Speed`,
            value: `${character.attributes.speed}`,
            inline: true,
        }, {
            name: `Passive Skill`,
            value: `**${character.passiveSkill.name}**: ${character.passiveSkill.descriptions.get(rarity)}`
        }, {
            name: "Active Skill",
            value: `**${character.activeSkill.name}**: ${character.activeSkill.descriptions.get(rarity)}`
        }, {
            name: "Catchphrase",
            value: `_"${character.quotes}"_`
        })
            .setFooter({
            iconURL: interaction.client.user.displayAvatarURL({ extension: 'png', size: 512 }),
            text: `Guess what? There are ${characterCount} ${rarity} ${character.name} in existence!`
        });
        const backButton = new discord_js_1.ButtonBuilder()
            .setCustomId('backCollection')
            .setLabel('Back')
            .setStyle(discord_js_1.ButtonStyle.Secondary);
        const charaInfoComponentRow = new discord_js_1.ActionRowBuilder()
            .addComponents(backButton);
        const responseOptions = {
            embeds: [characterInfoEmbed],
            components: [charaInfoComponentRow],
            files: []
        };
        if ('deferUpdate' in interaction && charaIdInput)
            await interaction.deferUpdate();
        const response = charaIdInput ? await interaction.editReply(responseOptions) : await interaction.reply(responseOptions);
        const collectorFilter = (i) => i.user.id === interaction.user.id;
        try {
            const confirmation = await response.awaitMessageComponent({
                filter: collectorFilter,
                time: 300000
            });
            if (confirmation.customId === 'backCollection') {
                await collection_1.default.callback(client, confirmation, true);
            }
        }
        catch (error) {
            if (error instanceof Error && error.message === "Collector received no interactions before ending with reason: time") {
                characterInfoEmbed.setFooter({
                    text: `⏱️ This command is only active for 5 minutes. To use it again, please type /info.`
                });
                await interaction.editReply({
                    embeds: [characterInfoEmbed],
                    components: []
                });
            }
            else {
                console.log(`Collection Command Error: ${error}`);
            }
        }
    }
};
