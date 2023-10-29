"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const config_json_1 = require("../../../config.json");
const config_1 = require("../../config");
const utils_1 = require("../../utils");
const exceptions_1 = require("../../commands/exceptions");
const register_1 = require("../../commands/account/register");
exports.default = async (client, interaction) => {
    if (!interaction.isChatInputCommand())
        return;
    if (!interaction.inGuild()) {
        (0, exceptions_1.commandNA)(interaction);
        return;
    }
    const localCommands = (0, utils_1.getLocalCommands)();
    try {
        const commandObject = localCommands.find((cmd) => cmd.name === interaction.commandName);
        if (!commandObject)
            return;
        if (commandObject.devOnly) {
            if (interaction.member &&
                'id' in interaction.member &&
                typeof interaction.member.id === 'string' &&
                !config_json_1.devs.includes(interaction.member.id)) {
                interaction.reply({
                    embeds: [
                        new discord_js_1.EmbedBuilder()
                            .setColor('#FF0000')
                            .setTitle('🚫 Access Denied')
                            .setDescription("I'm sorry, but this command is restricted to developers only.")
                            .setFooter({
                            text: config_1.config.messages.footerText
                        })
                    ],
                    ephemeral: true,
                });
                return;
            }
        }
        if (commandObject.testOnly && !(interaction.guild?.id === config_json_1.testServer)) {
            interaction.reply({
                embeds: [
                    new discord_js_1.EmbedBuilder()
                        .setColor('#FF0000')
                        .setTitle('🚫 Command Restriction')
                        .setDescription("I'm sorry, but this command is not allowed to be executed in this server.")
                        .setFooter({
                        text: config_1.config.messages.footerText
                    })
                ],
                ephemeral: true,
            });
            return;
        }
        if (commandObject.permissionsRequired?.some(permission => typeof interaction.member.permissions !== 'string' && !interaction.member.permissions.has(permission))) {
            interaction.reply({
                embeds: [
                    new discord_js_1.EmbedBuilder()
                        .setColor('#FF0000')
                        .setTitle('🚫 Permission Error')
                        .setDescription("I'm sorry, but you don't have the necessary permissions to execute this command. Please verify your permissions and try again.")
                        .setFooter({
                        text: config_1.config.messages.footerText
                    })
                ],
                ephemeral: true,
            });
            return;
        }
        if (commandObject.botPermissions?.some(permission => !interaction.guild?.members.me?.permissions.has(permission))) {
            interaction.reply({
                embeds: [
                    new discord_js_1.EmbedBuilder()
                        .setColor('#FF0000')
                        .setTitle('🚫 Permission Error')
                        .setDescription("I'm sorry, but I don't have the necessary permissions to execute this command. Could you please verify my permissions and try again? I appreciate your cooperation!")
                        .setFooter({
                        text: config_1.config.messages.footerText
                    })
                ],
                ephemeral: true,
            });
            return;
        }
        if (await (0, exceptions_1.cooldownMS)(interaction, commandObject) === false)
            return;
        const player = await (0, utils_1.getPlayer)(interaction);
        // Temporary
        // commandObject.callback(client, interaction);
        if (!player) {
            await register_1.default.callback(client, interaction);
        }
        else if (player) {
            commandObject.callback(client, interaction);
        }
    }
    catch (error) {
        console.log(`There was an error running this handle command: ${error}`);
    }
};
