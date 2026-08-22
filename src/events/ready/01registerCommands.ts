import { ApplicationCommand, ApplicationCommandManager, ApplicationCommandOptionData, Client, GuildApplicationCommandManager, GuildResolvable } from "discord.js";

import { testServer } from "../../../config.json";
import { getLocalCommands, getApplicationCommands, areCommandsDifferent } from "../../utils";
import { ICommandObject } from "../../interfaces";
import { setCommandTag } from "../../lib/commandTags";

export default async (client: Client) => {
    try {
        const localCommands = getLocalCommands();
        const applicationCommands = await getApplicationCommands(client);
        const testServerApplicationCommands = await getApplicationCommands(client, testServer);

        const processCommand = async (
            command: ICommandObject, 
            existingCommand: ApplicationCommand<{ guild: GuildResolvable; }> | undefined, 
            applicationCommands: GuildApplicationCommandManager | ApplicationCommandManager<ApplicationCommand<{ guild: GuildResolvable; }>, { guild: GuildResolvable; }, null>
        ) => {
            if (existingCommand) {
                if (command.deleted) {
                    await applicationCommands.delete(existingCommand.id);
                    console.log(`🗑 Deleted command "${command.name}".`);
                } else {
                    if (areCommandsDifferent(existingCommand, command)) {
                        await applicationCommands.edit(existingCommand.id, {
                            description: command.description,
                            options: command.options as ApplicationCommandOptionData[],
                        });
                        console.log(`🔁 Edited command "${command.name}".`);
                    }
                    setCommandTag(command.name, existingCommand.id);
                }
            } else if (!command.deleted) {
                const createdCommand = await applicationCommands.create({
                    name: command.name,
                    description: command.description,
                    options: command.options as ApplicationCommandOptionData[]
                });
                setCommandTag(command.name, createdCommand.id);
                console.log(`👍 Registered command "${command.name}."`);
            } else {
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
    } catch (error) {
        console.log(`Registering commands error: ${error}`);
    }
};