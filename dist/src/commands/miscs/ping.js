"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    name: 'ping',
    description: 'Pong!',
    options: [],
    deleted: false,
    // Optional
    devOnly: false,
    testOnly: false,
    callback: (client, interaction) => {
        interaction.reply(`Pong! ${client.ws.ping} ms`);
    },
};
