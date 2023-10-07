import * as path from "path";
import getAllFiles from "./getAllFiles";
import { CommandObject } from "../interfaces";

export default (exceptions: string[] = []) => {
    let localCommands: CommandObject[] = [];
    const commandsPath = path.join(__dirname, '..', 'commands');
    const commandCategories = getAllFiles(commandsPath, true);

    for (const commandCategory of commandCategories) {
        if (path.basename(commandCategory) === 'exceptions' || path.basename(commandCategory) === 'modals') continue;
        const commandFiles = getAllFiles(commandCategory);

        for (const commandFile of commandFiles) {
            const commandObject: CommandObject = require(commandFile).default;

            if (exceptions.includes(commandObject.name)) continue;
            localCommands.push(commandObject);
        }
    }
    return localCommands;
};