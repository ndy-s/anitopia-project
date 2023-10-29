"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const utils_1 = require("../../utils");
const collection_1 = require("./collection");
exports.default = {
    name: 'character',
    description: 'See and improve your characters, and form your team.',
    cooldown: 5000,
    options: [],
    deleted: false,
    // Optional
    devOnly: false,
    testOnly: false,
    botPermissions: [],
    permissionsRequired: [],
    callback: async (client, interaction, followUp = false, back = false) => {
        let player = await (0, utils_1.getPlayer)(interaction);
        const characterOption = new discord_js_1.StringSelectMenuBuilder()
            .setCustomId('characterOption')
            .setPlaceholder('Choose an action for your character!')
            .addOptions(new discord_js_1.StringSelectMenuOptionBuilder()
            .setLabel(`Collection`)
            .setDescription('Take a look at your character collection')
            .setValue('collection')
            .setEmoji('🖼️'), new discord_js_1.StringSelectMenuOptionBuilder()
            .setLabel('Enhance')
            .setDescription('Level up your characters for better performance')
            .setValue('enhance')
            .setEmoji('⚡'), new discord_js_1.StringSelectMenuOptionBuilder()
            .setLabel('Team')
            .setDescription('Create a powerful team with your characters')
            .setValue('team')
            .setEmoji('🛡️'));
        const characterEmbed = new discord_js_1.EmbedBuilder()
            .setColor('Blurple')
            .setAuthor({
            name: interaction.user.username,
            iconURL: interaction.user.displayAvatarURL(),
        })
            .setTitle('Characters')
            .setThumbnail('https://images-ext-1.discordapp.net/external/huMhSM-tW8IbG2kU1hR1Q-pI-A44b74PL_teDZ7nhVc/https/www.vhv.rs/dpng/d/28-280300_konosuba-megumin-explosion-megumin-chibi-png-transparent-png.png?width=566&height=671')
            .setDescription(`Welcome to your character command center! Here, you can view your collection of characters, enhance their abilities, or form a powerful team. Choose an option from the menu to get started. If you need any help, don't hesitate to ask!`);
        const characterComponentRow = new discord_js_1.ActionRowBuilder().addComponents(characterOption);
        const responseOptions = {
            embeds: [characterEmbed],
            components: [characterComponentRow],
            files: []
        };
        let response;
        if (back) {
            await interaction.deferUpdate();
            response = await interaction.editReply(responseOptions);
        }
        else {
            response = followUp ? await interaction.followUp(responseOptions) : await interaction.reply(responseOptions);
        }
        const collectorFilter = (i) => i.user.id === interaction.user.id;
        try {
            const confirmation = await response.awaitMessageComponent({
                filter: collectorFilter,
                time: 300000
            });
            if (confirmation.customId === 'characterOption' && 'values' in confirmation) {
                if (confirmation.values.includes('collection')) {
                    await collection_1.default.callback(client, confirmation, true);
                }
            }
        }
        catch (error) {
            console.log(error);
        }
    },
};
