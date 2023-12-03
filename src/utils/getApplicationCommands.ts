import { Client, Guild } from "discord.js";

export const getApplicationCommands = async (client: Client, guildId?: string) => {
    let applicationCommands;

    if (guildId) {
        const guild: Guild | null = await client.guilds.fetch(guildId);

        if (!guild) {
            throw new Error(`Guild with ID ${guildId} not found.`);
        }

        applicationCommands = guild.commands;

    } else {
        if (!client.application) {
            throw new Error("Client application is not available.");
        }

        applicationCommands = client.application.commands;
    }

    if (!applicationCommands) {
        throw new Error("Unable to fetch application commands.");
    }

    await applicationCommands.fetch({ guildId });
    return applicationCommands;
};
