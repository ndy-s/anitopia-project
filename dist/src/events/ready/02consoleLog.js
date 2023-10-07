"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
exports.default = (client) => {
    const serverCount = client.guilds.cache.size;
    client.user?.setActivity({
        name: `${serverCount} servers`,
        type: discord_js_1.ActivityType.Watching
    });
    console.log(`${client.user?.tag} is Online.`);
};
