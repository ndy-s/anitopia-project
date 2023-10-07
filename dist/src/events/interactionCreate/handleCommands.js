"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const config_json_1 = require("../../../config.json");
const getLocalCommands_1 = require("../../utils/getLocalCommands");
const Account_1 = require("../../models/Account");
const redis_1 = require("../../lib/redis");
const register_1 = require("../../commands/account/register");
const commandNA_1 = require("../../commands/exceptions/commandNA");
const cooldownMS_1 = require("../../commands/exceptions/cooldownMS");
const config_1 = require("../../config");
exports.default = async (client, interaction) => {
    if (!interaction.isChatInputCommand())
        return;
    if (!interaction.inGuild()) {
        (0, commandNA_1.default)(interaction);
        return;
    }
    const localCommands = (0, getLocalCommands_1.default)();
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
            else {
                console.error('Invalid interaction.member:', interaction.member);
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
        if (await (0, cooldownMS_1.default)(interaction, commandObject) === false)
            return;
        // Redis Caching
        const result = await redis_1.default.get(interaction.user.id);
        let account;
        if (result) {
            account = JSON.parse(result);
        }
        else {
            account = await Account_1.default.findOne({
                accountId: 'id' in interaction.member ? interaction.member.id : undefined,
                guildId: interaction.guild?.id
            });
            await redis_1.default.set(interaction.user.id, JSON.stringify(account), 'EX', 60);
        }
        if (!account) {
            await register_1.default.callback(client, interaction, account);
        }
        else if (account) {
            commandObject.callback(client, interaction);
        }
    }
    catch (error) {
        console.log(`There was an error running this handle command: ${error}`);
    }
};
