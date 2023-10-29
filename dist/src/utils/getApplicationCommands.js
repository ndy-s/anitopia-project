"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getApplicationCommands = void 0;
const getApplicationCommands = async (client, guildId) => {
    let applicationCommands;
    if (guildId) {
        const guild = await client.guilds.fetch(guildId);
        if (guild) {
            applicationCommands = guild.commands;
        }
        else {
            throw new Error(`Guild with ID ${guildId} not found.`);
        }
    }
    else {
        if (client.application) {
            applicationCommands = client.application.commands;
        }
        else {
            throw new Error("Client application is not available.");
        }
    }
    if (!applicationCommands) {
        throw new Error("Unable to fetch application commands.");
    }
    await applicationCommands.fetch({ guildId });
    return applicationCommands;
};
exports.getApplicationCommands = getApplicationCommands;
