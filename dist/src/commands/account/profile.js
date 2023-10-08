"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const redis_1 = require("../../lib/redis");
const Account_1 = require("../../models/Account");
const config_1 = require("../../config");
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
        const result = await redis_1.default.get(interaction.user.id);
        let account;
        if (result) {
            account = JSON.parse(result);
        }
        else {
            account = await Account_1.default.findOne({
                accountId: interaction.member && 'id' in interaction.member ? interaction.member.id : undefined,
            });
            await redis_1.default.set(interaction.user.id, JSON.stringify(account), 'EX', 60);
        }
        const profileOption = new discord_js_1.StringSelectMenuBuilder()
            .setCustomId('profileOption')
            .setPlaceholder('Select an option to explore!')
            .addOptions(new discord_js_1.StringSelectMenuOptionBuilder()
            .setLabel(`Customize Profile`)
            .setDescription('Personalize your profile to make it uniquely yours')
            .setValue('customize'), new discord_js_1.StringSelectMenuOptionBuilder()
            .setLabel('Daily Rewards')
            .setDescription('Earn exciting rewards every day')
            .setValue('daily'), new discord_js_1.StringSelectMenuOptionBuilder()
            .setLabel('Redeem Code')
            .setDescription('Got a code? Redeem it for cool perks')
            .setValue('redeem'));
        const profileEmbed = (0, config_1.configProfileEmbed)(interaction, account);
        const responseOptions = {
            embeds: [profileEmbed],
            components: [new discord_js_1.ActionRowBuilder().addComponents(profileOption)],
        };
        let response = followUp ? await interaction.followUp(responseOptions) : await interaction.reply(responseOptions);
        const collectorFilter = (i) => i.user.id === interaction.user.id;
        try {
            while (true) {
                let profileConfirmation = await response.awaitMessageComponent({
                    filter: collectorFilter,
                    time: 300000
                });
                // profileOption.options.forEach(option => {
                //     if ('values' in profileConfirmation) {
                //         if (profileConfirmation.values.includes(option.data.value)) {
                //             option.setDefault(true);
                //         }
                //     }
                // });
                if (profileConfirmation.customId === 'profileOption' && 'values' in profileConfirmation) {
                    if (profileConfirmation.values.includes('customize')) {
                        account = await Account_1.default.findOne({
                            accountId: interaction.member && 'id' in interaction.member ? interaction.member.id : undefined,
                        });
                        if (account) {
                            await redis_1.default.set(interaction.user.id, JSON.stringify(account), 'EX', 60);
                            const customizeProfileModal = new discord_js_1.ModalBuilder()
                                .setCustomId('customizeProfileModal')
                                .setTitle('Customize Profile');
                            const bioInput = new discord_js_1.TextInputBuilder()
                                .setCustomId('bioInput')
                                .setLabel("Biography")
                                .setStyle(discord_js_1.TextInputStyle.Paragraph)
                                .setValue(account.bio)
                                .setMaxLength(100)
                                .setRequired(true);
                            const customizeProfileModalRow = new discord_js_1.ActionRowBuilder().addComponents(bioInput);
                            customizeProfileModal.addComponents(customizeProfileModalRow);
                            await profileConfirmation.showModal(customizeProfileModal);
                            const components = [new discord_js_1.ActionRowBuilder().addComponents(profileOption)];
                            response = await (followUp ? response.edit({ components }) : interaction.editReply({ components }));
                        }
                    }
                }
            }
        }
        catch (error) {
            if (error instanceof Error) {
                if (error.message === "Collector received no interactions before ending with reason: time") {
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
    }
};
