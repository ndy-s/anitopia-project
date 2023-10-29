"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const utils_1 = require("../utils");
exports.default = (client) => {
    const eventPath = path.join(__dirname, '..', 'events');
    const eventFolders = (0, utils_1.getAllFiles)(eventPath, true);
    for (const eventFolder of eventFolders) {
        const eventFiles = (0, utils_1.getAllFiles)(eventFolder);
        const eventName = path.basename(eventFolder);
        if (typeof eventName === 'string') {
            client.on(eventName, async (arg) => {
                for (const eventFile of eventFiles) {
                    const eventFunction = require(eventFile).default;
                    await eventFunction(client, arg);
                }
            });
        }
    }
};
