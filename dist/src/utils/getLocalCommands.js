"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const getAllFiles_1 = require("./getAllFiles");
exports.default = (exceptions = []) => {
    let localCommands = [];
    const commandsPath = path.join(__dirname, '..', 'commands');
    const commandCategories = (0, getAllFiles_1.default)(commandsPath, true);
    for (const commandCategory of commandCategories) {
        if (path.basename(commandCategory) === 'exceptions' || path.basename(commandCategory) === 'modals')
            continue;
        const commandFiles = (0, getAllFiles_1.default)(commandCategory);
        for (const commandFile of commandFiles) {
            const commandObject = require(commandFile).default;
            if (exceptions.includes(commandObject.name))
                continue;
            localCommands.push(commandObject);
        }
    }
    return localCommands;
};
