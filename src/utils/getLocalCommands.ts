import * as path from "path";
import { getAllFiles } from "./getAllFiles";
import { ICommandObject } from "../interfaces";

export const getLocalCommands = (exceptions: string[] = []) => {
    let localCommands: ICommandObject[] = [];
    const commandsPath = path.join(__dirname, '..', 'commands');
    const commandCategories = getAllFiles(commandsPath, true);

    for (const commandCategory of commandCategories) {
        if (path.basename(commandCategory) === 'exceptions' || path.basename(commandCategory) === 'modals') continue;
        const commandFiles = getAllFiles(commandCategory);

        for (const commandFile of commandFiles) {
            const commandObject: ICommandObject = require(commandFile).default;

            if (exceptions.includes(commandObject.name)) continue;
            localCommands.push(commandObject);
        }
    }
    return localCommands;
};