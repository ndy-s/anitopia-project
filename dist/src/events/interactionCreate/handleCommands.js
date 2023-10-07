"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_json_1 = require("../../../config.json");
const getLocalCommands_1 = require("../../utils/getLocalCommands");
const Account_1 = require("../../models/Account");
const register_1 = require("../../commands/account/register");
const commandNA_1 = require("../../commands/exceptions/commandNA");
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
                    content: 'Only developers are allowed to run this command.',
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
                content: 'This command cannot be run here.',
                ephemeral: true,
            });
            return;
        }
        if (commandObject.permissionsRequired?.some(permission => typeof interaction.member.permissions !== 'string' && !interaction.member.permissions.has(permission))) {
            interaction.reply({
                content: 'Not enough permissions.',
                ephemeral: true,
            });
            return;
        }
        if (commandObject.botPermissions?.some(permission => !interaction.guild?.members.me?.permissions.has(permission))) {
            interaction.reply({
                content: "I don't have enough permissions.",
                ephemeral: true,
            });
            return;
        }
        const account = await Account_1.default.findOne({
            aaccountId: 'id' in interaction.member ? interaction.member.id : undefined,
            guildId: interaction.guild?.id
        });
        if (!account) {
            await register_1.default.callback(client, interaction);
        }
        else if (account) {
            await commandObject.callback(client, interaction);
        }
    }
    catch (error) {
        console.log(`There was an error running this handle command: ${error}`);
    }
};
