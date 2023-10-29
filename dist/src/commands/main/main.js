"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const profile_1 = require("../account/profile");
const character_1 = require("../character/character");
const summon_1 = require("./summon");
exports.default = {
    name: 'main',
    description: 'Central hub for Anitopia commands',
    cooldown: 5000,
    options: [],
    deleted: false,
    // Optional
    devOnly: false,
    testOnly: false,
    botPermissions: [],
    permissionsRequired: [],
    callback: async (client, interaction, followUp = false) => {
        const mainOption = new discord_js_1.StringSelectMenuBuilder()
            .setCustomId('mainOption')
            .setPlaceholder('What would you like to do next?')
            .addOptions(new discord_js_1.StringSelectMenuOptionBuilder()
            .setLabel('Story')
            .setDescription('Explore anime-based chapters and quests')
            .setValue('story')
            .setEmoji('🏰'), new discord_js_1.StringSelectMenuOptionBuilder()
            .setLabel('Summon')
            .setDescription('Summon your favorite characters')
            .setValue('summon')
            .setEmoji('🔮'), new discord_js_1.StringSelectMenuOptionBuilder()
            .setLabel('Character')
            .setDescription('Manage and upgrade your team of characters.')
            .setValue('character')
            .setEmoji('🧙'), new discord_js_1.StringSelectMenuOptionBuilder()
            .setLabel('Profile')
            .setDescription('Manage game progress, profile, and more')
            .setValue('profile')
            .setEmoji('👤'));
        const mainEmbed = new discord_js_1.EmbedBuilder()
            .setColor('Blurple')
            .setAuthor({
            name: interaction.user.username,
            iconURL: interaction.user.displayAvatarURL(),
        })
            .setTitle('Anitopia Main Commands')
            .setThumbnail('https://europe1.discourse-cdn.com/unity/original/3X/6/0/608e0f8940360c004564efc302d52054b7bc2493.jpeg')
            .setDescription(`Hello, ${interaction.user.username}! Are you ready to explore Anitopia? Use the dropdown menu below to navigate through the game.`)
            .setFooter({
            text: 'Select an option from the dropdown menu to continue.'
        });
        const mainComponentRow = new discord_js_1.ActionRowBuilder().addComponents(mainOption);
        const responseOptions = {
            embeds: [mainEmbed],
            components: [mainComponentRow]
        };
        const response = followUp ? await interaction.followUp(responseOptions) : await interaction.reply(responseOptions);
        const collectorFilter = (i) => i.user.id === interaction.user.id;
        try {
            const confirmation = await response.awaitMessageComponent({
                filter: collectorFilter,
                time: 300000
            });
            if (confirmation.customId === 'mainOption' && 'values' in confirmation) {
                await confirmation.deferUpdate();
                await confirmation.editReply({
                    components: []
                });
                if (confirmation.values.includes('profile')) {
                    await profile_1.default.callback(client, interaction, true);
                }
                else if (confirmation.values.includes('summon')) {
                    await summon_1.default.callback(client, interaction, true);
                }
                else if (confirmation.values.includes('character')) {
                    await character_1.default.callback(client, interaction, true);
                }
            }
        }
        catch (error) {
            console.log(`Main Command Error: ${error}`);
        }
    }
};
