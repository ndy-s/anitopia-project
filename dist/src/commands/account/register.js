"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const redis_1 = require("../../lib/redis");
const config_1 = require("../../config");
const utils_1 = require("../../utils");
const exceptions_1 = require("../exceptions");
const models_1 = require("../../models");
const profile_1 = require("./profile");
const main_1 = require("../main/main");
exports.default = {
    name: 'register',
    description: 'Join Anitopia and start your adventure',
    cooldown: 5000,
    options: [],
    deleted: false,
    // Optional
    devOnly: false,
    testOnly: false,
    botPermissions: [],
    permissionsRequired: [],
    callback: async (client, interaction) => {
        let player = await (0, utils_1.getPlayer)(interaction);
        if (player) {
            (0, exceptions_1.registrationNA)(interaction);
            return;
        }
        const latestAccount = await models_1.PlayerModel.findOne({}, {}, { sort: { createdAt: -1 } });
        const generatedUniqueToken = (0, utils_1.generateUniqueID)(latestAccount?.playerId ?? null);
        player = new models_1.PlayerModel({
            ...{
                userId: interaction.member && 'id' in interaction.member ? interaction.member.id : undefined,
                guildId: interaction.guild?.id,
                playerId: generatedUniqueToken,
            }
        });
        const registerEmbed = new discord_js_1.EmbedBuilder()
            .setColor('Blurple')
            .setAuthor({
            name: interaction.user.username,
            iconURL: interaction.user.displayAvatarURL(),
        })
            .setTitle('Welcome to Anitopia!')
            .setThumbnail('https://images-ext-1.discordapp.net/external/huMhSM-tW8IbG2kU1hR1Q-pI-A44b74PL_teDZ7nhVc/https/www.vhv.rs/dpng/d/28-280300_konosuba-megumin-explosion-megumin-chibi-png-transparent-png.png?width=566&height=671')
            .setDescription(`Explosion! Ahem... Greetings, <@!${interaction.user.id}>!\n\nI am Megumin, the great Arch-Wizard of Anitopia. I invite you to a realm of extraordinary experiences. By clicking '**Create Account**', you're not just signing up, but setting sail on an exciting journey.\n\nMay your adventure be filled with joy and discovery!`);
        const registerComponentRow = new discord_js_1.ActionRowBuilder()
            .addComponents(new discord_js_1.ButtonBuilder()
            .setCustomId('createAccount')
            .setLabel('Create Account')
            .setStyle(discord_js_1.ButtonStyle.Success));
        const response = await interaction.reply({
            embeds: [registerEmbed],
            components: [registerComponentRow],
        });
        const collectorFilter = (i) => i.user.id === interaction.user.id;
        try {
            const confirmation = await response.awaitMessageComponent({
                filter: collectorFilter,
                time: 300000
            });
            if (confirmation.customId === 'createAccount') {
                await confirmation.deferUpdate();
                await player.save();
                await redis_1.default.set(interaction.user.id, JSON.stringify(player), 'EX', 60);
                const mainButton = new discord_js_1.ButtonBuilder()
                    .setCustomId('main')
                    .setLabel('Main')
                    .setStyle(discord_js_1.ButtonStyle.Primary);
                const profileButton = new discord_js_1.ButtonBuilder()
                    .setCustomId('profile')
                    .setLabel('Profile')
                    .setStyle(discord_js_1.ButtonStyle.Primary);
                const commandButtonRow = new discord_js_1.ActionRowBuilder().addComponents(mainButton, profileButton);
                const congratulationResponse = await interaction.editReply({
                    embeds: [
                        new discord_js_1.EmbedBuilder()
                            .setColor('Blurple')
                            .setAuthor({
                            name: interaction.user.username,
                            iconURL: interaction.user.displayAvatarURL(),
                        })
                            .setTitle(`Congratulations ${interaction.user.username}!`)
                            .setDescription(`Congratulations <@!${interaction.user.id}>! 🎉 Your account has been successfully set up. Your epic journey in the world of Anitopia is about to unfold. Use ${config_1.config.commands.profileCommandTag} to check out your profile, and kickstart your adventure with ${config_1.config.commands.mainCommandTag}. Have a fantastic journey!`)
                            .setFooter({
                            iconURL: interaction.client.user.displayAvatarURL({ extension: 'png', size: 512 }),
                            text: config_1.config.messages.footerText
                        })
                    ],
                    components: [commandButtonRow]
                });
                try {
                    const confirmation = await congratulationResponse.awaitMessageComponent({
                        filter: collectorFilter,
                        time: 300000
                    });
                    await confirmation.deferUpdate();
                    await interaction.editReply({
                        components: []
                    });
                    if (confirmation.customId === 'main') {
                        await main_1.default.callback(client, interaction, true);
                    }
                    else if (confirmation.customId === 'profile') {
                        await profile_1.default.callback(client, interaction, true);
                    }
                }
                catch (error) {
                    if (error instanceof Error && error.message === "Collector received no interactions before ending with reason: time") {
                        await interaction.editReply({
                            components: []
                        });
                    }
                    else {
                        console.log(`Congratulations Success Handler Error: ${error}`);
                    }
                }
            }
        }
        catch (error) {
            if (error instanceof Error && error.message === "Collector received no interactions before ending with reason: time") {
                registerEmbed.setFooter({
                    text: `⏱️ This command is only active for 5 minutes. To use it again, please type /register.`
                });
                await interaction.editReply({
                    embeds: [registerEmbed],
                    components: []
                });
            }
            else {
                console.log(`Register Command Error: ${error}`);
            }
        }
    },
};
