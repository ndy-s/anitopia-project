"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_json_1 = require("../../../config.json");
const utils_1 = require("../../utils");
exports.default = async (client) => {
    try {
        const localCommands = (0, utils_1.getLocalCommands)();
        const applicationCommands = await (0, utils_1.getApplicationCommands)(client);
        const testServerApplicationCommands = await (0, utils_1.getApplicationCommands)(client, config_json_1.testServer);
        const processCommand = async (command, existingCommand, applicationCommands) => {
            if (existingCommand) {
                if (command.deleted) {
                    await applicationCommands.delete(existingCommand.id);
                    console.log(`🗑 Deleted command "${command.name}".`);
                }
                else if ((0, utils_1.areCommandsDifferent)(existingCommand, command)) {
                    await applicationCommands.edit(existingCommand.id, {
                        description: command.description,
                        options: command.options,
                    });
                    console.log(`🔁 Edited command "${command.name}".`);
                }
            }
            else if (!command.deleted) {
                await applicationCommands.create({
                    name: command.name,
                    description: command.description,
                    options: command.options
                });
                console.log(`👍 Registered command "${command.name}."`);
            }
            else {
                console.log(`⏩ Skipping registering command "${command.name}" as it's set to delete.`);
            }
        };
        for (const localCommand of localCommands) {
            const existingCommand = localCommand.testOnly
                ? testServerApplicationCommands.cache.find((cmd) => cmd.name === localCommand.name)
                : applicationCommands.cache.find((cmd) => cmd.name === localCommand.name);
            const commands = localCommand.testOnly ? testServerApplicationCommands : applicationCommands;
            await processCommand(localCommand, existingCommand, commands);
        }
    }
    catch (error) {
        console.log(`Registering commands error: ${error}`);
    }
};
