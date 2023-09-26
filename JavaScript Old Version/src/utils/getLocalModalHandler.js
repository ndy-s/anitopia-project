const path = require('path');
const getAllFiles = require('./getAllFiles.js');

module.exports = (exceptions = []) => {
    let localModalHandler = [];
    const modalHandlerPath = path.join(__dirname, '..', 'modalHandler');
    const modalHandlerCategories = getAllFiles(modalHandlerPath, true);

    // Loop through each modal handler category (subdirectory)
    for (const modalHandlerCategory of modalHandlerCategories) {
        const modalHandlerFiles = getAllFiles(modalHandlerCategory);

        // Loop through each modal handler file
        for (const modalHandlerFile of modalHandlerFiles) {
            const modalHandlerObject = require(modalHandlerFile);

            // Check if the modal handler name is in the exceptions list. If so, skip this modal handler
            if (exceptions.includes(modalHandlerObject.name)) continue;
            localModalHandler.push(modalHandlerObject);
        }
    }
    return localModalHandler;
};