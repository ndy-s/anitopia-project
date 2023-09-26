const path = require('path');
const getAllFiles = require('./getAllFiles.js');

module.exports = (exceptions = []) => {
    let localCommands = [];
    const commandsPath = path.join(__dirname, '..', 'commands');
    const commandCategories = getAllFiles(commandsPath, true);

    // Loop through each command category (subdirectory)
    for (const commandCategory of commandCategories) {
        const commandFiles = getAllFiles(commandCategory);

        // Loop through each command file
        for (const commandFile of commandFiles) {
            const commandObject = require(commandFile);

            // Check if the command name is in the exceptions list. If so, skip this command
            if (exceptions.includes(commandObject.name)) continue;
            localCommands.push(commandObject);
        }
    }
    return localCommands;
};