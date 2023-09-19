const { ActivityType } = require('discord.js');

module.exports = (client) => {
    const serverCount = client.guilds.cache.size;
    client.user.setActivity({
        name: `${serverCount} servers`,
        type: ActivityType.Watching
    });

    console.log(`${client.user.tag} is Online.`);
};