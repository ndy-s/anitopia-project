"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const utils_1 = require("../../utils");
exports.default = {
    name: 'delete-command',
    description: 'Removes a specified command',
    cooldown: 5000,
    options: [
        {
            name: 'command-name',
            description: 'Name of the command to be removed',
            type: discord_js_1.ApplicationCommandOptionType.String,
            required: true,
        }
    ],
    deleted: false,
    // Optional
    devOnly: true,
    testOnly: true,
    botPermissions: [],
    permissionsRequired: [],
    callback: async (client, interaction) => {
        const commandName = interaction.options.get('command-name')?.value;
        const applicationCommands = await (0, utils_1.getApplicationCommands)(client);
        const existingCommand = applicationCommands.cache.find((cmd) => cmd.name === commandName);
        if (existingCommand) {
            await applicationCommands.delete(existingCommand.id);
            console.log(`🗑 Deleted command "${commandName}".`);
        }
        await interaction.deferReply();
        if (existingCommand) {
            await interaction.editReply(`The command "${commandName}" has been successfully deleted.`);
        }
        else {
            await interaction.editReply(`The command "${commandName}" does not exist.`);
        }
    }
};
