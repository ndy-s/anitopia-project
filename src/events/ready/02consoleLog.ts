import { ActivityType, Client } from "discord.js";

export default (client: Client) => {
    const serverCount = client.guilds.cache.size;
    client.user?.setActivity({
        name: `${serverCount} servers`,
        type: ActivityType.Watching
    });

    console.log(`${client.user?.tag} is Online.`);
};