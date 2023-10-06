import * as path from 'path';
import getAllFiles from '../utils/getAllFiles';
import { Client } from 'discord.js';

export default (client: Client) => {
    const eventPath = path.join(__dirname, '..', 'events');
    const eventFolders = getAllFiles(eventPath, true);

    for (const eventFolder of eventFolders) {
        const eventFiles = getAllFiles(eventFolder);
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