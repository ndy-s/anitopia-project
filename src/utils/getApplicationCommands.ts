import { Client, Guild } from "discord.js";

export default async (client: Client, guildId?: string) => {
    let applicationCommands;

    if (guildId) {
        const guild: Guild | null = await client.guilds.fetch(guildId);

        if (guild) {
            applicationCommands = guild.commands;
        } else {
            throw new Error(`Guild with ID ${guildId} not found.`);
        }

    } else {
        if (client.application) {
            applicationCommands = client.application.commands;
        } else {
            throw new Error("Client application is not available.");
        }
    }

    if (!applicationCommands) {
        throw new Error("Unable to fetch application commands.");
    }

    await applicationCommands.fetch({ guildId });
    return applicationCommands;
};