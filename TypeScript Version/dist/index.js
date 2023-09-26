"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const discord_js_1 = require("discord.js");
const client = new discord_js_1.Client({
    intents: ['Guilds', 'GuildMessages', 'GuildMembers', 'MessageContent'],
});
client.on('ready', (c) => {
    console.log(`${c.user.username} is online.`);
});
client.login(process.env.TOKEN);
