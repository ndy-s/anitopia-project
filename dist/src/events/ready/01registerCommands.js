"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const getLocalCommands_1 = require("../../utils/getLocalCommands");
const getApplicationCommands_1 = require("../../utils/getApplicationCommands");
const areCommandsDifferent_1 = require("../../utils/areCommandsDifferent");
exports.default = async (client) => {
    try {
        const localCommands = (0, getLocalCommands_1.default)();
        const applicationCommands = await (0, getApplicationCommands_1.default)(client);
        for (const localCommand of localCommands) {
            const { name, description, options } = localCommand;
            const existingCommand = applicationCommands.cache.find((cmd) => cmd.name === name);
            if (existingCommand) {
                if (localCommand.deleted) {
                    await applicationCommands.delete(existingCommand.id);
                    console.log(`🗑 Deleted command "${name}".`);
                    continue;
                }
                if ((0, areCommandsDifferent_1.default)(existingCommand, localCommand)) {
                    await applicationCommands.edit(existingCommand.id, {
                        description, options: options,
                    });
                    console.log(`🔁 Edited command "${name}".`);
                }
            }
            else {
                if (localCommand.deleted) {
                    console.log(`⏩ Skipping registering command "${name}" as it's set to delete.`);
                    continue;
                }
                await applicationCommands.create({
                    name, description, options: options
                });
                console.log(`👍 Registered command "${name}."`);
            }
        }
    }
    catch (error) {
        console.log(`Registering commands error: ${error}`);
    }
};
