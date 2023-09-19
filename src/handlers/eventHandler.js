const path = require('path');
const getAllFiles = require('../utils/getAllFiles');

module.exports = (client) => {
    // Get a list of all event folders in the 'events' directory
    const eventPath = path.join(__dirname, '..', 'events');
    const eventFolders = getAllFiles(eventPath, true);

    for (const eventFolder of eventFolders) {
        // Get a list of event files within the current event folder
        const eventFiles = getAllFiles(eventFolder);

        // Sort the event files alphabetically
        eventFiles.sort((a, b) => a < b);

        // Extract the name of the event from the folder path
        const eventName = eventFolder.replace(/\\/g, '/').split('/').pop();

        client.on(eventName, async (arg) => {
            for (const eventFile of eventFiles) {
                const eventFunction = require(eventFile);
                await eventFunction(client, arg);
            }
        })
    }
};