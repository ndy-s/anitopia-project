"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLocalCommands = void 0;
const path = require("path");
const getAllFiles_1 = require("./getAllFiles");
const getLocalCommands = (exceptions = []) => {
    let localCommands = [];
    const commandsPath = path.join(__dirname, '..', 'commands');
    const commandCategories = (0, getAllFiles_1.getAllFiles)(commandsPath, true);
    for (const commandCategory of commandCategories) {
        if (path.basename(commandCategory) === 'exceptions' || path.basename(commandCategory) === 'modals')
            continue;
        const commandFiles = (0, getAllFiles_1.getAllFiles)(commandCategory);
        for (const commandFile of commandFiles) {
            const commandObject = require(commandFile).default;
            if (exceptions.includes(commandObject.name))
                continue;
            localCommands.push(commandObject);
        }
    }
    return localCommands;
};
exports.getLocalCommands = getLocalCommands;
