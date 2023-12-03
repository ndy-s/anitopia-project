"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const redis_1 = require("../../lib/redis");
const config_1 = require("../../config");
const utils_1 = require("../../utils");
const models_1 = require("../../models");
exports.default = {
    name: 'profile',
    description: 'Shows your Anitopia profile',
    cooldown: 5000,
    options: [],
    deleted: false,
    // Optional
    devOnly: false,
    testOnly: false,
    botPermissions: [],
    permissionsRequired: [],
    callback: async (client, interaction, followUp = false) => {
        let player = await (0, utils_1.getPlayer)(interaction);
        const profileOption = new discord_js_1.StringSelectMenuBuilder()
            .setCustomId('profileOption')
            .setPlaceholder('Select an action for your profile')
            .addOptions(new discord_js_1.StringSelectMenuOptionBuilder()
            .setLabel(`Customize Profile`)
            .setDescription('Personalize your profile to make it uniquely yours')
            .setValue('customize')
            .setEmoji('🎨'), new discord_js_1.StringSelectMenuOptionBuilder()
            .setLabel('Daily Rewards')
            .setDescription('Earn exciting rewards every day')
            .setValue('daily')
            .setEmoji('🎁'), new discord_js_1.StringSelectMenuOptionBuilder()
            .setLabel('Redeem Code')
            .setDescription('Got a code? Redeem it for cool perks')
            .setValue('redeem')
            .setEmoji('🔑'));
        const profileEmbed = (0, config_1.configProfileEmbed)(interaction, player);
        const profileComponentRow = new discord_js_1.ActionRowBuilder().addComponents(profileOption);
        const responseOptions = {
            embeds: [profileEmbed],
            components: [profileComponentRow],
        };
        let response = followUp ? await interaction.followUp(responseOptions) : await interaction.reply(responseOptions);
        const collectorFilter = (i) => i.user.id === interaction.user.id;
        try {
            while (true) {
                let confirmation = await response.awaitMessageComponent({
                    filter: collectorFilter,
                    time: 300000
                });
                // profileOption.options.forEach(option => {
                //     if ('values' in confirmation) {
                //         if (confirmation.values.includes(option.data.value)) {
                //             option.setDefault(true);
                //         }
                //     }
                // });
                if (confirmation.customId === 'profileOption' && 'values' in confirmation) {
                    if (confirmation.values.includes('customize')) {
                        player = await models_1.PlayerModel.findOne({
                            userId: interaction.member && 'id' in interaction.member ? interaction.member.id : undefined,
                        });
                        if (player) {
                            await redis_1.default.set(interaction.user.id, JSON.stringify(player), 'EX', 60);
                            const customizeProfileModal = new discord_js_1.ModalBuilder()
                                .setCustomId('customizeProfileModal')
                                .setTitle('Customize Profile');
                            const bioInput = new discord_js_1.TextInputBuilder()
                                .setCustomId('bioInput')
                                .setLabel("Biography")
                                .setStyle(discord_js_1.TextInputStyle.Paragraph)
                                .setValue(player.bio)
                                .setMaxLength(100)
                                .setRequired(true);
                            customizeProfileModal.addComponents(new discord_js_1.ActionRowBuilder().addComponents(bioInput));
                            await confirmation.showModal(customizeProfileModal);
                            const components = [new discord_js_1.ActionRowBuilder().addComponents(profileOption)];
                            response = await (followUp ? response.edit({ components }) : interaction.editReply({ components }));
                        }
                    }
                }
            }
        }
        catch (error) {
            if (error instanceof Error && error.message === "Collector received no interactions before ending with reason: time") {
                profileEmbed.setFooter({
                    text: `⏱️ This command is only active for 5 minutes. To use it again, please type /profile.`
                });
                await interaction.editReply({
                    embeds: [profileEmbed],
                    components: []
                });
            }
            else {
                console.log(`Profile Command Error: ${error}`);
            }
        }
    }
};
