"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const profile_1 = require("../account/profile");
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
            .setDescription(`Hello, ${interaction.user.username}! Ready for Anitopia?`)
            .setFooter({
            text: 'Use the dropdown menu to select an option. Need help? Type "/help" in the chat.'
        });
        const responseOptions = {
            embeds: [mainEmbed],
            components: [new discord_js_1.ActionRowBuilder().addComponents(mainOption)]
        };
        let response = followUp ? await interaction.followUp(responseOptions) : await interaction.reply(responseOptions);
        const collectorFilter = (i) => i.user.id === interaction.user.id;
        try {
            let mainConfirmation = await response.awaitMessageComponent({
                filter: collectorFilter,
                time: 300000
            });
            if (mainConfirmation.customId === 'mainOption' && 'values' in mainConfirmation) {
                if (mainConfirmation.values.includes('profile')) {
                    await mainConfirmation.deferUpdate();
                    await interaction.editReply({
                        components: []
                    });
                    await profile_1.default.callback(client, interaction, true);
                }
            }
        }
        catch (error) {
            console.log(`Main Command Error: ${error}`);
        }
    }
};
