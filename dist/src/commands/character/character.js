"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const utils_1 = require("../../utils");
const collection_1 = require("./collection");
const team_1 = require("./team");
exports.default = {
    name: 'character',
    description: 'Manage characters and teams in one place',
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
            .setPlaceholder('Select an action for your character')
            .addOptions(new discord_js_1.StringSelectMenuOptionBuilder()
            .setLabel(`Collection`)
            .setDescription('Browse through your collection of characters')
            .setValue('collection')
            .setEmoji('🖼️'), new discord_js_1.StringSelectMenuOptionBuilder()
            .setLabel('Enhance')
            .setDescription('Level up your characters to make them stronger')
            .setValue('enhance')
            .setEmoji('⚡'), new discord_js_1.StringSelectMenuOptionBuilder()
            .setLabel('Team')
            .setDescription('Build and manage teams for battles')
            .setValue('team')
            .setEmoji('🛡️'));
        const characterEmbed = new discord_js_1.EmbedBuilder()
            .setColor('Blurple')
            .setAuthor({
            name: interaction.user.username,
            iconURL: interaction.user.displayAvatarURL(),
        })
            .setTitle('Character Command Center')
            .setThumbnail('https://images-ext-1.discordapp.net/external/huMhSM-tW8IbG2kU1hR1Q-pI-A44b74PL_teDZ7nhVc/https/www.vhv.rs/dpng/d/28-280300_konosuba-megumin-explosion-megumin-chibi-png-transparent-png.png?width=566&height=671')
            .setDescription(`Welcome to the Character Command Center! Here, you can manage all aspects of your characters.\n\n- **Collection**: Browse and learn more about your characters.\n- **Enhance**: Power up your characters to increase their abilities.\n- **Team**: Strategically form teams with your characters for battles.`)
            .setFooter({
            iconURL: interaction.client.user.displayAvatarURL({ extension: 'png', size: 512 }),
            text: 'Select an option from the menu bellow for your character.',
        });
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
                else if (confirmation.values.includes('team')) {
                    await team_1.default.callback(client, confirmation, true);
                }
            }
        }
        catch (error) {
            console.log(error);
        }
    },
};
